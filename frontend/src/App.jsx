import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { 
  Upload, Play, LayoutDashboard, Filter, CheckSquare, Target, Calendar, Database, CheckCircle2, MinusCircle, AlertCircle, ArrowRight, Download 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [useFeatureSelection, setUseFeatureSelection] = useState(true);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file CSV terlebih dahulu!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadMessage("Mengunggah dan memproses dataset...");
      const res = await axios.post("http://localhost:8000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUploadMessage(res.data.message);
      setDatasetInfo({
        startDate: "02 Januari 2015", 
        endDate: res.data.last_date || "30 Desember 2025",
        rows: res.data.rows,
        features: 6
      });
      
    } catch (error) {
      setUploadMessage("Gagal mengunggah dataset.");
      console.error("Upload Error:", error);
    }
  };

  const handleFeatureSelectionToggle = (value) => {
    setUseFeatureSelection(value);
  };

  const handlePredict = async () => {
    if (!datasetInfo) return alert("Silakan upload dataset terlebih dahulu!");
    
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

  // Format data grafik deret waktu 50 hari terakhir
  const formatChartData = () => {
    if (!predictionData?.chart_data) return [];
    return predictionData.chart_data.actual.map((act, index) => ({
      hari: `H-${50 - index}`,
      aktual: act,
      svr: useFeatureSelection 
        ? predictionData.chart_data.svr_selected[index] 
        : predictionData.chart_data.svr_all[index],
      rf: useFeatureSelection 
        ? predictionData.chart_data.rf_selected[index] 
        : predictionData.chart_data.rf_all[index]
    }));
  };

  const getFeatureSelectionData = () => {
    if (!predictionData?.feature_selection?.ranking) {
      return null;
    }
    return predictionData.feature_selection.ranking;
  };

  const featureSelectionData = getFeatureSelectionData();

  const evaluationChartData = predictionData?.metrics ? [
    { 
      metrik: 'MAE', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.MAE,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.MAE,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.MAE,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.MAE,
    },
    { 
      metrik: 'RMSE', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.RMSE,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.RMSE,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.RMSE,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.RMSE,
    },
    { 
      metrik: 'R²', 
      'SVR (All)': predictionData.metrics.All_Features.SVR.R2,
      'SVR (Selected)': predictionData.metrics.Selected_Features.SVR.R2,
      'RF (All)': predictionData.metrics.All_Features.RandomForest.R2,
      'RF (Selected)': predictionData.metrics.Selected_Features.RandomForest.R2,
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

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0B1121] text-white flex flex-col shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
          <img 
            src="/logo-bbri.png" 
            alt="Logo BBRI" 
            className="h-10 object-contain" 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" 
            }} 
          />
        </div>
        
        <nav className="mt-6 space-y-2 px-4 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}
          >
            <LayoutDashboard className="mr-3" size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('features')} 
            className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'features' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}
          >
            <Filter className="mr-3" size={20} /> Feature Selection
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')} 
            className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'evaluation' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}
          >
            <CheckSquare className="mr-3" size={20} /> Model Evaluation
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                          */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-extrabold text-[#0B1121] tracking-tight">Sistem Prediksi Saham BBRI</h1>
            </div>

            {/* BARIS 1: Upload & Info Dataset */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700 mb-3">1. Upload Dataset (CSV / Excel)</h2>
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-indigo-50/50 transition-colors h-28">
                  <Upload className="text-indigo-400 mb-2" size={24} />
                  <p className="text-[11px] text-slate-500 mb-2">Drag & drop file di sini atau</p>
                  <label className="bg-[#0B1121] text-white px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition font-medium text-[11px] shadow-md">
                    Browse File
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                {file && (
                  <div className="mt-3 flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-100">
                    <span className="text-[11px] text-green-800 font-medium truncate pr-3">{file.name}</span>
                    <button onClick={handleUpload} className="text-[11px] bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition font-bold shadow-sm">
                      Upload
                    </button>
                  </div>
                )}
                {uploadMessage && <p className="text-[10px] text-green-600 mt-2 font-semibold text-center">{uploadMessage}</p>}
              </div>

              {/* KARTU 2: INFORMASI DATASET & TOMBOL DOWNLOAD EXCEL */}
              <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-700">2. Informasi Dataset</h2>
                  {predictionData && (
                    <button
                      onClick={handleDownloadExcel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <Download size={14} /> Download Laporan Excel
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 h-28">
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                    <Calendar className="text-blue-500 mb-1.5" size={20} />
                    <p className="text-[10px] text-slate-500 mb-1 font-medium">Rentang Data</p>
                    {datasetInfo ? (
                      <>
                        <p className="text-[11px] font-bold text-slate-800">{datasetInfo.startDate}</p>
                        <p className="text-[9px] text-slate-400 leading-none">–</p>
                        <p className="text-[11px] font-bold text-slate-800">{datasetInfo.endDate}</p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-slate-300">-</p>
                    )}
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                    <div className="bg-blue-100 p-1.5 rounded-full mb-1.5"><Database className="text-blue-600" size={16}/></div>
                    <p className="text-[10px] text-slate-500 mb-1 font-medium">Jumlah Data</p>
                    {datasetInfo ? (
                      <><p className="text-lg font-bold text-blue-900 leading-tight">{datasetInfo.rows.toLocaleString()}</p><p className="text-[9px] text-slate-400">Baris</p></>
                    ) : (
                      <p className="text-lg font-bold text-slate-300">-</p>
                    )}
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                    <div className="bg-indigo-100 p-1.5 rounded-full mb-1.5"><Filter className="text-indigo-600" size={16}/></div>
                    <p className="text-[10px] text-slate-500 mb-1 font-medium">Jumlah Fitur</p>
                    {datasetInfo ? (
                      <><p className="text-lg font-bold text-indigo-900 leading-tight">{datasetInfo.features}</p><p className="text-[9px] text-slate-400">Variabel</p></>
                    ) : (
                      <p className="text-lg font-bold text-slate-300">-</p>
                    )}
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
                    <div className="bg-purple-100 p-1.5 rounded-full mb-1.5"><Target className="text-purple-600" size={16}/></div>
                    <p className="text-[10px] text-slate-500 mb-1 font-medium">Target</p>
                    {datasetInfo ? (
                      <p className="text-[11px] font-bold text-purple-900 mt-1">Close Price</p>
                    ) : (
                      <p className="text-lg font-bold text-slate-300">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BARIS 2: Pengaturan Prediksi & Tombol Run */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                <div className="w-full">
                  <h2 className="text-sm font-bold text-slate-700 mb-2">3. Pengaturan Prediksi</h2>
                  <p className="text-[11px] font-medium text-slate-500 mb-3">Gunakan Seleksi Fitur (Feature Selection) untuk Grafik & Angka Dashboard?</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleFeatureSelectionToggle(true)} 
                      className={`flex-1 py-2 text-sm rounded-xl border-2 transition-all ${useFeatureSelection ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-sm' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                      Ya (Rekomendasi)
                    </button>
                    <button 
                      onClick={() => handleFeatureSelectionToggle(false)} 
                      className={`flex-1 py-2 text-sm rounded-xl border-2 transition-all ${!useFeatureSelection ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-sm' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                      Tidak (Seluruh Fitur)
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <h2 className="text-sm font-bold text-slate-700 mb-3">4. Eksekusi Model</h2>
                <button 
                  onClick={handlePredict} 
                  disabled={loading || !datasetInfo} 
                  className={`w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-bold tracking-wide shadow-md ${loading || !datasetInfo ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0B1121] text-white hover:bg-slate-800'}`}>
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
                      <LineChart data={formatChartData()} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hari" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} dy={10} />
                        
                        {/* PERBAIKAN: Sumbu Y dengan domain ketat agar fluktuasi grafik terlihat tajam */}
                        <YAxis 
                          domain={['dataMin - 50', 'dataMax + 50']} 
                          tick={{fontSize: 10, fill: '#94a3b8'}} 
                          axisLine={false} 
                          tickLine={false} 
                          dx={-10} 
                          tickFormatter={(value) => Number(value || 0).toLocaleString('id-ID')}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
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
                      {predictionData?.prediction?.prediction_date || "02 Januari 2026"}
                    </p>
                  </div>
                  
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-emerald-800 font-bold">Aktual Pasar (02 Jan 2026)</p>
                      <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        BENCHMARK
                      </span>
                    </div>
                    <p className="text-xl font-black text-emerald-700">
                      Rp{Number(predictionData?.prediction?.actual_target_close || 3640).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 rounded-xl shadow-sm flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Penutupan ({predictionData?.prediction?.base_date || "30 Desember 2025"}):
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      Rp{Number(predictionData?.prediction?.last_actual_close || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="bg-[#FCF5FF] border border-purple-200 p-3 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[11px] text-purple-700 font-bold">Prediksi SVR</p>
                      {(() => {
                        const pred = Number(useFeatureSelection 
                          ? predictionData?.prediction?.Selected_Features?.SVR 
                          : predictionData?.prediction?.All_Features?.SVR || 0);
                        const actual = Number(predictionData?.prediction?.actual_target_close || 3640);
                        const selisih = Math.abs(pred - actual);
                        const akurasi = Math.max(0, 100 - (selisih / actual) * 100);
                        return (
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded">
                            Akurasi: {akurasi.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xl font-black text-purple-700 mb-0.5">
                      Rp{Number(useFeatureSelection 
                        ? predictionData?.prediction?.Selected_Features?.SVR 
                        : predictionData?.prediction?.All_Features?.SVR || 0
                      ).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <p className="text-[10px] text-purple-600/80 font-medium">
                      Selisih: Rp{(() => {
                        const pred = Number(useFeatureSelection 
                          ? predictionData?.prediction?.Selected_Features?.SVR 
                          : predictionData?.prediction?.All_Features?.SVR || 0);
                        const actual = Number(predictionData?.prediction?.actual_target_close || 3640);
                        return Math.abs(pred - actual).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                      })()}
                    </p>
                  </div>

                  <div className="bg-[#FFF5F5] border border-red-200 p-3 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[11px] text-red-700 font-bold">Prediksi RFR</p>
                      {(() => {
                        const pred = Number(useFeatureSelection 
                          ? predictionData?.prediction?.Selected_Features?.RandomForest 
                          : predictionData?.prediction?.All_Features?.RandomForest || 0);
                        const actual = Number(predictionData?.prediction?.actual_target_close || 3640);
                        const selisih = Math.abs(pred - actual);
                        const akurasi = Math.max(0, 100 - (selisih / actual) * 100);
                        return (
                          <span className="text-[10px] font-bold text-red-800 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">
                            Akurasi: {akurasi.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xl font-black text-red-700 mb-0.5">
                      Rp{Number(useFeatureSelection 
                        ? predictionData?.prediction?.Selected_Features?.RandomForest 
                        : predictionData?.prediction?.All_Features?.RandomForest || 0
                      ).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <p className="text-[10px] text-red-600/80 font-medium">
                      Selisih: Rp{(() => {
                        const pred = Number(useFeatureSelection 
                          ? predictionData?.prediction?.Selected_Features?.RandomForest 
                          : predictionData?.prediction?.All_Features?.RandomForest || 0);
                        const actual = Number(predictionData?.prediction?.actual_target_close || 3640);
                        return Math.abs(pred - actual).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FEATURE SELECTION                                  */}
        {/* ========================================================= */}
        {activeTab === 'features' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {!featureSelectionData ? (
              renderEmptyState(
                "Hasil Seleksi Fitur Belum Tersedia",
                "Silakan unggah dataset saham BBRI terlebih dahulu, lalu klik tombol 'RUN PREDICTION' di menu Dashboard untuk menjalankan komputasi seleksi fitur."
              )
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0B1121] text-white text-center py-3 text-sm font-semibold tracking-wide">
                      Total Feature
                    </div>
                    <div className="py-8 flex items-center justify-center">
                      <span className="text-5xl font-black text-[#0B1121]">{featureSelectionData.length}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0B1121] text-white text-center py-3 text-sm font-semibold tracking-wide">
                      Selected Feature
                    </div>
                    <div className="py-8 flex items-center justify-center">
                      <span className="text-5xl font-black text-[#0B1121]">
                        {featureSelectionData.filter(item => item.status === 'selected').length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0B1121] text-white text-center py-3 text-sm font-semibold tracking-wide">
                      Feature Selection Method
                    </div>
                    <div className="py-8 flex items-center justify-center px-4 text-center">
                      <span className="text-xl font-bold text-[#0B1121] leading-snug">
                        Random Forest Feature<br />Importance
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0B1121] text-white text-sm">
                          <th className="py-4 px-6 font-semibold">Rank</th>
                          <th className="py-4 px-6 font-semibold">Feature Name</th>
                          <th className="py-4 px-6 font-semibold">Importance Score</th>
                          <th className="py-4 px-6 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {featureSelectionData.map((item) => (
                          <tr key={item.rank} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-bold text-[#0B1121]">{item.rank}</td>
                            <td className="py-4 px-6">{item.name}</td>
                            <td className="py-4 px-6">{item.score.toFixed(3)}</td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex justify-center">
                                {item.status === 'selected' ? (
                                  <CheckCircle2 className="text-[#0B1121] fill-[#0B1121] text-white" size={24} />
                                ) : (
                                  <MinusCircle className="text-[#0B1121]" size={24} />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center">
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={featureSelectionData}
                          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                          barCategoryGap="25%"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis 
                            type="number" 
                            domain={[0, 'auto']} 
                            tick={{ fontSize: 12, fill: '#0B1121', fontWeight: 600 }}
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={false}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 13, fill: '#0B1121', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            width={75}
                          />
                          <Tooltip 
                            formatter={(value) => [Number(value).toFixed(3), "Score"]}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          />
                          <Bar dataKey="score" fill="#0B1121" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-[#0B1121] mb-6">Grafik Perbandingan Metrik (All vs. Selected)</h2>
                  
                  <div className="h-[400px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={evaluationChartData}
                        margin={{ top: 25, right: 30, left: 10, bottom: 10 }}
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
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => Number(value).toFixed(4)}
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          align="center" 
                          wrapperStyle={{ paddingBottom: '30px', fontWeight: 500, fontSize: '12px' }}
                          iconType="square"
                          iconSize={10}
                        />
                        <Bar name="SVR (All Features)" dataKey="SVR (All)" fill="#9333ea" radius={[2, 2, 0, 0]} maxBarSize={45}>
                          <LabelList dataKey="SVR (All)" position="top" formatter={(val) => Number(val).toFixed(4)} style={{ fontSize: '10px', fill: '#6b21a8' }} />
                        </Bar>
                        <Bar name="SVR (Selected Top-4)" dataKey="SVR (Selected)" fill="#581c87" radius={[2, 2, 0, 0]} maxBarSize={45}>
                          <LabelList dataKey="SVR (Selected)" position="top" formatter={(val) => Number(val).toFixed(4)} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#581c87' }} />
                        </Bar>
                        <Bar name="RF (All Features)" dataKey="RF (All)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={45}>
                          <LabelList dataKey="RF (All)" position="top" formatter={(val) => Number(val).toFixed(4)} style={{ fontSize: '10px', fill: '#1d4ed8' }} />
                        </Bar>
                        <Bar name="RF (Selected Top-4)" dataKey="RF (Selected)" fill="#1e3a8a" radius={[2, 2, 0, 0]} maxBarSize={45}>
                          <LabelList dataKey="RF (Selected)" position="top" formatter={(val) => Number(val).toFixed(4)} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1e3a8a' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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