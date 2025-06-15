import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Clock, Thermometer, Save, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { RoastingProfile } from '../../types';

export default function RoastingProfileManager() {
  const { state, dispatch } = useAppContext();
  const { roastingProfiles, user } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RoastingProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    temperatureCurve: '',
    targetDuration: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (editingProfile) {
      // Update existing profile
      const updatedProfile: RoastingProfile = {
        ...editingProfile,
        name: formData.name,
        temperatureCurve: formData.temperatureCurve,
        targetDuration: parseInt(formData.targetDuration),
        notes: formData.notes
      };
      dispatch({ type: 'UPDATE_ROASTING_PROFILE', payload: updatedProfile });
    } else {
      // Create new profile
      const newProfile: RoastingProfile = {
        id: Date.now().toString(),
        name: formData.name,
        temperatureCurve: formData.temperatureCurve,
        targetDuration: parseInt(formData.targetDuration),
        notes: formData.notes,
        createdBy: user.id,
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_ROASTING_PROFILE', payload: newProfile });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      temperatureCurve: '',
      targetDuration: '',
      notes: ''
    });
    setShowAddModal(false);
    setEditingProfile(null);
  };

  const handleEdit = (profile: RoastingProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      temperatureCurve: profile.temperatureCurve,
      targetDuration: profile.targetDuration.toString(),
      notes: profile.notes
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus profil roasting ini?')) {
      dispatch({ type: 'DELETE_ROASTING_PROFILE', payload: id });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Profil Roasting</h1>
        <p className="text-gray-600">Kelola profil roasting untuk berbagai jenis biji kopi</p>
      </div>

      {/* Add Profile Button */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Profil Baru</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roastingProfiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{profile.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {profile.targetDuration} menit
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(profile)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Kurva Temperatur:</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{profile.temperatureCurve}</p>
              </div>
              
              {profile.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Catatan:</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{profile.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Dibuat: {profile.createdAt.toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {roastingProfiles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Profil</h3>
            <p className="text-gray-600 mb-4">Buat profil roasting pertama Anda</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tambah Profil
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProfile ? 'Edit Profil Roasting' : 'Tambah Profil Roasting'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Profil
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contoh: Medium Roast - Arabica"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Target (menit)
                </label>
                <input
                  type="number"
                  name="targetDuration"
                  value={formData.targetDuration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kurva Temperatur
                </label>
                <textarea
                  name="temperatureCurve"
                  value={formData.temperatureCurve}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsikan kurva temperatur roasting..."
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Catatan tambahan untuk profil ini..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingProfile ? 'Update' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}