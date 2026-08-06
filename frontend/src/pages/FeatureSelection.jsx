import React from 'react';
import { useData } from '../context/DataContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FeatureSelection = () => {
  const { mlData, isLoading, getFeatureImportanceData } = useData();

  // Get feature importance data
  const featureData = getFeatureImportanceData();

  // Empty state
  if (!mlData) {
    return (
      <div className="w-full min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Feature Selection</h1>

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

  // Colors for chart
  const colors = ['#100b72', '#5c56b6', '#ff4444', '#ffa500', '#00cc66', '#9966ff'];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6">Feature Selection</h1>

        {/* INFO CARD */}
        <div className="bg-white border-l-4 border-slate-700 rounded p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-slate-600 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Tentang Feature Selection</p>
              <p className="text-sm text-slate-700">
                Feature Selection mengidentifikasi fitur terpenting yang berkontribusi terhadap
                akurasi model. Fitur dengan importance tinggi memiliki pengaruh besar terhadap
                prediksi harga saham.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURE IMPORTANCE TABLE */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Ranking Feature Importance</h2>

          {featureData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Feature
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Importance Score
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        item.status === 'selected' ? 'bg-green-50' : 'bg-gray-50'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="border border-gray-200 px-4 py-3 text-center font-bold text-gray-700">
                        {item.rank || index + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">
                        {item.feature}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-accent-blue h-full rounded-full transition-all"
                              style={{ width: `${(item.importance || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-right">
                            {((item.importance || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        {item.status === 'selected' ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                            <XCircle className="w-4 h-4" />
                            Dropped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Data feature importance tidak tersedia</p>
            </div>
          )}
        </div>

        {/* FEATURE IMPORTANCE CHART */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Visualisasi Feature Importance
          </h2>

          {featureData.length > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={featureData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <YAxis dataKey="feature" type="category" width={70} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `${(value * 100).toFixed(2)}%`}
                    labelStyle={{ color: '#100b72', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="importance" name="Importance Score" radius={[0, 8, 8, 0]}>
                    {featureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center text-gray-400">
                <BarChart className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>Data chart tidak tersedia</p>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center mt-4">
            * Fitur dengan importance tinggi memiliki pengaruh besar terhadap akurasi prediksi model
          </p>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-slate-800 text-white rounded-lg p-6 mt-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Ringkasan Feature Selection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded p-4">
              <p className="text-sm text-slate-300 mb-1">Total Fitur</p>
              <p className="text-2xl font-bold">{featureData.length}</p>
            </div>
            <div className="bg-white/10 rounded p-4">
              <p className="text-sm text-slate-300 mb-1">Fitur Dipilih</p>
              <p className="text-2xl font-bold">
                {featureData.filter((f) => f.status === 'selected').length}
              </p>
            </div>
            <div className="bg-white/10 rounded p-4">
              <p className="text-sm text-slate-300 mb-1">Fitur Tidak Dipakai</p>
              <p className="text-2xl font-bold">
                {featureData.filter((f) => f.status !== 'selected').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSelection;
