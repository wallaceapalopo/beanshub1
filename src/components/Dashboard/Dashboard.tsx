import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Package, Flame, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import QuickStats from './QuickStats';
import RecentActivities from './RecentActivities';

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

      {/* Quick Stats */}
      <div className="mb-6 lg:mb-8">
        <QuickStats />
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

      {/* Recent Activities and Low Stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <RecentActivities />

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peringatan Stok Rendah</h3>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p className="text-green-600 font-medium">Semua stok dalam kondisi baik</p>
              <p className="text-sm text-gray-500">Tidak ada item dengan stok rendah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((bean) => (
                <div key={bean.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{bean.variety}</p>
                    <p className="text-sm text-gray-600">{bean.origin}</p>
                    <p className="text-sm text-red-600">Sisa: {bean.quantity}kg (Min: {bean.lowStockThreshold}kg)</p>
                  </div>
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex-shrink-0 ml-3">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Kritis
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Rekomendasi:</strong> Segera lakukan pemesanan ulang untuk item dengan stok rendah untuk menghindari kehabisan stok.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}