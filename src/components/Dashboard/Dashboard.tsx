import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Package, Flame, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const salesData = [
  { month: 'Jan', penjualan: 45000000, keuntungan: 15000000 },
  { month: 'Feb', penjualan: 52000000, keuntungan: 18000000 },
  { month: 'Mar', penjualan: 48000000, keuntungan: 16000000 },
  { month: 'Apr', penjualan: 61000000, keuntungan: 22000000 },
  { month: 'May', penjualan: 58000000, keuntungan: 20000000 },
  { month: 'Jun', penjualan: 67000000, keuntungan: 25000000 }
];

const inventoryData = [
  { name: 'Arabica Gayo', value: 500, color: '#8B4513' },
  { name: 'Toraja Kalosi', value: 200, color: '#DAA520' },
  { name: 'Java Preanger', value: 350, color: '#228B22' },
  { name: 'Mandailing', value: 150, color: '#CD853F' }
];

export default function Dashboard() {
  const { state } = useAppContext();
  const { greenBeans, roastingSessions, sales } = state;

  const totalInventory = greenBeans.reduce((sum, bean) => sum + bean.quantity, 0);
  const lowStockItems = greenBeans.filter(bean => bean.quantity <= bean.lowStockThreshold);
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const roastingSessionsThisMonth = roastingSessions.filter(session => 
    session.roastDate.getMonth() === new Date().getMonth()
  ).length;

  const stats = [
    {
      title: 'Total Stok Biji Hijau',
      value: `${totalInventory} kg`,
      icon: Package,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      title: 'Sesi Roasting Bulan Ini',
      value: roastingSessionsThisMonth.toString(),
      icon: Flame,
      color: 'bg-orange-500',
      change: '+8%'
    },
    {
      title: 'Total Penjualan',
      value: `Rp ${totalSales.toLocaleString('id-ID')}`,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+15%'
    },
    {
      title: 'Stok Rendah',
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'items'
    }
  ];

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Ringkasan operasional roastery Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{stat.change}</span>
                </p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Penjualan & Keuntungan</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Line type="monotone" dataKey="penjualan" stroke="#8B4513" strokeWidth={2} />
                <Line type="monotone" dataKey="keuntungan" stroke="#DAA520" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Inventori</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}kg`}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peringatan Stok Rendah</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500">Semua stok dalam kondisi baik</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((bean) => (
                <div key={bean.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{bean.variety}</p>
                    <p className="text-sm text-gray-600">Sisa: {bean.quantity}kg</p>
                  </div>
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex-shrink-0 ml-3">
                    Stok Rendah
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Penjualan Terbaru</h3>
          {sales.length === 0 ? (
            <p className="text-gray-500">Belum ada penjualan</p>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {sale.quantity}kg - {sale.productType === 'roasted' ? 'Biji Sangrai' : 'Biji Hijau'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.saleDate.toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-medium text-gray-800">
                      Rp {sale.totalAmount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}