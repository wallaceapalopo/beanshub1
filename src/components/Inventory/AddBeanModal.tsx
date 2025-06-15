import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GreenBean } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/firestoreService';

interface AddBeanModalProps {
  onClose: () => void;
}

export default function AddBeanModal({ onClose }: AddBeanModalProps) {
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    variety: '',
    origin: '',
    quantity: '',
    purchasePricePerKg: '',
    lowStockThreshold: '50'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const newBean: Omit<GreenBean, 'id'> = {
        supplierName: formData.supplierName,
        variety: formData.variety,
        origin: formData.origin,
        quantity: parseFloat(formData.quantity),
        purchasePricePerKg: parseFloat(formData.purchasePricePerKg),
        entryDate: new Date(),
        batchNumber: `GB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        lowStockThreshold: parseFloat(formData.lowStockThreshold)
      };

      const id = await FirestoreService.createGreenBean(newBean, user.id);
      
      dispatch({ 
        type: 'ADD_GREEN_BEAN', 
        payload: { ...newBean, id } as GreenBean 
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          title: 'Biji Kopi Ditambahkan',
          message: `${newBean.variety} berhasil ditambahkan ke inventori`,
          timestamp: new Date(),
          read: false
        }
      });

      onClose();
    } catch (error) {
      console.error('Error adding green bean:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          title: 'Gagal Menambahkan',
          message: 'Terjadi kesalahan saat menambahkan biji kopi',
          timestamp: new Date(),
          read: false
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tambah Biji Kopi Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Supplier
            </label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varietas
            </label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="contoh: Arabica Gayo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asal
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="contoh: Aceh, Indonesia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kuantitas (kg)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga per kg (Rp)
              </label>
              <input
                type="number"
                name="purchasePricePerKg"
                value={formData.purchasePricePerKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batas Minimum Stok (kg)
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}