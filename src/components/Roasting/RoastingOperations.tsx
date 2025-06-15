import React, { useState } from 'react';
import { Flame, Plus, Clock, Thermometer, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import RoastingSessionModal from './RoastingSessionModal';

export default function RoastingOperations() {
  const { state } = useAppContext();
  const { roastingSessions, greenBeans, roastingProfiles } = state;
  const [showSessionModal, setShowSessionModal] = useState(false);

  const todaysRoasting = roastingSessions.filter(session => 
    session.roastDate.toDateString() === new Date().toDateString()
  );

  const totalRoastedToday = todaysRoasting.reduce((sum, session) => sum + session.roastedQuantity, 0);

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Operasi Roasting</h1>
        <p className="text-gray-600">Kelola proses roasting biji kopi Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sesi Hari Ini</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{todaysRoasting.length}</p>
            </div>
            <Flame className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roasted Hari Ini</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{totalRoastedToday} kg</p>
            </div>
            <div className="h-6 w-6 lg:h-8 lg:w-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs lg:text-sm">kg</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profil</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{roastingProfiles.length}</p>
            </div>
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowSessionModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Mulai Sesi Roasting</span>
          </button>

          <Link
            to="/roasting/profiles"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Kelola Profil Roasting</span>
          </Link>
        </div>
      </div>

      {/* Recent Roasting Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Sesi Roasting Terbaru</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biji Hijau
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profil
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuantitas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roastingSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 lg:px-6 py-8 text-center text-gray-500">
                    <Flame className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada sesi roasting</p>
                    <p className="text-sm">Mulai sesi pertama Anda sekarang</p>
                  </td>
                </tr>
              ) : (
                roastingSessions.map((session) => {
                  const greenBean = greenBeans.find(bean => bean.id === session.greenBeanId);
                  const profile = roastingProfiles.find(p => p.id === session.profileId);
                  
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.batchNumber}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{greenBean?.variety}</div>
                        <div className="text-sm text-gray-500">{greenBean?.origin}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{profile?.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {profile?.targetDuration} menit
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.greenBeanQuantity} kg → {session.roastedQuantity} kg
                        </div>
                        <div className="text-sm text-gray-500">
                          Loss: {((session.greenBeanQuantity - session.roastedQuantity) / session.greenBeanQuantity * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.roastDate.toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSessionModal && (
        <RoastingSessionModal 
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </div>
  );
}