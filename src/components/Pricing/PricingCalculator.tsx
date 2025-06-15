import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function PricingCalculator() {
  const { state } = useAppContext();
  const { greenBeans } = state;
  const [selectedBeanId, setSelectedBeanId] = useState('');
  const [operatingCosts, setOperatingCosts] = useState({
    electricity: 5000,
    labor: 15000,
    packaging: 3000,
    overhead: 7000
  });
  const [targetMargin, setTargetMargin] = useState(40);

  const selectedBean = greenBeans.find(bean => bean.id === selectedBeanId);
  
  const calculations = selectedBean ? {
    greenBeanCostPerKg: selectedBean.purchasePricePerKg,
    totalOperatingCosts: Object.values(operatingCosts).reduce((sum, cost) => sum + cost, 0),
    roastedBeanCostPerKg: (selectedBean.purchasePricePerKg / 0.8) + Object.values(operatingCosts).reduce((sum, cost) => sum + cost, 0),
    suggestedRetailPrice: ((selectedBean.purchasePricePerKg / 0.8) + Object.values(operatingCosts).reduce((sum, cost) => sum + cost, 0)) * (1 + targetMargin / 100),
    profitPerKg: 0
  } : null;

  if (calculations) {
    calculations.profitPerKg = calculations.suggestedRetailPrice - calculations.roastedBeanCostPerKg;
  }

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kalkulator Harga</h1>
        <p className="text-gray-600">Hitung harga jual optimal untuk produk kopi Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-amber-600" />
              Pilih Biji Kopi
            </h3>
            <select
              value={selectedBeanId}
              onChange={(e) => setSelectedBeanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Pilih biji kopi...</option>
              {greenBeans.map(bean => (
                <option key={bean.id} value={bean.id}>
                  {bean.variety} - Rp {bean.purchasePricePerKg.toLocaleString('id-ID')}/kg
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Biaya Operasional (per kg)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listrik & Gas (Rp)
                </label>
                <input
                  type="number"
                  value={operatingCosts.electricity}
                  onChange={(e) => setOperatingCosts({...operatingCosts, electricity: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenaga Kerja (Rp)
                </label>
                <input
                  type="number"
                  value={operatingCosts.labor}
                  onChange={(e) => setOperatingCosts({...operatingCosts, labor: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kemasan (Rp)
                </label>
                <input
                  type="number"
                  value={operatingCosts.packaging}
                  onChange={(e) => setOperatingCosts({...operatingCosts, packaging: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overhead (Rp)
                </label>
                <input
                  type="number"
                  value={operatingCosts.overhead}
                  onChange={(e) => setOperatingCosts({...operatingCosts, overhead: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Target Margin
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin Keuntungan (%)
              </label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                min="0"
                max="100"
              />
              <div className="mt-2">
                <input
                  type="range"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {calculations ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Harga Jual Disarankan</p>
                      <p className="text-3xl font-bold">
                        Rp {calculations.suggestedRetailPrice.toLocaleString('id-ID')}
                      </p>
                      <p className="text-green-100 text-sm">per kilogram</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Keuntungan per kg</p>
                      <p className="text-3xl font-bold">
                        Rp {calculations.profitPerKg.toLocaleString('id-ID')}
                      </p>
                      <p className="text-blue-100 text-sm">{targetMargin}% margin</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Rincian Perhitungan</h3>
                  <p className="text-sm text-gray-600">Untuk {selectedBean?.variety} - {selectedBean?.origin}</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Harga Beli Biji Hijau</span>
                      <span className="font-medium">Rp {calculations.greenBeanCostPerKg.toLocaleString('id-ID')}/kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Susut Roasting (20%)</span>
                      <span className="font-medium text-orange-600">
                        Rp {((calculations.greenBeanCostPerKg / 0.8) - calculations.greenBeanCostPerKg).toLocaleString('id-ID')}/kg
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Biaya Operasional:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">• Listrik & Gas</span>
                          <span>Rp {operatingCosts.electricity.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">• Tenaga Kerja</span>
                          <span>Rp {operatingCosts.labor.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">• Kemasan</span>
                          <span>Rp {operatingCosts.packaging.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">• Overhead</span>
                          <span>Rp {operatingCosts.overhead.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                          <span>Total Biaya Operasional</span>
                          <span>Rp {calculations.totalOperatingCosts.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 font-medium">
                      <span className="text-gray-800">Total Biaya Produksi</span>
                      <span className="text-red-600">Rp {calculations.roastedBeanCostPerKg.toLocaleString('id-ID')}/kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Margin Keuntungan ({targetMargin}%)</span>
                      <span className="font-medium text-green-600">
                        Rp {calculations.profitPerKg.toLocaleString('id-ID')}/kg
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 bg-amber-50 px-4 rounded-lg font-bold text-lg">
                      <span className="text-amber-800">Harga Jual Disarankan</span>
                      <span className="text-amber-800">Rp {calculations.suggestedRetailPrice.toLocaleString('id-ID')}/kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Comparison */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulasi Harga Berbagai Margin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[30, 40, 50].map(margin => {
                    const price = calculations.roastedBeanCostPerKg * (1 + margin / 100);
                    const profit = price - calculations.roastedBeanCostPerKg;
                    return (
                      <div key={margin} className={`p-4 rounded-lg border-2 ${margin === targetMargin ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Margin {margin}%</p>
                          <p className="text-xl font-bold text-gray-800">
                            Rp {price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-sm text-green-600">
                            Profit: Rp {profit.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
              <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Pilih Biji Kopi</h3>
              <p className="text-gray-600">Pilih biji kopi dari inventori untuk memulai perhitungan harga</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}