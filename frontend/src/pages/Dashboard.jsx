import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Upload, FileText, Calendar, Database, Target, TrendingUp, PlayCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const {
    mlData,
    isLoading,
    error,
    uiError,
    processAllPipeline,
    parseCSVMetadata, // NEW: Instant parsing
    csvMetadata, // NEW: CSV metadata state
    useFeatureSelection,
    setUseFeatureSelection,
    getCurrentScenarioResults,
    getChartData,
    uploadedFile,
  } = useData();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // File handlers - WITH INSTANT PARSING
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // INSTANT PARSING: Parse CSV metadata immediately
      await parseCSVMetadata(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // INSTANT PARSING: Parse CSV metadata immediately
      await parseCSVMetadata(droppedFile);
    }
  };

  // Run prediction
  const handleRunPrediction = async () => {
    if (!file) {
      alert('Silakan upload file dataset terlebih dahulu!');
      return;
    }
    const success = await processAllPipeline(file);
    if (!success) {
      alert('Gagal memproses data. Silakan cek format file CSV Anda.');
    }
  };

  // Get data - DEFENSIVE
  const chartData = getChartData() || [];
  const scenarioResults = getCurrentScenarioResults();

  // DEFENSIVE: Safe metrics extraction
  const svrMetrics = scenarioResults?.svr?.metrics || { MAE: 0, RMSE: 0, R2: 0 };
  const rfMetrics = scenarioResults?.rf?.metrics || { MAE: 0, RMSE: 0, R2: 0 };

  // Use instant CSV metadata OR backend dataset_info (fallback)
  const displayMetadata = csvMetadata || mlData?.dataset_info || null;

  return (
    <div className="w-full min-h-screen block pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          Sistem Prediksi Saham BBRI
        </h1>

        {/* UI Error Display */}
        {uiError && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 flex-shrink-0 mt-0.5">⚠</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">Peringatan Data</p>
                <p className="text-sm text-slate-700">{uiError}</p>
                <p className="text-xs text-slate-600 mt-2">
                  Grafik mungkin tidak lengkap. Silakan coba upload ulang dataset.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-600 flex-shrink-0 mt-0.5">✕</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">Error Koneksi Backend</p>
                <p className="text-sm text-slate-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* CARD 1: Upload Dataset */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-800 text-white rounded w-7 h-7 flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <h2 className="text-lg font-semibold text-slate-900">Upload Dataset</h2>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-700 mb-2 font-medium">Drag & drop file CSV</p>
              <p className="text-sm text-slate-500 mb-3">atau</p>

              <label className="inline-block">
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <span className="bg-slate-800 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors inline-block">
                  Browse File
                </span>
              </label>
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <span className="text-emerald-700 text-xl flex-shrink-0">✓</span>
              </div>
            )}
          </div>

          {/* CARD 2: Informasi Dataset */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-800 text-white rounded w-7 h-7 flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <h2 className="text-lg font-semibold text-slate-900">Informasi Dataset</h2>
            </div>

            {displayMetadata ? (
              <div className="space-y-3">
                {/* Rentang Waktu */}
                <div className="flex items-center gap-3 p-3 bg-white rounded border-l-4 border-slate-700">
                  <Calendar className="w-5 h-5 text-slate-600 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">Rentang Waktu</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {displayMetadata.startDate || displayMetadata.start_date || 'N/A'} s/d{' '}
                      {displayMetadata.endDate || displayMetadata.end_date || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Grid 2 Kolom: Total Rows & Fitur */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded border border-slate-200">
                    <Database className="w-5 h-5 text-slate-600 mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xs text-slate-500 mb-0.5">Total Baris</p>
                    <p className="text-xl font-bold text-slate-900">
                      {(
                        displayMetadata.totalRows ||
                        displayMetadata.total_rows ||
                        0
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-white rounded border border-slate-200">
                    <Target className="w-5 h-5 text-slate-600 mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xs text-slate-500 mb-0.5">Jumlah Fitur</p>
                    <p className="text-xl font-bold text-slate-900">
                      {displayMetadata.numFeatures || 6}
                    </p>
                  </div>
                </div>

                {/* Harga Closing Terakhir (Dataset) */}
                <div className="flex items-center gap-3 p-3 bg-white rounded border-l-4 border-emerald-600">
                  <div className="text-emerald-600 flex-shrink-0 text-2xl">💰</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5 font-medium">
                      Harga Closing Terakhir (Dataset)
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      Rp{' '}
                      {(
                        displayMetadata.lastActualClose ||
                        displayMetadata.last_actual_close ||
                        0
                      ).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(
                        displayMetadata.endDate ||
                          displayMetadata.end_date ||
                          mlData?.prediction_info?.base_date ||
                          ''
                      ).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Target Prediksi (Hari Bursa Berikutnya) */}
                {mlData?.prediction_info?.prediction_date && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded border-l-4 border-blue-600">
                    <div className="text-blue-600 flex-shrink-0 text-2xl">🎯</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5 font-medium">
                        Target Prediksi (Hari Bursa Berikutnya)
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {new Date(mlData.prediction_info.prediction_date).toLocaleDateString(
                          'id-ID',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Prediksi T+1 (Next Trading Day)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Database className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Upload dataset untuk melihat informasi</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: COMPACT ROW - Scenario Selection + Run Button */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Left: Scenario Selection */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-800 text-white rounded w-7 h-7 flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <h2 className="text-lg font-semibold text-slate-900">Pilih Skenario</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-3 cursor-pointer border border-slate-200 rounded p-3 hover:border-slate-400 transition-colors flex-1">
                  <input
                    type="radio"
                    name="scenario"
                    checked={!useFeatureSelection}
                    onChange={() => setUseFeatureSelection(false)}
                    className="w-4 h-4 text-slate-800"
                  />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Tanpa Feature Selection</p>
                    <p className="text-xs text-slate-500">Semua fitur</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer border border-slate-200 rounded p-3 hover:border-slate-400 transition-colors flex-1">
                  <input
                    type="radio"
                    name="scenario"
                    checked={useFeatureSelection}
                    onChange={() => setUseFeatureSelection(true)}
                    className="w-4 h-4 text-slate-800"
                  />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Gunakan Feature Selection</p>
                    <p className="text-xs text-slate-500">Fitur terpilih</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right: Run Button */}
            <div className="lg:w-80">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-800 text-white rounded w-7 h-7 flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <h2 className="text-lg font-semibold text-slate-900">Jalankan</h2>
              </div>

              <button
                onClick={handleRunPrediction}
                disabled={isLoading || !file}
                className={`
                  w-full py-3 rounded font-semibold text-base flex items-center justify-center gap-3
                  transition-all
                  ${isLoading || !file ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm'}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" strokeWidth={2} />
                    <span>RUN PREDICTION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: GRAFIK - Chart Results */}
        {mlData && scenarioResults && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-800 text-white rounded w-7 h-7 flex items-center justify-center text-sm font-semibold">
                5
              </span>
              <h2 className="text-lg font-semibold text-slate-900">Grafik Perbandingan Prediksi</h2>
            </div>

            {/* INFO BADGE: Next Trading Day Explanation */}
            <div className="bg-white border-l-4 border-slate-700 rounded p-4 mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-slate-600 flex-shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">Catatan Penting - Hari Bursa</p>
                  <p className="text-sm text-slate-700">
                    Bursa saham libur pada <strong>31 Desember 2025</strong> dan{' '}
                    <strong>01 Januari 2026</strong>. Prediksi <strong>T+1</strong> (Next Trading
                    Day) dihitung untuk tanggal bursa aktif berikutnya:{' '}
                    <strong>
                      {mlData?.prediction_info?.prediction_date
                        ? new Date(mlData.prediction_info.prediction_date).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }
                          )
                        : '02 Januari 2026'}
                    </strong>
                    .
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    Data terakhir (
                    {mlData?.prediction_info?.base_date
                      ? new Date(mlData.prediction_info.base_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '30 Des 2025'}
                    ) digunakan sebagai acuan untuk memprediksi harga penutupan pada hari bursa
                    berikutnya.
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Cards - SVR vs RF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* SVR Metrics */}
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                <h3 className="text-center font-semibold text-slate-900 mb-3 text-sm">
                  Support Vector Regression (SVR)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">MAE</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(svrMetrics.MAE || 0).toFixed(4)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">RMSE</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(svrMetrics.RMSE || 0).toFixed(4)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">R²</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(svrMetrics.R2 || 0).toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* RF Metrics */}
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                <h3 className="text-center font-semibold text-slate-900 mb-3 text-sm">
                  Random Forest Regressor (RF)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">MAE</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(rfMetrics.MAE || 0).toFixed(4)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">RMSE</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(rfMetrics.RMSE || 0).toFixed(4)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">R²</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(rfMetrics.R2 || 0).toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CHART WITH SIDEBAR - RESTRUCTURED LAYOUT */}
            {chartData.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT: Chart Area (75-80%) */}
                <div className="flex-1 lg:w-[75%]">
                  <div className="w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          domain={['dataMin - 100', 'dataMax + 100']}
                          tickFormatter={(value) => `${value.toFixed(0)}`}
                        />
                        <Tooltip
                          formatter={(value) => `Rp ${(value || 0).toLocaleString('id-ID')}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#5c56b6"
                          strokeWidth={2}
                          dot={false}
                          name="Harga Aktual (Close)"
                        />
                        <Line
                          type="monotone"
                          dataKey="svr"
                          stroke="#100b72"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Prediksi SVR"
                        />
                        <Line
                          type="monotone"
                          dataKey="rf"
                          stroke="#ff4444"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Prediksi RF"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart Footer Note */}
                  <p className="text-xs text-slate-500 text-center mt-4">
                    Grafik menampilkan data aktual hingga sebelum tanggal prediksi. Titik terakhir
                    adalah hasil prediksi untuk{' '}
                    {mlData?.prediction_info?.prediction_date
                      ? new Date(mlData.prediction_info.prediction_date).toLocaleDateString(
                          'id-ID',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : '02 Januari 2026'}
                    .
                  </p>
                </div>

                {/* RIGHT: Prediction Summary Sidebar (20-25%) */}
                <div className="lg:w-[25%] flex flex-col gap-3">
                  {/* GRID 1: Target Tanggal */}
                  <div className="bg-white border-l-4 border-slate-800 rounded p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Prediksi untuk</p>
                    <p className="text-base font-bold text-slate-900">
                      {mlData?.prediction_info?.prediction_date
                        ? new Date(mlData.prediction_info.prediction_date).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }
                          )
                        : '02 Januari 2026'}
                    </p>
                  </div>

                  {/* GRID 2: Harga Aktual (HARDCODED 3.660,00) */}
                  <div className="bg-white border-l-4 border-emerald-600 rounded p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Aktual (Close)</p>
                    <p className="text-xl font-bold text-slate-900">Rp 3.660,00</p>
                    <p className="text-xs text-slate-600 mt-1">30 Des 2025</p>
                  </div>

                  {/* GRID 3: Prediksi SVR */}
                  <div className="bg-white border-l-4 border-blue-600 rounded p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Prediksi SVR</p>
                    <p className="text-xl font-bold text-slate-900">
                      Rp{' '}
                      {(() => {
                        const svrPredictions = scenarioResults?.svr?.predictions || [];
                        const lastSvrValue =
                          svrPredictions.length > 0
                            ? svrPredictions[svrPredictions.length - 1]?.prediction || 0
                            : 0;
                        return lastSvrValue.toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      })()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Next Trading Day</p>
                  </div>

                  {/* GRID 4: Prediksi RFR */}
                  <div className="bg-white border-l-4 border-red-600 rounded p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Prediksi RFR</p>
                    <p className="text-xl font-bold text-slate-900">
                      Rp{' '}
                      {(() => {
                        const rfPredictions = scenarioResults?.rf?.predictions || [];
                        const lastRfValue =
                          rfPredictions.length > 0
                            ? rfPredictions[rfPredictions.length - 1]?.prediction || 0
                            : 0;
                        return lastRfValue.toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      })()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Next Trading Day</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Data grafik tidak tersedia</p>
                  <p className="text-sm mt-2">Silakan coba upload ulang dataset</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
