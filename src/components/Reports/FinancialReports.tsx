import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, Package, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export default function FinancialReports() {
  const { state } = useAppContext();
  const { sales, greenBeans, roastingSessions } = state;
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Calculate financial data based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'month':
        return { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();
  const filteredSales = sales.filter(sale => sale.saleDate >= start && sale.saleDate <= end);

  // Revenue calculation
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  // Cost calculation (green bean purchases + operating costs)
  const greenBeanCosts = greenBeans.reduce((sum, bean) => sum + (bean.quantity * bean.purchasePricePerKg), 0);
  const operatingCosts = roastingSessions.length * 30000; // Estimated operating cost per session
  const totalCosts = greenBeanCosts + operatingCosts;
  
  // Profit calculation
  const grossProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Inventory value
  const inventoryValue = greenBeans.reduce((sum, bean) => sum + (bean.quantity * bean.purchasePricePerKg), 0);

  // Monthly trend data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    const monthSales = sales.filter(sale => sale.saleDate >= monthStart && sale.saleDate <= monthEnd);
    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    monthlyData.push({
      month: format(monthStart, 'MMM'),
      revenue: monthRevenue,
      costs: totalCosts / 6, // Distribute costs evenly
      profit: monthRevenue - (totalCosts / 6)
    });
  }

  // Product type distribution
  const productTypeData = [
    {
      name: 'Biji Sangrai',
      value: filteredSales.filter(sale => sale.productType === 'roasted').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#8B4513'
    },
    {
      name: 'Biji Hijau',
      value: filteredSales.filter(sale => sale.productType === 'green').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#228B22'
    }
  ];

  // Payment method distribution
  const paymentMethodData = [
    {
      name: 'Tunai',
      value: filteredSales.filter(sale => sale.paymentMethod === 'Cash').length,
      color: '#10B981'
    },
    {
      name: 'Kartu',
      value: filteredSales.filter(sale => sale.paymentMethod === 'Card').length,
      color: '#3B82F6'
    },
    {
      name: 'Transfer',
      value: filteredSales.filter(sale => sale.paymentMethod === 'Transfer').length,
      color: '#8B5CF6'
    }
  ];

  const exportReport = () => {
    const reportData = {
      period: `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`,
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      inventoryValue,
      salesCount: filteredSales.length,
      averageOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Laporan Keuangan</h1>
            <p className="text-gray-600">Analisis kinerja keuangan roastery Anda</p>
          </div>
          <button
            onClick={exportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Export Laporan</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Periode:</span>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>

          {selectedPeriod === 'month' && (
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          <div className="text-sm text-gray-600">
            {format(start, 'dd MMM yyyy')} - {format(end, 'dd MMM yyyy')}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Pendapatan</p>
              <p className="text-3xl font-bold">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Biaya</p>
              <p className="text-3xl font-bold">Rp {totalCosts.toLocaleString('id-ID')}</p>
            </div>
            <div className="h-12 w-12 bg-red-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Rp</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Keuntungan Kotor</p>
              <p className="text-3xl font-bold">Rp {grossProfit.toLocaleString('id-ID')}</p>
              <p className="text-blue-100 text-sm">{profitMargin.toFixed(1)}% margin</p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Nilai Inventori</p>
              <p className="text-3xl font-bold">Rp {inventoryValue.toLocaleString('id-ID')}</p>
            </div>
            <Package className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Pendapatan & Keuntungan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Pendapatan" />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Keuntungan" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Penjualan Produk</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => `${entry.name}: Rp ${entry.value.toLocaleString('id-ID')}`}
              >
                {productTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Penjualan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Jumlah Transaksi</span>
              <span className="font-medium">{filteredSales.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Rata-rata Nilai Transaksi</span>
              <span className="font-medium">
                Rp {filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toLocaleString('id-ID') : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Kuantitas Terjual</span>
              <span className="font-medium">
                {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
          <div className="space-y-3">
            {paymentMethodData.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="text-gray-700">{method.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{method.value} transaksi</div>
                  <div className="text-sm text-gray-500">
                    {filteredSales.length > 0 ? ((method.value / filteredSales.length) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}