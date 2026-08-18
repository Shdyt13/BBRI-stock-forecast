import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AlertCircle, TrendingUp, Award, Target } from 'lucide-react';

const ModelEvaluation = () => {
  const { mlData, isLoading, getAllMetrics } = useData();
  const [selectedScenario, setSelectedScenario] = useState('without_feature_selection');

  // Get all metrics
  const allMetrics = getAllMetrics();

  // Empty state
  if (!mlData) {
    return (
      <div className="w-full min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Model Evaluation</h1>

          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Data</h3>
            <p className="text-slate-600 mb-4">
              Silakan jalankan prediksi terlebih dahulu dari halaman Dashboard.
            </p>
            <p className="text-sm text-slate-500">
              Upload dataset CSV → Klik RUN PREDICTION → Kembali ke halaman ini
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get current metrics based on selected scenario
  const currentMetrics = allMetrics[selectedScenario];

  // Determine best model
  const getBestModel = (metrics) => {
    if (!metrics || !metrics.svr || !metrics.rf) return null;

    const svrR2 = metrics.svr.R2 || 0;
    const rfR2 = metrics.rf.R2 || 0;

    return svrR2 > rfR2 ? 'SVR' : 'RF';
  };

  const bestModel = getBestModel(currentMetrics);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6">Model Evaluation</h1>

        {/* INFO CARD */}
        <div className="bg-white border-l-4 border-slate-700 rounded p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-slate-600 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 mb-1">Tentang Metrik Evaluasi</p>
              <p className="text-sm text-slate-700 mb-2">
                Metrik evaluasi digunakan untuk mengukur performa model machine learning:
              </p>
              <ul className="text-sm text-slate-700 space-y-1 ml-4">
                <li>
                  • <strong>MAE (Mean Absolute Error)</strong>: Rata-rata kesalahan absolut. Semakin
                  kecil semakin baik.
                </li>
                <li>
                  • <strong>RMSE (Root Mean Squared Error)</strong>: Akar dari rata-rata kuadrat
                  kesalahan. Semakin kecil semakin baik.
                </li>
                <li>
                  • <strong>R² (Coefficient of Determination)</strong>: Seberapa baik model
                  menjelaskan variasi data. Range 0-1, semakin tinggi semakin baik.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pilih Skenario</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedScenario('without_feature_selection')}
              className={`p-4 rounded border-2 transition-all text-left ${
                selectedScenario === 'without_feature_selection'
                  ? 'border-slate-800 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedScenario === 'without_feature_selection'
                      ? 'border-slate-800'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedScenario === 'without_feature_selection' && (
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900">Tanpa Feature Selection</h3>
              </div>
              <p className="text-sm text-slate-600 ml-6">Menggunakan semua fitur (All Features)</p>
            </button>

            <button
              onClick={() => setSelectedScenario('with_feature_selection')}
              className={`p-4 rounded border-2 transition-all text-left ${
                selectedScenario === 'with_feature_selection'
                  ? 'border-slate-800 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedScenario === 'with_feature_selection'
                      ? 'border-slate-800'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedScenario === 'with_feature_selection' && (
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900">Dengan Feature Selection</h3>
              </div>
              <p className="text-sm text-slate-600 ml-6">Hanya menggunakan fitur terpenting</p>
            </button>
          </div>
        </div>

        {/* BEST MODEL CARD */}
        {bestModel && (
          <div className="bg-emerald-600 text-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-7 h-7" strokeWidth={2} />
              <h3 className="text-xl font-semibold">Model Terbaik</h3>
            </div>
            <p className="text-2xl font-bold mb-2">
              {bestModel === 'SVR' ? 'Support Vector Regression (SVR)' : 'Random Forest Regressor'}
            </p>
            <p className="text-sm text-emerald-50">
              Berdasarkan R² Score tertinggi pada skenario{' '}
              {selectedScenario === 'with_feature_selection'
                ? 'dengan Feature Selection'
                : 'tanpa Feature Selection'}
            </p>
          </div>
        )}

        {/* METRICS COMPARISON TABLE */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Perbandingan Metrik Model</h2>

          {currentMetrics ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Metrik
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Support Vector Regression (SVR)
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Random Forest Regressor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                      MAE (Mean Absolute Error)
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.svr.MAE || 0).toFixed(4)}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.rf.MAE || 0).toFixed(4)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                      RMSE (Root Mean Squared Error)
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.svr.RMSE || 0).toFixed(4)}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.rf.RMSE || 0).toFixed(4)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                      R² Score (Coefficient of Determination)
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.svr.R2 || 0).toFixed(4)}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center font-mono text-base font-semibold text-slate-900">
                      {(currentMetrics.rf.R2 || 0).toFixed(4)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Data metrik tidak tersedia</p>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center mt-4">
            * Nilai MAE dan RMSE: Semakin kecil semakin baik | Nilai R²: Semakin mendekati 1 semakin
            baik
          </p>
        </div>

        {/* VISUAL COMPARISON CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SVR CARD */}
          <div className="bg-white rounded-lg border-l-4 border-blue-600 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-blue-600">
                <Target className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Support Vector Regression</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">MAE</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.svr?.MAE || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((1 - (currentMetrics?.svr?.MAE || 0)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">RMSE</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.svr?.RMSE || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((1 - (currentMetrics?.svr?.RMSE || 0)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">R² Score</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.svr?.R2 || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentMetrics?.svr?.R2 || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RF CARD */}
          <div className="bg-white rounded-lg border-l-4 border-emerald-600 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-emerald-600">
                <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Random Forest Regressor</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">MAE</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.rf?.MAE || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((1 - (currentMetrics?.rf?.MAE || 0)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">RMSE</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.rf?.RMSE || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((1 - (currentMetrics?.rf?.RMSE || 0)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">R² Score</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {(currentMetrics?.rf?.R2 || 0).toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentMetrics?.rf?.R2 || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluation;
