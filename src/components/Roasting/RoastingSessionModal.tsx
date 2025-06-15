import React, { useState } from 'react';
import { X, Flame } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { RoastingSession } from '../../types';

interface RoastingSessionModalProps {
  onClose: () => void;
}

export default function RoastingSessionModal({ onClose }: RoastingSessionModalProps) {
  const { state, dispatch } = useAppContext();
  const { greenBeans, roastingProfiles, user } = state;
  const [formData, setFormData] = useState({
    greenBeanId: '',
    greenBeanQuantity: '',
    profileId: '',
    notes: ''
  });

  const selectedBean = greenBeans.find(bean => bean.id === formData.greenBeanId);
  const roastedQuantity = formData.greenBeanQuantity 
    ? (parseFloat(formData.greenBeanQuantity) * 0.8).toFixed(2)
    : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const newSession: RoastingSession = {
      id: Date.now().toString(),
      greenBeanId: formData.greenBeanId,
      greenBeanQuantity: parseFloat(formData.greenBeanQuantity),
      roastedQuantity: parseFloat(roastedQuantity),
      profileId: formData.profileId,
      roastDate: new Date(),
      roasterId: user.id,
      notes: formData.notes,
      batchNumber: `RS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    };

    dispatch({ type: 'ADD_ROASTING_SESSION', payload: newSession });

    // Update green bean inventory
    if (selectedBean) {
      const updatedBean = {
        ...selectedBean,
        quantity: selectedBean.quantity - parseFloat(formData.greenBeanQuantity)
      };
      dispatch({ type: 'UPDATE_GREEN_BEAN', payload: updatedBean });
    }

    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Sesi Roasting Selesai',
        message: `${roastedQuantity}kg biji kopi berhasil di-roasting`,
        timestamp: new Date(),
        read: false
      }
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            <Flame className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">Sesi Roasting Baru</h2>
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
              Pilih Biji Hijau
            </label>
            <select
              name="greenBeanId"
              value={formData.greenBeanId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kuantitas Biji Hijau (kg)
            </label>
            <input
              type="number"
              name="greenBeanQuantity"
              value={formData.greenBeanQuantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="0.1"
              max={selectedBean?.quantity || undefined}
              step="0.1"
              required
            />
            {selectedBean && (
              <p className="text-sm text-gray-500 mt-1">
                Maksimal: {selectedBean.quantity}kg
              </p>
            )}
          </div>

          {formData.greenBeanQuantity && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Estimasi Hasil</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Biji Hijau:</p>
                  <p className="font-medium">{formData.greenBeanQuantity} kg</p>
                </div>
                <div>
                  <p className="text-gray-600">Biji Roasted (20% loss):</p>
                  <p className="font-medium text-orange-700">{roastedQuantity} kg</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profil Roasting
            </label>
            <select
              name="profileId"
              value={formData.profileId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Pilih profil roasting...</option>
              {roastingProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.targetDuration} menit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tambahkan catatan khusus untuk sesi ini..."
            />
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Mulai Roasting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}