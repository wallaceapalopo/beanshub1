import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, Package, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { GreenBean } from '../../types';
import AddBeanModal from './AddBeanModal';
import StockMovementModal from './StockMovementModal';

export default function InventoryManagement() {
  const { state, dispatch } = useAppContext();
  const { greenBeans } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedBean, setSelectedBean] = useState<GreenBean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredBeans = greenBeans
    .filter(bean =>
      bean.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bean.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bean.origin.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(bean =>
      filterOrigin === '' || bean.origin.includes(filterOrigin)
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.variety.localeCompare(b.variety);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'date':
          comparison = a.entryDate.getTime() - b.entryDate.getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const origins = [...new Set(greenBeans.map(bean => bean.origin))];
  const totalValue = greenBeans.reduce((sum, bean) => sum + (bean.quantity * bean.purchasePricePerKg), 0);
  const lowStockCount = greenBeans.filter(bean => bean.quantity <= bean.lowStockThreshold).length;

  const handleDeleteBean = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus biji kopi ini?')) {
      dispatch({ type: 'DELETE_GREEN_BEAN', payload: id });
    }
  };

  const handleStockMovement = (bean: GreenBean) => {
    setSelectedBean(bean);
    setShowMovementModal(true);
  };

  const toggleSort = (field: 'name' | 'quantity' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Inventori Biji Hijau</h1>
        <p className="text-gray-600">Kelola stok biji kopi hijau Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Stok</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {greenBeans.reduce((sum, bean) => sum + bean.quantity, 0)} kg
              </p>
            </div>
            <Package className="h-6 w-6 lg:h-8 lg:w-8 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Nilai Total</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800 truncate">
                Rp {totalValue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="h-6 w-6 lg:h-8 lg:w-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs lg:text-sm">Rp</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari biji kopi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Semua Asal</option>
                {origins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Urutkan:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'quantity' | 'date');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="quantity-asc">Stok Terendah</option>
                <option value="quantity-desc">Stok Tertinggi</option>
                <option value="date-desc">Terbaru</option>
                <option value="date-asc">Terlama</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Tambah Biji Kopi</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biji Kopi
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga/kg
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Total Nilai
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBeans.map((bean) => (
                <tr key={bean.id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bean.variety}</div>
                      <div className="text-sm text-gray-500">{bean.origin}</div>
                      <div className="text-xs text-gray-400">Batch: {bean.batchNumber}</div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bean.supplierName}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bean.quantity} kg</div>
                    <div className="text-xs text-gray-500">Min: {bean.lowStockThreshold} kg</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {bean.purchasePricePerKg.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hidden lg:table-cell">
                    Rp {(bean.quantity * bean.purchasePricePerKg).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {bean.quantity <= bean.lowStockThreshold ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Stok Rendah</span>
                        <span className="sm:hidden">Rendah</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleStockMovement(bean)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Pergerakan Stok"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                      <button className="text-amber-600 hover:text-amber-900" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBean(bean.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddBeanModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={(bean) => {
            dispatch({ type: 'ADD_GREEN_BEAN', payload: bean });
            setShowAddModal(false);
          }}
        />
      )}

      {showMovementModal && selectedBean && (
        <StockMovementModal
          bean={selectedBean}
          onClose={() => {
            setShowMovementModal(false);
            setSelectedBean(null);
          }}
        />
      )}
    </div>
  );
}