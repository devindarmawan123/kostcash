import React, { useState } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar, DollarSign, Trash2, Plus, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KeuanganKostApp() {
  const [activeTab, setActiveTab] = useState('input');
  const [penghasilanBulanan, setPenghasilanBulanan] = useState(3000000);
  const [expenses, setExpenses] = useState([
    { id: 1, tanggal: '2024-11-15', kategori: 'Makan', items: [20000, 10000, 30000] },
    { id: 2, tanggal: '2024-11-15', kategori: 'Kebutuhan', items: [100000] },
    { id: 3, tanggal: '2024-11-15', kategori: 'Bensin', items: [25000] },
    { id: 4, tanggal: '2024-11-14', kategori: 'Makan', items: [15000, 20000, 25000] },
    { id: 5, tanggal: '2024-11-14', kategori: 'Listrik', items: [50000] },
  ]);

  const [newExpense, setNewExpense] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Makan',
    items: ['']
  });

  const [kategoriOptions, setKategoriOptions] = useState(['Makan', 'Kebutuhan', 'Bensin', 'Listrik', 'Hiburan', 'Sewa Kost', 'Lainnya']);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const addItemToNewExpense = () => {
    setNewExpense({
      ...newExpense,
      items: [...newExpense.items, '']
    });
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !kategoriOptions.includes(newCategory.trim())) {
      setKategoriOptions([...kategoriOptions, newCategory.trim()]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const deleteCategory = (category) => {
    if (kategoriOptions.length > 1) {
      setKategoriOptions(kategoriOptions.filter(k => k !== category));
      // Update expenses that use this category to 'Lainnya'
      setExpenses(expenses.map(exp => 
        exp.kategori === category ? { ...exp, kategori: 'Lainnya' } : exp
      ));
    }
  };

  const updateItem = (index, value) => {
    const newItems = [...newExpense.items];
    newItems[index] = value;
    setNewExpense({ ...newExpense, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = newExpense.items.filter((_, i) => i !== index);
    setNewExpense({ ...newExpense, items: newItems });
  };

  const handleAddExpense = () => {
    const validItems = newExpense.items.filter(item => item && !isNaN(parseFloat(item))).map(item => parseFloat(item));
    if (validItems.length > 0) {
      setExpenses([...expenses, {
        id: Date.now(),
        tanggal: newExpense.tanggal,
        kategori: newExpense.kategori,
        items: validItems
      }]);
      setNewExpense({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: 'Makan',
        items: ['']
      });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const calculateTotal = (items) => items.reduce((sum, item) => sum + item, 0);

  const totalPengeluaran = expenses.reduce((sum, exp) => sum + calculateTotal(exp.items), 0);

  const getWeeklySummary = () => {
    const weekly = {};
    expenses.forEach(exp => {
      const date = new Date(exp.tanggal);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekly[weekKey]) weekly[weekKey] = {};
      if (!weekly[weekKey][exp.kategori]) weekly[weekKey][exp.kategori] = 0;
      weekly[weekKey][exp.kategori] += calculateTotal(exp.items);
    });
    return weekly;
  };

  const getCategorySummary = () => {
    const summary = {};
    expenses.forEach(exp => {
      if (!summary[exp.kategori]) summary[exp.kategori] = 0;
      summary[exp.kategori] += calculateTotal(exp.items);
    });
    return summary;
  };

  const getAnalysis = () => {
    if (totalPengeluaran > penghasilanBulanan) {
      const categorySummary = getCategorySummary();
      const maxCategory = Object.keys(categorySummary).reduce((a, b) => 
        categorySummary[a] > categorySummary[b] ? a : b
      );
      return {
        type: 'warning',
        message: `Anda terlalu boros! Pengeluaran melebihi penghasilan sebesar Rp ${(totalPengeluaran - penghasilanBulanan).toLocaleString('id-ID')}`,
        detail: `Terutama di kategori ${maxCategory} (Rp ${categorySummary[maxCategory].toLocaleString('id-ID')})`
      };
    } else {
      const selisih = penghasilanBulanan - totalPengeluaran;
      return {
        type: 'success',
        message: 'Manajemen keuangan Anda sudah baik!',
        detail: `Anda berhasil menghemat Rp ${selisih.toLocaleString('id-ID')}. Tingkatkan lagi! 💪`
      };
    }
  };

  const analysis = getAnalysis();
  const categorySummary = getCategorySummary();
  const weeklySummary = getWeeklySummary();

  // Data for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  
  const pieChartData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value
  }));

  const weeklyChartData = Object.entries(weeklySummary)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, categories]) => {
      const weekTotal = Object.values(categories).reduce((sum, val) => sum + val, 0);
      return {
        minggu: new Date(week).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        total: weekTotal,
        ...categories
      };
    });

  const monthlyChartData = [
    { name: 'Penghasilan', value: penghasilanBulanan },
    { name: 'Pengeluaran', value: totalPengeluaran },
    { name: 'Sisa', value: Math.max(0, penghasilanBulanan - totalPengeluaran) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 mb-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            {/* Logo */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50"></div>
                <svg width="48" height="48" viewBox="0 0 48 48" className="relative">
                  {/* Coin */}
                  <circle cx="24" cy="24" r="20" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="16" fill="#FDE68A" opacity="0.7"/>
                  {/* Dollar sign */}
                  <text x="24" y="32" fontSize="24" fontWeight="bold" fill="#92400E" textAnchor="middle" fontFamily="Arial">$</text>
                  {/* Sparkles */}
                  <circle cx="10" cy="10" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="38" cy="12" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="40" cy="36" r="2" fill="#FFF" opacity="0.8"/>
                  <circle cx="8" cy="38" r="2" fill="#FFF" opacity="0.8"/>
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1">
                Kost<span className="text-yellow-300">Cash</span>
              </h1>
              <p className="text-emerald-100 text-sm">Atur uang kost, hidup tenang!</p>
            </div>
          </div>
          <p className="text-emerald-50 opacity-90 text-sm max-w-2xl">
            Kelola keuangan kost kamu dengan smart, pantau pengeluaran, dan capai target saving! 💰✨
          </p>
        </div>

        {/* Penghasilan Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Penghasilan Bulanan</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <input
            type="number"
            value={penghasilanBulanan}
            onChange={(e) => setPenghasilanBulanan(parseFloat(e.target.value) || 0)}
            className="text-3xl font-bold bg-transparent border-b-2 border-white/30 focus:border-white outline-none w-full mb-2"
          />
          <p className="text-sm opacity-75">Rp {penghasilanBulanan.toLocaleString('id-ID')}</p>
        </div>

        {/* Analysis Alert */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${analysis.type === 'warning' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-teal-500'} text-white`}>
          <div className="flex items-start gap-3">
            {analysis.type === 'warning' ? <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" /> : <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />}
            <div>
              <h3 className="font-bold text-lg mb-1">{analysis.message}</h3>
              <p className="text-sm opacity-90">{analysis.detail}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-lg">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'input' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Input Pengeluaran
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Ringkasan
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'input' && (
              <div>
                {/* Input Form */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Tambah Pengeluaran Baru</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                      <input
                        type="date"
                        value={newExpense.tanggal}
                        onChange={(e) => setNewExpense({ ...newExpense, tanggal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <div className="flex gap-2">
                        <select
                          value={newExpense.kategori}
                          onChange={(e) => setNewExpense({ ...newExpense, kategori: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {kategoriOptions.map(kat => (
                            <option key={kat} value={kat}>{kat}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowAddCategory(true)}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Tambah Kategori"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add Category Modal */}
                  {showAddCategory && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Tambah Kategori Baru</h4>
                        <button
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory('');
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nama kategori..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                        />
                        <button
                          onClick={addNewCategory}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Tambah
                        </button>
                      </div>
                      
                      {/* List of existing categories */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Kategori yang ada:</p>
                        <div className="flex flex-wrap gap-2">
                          {kategoriOptions.map(kat => (
                            <div key={kat} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm">
                              <span>{kat}</span>
                              {kategoriOptions.length > 1 && kat !== 'Lainnya' && (
                                <button
                                  onClick={() => deleteCategory(kat)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nominal (bisa tambah beberapa item, misal: makan 3x sehari)
                  </label>
                  {newExpense.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="number"
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        placeholder="Contoh: 20000"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {newExpense.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addItemToNewExpense}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Tambah Item
                    </button>
                    <button
                      onClick={handleAddExpense}
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Simpan Pengeluaran
                    </button>
                  </div>

                  {newExpense.items.filter(i => i).length > 1 && (
                    <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg">
                      Total: Rp {newExpense.items.filter(i => i && !isNaN(parseFloat(i))).reduce((sum, item) => sum + parseFloat(item), 0).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                {/* Recent Expenses */}
                <h3 className="font-bold text-lg mb-4 text-gray-800">Riwayat Pengeluaran</h3>
                <div className="space-y-3">
                  {expenses.slice().reverse().map(exp => (
                    <div key={exp.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{exp.kategori}</span>
                            <span className="text-xs text-gray-500">{new Date(exp.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          {exp.items.length > 1 && (
                            <div className="text-xs text-gray-600 mb-1">
                              {exp.items.map((item, i) => `Rp ${item.toLocaleString('id-ID')}`).join(' + ')}
                            </div>
                          )}
                          <div className="text-lg font-bold text-blue-600">
                            Rp {calculateTotal(exp.items).toLocaleString('id-ID')}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div>
                {/* Monthly Summary */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6 text-white">
                  <h3 className="font-bold text-lg mb-4">Ringkasan Bulanan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-75 mb-1">Total Penghasilan</p>
                      <p className="text-2xl font-bold">Rp {penghasilanBulanan.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-75 mb-1">Total Pengeluaran</p>
                      <p className="text-2xl font-bold">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <p className="text-sm opacity-75 mb-1">Sisa / Defisit</p>
                    <p className={`text-2xl font-bold ${penghasilanBulanan >= totalPengeluaran ? 'text-green-200' : 'text-red-200'}`}>
                      Rp {(penghasilanBulanan - totalPengeluaran).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Monthly Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Grafik Bulanan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Pengeluaran Per Kategori</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {Object.entries(categorySummary).sort((a, b) => b[1] - a[1]).map(([kategori, total], index) => (
                        <div key={kategori} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="font-medium text-gray-700">{kategori}</span>
                          </div>
                          <span className="font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Line Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Tren Pengeluaran Per Minggu</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="minggu" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} name="Total" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Detailed Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Detail Per Minggu</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="minggu" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                      />
                      <Legend />
                      {Object.keys(categorySummary).map((kategori, index) => (
                        <Bar 
                          key={kategori} 
                          dataKey={kategori} 
                          stackId="a" 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Summary Table */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Tabel Ringkasan Mingguan</h3>
                  <div className="space-y-4">
                    {Object.entries(weeklySummary).sort((a, b) => b[0].localeCompare(a[0])).map(([week, categories]) => {
                      const weekTotal = Object.values(categories).reduce((sum, val) => sum + val, 0);
                      return (
                        <div key={week} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-700">
                              Minggu {new Date(week).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="font-bold text-purple-600">Rp {weekTotal.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(categories).map(([cat, total]) => (
                              <div key={cat} className="flex justify-between text-sm">
                                <span className="text-gray-600">{cat}</span>
                                <span className="text-gray-800">Rp {total.toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}