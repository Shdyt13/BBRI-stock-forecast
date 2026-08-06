import React, { createContext, useContext, useState } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Create Context
const DataContext = createContext();

// Custom hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Provider Component - V4.0
export const DataProvider = ({ children }) => {
  // Global states
  const [mlData, setMlData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uiError, setUiError] = useState(null); // UI/Rendering error
  const [uploadedFile, setUploadedFile] = useState(null);

  // NEW: Instant CSV metadata (parsed immediately after upload)
  const [csvMetadata, setCsvMetadata] = useState(null);

  // V4.0: Only scenario selection (no model selection)
  const [useFeatureSelection, setUseFeatureSelection] = useState(false);

  // NEW: Instant CSV parsing on file selection (frontend-only)
  const parseCSVMetadata = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse header
      const header = lines[0].split(',').map((h) => h.trim());
      const numFeatures = header.length;

      // Parse all data rows (skip header)
      const dataRows = lines.slice(1);
      const totalRows = dataRows.length;

      // Find Date column index
      const dateColIndex = header.findIndex((h) => h.toLowerCase() === 'date');
      const closeColIndex = header.findIndex((h) => h.toLowerCase() === 'close');

      let startDate = 'N/A';
      let endDate = 'N/A';
      let lastActualClose = 0;

      if (dateColIndex !== -1 && dataRows.length > 0) {
        // Get first date
        const firstRow = dataRows[0].split(',');
        startDate = firstRow[dateColIndex]?.trim() || 'N/A';

        // Get last date and close price
        const lastRow = dataRows[dataRows.length - 1].split(',');
        endDate = lastRow[dateColIndex]?.trim() || 'N/A';

        if (closeColIndex !== -1) {
          lastActualClose = parseFloat(lastRow[closeColIndex]?.trim()) || 0;
        }
      }

      const metadata = {
        totalRows,
        numFeatures,
        startDate,
        endDate,
        lastActualClose,
        dateRange: `${startDate} - ${endDate}`,
      };

      setCsvMetadata(metadata);

      return metadata;
    } catch (parseError) {
      setError(`Gagal membaca file CSV: ${parseError.message}`);
      return null;
    }
  };

  // Main API call - TEAM BACKEND INTEGRATION (2-step flow)
  const processAllPipeline = async (file) => {
    if (!file) {
      setError('Silakan upload file dataset terlebih dahulu!');
      return false;
    }

    const validExtensions = ['.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError('File harus berformat CSV!');
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      // STEP 1: Upload Dataset
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || `Upload failed! status: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();

      // STEP 2: Run Prediction
      const predictResponse = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!predictResponse.ok) {
        const errorData = await predictResponse.json();
        throw new Error(errorData.error || `Prediction failed! status: ${predictResponse.status}`);
      }

      const teamData = await predictResponse.json();

      // STEP 3: Data Mapping - Transform team's response to V4.0 structure
      try {
        const mappedData = mapTeamResponseToV4Structure(teamData);

        // Validate mapped data before setting state
        if (!mappedData || !mappedData.results) {
          throw new Error('Invalid mapped data structure');
        }

        setMlData(mappedData);
        setUploadedFile(file);
        setUiError(null); // Clear any previous UI errors

        return true;
      } catch (mappingError) {
        setUiError(`Gagal memproses data visualisasi: ${mappingError.message}`);
        setError(`Gagal memetakan data: ${mappingError.message}`);
        return false;
      }
    } catch (err) {
      setError(`Gagal memproses data: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Data Mapping Function: Team Backend → V4.0 Frontend (DEFENSIVE VERSION)
  const mapTeamResponseToV4Structure = (teamData) => {
    try {
      // DEFENSIVE: Validate input
      if (!teamData) {
        throw new Error('Backend response is empty');
      }

      // DEFENSIVE: Extract with optional chaining and fallbacks
      const chartData = teamData.chart_data || {};
      const chartActual = chartData.actual || [];
      const chartSvrSelected = chartData.svr_selected || [];
      const chartRfSelected = chartData.rf_selected || [];
      const chartSvrAll = chartData.svr_all || [];
      const chartRfAll = chartData.rf_all || [];

      // FIXED: Gunakan tanggal asli dari backend (bukan auto-generate)
      const dates = chartData.dates || [];

      // DEFENSIVE: Validate array lengths
      if (chartActual.length === 0) {
        throw new Error('No chart data available from backend');
      }

      // DEFENSIVE: Validate dates array
      if (dates.length === 0 || dates.length !== chartActual.length) {
        // Fallback: generate simple indices if dates not available
        dates = chartActual.map((_, i) => `Data ${i + 1}`);
      }

      // DEFENSIVE: Transform with safe array access (using real dates from backend)
      const predictionsWithFS = dates.map((date, index) => ({
        date,
        actual: chartActual[index] || 0,
        prediction: chartSvrSelected[index] || 0,
      }));

      const predictionswithFSrf = dates.map((date, index) => ({
        date,
        actual: chartActual[index] || 0,
        prediction: chartRfSelected[index] || 0,
      }));

      const predictionsWithoutFS = dates.map((date, index) => ({
        date,
        actual: chartActual[index] || 0,
        prediction: chartSvrAll[index] || 0,
      }));

      const predictionsWithoutFSrf = dates.map((date, index) => ({
        date,
        actual: chartActual[index] || 0,
        prediction: chartRfAll[index] || 0,
      }));

      // DEFENSIVE: Safe metrics extraction with defaults
      const metrics = teamData.metrics || {};
      const metricsAll = metrics.All_Features || {};
      const metricsSelected = metrics.Selected_Features || {};
      const svrMetricsAll = metricsAll.SVR || {};
      const rfMetricsAll = metricsAll.RandomForest || {};
      const svrMetricsSelected = metricsSelected.SVR || {};
      const rfMetricsSelected = metricsSelected.RandomForest || {};

      // DEFENSIVE: Safe feature selection extraction
      const featureSelection = teamData.feature_selection || {};
      const ranking = featureSelection.ranking || [];
      const featureImportance = ranking.map((item) => ({
        feature: item?.name || 'Unknown',
        importance: item?.score || 0,
        rank: item?.rank || 0,
        status: item?.status || 'unknown',
      }));

      // Return mapped structure with all safeguards
      return {
        feature_importance: featureImportance,
        results: {
          with_feature_selection: {
            svr: {
              metrics: {
                MAE: svrMetricsSelected.MAE || 0,
                RMSE: svrMetricsSelected.RMSE || 0,
                R2: svrMetricsSelected.R2 || 0,
              },
              predictions: predictionsWithFS,
            },
            rf: {
              metrics: {
                MAE: rfMetricsSelected.MAE || 0,
                RMSE: rfMetricsSelected.RMSE || 0,
                R2: rfMetricsSelected.R2 || 0,
              },
              predictions: predictionswithFSrf,
            },
          },
          without_feature_selection: {
            svr: {
              metrics: {
                MAE: svrMetricsAll.MAE || 0,
                RMSE: svrMetricsAll.RMSE || 0,
                R2: svrMetricsAll.R2 || 0,
              },
              predictions: predictionsWithoutFS,
            },
            rf: {
              metrics: {
                MAE: rfMetricsAll.MAE || 0,
                RMSE: rfMetricsAll.RMSE || 0,
                R2: rfMetricsAll.R2 || 0,
              },
              predictions: predictionsWithoutFSrf,
            },
          },
        },
        // DEFENSIVE: Dataset metadata (keseluruhan CSV)
        dataset_info: {
          total_rows: teamData.dataset_info?.total_rows || chartActual.length || 0,
          start_date: teamData.dataset_info?.start_date || dates[0] || 'N/A',
          end_date: teamData.dataset_info?.end_date || dates[dates.length - 1] || 'N/A',
          date_range:
            teamData.dataset_info?.date_range ||
            `${dates[0] || 'N/A'} - ${dates[dates.length - 1] || 'N/A'}`,
        },
        // DEFENSIVE: Prediction info (harga aktual terakhir & tanggal prediksi)
        prediction_info: {
          base_date: teamData.prediction?.base_date || dates[dates.length - 1] || 'N/A',
          prediction_date: teamData.prediction?.prediction_date || 'N/A',
          last_actual_close: teamData.prediction?.last_actual_close || 0,
        },
        // Preserve original team data for debugging
        _teamOriginal: teamData,
      };
    } catch (mappingError) {
      // Return safe empty structure to prevent white screen
      return {
        feature_importance: [],
        results: {
          with_feature_selection: {
            svr: {
              metrics: { MAE: 0, RMSE: 0, R2: 0 },
              predictions: [],
            },
            rf: {
              metrics: { MAE: 0, RMSE: 0, R2: 0 },
              predictions: [],
            },
          },
          without_feature_selection: {
            svr: {
              metrics: { MAE: 0, RMSE: 0, R2: 0 },
              predictions: [],
            },
            rf: {
              metrics: { MAE: 0, RMSE: 0, R2: 0 },
              predictions: [],
            },
          },
        },
        dataset_info: {
          total_rows: 0,
          start_date: 'N/A',
          end_date: 'N/A',
          date_range: 'N/A - N/A',
        },
        prediction_info: {
          base_date: 'N/A',
          prediction_date: 'N/A',
          last_actual_close: 0,
        },
        _mappingError: mappingError.message,
        _teamOriginal: teamData,
      };
    }
  };

  // Reset function
  const resetData = () => {
    setMlData(null);
    setError(null);
    setUploadedFile(null);
    setCsvMetadata(null);
    setUseFeatureSelection(false);
  };

  // V4.0: Get current scenario results (both SVR and RF)
  const getCurrentScenarioResults = () => {
    if (!mlData || !mlData.results) return null;

    return useFeatureSelection
      ? mlData.results.with_feature_selection
      : mlData.results.without_feature_selection;
  };

  // V4.0: Get chart data for 3 lines (Actual + SVR + RF) - DEFENSIVE
  const getChartData = () => {
    try {
      const scenarioResults = getCurrentScenarioResults();

      // DEFENSIVE: Return empty array if no data
      if (!scenarioResults) return [];

      const svrPredictions = scenarioResults?.svr?.predictions || [];
      const rfPredictions = scenarioResults?.rf?.predictions || [];

      // DEFENSIVE: Return empty if predictions are empty
      if (svrPredictions.length === 0) return [];

      // Merge into single array with 3 values per point
      return svrPredictions.map((item, index) => ({
        date: item?.date || '',
        actual: item?.actual || 0,
        svr: item?.prediction || 0,
        rf: rfPredictions[index]?.prediction || 0,
      }));
    } catch (chartError) {
      return []; // Return empty array to prevent crash
    }
  };

  // NEW: Get feature importance data for FeatureSelection page
  const getFeatureImportanceData = () => {
    if (!mlData || !mlData.feature_importance) return [];
    return mlData.feature_importance;
  };

  // NEW: Get all metrics for ModelEvaluation page
  const getAllMetrics = () => {
    if (!mlData || !mlData.results) {
      return {
        with_feature_selection: null,
        without_feature_selection: null,
      };
    }

    return {
      with_feature_selection: {
        svr: mlData.results.with_feature_selection?.svr?.metrics || { MAE: 0, RMSE: 0, R2: 0 },
        rf: mlData.results.with_feature_selection?.rf?.metrics || { MAE: 0, RMSE: 0, R2: 0 },
      },
      without_feature_selection: {
        svr: mlData.results.without_feature_selection?.svr?.metrics || { MAE: 0, RMSE: 0, R2: 0 },
        rf: mlData.results.without_feature_selection?.rf?.metrics || { MAE: 0, RMSE: 0, R2: 0 },
      },
    };
  };

  // Context value
  const value = {
    // States
    mlData,
    isLoading,
    error,
    uiError, // NEW: UI/rendering errors
    uploadedFile,
    csvMetadata, // NEW: Instant CSV metadata
    useFeatureSelection,

    // Functions
    processAllPipeline,
    parseCSVMetadata, // NEW: Parse CSV metadata instantly
    resetData,
    setUseFeatureSelection,
    setError,
    setUiError, // NEW: Allow components to set UI errors

    // V4.0 Computed values
    getCurrentScenarioResults,
    getChartData,
    getFeatureImportanceData, // NEW: For FeatureSelection page
    getAllMetrics, // NEW: For ModelEvaluation page
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
