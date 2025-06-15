import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function InventoryTracking() {
  const { state } = useAppContext();
  const { greenBeans, roastingSessions, sales } = state;
  const [timeRange, setTimeRange] = useState('30days');

  // Calculate inventory movements
  const getInventoryMovements = () => {
    const movements = [];
    
    // Add roasting sessions as outgoing movements
    roastingSessions.forEach(session => {
      const bean = greenBeans.find(b => b.id === session.greenBeanId);
      if (bean) {
        movements.push({
          date: session.roastDate,
          type: 'roasting',
          beanId: session.greenBeanId,
          beanName: bean.variety,
          quantity: -session.greenBeanQuantity,
          reason: 'Roasting Session',
          batchNumber: session.batchNumber
        });
      }
    });

    // Add green bean sales as outgoing movements
    sales.filter(sale => sale.productType === 'green').forEach(sale => {
      const bean = greenBeans.find(b => b.id === sale.productId);
      if (bean) {
        movements.push({
          date: sale.saleDate,
          type: 'sale',
          beanId: sale.productId,
          beanName: bean.variety,
          quantity: -sale.quantity,
          reason: 'Direct Sale',
          customer: sale.customerName
        });
      }
    });

    // Add initial stock as incoming movements
    greenBeans.forEach(bean => {
      movements.push({
        date: bean.entryDate,
        type: 'purchase',
        beanId: bean.id,
        beanName: bean.variety,
        quantity: bean.quantity,
        reason: 'Initial Stock',
        supplier: bean.supplierName
      });
    });

    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const movements = getInventoryMovements();

  // Calculate turnover rate
  const calculateTurnoverRate = (beanId: string) => {
    const bean = greenBeans.find(b => b.id === beanId);
    if (!bean) return 0;

    const beanMovements = movements.filter(m => m.beanId === beanId && m.quantity < 0);
    const totalUsed = Math.abs(beanMovements.reduce((sum, m) => sum + m.quantity, 0));
    const averageStock = bean.quantity + (totalUsed / 2);
    
    return averageStock > 0 ? (totalUsed / averageStock) * 365 : 0;
  };

  // Stock level trends
  const getStockTrends = () => {
    return greenBeans.map(bean => {
      const currentStock = bean.quantity;
      const totalUsed = Math.abs(movements
        .filter(m => m.beanId === bean.id && m.quantity < 0)
        .reduce((sum, m) => sum + m.quantity, 0));
      const originalStock = currentStock + totalUsed;
      const usageRate = originalStock > 0 ? (totalUsed / originalStock) * 100 : 0;

      return {
        name: bean.variety,
        current: currentStock,
        original: originalStock,
        used: totalUsed,
        usageRate,
        turnoverRate: calculateTurnoverRate(bean.id),
        daysRemaining: currentStock > 0 && totalUsed > 0 ? 
          Math.round((currentStock / (totalUsed / 30)) * 30) : 0
      };
    });
  };

  const stockTrends = getStockTrends();

  // Daily usage chart data
  const getDailyUsage = () => {
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayMovements = movements.filter(m => 
        m.date >= dayStart && m.date <= dayEnd && m.quantity < 0
      );
      
      const totalUsage = Math.abs(dayMovements.reduce((sum, m) => sum + m.quantity, 0));
      
      dailyData.push({
        date: format(dayStart, 'dd/MM'),
        usage: totalUsage,
        roasting: Math.abs(dayMovements.filter(m => m.type === 'roasting').reduce((sum, m) => sum + m.quantity, 0)),
        sales: Math.abs(dayMovements.filter(m => m.type === 'sale').reduce((sum, m) => sum + m.quantity, 0))
      });
    }
    return dailyData;
  };

  const dailyUsage = getDailyUsage();

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Pelacakan Inventori</h1>
        <p className="text-gray-600">Monitor pergerakan dan tren stok biji kopi</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stok Aktif</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {greenBeans.reduce((sum, bean) => sum + bean.quantity, 0)} kg
              </p>
            </div>
            <Package className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Turnover</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {(stockTrends.reduce((sum, s) => sum + s.turnoverRate, 0) / stockTrends.length).toFixed(1)}x
              </p>
              <p className="text-sm text-gray-500">per tahun</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Penggunaan 7 Hari</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {dailyUsage.reduce((sum, day) => sum + day.usage, 0)} kg
              </p>
            </div>
            <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Item Kritis</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {greenBeans.filter(bean => bean.quantity <= bean.lowStockThreshold).length}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {/* Daily Usage Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Penggunaan Harian</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} kg`,
                  name === 'roasting' ? 'Roasting' : name === 'sales' ? 'Penjualan' : 'Total'
                ]} />
                <Bar dataKey="roasting" stackId="a" fill="#F59E0B" />
                <Bar dataKey="sales" stackId="a" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Level Stok vs Target</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg`]} />
                <Bar dataKey="current" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Analysis Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Analisis Stok Detail</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Varietas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok Saat Ini
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tingkat Penggunaan
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover Rate
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimasi Habis
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockTrends.map((trend, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{trend.name}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trend.current} kg</div>
                    <div className="text-xs text-gray-500">dari {trend.original} kg</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trend.usageRate.toFixed(1)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(trend.usageRate, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.turnoverRate.toFixed(1)}x/tahun
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.daysRemaining > 0 ? `${trend.daysRemaining} hari` : 'N/A'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {trend.current <= greenBeans.find(b => b.variety === trend.name)?.lowStockThreshold! ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Kritis
                      </span>
                    ) : trend.daysRemaining < 30 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Perhatian
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Pergerakan Stok Terbaru</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biji Kopi
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuantitas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.slice(0, 10).map((movement, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {movement.date.toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      movement.type === 'purchase' ? 'bg-green-100 text-green-800' :
                      movement.type === 'roasting' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {movement.type === 'purchase' ? 'Pembelian' :
                       movement.type === 'roasting' ? 'Roasting' : 'Penjualan'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.beanName}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity} kg
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.reason}
                    {movement.batchNumber && (
                      <div className="text-xs text-gray-500">Batch: {movement.batchNumber}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}