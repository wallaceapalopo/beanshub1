import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, Package, FileText, Printer, Share } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function FinancialReports() {
  const { state } = useAppContext();
  const { sales, greenBeans, roastingSessions } = state;
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

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
      amount: filteredSales.filter(sale => sale.paymentMethod === 'Cash').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#10B981'
    },
    {
      name: 'Kartu',
      value: filteredSales.filter(sale => sale.paymentMethod === 'Card').length,
      amount: filteredSales.filter(sale => sale.paymentMethod === 'Card').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#3B82F6'
    },
    {
      name: 'Transfer',
      value: filteredSales.filter(sale => sale.paymentMethod === 'Transfer').length,
      amount: filteredSales.filter(sale => sale.paymentMethod === 'Transfer').reduce((sum, sale) => sum + sale.totalAmount, 0),
      color: '#8B5CF6'
    }
  ];

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text('BeansHub - Laporan Keuangan', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Periode: ${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`, pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Digenerate pada: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, pageWidth / 2, 37, { align: 'center' });

      // Summary Section
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Ringkasan Keuangan', 20, 55);

      const summaryData = [
        ['Metrik', 'Nilai'],
        ['Total Pendapatan', `Rp ${totalRevenue.toLocaleString('id-ID')}`],
        ['Total Biaya', `Rp ${totalCosts.toLocaleString('id-ID')}`],
        ['Keuntungan Kotor', `Rp ${grossProfit.toLocaleString('id-ID')}`],
        ['Margin Keuntungan', `${profitMargin.toFixed(1)}%`],
        ['Nilai Inventori', `Rp ${inventoryValue.toLocaleString('id-ID')}`],
        ['Jumlah Transaksi', filteredSales.length.toString()],
        ['Rata-rata Transaksi', `Rp ${(filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0).toLocaleString('id-ID')}`]
      ];

      pdf.autoTable({
        startY: 65,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });

      // Sales Details
      let currentY = (pdf as any).lastAutoTable.finalY + 20;
      
      pdf.setFontSize(16);
      pdf.text('Detail Penjualan', 20, currentY);
      
      const salesData = [
        ['Tanggal', 'Produk', 'Kuantitas', 'Harga/kg', 'Total', 'Pembayaran']
      ];

      filteredSales.forEach(sale => {
        const product = sale.productType === 'green' 
          ? greenBeans.find(bean => bean.id === sale.productId)?.variety || 'Green Bean'
          : 'Roasted Coffee';
        
        salesData.push([
          format(sale.saleDate, 'dd/MM/yyyy'),
          product,
          `${sale.quantity} kg`,
          `Rp ${sale.pricePerKg.toLocaleString('id-ID')}`,
          `Rp ${sale.totalAmount.toLocaleString('id-ID')}`,
          sale.paymentMethod
        ]);
      });

      pdf.autoTable({
        startY: currentY + 10,
        head: [salesData[0]],
        body: salesData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 }
        }
      });

      // Payment Method Analysis
      currentY = (pdf as any).lastAutoTable.finalY + 20;
      
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Analisis Metode Pembayaran', 20, currentY);

      const paymentData = [
        ['Metode', 'Jumlah Transaksi', 'Total Nilai', 'Persentase']
      ];

      paymentMethodData.forEach(method => {
        const percentage = filteredSales.length > 0 ? ((method.value / filteredSales.length) * 100).toFixed(1) : '0';
        paymentData.push([
          method.name,
          method.value.toString(),
          `Rp ${method.amount.toLocaleString('id-ID')}`,
          `${percentage}%`
        ]);
      });

      pdf.autoTable({
        startY: currentY + 10,
        head: [paymentData[0]],
        body: paymentData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247] },
        styles: { fontSize: 10 }
      });

      // Monthly Trend Analysis
      currentY = (pdf as any).lastAutoTable.finalY + 20;
      
      if (currentY > 220) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Tren Bulanan (6 Bulan Terakhir)', 20, currentY);

      const trendData = [
        ['Bulan', 'Pendapatan', 'Biaya', 'Keuntungan']
      ];

      monthlyData.forEach(month => {
        trendData.push([
          month.month,
          `Rp ${month.revenue.toLocaleString('id-ID')}`,
          `Rp ${month.costs.toLocaleString('id-ID')}`,
          `Rp ${month.profit.toLocaleString('id-ID')}`
        ]);
      });

      pdf.autoTable({
        startY: currentY + 10,
        head: [trendData[0]],
        body: trendData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 10 }
      });

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 30, pdf.internal.pageSize.height - 10);
        pdf.text('BeansHub Coffee Management System', 20, pdf.internal.pageSize.height - 10);
      }

      // Save the PDF
      const fileName = `laporan-keuangan-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    const reportData = {
      period: `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue,
        totalCosts,
        grossProfit,
        profitMargin,
        inventoryValue,
        salesCount: filteredSales.length,
        averageOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
      },
      sales: filteredSales,
      monthlyTrend: monthlyData,
      paymentMethods: paymentMethodData,
      productTypes: productTypeData
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
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Laporan Keuangan</h1>
            <p className="text-gray-600">Analisis kinerja keuangan roastery Anda</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FileText className="h-5 w-5" />
              <span>{isExporting ? 'Membuat PDF...' : 'Export PDF'}</span>
            </button>
            <button
              onClick={exportToJSON}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Periode:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
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

            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">
                {format(start, 'dd MMM yyyy')} - {format(end, 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-green-100 text-sm font-medium">Total Pendapatan</p>
              <p className="text-2xl lg:text-3xl font-bold truncate">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
            <DollarSign className="h-8 w-8 lg:h-12 lg:w-12 text-green-200 flex-shrink-0 ml-3" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-red-100 text-sm font-medium">Total Biaya</p>
              <p className="text-2xl lg:text-3xl font-bold truncate">Rp {totalCosts.toLocaleString('id-ID')}</p>
            </div>
            <div className="h-8 w-8 lg:h-12 lg:w-12 bg-red-400 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <span className="text-white font-bold text-sm lg:text-base">Rp</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-100 text-sm font-medium">Keuntungan Kotor</p>
              <p className="text-2xl lg:text-3xl font-bold truncate">Rp {grossProfit.toLocaleString('id-ID')}</p>
              <p className="text-blue-100 text-sm">{profitMargin.toFixed(1)}% margin</p>
            </div>
            <TrendingUp className="h-8 w-8 lg:h-12 lg:w-12 text-blue-200 flex-shrink-0 ml-3" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-purple-100 text-sm font-medium">Nilai Inventori</p>
              <p className="text-2xl lg:text-3xl font-bold truncate">Rp {inventoryValue.toLocaleString('id-ID')}</p>
            </div>
            <Package className="h-8 w-8 lg:h-12 lg:w-12 text-purple-200 flex-shrink-0 ml-3" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Pendapatan & Keuntungan</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Product Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Penjualan Produk</h3>
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
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
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
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Transaksi Terbesar</span>
              <span className="font-medium">
                Rp {filteredSales.length > 0 ? Math.max(...filteredSales.map(s => s.totalAmount)).toLocaleString('id-ID') : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
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
                    Rp {method.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-400">
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