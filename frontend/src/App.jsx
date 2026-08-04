import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Play, LayoutDashboard, Filter, CheckSquare, Target, Calendar, Database 
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
        endDate: "30 Desember 2025",
        rows: res.data.rows,
        features: 6
      });
      
    } catch (error) {
      setUploadMessage("Gagal mengunggah dataset.");
      console.error(error);
    }
  };

  // Fungsi toggle dikembalikan seperti semula (instan) tanpa menghapus predictionData
  const handleFeatureSelectionToggle = (value) => {
    setUseFeatureSelection(value);
  };

  const handlePredict = async () => {
    if (!datasetInfo) return alert("Silakan upload dataset terlebih dahulu!");
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/predict");
      setPredictionData(res.data);
    } catch (error) {
      alert("Gagal menjalankan prediksi. Pastikan server backend menyala.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!predictionData) return [];
    return predictionData.chart_data.actual.map((act, index) => ({
      hari: `H-${50 - index}`,
      aktual: act,
      svr: useFeatureSelection ? predictionData.chart_data.svr_selected[index] : predictionData.chart_data.svr_all[index],
      rf: useFeatureSelection ? predictionData.chart_data.rf_selected[index] : predictionData.chart_data.rf_all[index]
    }));
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0B1121] text-white flex flex-col shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
          <img src="/logo-bbri.png" alt="Logo BBRI" className="h-10 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" }} />
        </div>
        
        <nav className="mt-6 space-y-2 px-4 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}>
            <LayoutDashboard className="mr-3" size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('features')} className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'features' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}>
            <Filter className="mr-3" size={20} /> Feature Selection
          </button>
          <button onClick={() => setActiveTab('evaluation')} className={`flex items-center w-full p-3.5 rounded-xl transition-all font-medium ${activeTab === 'evaluation' ? 'bg-[#1E293B] text-blue-400 shadow-md' : 'hover:bg-[#1E293B] text-slate-400'}`}>
            <CheckSquare className="mr-3" size={20} /> Evaluasi Model
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#0B1121] tracking-tight">Sistem Prediksi Saham BBRI</h1>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* BARIS 1: Upload & Info Dataset (DIPERKECIL) */}
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

              <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700 mb-3">2. Informasi Dataset</h2>
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

            {/* BARIS 2: Pengaturan Prediksi & Tombol Run (DIPERKECIL) */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                <div className="w-full">
                  <h2 className="text-sm font-bold text-slate-700 mb-2">3. Pengaturan Prediksi</h2>
                  <p className="text-[11px] font-medium text-slate-500 mb-3">Gunakan Seleksi Fitur (Feature Selection)?</p>
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
                
                {/* Area Grafik */}
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-700 mb-6">5. Grafik Aktual vs Prediksi (50 Data Terakhir)</h2>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData()} margin={{ top: 5, right: 10, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hari" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} dy={10} />
                        
                        {/* SUMBU Y DIKUNCI DI RENTANG 3000 HINGGA 4000 */}
                        <YAxis 
                          domain={[3000, 4000]} 
                          tick={{fontSize: 10, fill: '#94a3b8'}} 
                          axisLine={false} 
                          tickLine={false} 
                          dx={-10} 
                          tickFormatter={(value) => value.toLocaleString('id-ID')}
                        />
                        
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                          formatter={(value) => value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        />
                        <Legend wrapperStyle={{ bottom: -10 }} iconType="circle" iconSize={8} />
                        
                        <Line type="monotone" dataKey="aktual" name="Harga Aktual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="rf" name="Prediksi RFR" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="svr" name="Prediksi SVR" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Panel Kanan: Kartu Hasil T+1 */}
                <div className="w-full lg:w-56 flex flex-col gap-3 justify-center">
                  <div className="bg-gradient-to-r from-[#5a54f9] to-[#807bfb] text-white p-3.5 rounded-xl shadow-md text-center">
                    <p className="text-[10px] text-white/80 mb-0.5 font-medium">Prediksi untuk</p>
                    <p className="font-bold text-base tracking-wide">{predictionData.prediction.prediction_date}</p>
                  </div>
                  
                  <div className="bg-[#F0F7FF] border border-blue-100 p-3.5 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[11px] text-blue-500 font-bold mb-1">Aktual (Close)</p>
                    <p className="text-xl font-black text-blue-600">
                      {predictionData.prediction.last_actual_close.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="bg-[#FCF5FF] border border-purple-100 p-3.5 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[11px] text-purple-500 font-bold mb-1">Prediksi SVR</p>
                    <p className="text-xl font-black text-purple-600">
                      {useFeatureSelection 
                        ? predictionData.prediction.Selected_Features.SVR.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                        : predictionData.prediction.All_Features.SVR.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                      }
                    </p>
                  </div>

                  <div className="bg-[#FFF5F5] border border-red-100 p-3.5 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[11px] text-red-500 font-bold mb-1">Prediksi RFR</p>
                    <p className="text-xl font-black text-red-600">
                      {useFeatureSelection 
                        ? predictionData.prediction.Selected_Features.RandomForest.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                        : predictionData.prediction.All_Features.RandomForest.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FEATURE SELECTION & EVALUASI */}
        {activeTab === 'features' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Hasil Seleksi Fitur</h1>
          </div>
        )}
        
        {activeTab === 'evaluation' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Evaluasi Kinerja Model</h1>
          </div>
        )}

      </div>
    </div>
  );
}