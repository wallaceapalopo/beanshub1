import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, Package, ArrowUpDown, Eye, MoreVertical } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { GreenBean } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import AddBeanModal from './AddBeanModal';
import EditBeanModal from './EditBeanModal';
import StockMovementModal from './StockMovementModal';
import BeanDetailsModal from './BeanDetailsModal';

export default function InventoryManagement() {
  const { state, dispatch } = useAppContext();
  const { greenBeans, user } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBean, setSelectedBean] = useState<GreenBean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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

  const handleDeleteBean = async (id: string) => {
    if (!user) return;
    
    if (window.confirm('Apakah Anda yakin ingin menghapus biji kopi ini?')) {
      try {
        await FirestoreService.delete('greenBeans', id);
        dispatch({ type: 'DELETE_GREEN_BEAN', payload: id });
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Biji Kopi Dihapus',
            message: 'Biji kopi berhasil dihapus dari inventori',
            timestamp: new Date(),
            read: false
          }
        });
      } catch (error) {
        console.error('Error deleting green bean:', error);
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            title: 'Gagal Menghapus',
            message: 'Terjadi kesalahan saat menghapus biji kopi',
            timestamp: new Date(),
            read: false
          }
        });
      }
    }
  };

  const handleEditBean = (bean: GreenBean) => {
    setSelectedBean(bean);
    setShowEditModal(true);
  };

  const handleViewDetails = (bean: GreenBean) => {
    setSelectedBean(bean);
    setShowDetailsModal(true);
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

  const BeanCard = ({ bean }: { bean: GreenBean }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{bean.variety}</h3>
          <p className="text-sm text-gray-600 truncate">{bean.origin}</p>
          <p className="text-xs text-gray-500">Batch: {bean.batchNumber}</p>
        </div>
        <div className="relative ml-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Stok:</span>
          <span className="font-medium">{bean.quantity} kg</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Harga/kg:</span>
          <span className="font-medium">Rp {bean.purchasePricePerKg.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Supplier:</span>
          <span className="text-sm truncate ml-2">{bean.supplierName}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {bean.quantity <= bean.lowStockThreshold ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-3">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Stok Rendah
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
            Normal
          </span>
        )}

        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetails(bean)}
            className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Detail
          </button>
          <button 
            onClick={() => handleEditBean(bean)}
            className="flex-1 text-amber-600 hover:text-amber-800 text-sm font-medium"
          >
            Edit
          </button>
          <button 
            onClick={() => handleStockMovement(bean)}
            className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Stok
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Inventori Biji Hijau</h1>
        <p className="text-gray-600">Kelola stok biji kopi hijau Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
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

          <div className="flex space-x-2">
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'table' ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tabel
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
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
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredBeans.map((bean) => (
            <BeanCard key={bean.id} bean={bean} />
          ))}
          {filteredBeans.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak ada biji kopi ditemukan</h3>
              <p className="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
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
                          onClick={() => handleViewDetails(bean)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleStockMovement(bean)}
                          className="text-green-600 hover:text-green-900"
                          title="Pergerakan Stok"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditBean(bean)}
                          className="text-amber-600 hover:text-amber-900"
                          title="Edit"
                        >
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
                {filteredBeans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 lg:px-6 py-8 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada biji kopi ditemukan</p>
                      <p className="text-sm">Coba ubah filter pencarian Anda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddBeanModal 
          onClose={() => setShowAddModal(false)} 
        />
      )}

      {showEditModal && selectedBean && (
        <EditBeanModal
          bean={selectedBean}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBean(null);
          }}
          onUpdate={async (bean) => {
            try {
              await FirestoreService.update('greenBeans', bean.id, bean);
              dispatch({ type: 'UPDATE_GREEN_BEAN', payload: bean });
              setShowEditModal(false);
              setSelectedBean(null);
              
              dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                  id: Date.now().toString(),
                  type: 'success',
                  title: 'Biji Kopi Diperbarui',
                  message: `${bean.variety} berhasil diperbarui`,
                  timestamp: new Date(),
                  read: false
                }
              });
            } catch (error) {
              console.error('Error updating green bean:', error);
              dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                  id: Date.now().toString(),
                  type: 'error',
                  title: 'Gagal Memperbarui',
                  message: 'Terjadi kesalahan saat memperbarui biji kopi',
                  timestamp: new Date(),
                  read: false
                }
              });
            }
          }}
        />
      )}

      {showDetailsModal && selectedBean && (
        <BeanDetailsModal
          bean={selectedBean}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBean(null);
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