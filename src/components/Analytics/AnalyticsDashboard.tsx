import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function AnalyticsDashboard() {
  const { state } = useAppContext();
  const { sales, greenBeans, roastingSessions } = state;
  const [timeRange, setTimeRange] = useState('30days');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();
  const filteredSales = sales.filter(sale => sale.saleDate >= start && sale.saleDate <= end);

  // Performance metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalOrders = filteredSales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalQuantitySold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Previous period comparison
  const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  const prevSales = sales.filter(sale => sale.saleDate >= prevStart && sale.saleDate < start);
  const prevRevenue = prevSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Daily sales data
  const dailySalesData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    const daySales = sales.filter(sale => sale.saleDate >= dayStart && sale.saleDate <= dayEnd);
    const dayRevenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const dayOrders = daySales.length;

    dailySalesData.push({
      date: format(dayStart, 'dd/MM'),
      revenue: dayRevenue,
      orders: dayOrders,
      quantity: daySales.reduce((sum, sale) => sum + sale.quantity, 0)
    });
  }

  // Product type distribution
  const productTypeData = [
    {
      name: 'Biji Sangrai',
      value: filteredSales.filter(sale => sale.productType === 'roasted').length,
      revenue: filteredSales.filter(sale => sale.productType === 'roasted').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#8B4513'
    },
    {
      name: 'Biji Hijau',
      value: filteredSales.filter(sale => sale.productType === 'green').length,
      revenue: filteredSales.filter(sale => sale.productType === 'green').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#228B22'
    }
  ];

  // Top performing beans
  const beanPerformance = greenBeans.map(bean => {
    const beanSales = filteredSales.filter(sale => sale.productId === bean.id);
    const revenue = beanSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const quantity = beanSales.reduce((sum, sale) => sum + sale.quantity, 0);
    return {
      name: bean.variety,
      revenue,
      quantity,
      orders: beanSales.length
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Roasting efficiency
  const roastingEfficiency = roastingSessions.map(session => {
    const efficiency = (session.roastedQuantity / session.greenBeanQuantity) * 100;
    return {
      date: format(session.roastDate, 'dd/MM'),
      efficiency,
      greenBean: session.greenBeanQuantity,
      roasted: session.roastedQuantity
    };
  }).slice(-10);

  const metrics = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      change: revenueGrowth,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Pesanan',
      value: totalOrders.toString(),
      change: 0,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Rata-rata Nilai Pesanan',
      value: `Rp ${averageOrderValue.toLocaleString('id-ID')}`,
      change: 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Kuantitas Terjual',
      value: `${totalQuantitySold} kg`,
      change: 0,
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Analisis performa bisnis roastery Anda</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1 truncate">{metric.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800 truncate">{metric.value}</p>
                {metric.change !== 0 && (
                  <div className="flex items-center mt-2">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${metric.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                <metric.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {/* Daily Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Penjualan Harian</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `Rp ${value.toLocaleString('id-ID')}` : value,
                  name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                ]} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="orders" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Jenis Produk</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {productTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Performing Beans */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biji Kopi Terlaris</h3>
          <div className="space-y-4">
            {beanPerformance.map((bean, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{bean.name}</p>
                    <p className="text-sm text-gray-600">{bean.quantity} kg terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    Rp {bean.revenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600">{bean.orders} pesanan</p>
                </div>
              </div>
            ))}
            {beanPerformance.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada data penjualan</p>
            )}
          </div>
        </div>

        {/* Roasting Efficiency */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Efisiensi Roasting</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roastingEfficiency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 85]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Efisiensi']} />
                <Line type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Target Efisiensi:</strong> 80% (20% weight loss normal untuk roasting)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}