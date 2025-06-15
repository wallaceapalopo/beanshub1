import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Sale } from '../../types';

interface AddSaleModalProps {
  onClose: () => void;
}

export default function AddSaleModal({ onClose }: AddSaleModalProps) {
  const { state, dispatch } = useAppContext();
  const { greenBeans, user } = state;
  const [formData, setFormData] = useState({
    productType: 'roasted' as 'green' | 'roasted',
    productId: '',
    quantity: '',
    pricePerKg: '',
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'Transfer',
    customerName: '',
    customerPhone: ''
  });

  const selectedProduct = formData.productType === 'green' 
    ? greenBeans.find(bean => bean.id === formData.productId)
    : null;

  const totalAmount = formData.quantity && formData.pricePerKg 
    ? parseFloat(formData.quantity) * parseFloat(formData.pricePerKg)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const newSale: Sale = {
      id: Date.now().toString(),
      productType: formData.productType,
      productId: formData.productId || 'roasted-coffee',
      quantity: parseFloat(formData.quantity),
      pricePerKg: parseFloat(formData.pricePerKg),
      totalAmount: totalAmount,
      paymentMethod: formData.paymentMethod,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      saleDate: new Date(),
      staffId: user.id
    };

    dispatch({ type: 'ADD_SALE', payload: newSale });

    // Update inventory if selling green beans
    if (formData.productType === 'green' && selectedProduct) {
      const updatedBean = {
        ...selectedProduct,
        quantity: selectedProduct.quantity - parseFloat(formData.quantity)
      };
      dispatch({ type: 'UPDATE_GREEN_BEAN', payload: updatedBean });
    }

    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Penjualan Berhasil',
        message: `Penjualan ${formData.quantity}kg berhasil dicatat`,
        timestamp: new Date(),
        read: false
      }
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">Tambah Penjualan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Produk
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="roasted">Biji Kopi Sangrai</option>
              <option value="green">Biji Kopi Hijau</option>
            </select>
          </div>

          {formData.productType === 'green' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Biji Hijau
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Pilih biji hijau...</option>
                {greenBeans.filter(bean => bean.quantity > 0).map(bean => (
                  <option key={bean.id} value={bean.id}>
                    {bean.variety} - {bean.origin} (Stok: {bean.quantity}kg)
                  </option>
                ))}
              </select>
            </div>
          )}

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0.1"
                max={selectedProduct?.quantity || undefined}
                step="0.1"
                required
              />
              {selectedProduct && (
                <p className="text-sm text-gray-500 mt-1">
                  Maksimal: {selectedProduct.quantity}kg
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga per kg (Rp)
              </label>
              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-medium">Total Pembayaran:</span>
                <span className="text-2xl font-bold text-green-800">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="Cash">Tunai</option>
              <option value="Card">Kartu</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pelanggan (Opsional)
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nama pelanggan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. Telepon (Opsional)
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Simpan Penjualan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}