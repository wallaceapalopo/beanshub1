import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { GreenBean } from '../../types';

interface EditBeanModalProps {
  bean: GreenBean;
  onClose: () => void;
  onUpdate: (bean: GreenBean) => void;
}

export default function EditBeanModal({ bean, onClose, onUpdate }: EditBeanModalProps) {
  const [formData, setFormData] = useState({
    supplierName: bean.supplierName,
    variety: bean.variety,
    origin: bean.origin,
    quantity: bean.quantity.toString(),
    purchasePricePerKg: bean.purchasePricePerKg.toString(),
    lowStockThreshold: bean.lowStockThreshold.toString()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Nama supplier wajib diisi';
    }

    if (!formData.variety.trim()) {
      newErrors.variety = 'Varietas wajib diisi';
    }

    if (!formData.origin.trim()) {
      newErrors.origin = 'Asal wajib diisi';
    }

    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'Kuantitas harus lebih dari 0';
    }

    if (!formData.purchasePricePerKg || parseFloat(formData.purchasePricePerKg) < 0) {
      newErrors.purchasePricePerKg = 'Harga harus lebih dari 0';
    }

    if (!formData.lowStockThreshold || parseFloat(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = 'Batas minimum harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedBean: GreenBean = {
      ...bean,
      supplierName: formData.supplierName.trim(),
      variety: formData.variety.trim(),
      origin: formData.origin.trim(),
      quantity: parseFloat(formData.quantity),
      purchasePricePerKg: parseFloat(formData.purchasePricePerKg),
      lowStockThreshold: parseFloat(formData.lowStockThreshold)
    };

    onUpdate(updatedBean);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Biji Kopi</h2>
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
              Nama Supplier *
            </label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.supplierName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.supplierName && <p className="text-red-500 text-sm mt-1">{errors.supplierName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varietas *
            </label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.variety ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="contoh: Arabica Gayo"
            />
            {errors.variety && <p className="text-red-500 text-sm mt-1">{errors.variety}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asal *
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.origin ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="contoh: Aceh, Indonesia"
            />
            {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kuantitas (kg) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.1"
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga per kg (Rp) *
              </label>
              <input
                type="number"
                name="purchasePricePerKg"
                value={formData.purchasePricePerKg}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.purchasePricePerKg ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
              />
              {errors.purchasePricePerKg && <p className="text-red-500 text-sm mt-1">{errors.purchasePricePerKg}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batas Minimum Stok (kg) *
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.lowStockThreshold ? 'border-red-300' : 'border-gray-300'
              }`}
              min="0"
              step="0.1"
            />
            {errors.lowStockThreshold && <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold}</p>}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Informasi Biji Kopi:</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <p><strong>Batch Number:</strong> {bean.batchNumber}</p>
              <p><strong>Tanggal Masuk:</strong> {bean.entryDate.toLocaleDateString('id-ID')}</p>
              <p><strong>Nilai Total Saat Ini:</strong> Rp {(parseFloat(formData.quantity || '0') * parseFloat(formData.purchasePricePerKg || '0')).toLocaleString('id-ID')}</p>
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
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}