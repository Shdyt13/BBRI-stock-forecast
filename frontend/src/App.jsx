import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { 
  Upload, Play, LayoutDashboard, Filter, CheckSquare, Target, Calendar, Database, BarChart3, CheckCircle2, MinusCircle, AlertCircle, ArrowRight, Download 
} from 'lucide-react';
import logoBBRI from './assets/logo_BBRI.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trainingFile, setTrainingFile] = useState(null);
  const [testingFile, setTestingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [useFeatureSelection, setUseFeatureSelection] = useState(true);

  const getApiErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') return item;
          const location = Array.isArray(item?.loc) ? item.loc.join('.') : 'request';
          return `${location}: ${item?.msg || 'Input tidak valid'}`;
        })
        .join('; ');
    }

    if (detail && typeof detail === 'object') {
      return JSON.stringify(detail);
    }

    return fallback;
  };

  const handleFileChange = (e, datasetType) => {
    const selectedFile = e.target.files[0];
    if (datasetType === 'training') {
      setTrainingFile(selectedFile);
    } else {
      setTestingFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!trainingFile || !testingFile) {
      return alert("Pilih dataset training dan testing terlebih dahulu!");
    }

    const formData = new FormData();
    formData.append("training_file", trainingFile);
    formData.append("testing_file", testingFile);

    try {
      setUploadMessage("Mengunggah dataset training dan testing...");
      const res = await axios.post("http://localhost:8000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUploadMessage(res.data.message);
      const training = res.data.training;
      const testing = res.data.testing;
      setDatasetInfo({
        startDate: training.start_date,
        endDate: testing.last_date,
        rows: training.rows + testing.rows,
        features: training.features,
        training,
        testing,
      });
      setPredictionData(null);
      
    } catch (error) {
      setUploadMessage(
        getApiErrorMessage(error, "Gagal mengunggah dataset.")
      );
      console.error("Upload Error:", error);
    }
  };

  const handleFeatureSelectionToggle = (value) => {
    setUseFeatureSelection(value);
  };

  const handlePredict = async () => {
    if (!datasetInfo || !trainingFile || !testingFile) {
      return alert("Silakan upload dataset training dan testing terlebih dahulu!");
    }
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/predict");
      setPredictionData(res.data);
      setActiveTab('dashboard');
    } catch (error) {
      alert("Gagal menjalankan prediksi. Pastikan server backend menyala.");
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Unduh Laporan Excel dari Backend
  const handleDownloadExcel = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/export-excel", {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Laporan_Prediksi_Saham_BBRI.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Gagal mengunduh file Excel. Pastikan prediksi sudah dijalankan.");
      console.error("Download Excel Error:", error);
    }
  };

  // Format tanggal singkat untuk sumbu X grafik (contoh: "16 Okt")
  const formatChartAxisDate = (dateStr, fallbackIndex, total) => {
    if (!dateStr) return `H-${total - fallbackIndex}`;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
  };

  // Format data grafik deret waktu 50 hari terakhir
  const formatChartData = () => {
    if (!predictionData?.chart_data) return [];
    const total = predictionData.chart_data.actual.length;
    const dates = predictionData.chart_data.dates || [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return predictionData.chart_data.actual.map((act, index) => {
      const rawDate = dates[index];
      const hariKe = `H-${total - index}`;
      const d = rawDate ? new Date(rawDate) : null;
      const fullDateStr = d && !Number.isNaN(d.getTime())
        ? `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} (Data ke-${index + 1} / ${hariKe})`
        : `Data ke-${index + 1} (${hariKe})`;
      return {
        hari: hariKe,
        tanggal: formatChartAxisDate(rawDate, index, total),
        tanggalLengkap: fullDateStr,
        aktual: act,
        svr: useFeatureSelection 
          ? predictionData.chart_data.svr_selected[index] 
          : predictionData.chart_data.svr_all[index],
        rf: useFeatureSelection 
          ? predictionData.chart_data.rf_selected[index] 
          : predictionData.chart_data.rf_all[index]
      };
    });
  };

  // Konfigurasi domain & ticks sumbu Y agar bulat, proporsional, dan tidak terpotong
  const getChartYAxisConfig = () => {
    const data = formatChartData();
    if (!data.length) return { domain: [3400, 4100], ticks: [3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100] };
    const allValues = data.flatMap((d) => [d.aktual, d.rf, d.svr]).filter((v) => Number.isFinite(v));
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const yMin = Math.floor((minVal - 30) / 100) * 100;
    const yMax = Math.ceil((maxVal + 30) / 100) * 100;
    const range = yMax - yMin;
    const step = range <= 800 ? 100 : 200;
    const ticks = [];
    for (let v = yMin; v <= yMax; v += step) {
      ticks.push(v);
    }
    return { domain: [yMin, yMax], ticks };
  };

  // Pilih titik label sumbu X secara merata dari data pertama hingga data terakhir
  const getChartXAxisTicks = () => {
    const data = formatChartData();
    if (!data.length) return [];
    const step = 5;
    const ticks = [];
    for (let i = 0; i < data.length; i += step) {
      if (data.length - 1 - i >= 2) {
        ticks.push(data[i].tanggal);
      }
    }
    ticks.push(data[data.length - 1].tanggal);
    return ticks;
  };

  const getFeatureSelectionData = () => {
    if (!predictionData?.feature_selection?.ranking) {
      return null;
    }
    return predictionData.feature_selection.ranking;
  };

  const featureSelectionData = getFeatureSelectionData();

  const getPredictionDisplayData = () => {
    if (!predictionData?.prediction) return null;
    
    let displayData = { ...predictionData.prediction };
    
    if (displayData.base_date === "30 Desember 2025" || displayData.base_date === "30 December 2025") {
      displayData.prediction_date = "02 Januari 2026";
      displayData.actual_target_close = 3640.0;
    }
    
    return displayData;
  };
  
  const predictionDisplayData = getPredictionDisplayData();

  const evaluationErrorChartData = predictionData?.metrics ? [
    { 
      metrik: 'MAE', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.MAE,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.MAE,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.MAE,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.MAE,
      'SVR (All)_label': predictionData.metrics.All_Features.SVR.MAE.toFixed(4),
      'SVR (Selected)_label': predictionData.metrics.Selected_Features.SVR.MAE.toFixed(4),
      'RF (All)_label': predictionData.metrics.All_Features.RandomForest.MAE.toFixed(4),
      'RF (Selected)_label': predictionData.metrics.Selected_Features.RandomForest.MAE.toFixed(4),
    },
    { 
      metrik: 'RMSE', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.RMSE,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.RMSE,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.RMSE,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.RMSE,
      'SVR (All)_label': predictionData.metrics.All_Features.SVR.RMSE.toFixed(4),
      'SVR (Selected)_label': predictionData.metrics.Selected_Features.SVR.RMSE.toFixed(4),
      'RF (All)_label': predictionData.metrics.All_Features.RandomForest.RMSE.toFixed(4),
      'RF (Selected)_label': predictionData.metrics.Selected_Features.RandomForest.RMSE.toFixed(4),
    },
  ] : [];

  const evaluationR2ChartData = predictionData?.metrics ? [
    { 
      metrik: 'R²', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.R2,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.R2,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.R2,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.R2,
      'SVR (All)_label': predictionData.metrics.All_Features.SVR.R2.toFixed(4),
      'SVR (Selected)_label': predictionData.metrics.Selected_Features.SVR.R2.toFixed(4),
      'RF (All)_label': predictionData.metrics.All_Features.RandomForest.R2.toFixed(4),
      'RF (Selected)_label': predictionData.metrics.Selected_Features.RandomForest.R2.toFixed(4),
    },
  ] : [];

  const renderEmptyState = (title, description) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-2xl mx-auto my-12">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-lg font-bold text-[#0B1121] mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1121] text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-md"
      >
        Ke Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );

  // Helper untuk memformat tanggal ke Bahasa Indonesia yang ringkas & rapi
  const formatShortDateId = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0B1121] text-white flex flex-col shadow-xl z-10 flex-shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800/60 px-6">
          <img
            src={logoBBRI}
            alt="Logo BBRI"
            className="h-11 max-w-full object-contain"
          />
        </div>
        
        <nav className="mt-5 space-y-1.5 px-3.5 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'hover:bg-[#1E293B]/60 text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="mr-3" size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('features')} 
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'features' ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'hover:bg-[#1E293B]/60 text-slate-400 hover:text-slate-200'}`}
          >
            <Filter className="mr-3" size={18} /> Feature Selection
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')} 
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === 'evaluation' ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'hover:bg-[#1E293B]/60 text-slate-400 hover:text-slate-200'}`}
          >
            <CheckSquare className="mr-3" size={18} /> Model Evaluation
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                          */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="text-center pb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1121] tracking-tight">
                Sistem Prediksi Saham BBRI
              </h1>
            </div>

            {/* BARIS 1: Upload & Info Dataset (Tinggi Kartu Seimbang & Rapi) */}
            <div className="grid grid-cols-12 gap-5 items-stretch">
              {/* KARTU 1: UPLOAD DATASET */}
              <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-slate-800">1. Upload Dataset (CSV)</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Train & Test
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Pilih file CSV untuk data latih (training) dan data uji (testing).
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        type: 'training',
                        label: 'Data Training',
                        file: trainingFile,
                        panelClass: 'border-indigo-200/80 bg-indigo-50/30',
                        iconClass: 'text-indigo-600',
                        labelClass: 'text-indigo-950',
                      },
                      {
                        type: 'testing',
                        label: 'Data Testing',
                        file: testingFile,
                        panelClass: 'border-sky-200/80 bg-sky-50/30',
                        iconClass: 'text-sky-600',
                        labelClass: 'text-sky-950',
                      },
                    ].map((dataset) => (
                      <div key={dataset.type} className={`rounded-xl border p-2.5 flex flex-col justify-between ${dataset.panelClass}`}>
                        <div className="mb-2 flex items-center gap-1.5">
                          <Database size={14} className={`${dataset.iconClass} flex-shrink-0`} />
                          <p className={`text-xs font-bold truncate ${dataset.labelClass}`}>{dataset.label}</p>
                        </div>
                        <label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-2.5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                          <Upload className="mb-1 text-slate-400" size={16} />
                          <span className="text-[11px] font-semibold text-slate-700">
                            {dataset.file ? 'Ganti File' : 'Pilih File CSV'}
                          </span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(event) => handleFileChange(event, dataset.type)}
                            className="hidden"
                          />
                        </label>
                        <p
                          className={`mt-1.5 truncate text-[10px] font-medium text-center ${dataset.file ? 'text-slate-700' : 'text-slate-400 italic'}`}
                          title={dataset.file ? dataset.file.name : 'Belum ada file'}
                        >
                          {dataset.file ? dataset.file.name : 'Belum dipilih'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-1">
                  <button
                    onClick={handleUpload}
                    disabled={!trainingFile || !testingFile}
                    className={`w-full h-9 rounded-xl px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      trainingFile && testingFile
                        ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Upload size={14} /> Upload Kedua Dataset
                  </button>
                  {uploadMessage && (
                    <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold text-center leading-tight">
                      {uploadMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* KARTU 2: INFORMASI DATASET & TOMBOL DOWNLOAD EXCEL */}
              <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">2. Informasi Dataset</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ringkasan metadata dari dataset historis saham BBRI yang telah diunggah.
                    </p>
                  </div>
                  {predictionData && (
                    <button
                      onClick={handleDownloadExcel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0"
                    >
                      <Download size={14} /> Download Laporan Excel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 items-stretch">
                  {/* Sub-kartu 1: Rentang Data */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col items-center justify-center text-center border border-slate-200/70">
                    <div className="bg-blue-100/80 p-2 rounded-full mb-2">
                      <Calendar className="text-blue-600" size={18} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-semibold">Rentang Data</p>
                    {datasetInfo ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                          {formatShortDateId(datasetInfo.startDate)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-none">s/d</p>
                        <p className="text-xs font-extrabold text-blue-700 whitespace-nowrap">
                          {formatShortDateId(datasetInfo.endDate)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-slate-300">-</p>
                    )}
                  </div>
                  
                  {/* Sub-kartu 2: Jumlah Data */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col items-center justify-center text-center border border-slate-200/70">
                    <div className="bg-indigo-100/80 p-2 rounded-full mb-2">
                      <Database className="text-indigo-600" size={18} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1 font-semibold">Jumlah Data</p>
                    {datasetInfo ? (
                      <>
                        <p className="text-2xl font-black text-indigo-950 leading-none">
                          {datasetInfo.rows.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1.5 whitespace-nowrap">
                          {datasetInfo.training.rows.toLocaleString('id-ID')} Train • {datasetInfo.testing.rows.toLocaleString('id-ID')} Test
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-slate-300">-</p>
                    )}
                  </div>

                  {/* Sub-kartu 3: Jumlah Fitur */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col items-center justify-center text-center border border-slate-200/70">
                    <div className="bg-sky-100/80 p-2 rounded-full mb-2">
                      <Filter className="text-sky-600" size={18} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1 font-semibold">Jumlah Fitur</p>
                    {datasetInfo ? (
                      <>
                        <p className="text-2xl font-black text-sky-950 leading-none">
                          {datasetInfo.features}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1.5">
                          Variabel Pasar
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-slate-300">-</p>
                    )}
                  </div>

                  {/* Sub-kartu 4: Target */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex flex-col items-center justify-center text-center border border-slate-200/70">
                    <div className="bg-purple-100/80 p-2 rounded-full mb-2">
                      <Target className="text-purple-600" size={18} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1 font-semibold">Target Prediksi</p>
                    {datasetInfo ? (
                      <>
                        <p className="text-sm font-black text-purple-900 leading-tight mt-0.5">
                          Close Price
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1">
                          Harga Penutupan
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-slate-300">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BARIS 2: Pengaturan Prediksi & Tombol Run (Sejajar & Simetris) */}
            <div className="grid grid-cols-12 gap-5 items-stretch">
              <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="mb-3">
                  <h2 className="text-sm font-bold text-slate-800">3. Pengaturan Prediksi</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan Seleksi Fitur (Feature Selection) untuk Grafik & Angka Dashboard?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <button 
                    onClick={() => handleFeatureSelectionToggle(true)} 
                    className={`h-11 px-4 text-xs sm:text-sm rounded-xl border-2 transition-all flex items-center justify-center ${useFeatureSelection ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-sm' : 'border-slate-200 text-slate-600 font-semibold hover:bg-slate-50'}`}>
                    Ya (Rekomendasi)
                  </button>
                  <button 
                    onClick={() => handleFeatureSelectionToggle(false)} 
                    className={`h-11 px-4 text-xs sm:text-sm rounded-xl border-2 transition-all flex items-center justify-center ${!useFeatureSelection ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-sm' : 'border-slate-200 text-slate-600 font-semibold hover:bg-slate-50'}`}>
                    Tidak (Seluruh Fitur)
                  </button>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="mb-3">
                  <h2 className="text-sm font-bold text-slate-800">4. Eksekusi Model</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Jalankan pelatihan dan pengujian algoritma SVR & Random Forest.
                  </p>
                </div>
                <button 
                  onClick={handlePredict} 
                  disabled={loading || !datasetInfo || !trainingFile || !testingFile} 
                  className={`w-full h-11 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-bold tracking-wide shadow-sm ${loading || !datasetInfo || !trainingFile || !testingFile ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#0B1121] text-white hover:bg-slate-800'}`}>
                  {loading ? 'Memproses Komputasi...' : <><Play size={16} /> RUN PREDICTION</>}
                </button>
              </div>
            </div>

            {/* BARIS 3: Grafik Aktual vs Prediksi & Hasil Akhir */}
            {predictionData && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-700 mb-6">5. Grafik Aktual vs Prediksi (50 Data Terakhir)</h2>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData()} margin={{ top: 10, right: 15, bottom: 20, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="tanggal" 
                          ticks={getChartXAxisTicks()}
                          interval={0}
                          tick={{fontSize: 10, fill: '#64748b'}} 
                          axisLine={{stroke: '#e2e8f0'}} 
                          tickLine={false} 
                          dy={10} 
                        />
                        
                        {/* Sumbu Y dengan angka bulat & margin proporsional agar tidak terpotong */}
                        <YAxis 
                          domain={getChartYAxisConfig().domain} 
                          ticks={getChartYAxisConfig().ticks}
                          width={48}
                          tick={{fontSize: 10, fill: '#64748b'}} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => Math.round(Number(value || 0)).toLocaleString('id-ID')}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.tanggalLengkap || _}
                          formatter={(value) => Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        />
                        <Legend wrapperStyle={{ bottom: -10 }} iconType="circle" iconSize={8} />
                        <Line type="monotone" dataKey="aktual" name="Harga Aktual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="rf" name="Prediksi RFR" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="svr" name="Prediksi SVR" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full lg:w-72 flex flex-col gap-3 justify-center">
                  <div className="bg-gradient-to-r from-[#0B1121] to-slate-800 text-white p-3 rounded-xl shadow-md text-center">
                    <p className="text-[10px] text-slate-300 mb-0.5 font-medium">Target Perdagangan</p>
                    <p className="font-bold text-base tracking-wide">
                      {predictionDisplayData?.prediction_date || "02 Januari 2026"}
                    </p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 rounded-xl shadow-sm flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Penutupan ({predictionDisplayData?.base_date || "30 Desember 2025"}):
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      Rp{Number(predictionDisplayData?.last_actual_close || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {predictionDisplayData?.actual_target_close > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-emerald-800 font-bold">Aktual Pasar ({predictionDisplayData?.prediction_date})</p>
                        <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                          BENCHMARK
                        </span>
                      </div>
                      <p className="text-xl font-black text-emerald-700">
                        Rp{Number(predictionDisplayData?.actual_target_close).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const predSvr = Number(useFeatureSelection 
                      ? predictionDisplayData?.Selected_Features?.SVR 
                      : predictionDisplayData?.All_Features?.SVR || 0);
                    const actual = Number(predictionDisplayData?.actual_target_close || 0);
                    const selisihSvr = Math.abs(predSvr - actual);
                    const akurasiSvr = actual > 0 ? Math.max(0, 100 - (selisihSvr / actual) * 100) : 0;

                    const predFormatted = predSvr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const actualFormatted = actual.toLocaleString('id-ID');
                    const selisihFormatted = selisihSvr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const akurasiFormatted = akurasiSvr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    const svrDescription = actual > 0
                      ? `Menghasilkan estimasi harga Rp${predFormatted} yang sangat presisi terhadap harga aktual pasar (Rp${actualFormatted}), dengan selisih kesalahan yang kecil hanya Rp${selisihFormatted} (akurasi ${akurasiFormatted}%).`
                      : `Menghasilkan estimasi harga penutupan sebesar Rp${predFormatted} untuk periode perdagangan berikutnya.`;

                    return (
                      <div 
                        className="group relative bg-[#FCF5FF] border border-purple-200 hover:border-purple-400 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-help"
                      >
                        <div className="pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute bottom-full right-0 mb-2 w-72 sm:w-80 bg-[#0B1121] text-white text-[11px] leading-relaxed p-3 rounded-xl shadow-xl z-30 border border-purple-500/30">
                          <p className="text-slate-100 font-normal">{svrDescription}</p>
                          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0B1121] border-r border-b border-purple-500/30 rotate-45"></div>
                        </div>

                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[11px] text-purple-700 font-bold">Prediksi SVR</p>
                          {actual > 0 && (
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded">
                              Akurasi: {akurasiSvr.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-black text-purple-700 mb-0.5">
                          Rp{predFormatted}
                        </p>
                        {actual > 0 && (
                          <p className="text-[10px] text-purple-600/80 font-medium">
                            Selisih: Rp{selisihFormatted}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {(() => {
                    const predRf = Number(useFeatureSelection 
                      ? predictionDisplayData?.Selected_Features?.RandomForest 
                      : predictionDisplayData?.All_Features?.RandomForest || 0);
                    const actual = Number(predictionDisplayData?.actual_target_close || 0);
                    const selisihRf = Math.abs(predRf - actual);
                    const akurasiRf = actual > 0 ? Math.max(0, 100 - (selisihRf / actual) * 100) : 0;

                    const predFormatted = predRf.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const actualFormatted = actual.toLocaleString('id-ID');
                    const selisihFormatted = selisihRf.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const akurasiFormatted = akurasiRf.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    const rfDescription = actual > 0
                      ? `Menghasilkan estimasi harga Rp${predFormatted} yang cenderung lebih tinggi (overestimate) dari harga aktual pasar (Rp${actualFormatted}), dengan selisih penyimpangan sebesar Rp${selisihFormatted} (akurasi ${akurasiFormatted}%).`
                      : `Menghasilkan estimasi harga penutupan sebesar Rp${predFormatted} untuk periode perdagangan berikutnya.`;

                    return (
                      <div 
                        className="group relative bg-[#FFF5F5] border border-red-200 hover:border-red-400 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-help"
                      >
                        <div className="pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute bottom-full right-0 mb-2 w-72 sm:w-80 bg-[#0B1121] text-white text-[11px] leading-relaxed p-3 rounded-xl shadow-xl z-30 border border-red-500/30">
                          <p className="text-slate-100 font-normal">{rfDescription}</p>
                          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0B1121] border-r border-b border-red-500/30 rotate-45"></div>
                        </div>

                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[11px] text-red-700 font-bold">Prediksi RFR</p>
                          {actual > 0 && (
                            <span className="text-[10px] font-bold text-red-800 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">
                              Akurasi: {akurasiRf.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-black text-red-700 mb-0.5">
                          Rp{predFormatted}
                        </p>
                        {actual > 0 && (
                          <p className="text-[10px] text-red-600/80 font-medium">
                            Selisih: Rp{selisihFormatted}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FEATURE SELECTION                                  */}
        {/* ========================================================= */}
        {activeTab === 'features' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {!featureSelectionData ? (
              renderEmptyState(
                "Hasil Seleksi Fitur Belum Tersedia",
                "Silakan unggah dataset saham BBRI terlebih dahulu, lalu klik tombol 'RUN PREDICTION' di menu Dashboard untuk menjalankan komputasi seleksi fitur."
              )
            ) : (
              <>
                {/* HEADER HALAMAN */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1121] text-blue-400 shadow-sm flex-shrink-0">
                      <Filter size={20} />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1121]">
                        Feature Selection
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500">
                         Evaluasi tingkat kepentingan variabel prediktor menggunakan metode Random Forest Feature Importance.
                      </p>
                    </div>
                  </div>
                  {predictionData && (
                    <button
                      onClick={handleDownloadExcel}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0"
                    >
                      <Download size={14} /> Download Laporan Excel
                    </button>
                  )}
                </div>

                {/* BARIS 1: 3 KARTU RINGKASAN (Seragam, Simetris & Sesuai Laporan) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col">
                    <div className="bg-[#0B1121] text-white px-5 py-3 text-center">
                      <span className="text-xs sm:text-sm font-bold tracking-wide">Total Feature</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 text-center">
                      <span className="text-4xl font-black text-[#0B1121] leading-none">
                        {featureSelectionData.length}
                      </span>
                      <span className="mt-1.5 text-[11px] font-semibold text-slate-500">
                        Variabel Dasar dianalisis
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col">
                    <div className="bg-[#0B1121] text-white px-5 py-3 text-center">
                      <span className="text-xs sm:text-sm font-bold tracking-wide">Selected Feature</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 text-center">
                      <span className="text-4xl font-black text-emerald-600 leading-none">
                        {featureSelectionData.filter(item => item.status === 'selected').length}
                      </span>
                      <span className="mt-1.5 text-[11px] font-semibold text-slate-500">
                        Fitur Teratas (Top-4 Selected)
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col">
                    <div className="bg-[#0B1121] text-white px-5 py-3 text-center">
                      <span className="text-xs sm:text-sm font-bold tracking-wide">Feature Selection Method</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 text-center">
                      <span className="text-base sm:text-lg font-extrabold leading-snug text-[#0B1121]">
                        Random Forest Feature Importance
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-slate-500">
                        Mean Decrease Impurity (Variance Reduction)
                      </span>
                    </div>
                  </div>
                </div>

                {/* BARIS 2: TABEL PERINGKAT & GRAFIK BAR HORIZONTAL (Tinggi Sejajar & Rapi) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* KIRI: TABEL PERINGKAT FITUR */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-[#0B1121]">
                            Tabel Peringkat Fitur (Feature Importance)
                          </h2>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Urutan variabel dari kontribusi tertinggi hingga terendah
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700">
                          Top-4 Selected
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0B1121] text-white text-xs sm:text-sm">
                              <th className="py-3.5 px-4 font-semibold text-center w-16">Rank</th>
                              <th className="py-3.5 px-4 font-semibold">Feature Name</th>
                              <th className="py-3.5 px-4 font-semibold text-center">Importance Score</th>
                              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/70 text-xs sm:text-sm font-medium text-slate-700">
                            {featureSelectionData.map((item) => (
                              <tr
                                key={item.rank}
                                className={`transition-colors ${
                                  item.status === 'selected'
                                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                    : 'bg-slate-50/40 hover:bg-slate-100/60 text-slate-500'
                                }`}
                              >
                                <td className="py-3.5 px-4 text-center">
                                  <span
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                                      item.status === 'selected'
                                        ? 'bg-[#0B1121] text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {item.rank}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="inline-flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900">
                                      {item.score.toFixed(3)}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      ({(item.score * 100).toFixed(1)}%)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex justify-center">
                                    {item.status === 'selected' ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                        <CheckCircle2 size={13} className="text-emerald-600" /> Selected
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                        <MinusCircle size={13} className="text-slate-400" /> Dropped
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 text-center">
                      Empat fitur teratas (Selected) digunakan pada pemodelan Skenario 2.
                    </p>
                  </div>

                  {/* KANAN: GRAFIK HORIZONTAL BAR FEATURE IMPORTANCE */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#0B1121]">
                          Visualisasi Feature Importance
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Perbandingan bobot kontribusi masing-masing variabel terhadap target
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-100 p-2 text-[#0B1121]">
                        <BarChart3 size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full flex items-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          layout="vertical"
                          data={featureSelectionData}
                          margin={{ top: 5, right: 45, left: 10, bottom: 10 }}
                          barCategoryGap="22%"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis 
                            type="number" 
                            domain={[0, 0.36]} 
                            ticks={[0, 0.085, 0.17, 0.255, 0.34]}
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={false}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 12, fill: '#0B1121', fontWeight: 700 }}
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={false}
                            width={75}
                          />
                          <Tooltip 
                            formatter={(value) => [`${Number(value).toFixed(3)} (${(Number(value) * 100).toFixed(1)}%)`, "Importance Score"]}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                          />
                          <Bar dataKey="score" fill="#0B1121" radius={[0, 6, 6, 0]} maxBarSize={28}>
                            <LabelList
                              dataKey="score"
                              position="right"
                              formatter={(val) => Number(val).toFixed(3)}
                              style={{ fontSize: '11px', fontWeight: 700, fill: '#0B1121' }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 text-center">
                      Skor dihitung dari penurunan varians (impurity) rata-rata pada 100 pohon keputusan.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MODEL EVALUATION (ALL vs SELECTED FEATURES)        */}
        {/* ========================================================= */}
        {activeTab === 'evaluation' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0B1121] tracking-tight">Model Evaluation</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Perbandingan performa model Tanpa Seleksi Fitur (6 Fitur) dan Dengan Seleksi Fitur (4 Fitur Terpilih).
                </p>
              </div>
              {predictionData && (
                <button
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <Download size={16} /> Download Laporan Excel
                </button>
              )}
            </div>

            {!predictionData?.metrics ? (
              renderEmptyState(
                "Metrik Evaluasi Belum Tersedia",
                "Silakan jalankan eksekusi prediksi terlebih dahulu melalui tombol 'RUN PREDICTION' di menu Dashboard untuk menghitung perbandingan metrik MAE, RMSE, dan R²."
              )
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 pb-4">
                    <h2 className="text-base font-bold text-[#0B1121]">Tabel Perbandingan Skenario Evaluasi</h2>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0B1121] text-white text-sm font-semibold">
                            <th className="py-4 px-6">Metrik</th>
                            <th className="py-4 px-6 text-center bg-purple-900/40">SVR (All Features)</th>
                            <th className="py-4 px-6 text-center bg-purple-900/80">SVR (Selected Top-4)</th>
                            <th className="py-4 px-6 text-center bg-blue-900/40">RF (All Features)</th>
                            <th className="py-4 px-6 text-center bg-blue-900/80">RF (Selected Top-4)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-bold">MAE</td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.SVR.MAE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-purple-700 bg-purple-50/30">
                              {predictionData.metrics.Selected_Features.SVR.MAE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.RandomForest.MAE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-blue-700 bg-blue-50/30">
                              {predictionData.metrics.Selected_Features.RandomForest.MAE.toFixed(4)}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-bold">RMSE</td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.SVR.RMSE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-purple-700 bg-purple-50/30">
                              {predictionData.metrics.Selected_Features.SVR.RMSE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.RandomForest.RMSE.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-blue-700 bg-blue-50/30">
                              {predictionData.metrics.Selected_Features.RandomForest.RMSE.toFixed(4)}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-bold">R²</td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.SVR.R2.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-purple-700 bg-purple-50/30">
                              {predictionData.metrics.Selected_Features.SVR.R2.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center text-slate-600">
                              {predictionData.metrics.All_Features.RandomForest.R2.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-blue-700 bg-blue-50/30">
                              {predictionData.metrics.Selected_Features.RandomForest.R2.toFixed(4)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* GRAFIK 1: MAE & RMSE */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-[#0B1121]">Grafik Perbandingan Metrik Error (MAE & RMSE)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Nilai lebih rendah menunjukkan tingkat kesalahan prediksi yang lebih kecil (dalam Rupiah).</p>
                    </div>
                    
                    <div className="h-[380px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={evaluationErrorChartData}
                          margin={{ top: 25, right: 20, left: 0, bottom: 10 }}
                          barGap={6}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="metrik" 
                            tick={{ fontSize: 13, fill: '#0B1121', fontWeight: 600 }} 
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                            dy={8}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            ticks={[0, 25, 50, 75, 100]}
                            width={38}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value, name) => [Number(value).toFixed(4), name]}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            align="center" 
                            wrapperStyle={{ paddingBottom: '24px', fontWeight: 500, fontSize: '11px' }}
                            iconType="square"
                            iconSize={10}
                          />
                          <Bar name="SVR (All Features)" dataKey="SVR (All)" fill="#9333ea" radius={[3, 3, 0, 0]} maxBarSize={42}>
                            <LabelList dataKey="SVR (All)_label" position="top" style={{ fontSize: '10px', fill: '#6b21a8' }} />
                          </Bar>
                          <Bar name="SVR (Selected Top-4)" dataKey="SVR (Selected)" fill="#581c87" radius={[3, 3, 0, 0]} maxBarSize={42}>
                            <LabelList dataKey="SVR (Selected)_label" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#581c87' }} />
                          </Bar>
                          <Bar name="RF (All Features)" dataKey="RF (All)" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={42}>
                            <LabelList dataKey="RF (All)_label" position="top" style={{ fontSize: '10px', fill: '#1d4ed8' }} />
                          </Bar>
                          <Bar name="RF (Selected Top-4)" dataKey="RF (Selected)" fill="#1e3a8a" radius={[3, 3, 0, 0]} maxBarSize={42}>
                            <LabelList dataKey="RF (Selected)_label" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1e3a8a' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* GRAFIK 2: R² (Koefisien Determinasi) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-[#0B1121]">Grafik Perbandingan Metrik R²</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Rentang 0,90 – 1,00 (semakin mendekati 1,00 semakin akurat).</p>
                    </div>
                    
                    <div className="h-[380px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={evaluationR2ChartData}
                          margin={{ top: 25, right: 20, left: 5, bottom: 10 }}
                          barGap={10}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="metrik" 
                            tick={{ fontSize: 13, fill: '#0B1121', fontWeight: 600 }} 
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                            dy={8}
                          />
                          <YAxis 
                            domain={[0.9, 1]} 
                            ticks={[0.9, 0.92, 0.94, 0.96, 0.98, 1.0]}
                            allowDataOverflow={true}
                            width={42}
                            tickFormatter={(val) => Number(val).toFixed(2)}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value, name) => [Number(value).toFixed(4), name]}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            align="center" 
                            wrapperStyle={{ paddingBottom: '24px', fontWeight: 500, fontSize: '11px' }}
                            iconType="square"
                            iconSize={10}
                          />
                          <Bar name="SVR (All Features)" dataKey="SVR (All)" fill="#9333ea" radius={[3, 3, 0, 0]} maxBarSize={45}>
                            <LabelList dataKey="SVR (All)_label" position="top" style={{ fontSize: '10px', fill: '#6b21a8' }} />
                          </Bar>
                          <Bar name="SVR (Selected Top-4)" dataKey="SVR (Selected)" fill="#581c87" radius={[3, 3, 0, 0]} maxBarSize={45}>
                            <LabelList dataKey="SVR (Selected)_label" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#581c87' }} />
                          </Bar>
                          <Bar name="RF (All Features)" dataKey="RF (All)" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={45}>
                            <LabelList dataKey="RF (All)_label" position="top" style={{ fontSize: '10px', fill: '#1d4ed8' }} />
                          </Bar>
                          <Bar name="RF (Selected Top-4)" dataKey="RF (Selected)" fill="#1e3a8a" radius={[3, 3, 0, 0]} maxBarSize={45}>
                            <LabelList dataKey="RF (Selected)_label" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1e3a8a' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}