import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { GreenBean } from '../../types';

interface StockMovementModalProps {
  bean: GreenBean;
  onClose: () => void;
}

export default function StockMovementModal({ bean, onClose }: StockMovementModalProps) {
  const { dispatch } = useAppContext();
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movementQuantity = parseFloat(quantity);
    const newQuantity = movementType === 'in' 
      ? bean.quantity + movementQuantity 
      : bean.quantity - movementQuantity;

    if (newQuantity < 0) {
      alert('Kuantitas tidak boleh negatif');
      return;
    }

    const updatedBean: GreenBean = {
      ...bean,
      quantity: newQuantity
    };

    dispatch({ type: 'UPDATE_GREEN_BEAN', payload: updatedBean });

    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'info',
        title: 'Pergerakan Stok',
        message: `${movementType === 'in' ? 'Penambahan' : 'Pengurangan'} stok ${bean.variety}: ${movementQuantity}kg`,
        timestamp: new Date(),
        read: false
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Pergerakan Stok</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800">{bean.variety}</h3>
            <p className="text-sm text-gray-600">{bean.origin}</p>
            <p className="text-sm text-gray-600">Stok saat ini: <span className="font-medium">{bean.quantity} kg</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pergerakan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    movementType === 'in'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Stok Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('out')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    movementType === 'out'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Stok Keluar</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kuantitas (kg)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0.1"
                max={movementType === 'out' ? bean.quantity : undefined}
                step="0.1"
                required
              />
              {movementType === 'out' && (
                <p className="text-sm text-gray-500 mt-1">
                  Maksimal: {bean.quantity}kg
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih alasan...</option>
                {movementType === 'in' ? (
                  <>
                    <option value="purchase">Pembelian Baru</option>
                    <option value="return">Retur dari Pelanggan</option>
                    <option value="adjustment">Penyesuaian Stok</option>
                    <option value="transfer">Transfer dari Cabang Lain</option>
                  </>
                ) : (
                  <>
                    <option value="roasting">Untuk Roasting</option>
                    <option value="sale">Penjualan Langsung</option>
                    <option value="damage">Kerusakan/Expired</option>
                    <option value="sample">Sample/Testing</option>
                    <option value="adjustment">Penyesuaian Stok</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tambahkan catatan tambahan..."
              />
            </div>

            {quantity && (
              <div className={`p-4 rounded-lg ${movementType === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                <h4 className={`font-medium mb-2 ${movementType === 'in' ? 'text-green-800' : 'text-red-800'}`}>
                  Ringkasan Pergerakan
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stok Saat Ini:</span>
                    <span className="font-medium">{bean.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {movementType === 'in' ? 'Penambahan:' : 'Pengurangan:'}
                    </span>
                    <span className={`font-medium ${movementType === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {movementType === 'in' ? '+' : '-'}{quantity} kg
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-600">Stok Setelah:</span>
                    <span className="font-bold">
                      {movementType === 'in' 
                        ? (bean.quantity + parseFloat(quantity)).toFixed(1)
                        : (bean.quantity - parseFloat(quantity)).toFixed(1)
                      } kg
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  movementType === 'in'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {movementType === 'in' ? 'Tambah Stok' : 'Kurangi Stok'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}