import React from 'react';
import { X, User, Mail, Phone, Shield, Calendar, Clock, Activity } from 'lucide-react';
import { User as UserType } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface UserDetailsModalProps {
  user: UserType;
  onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const { state } = useAppContext();
  const { roastingSessions, sales } = state;

  // Calculate user activity stats
  const userRoastingSessions = roastingSessions.filter(session => session.roasterId === user.id);
  const userSales = sales.filter(sale => sale.staffId === user.id);
  
  const totalRoastedQuantity = userRoastingSessions.reduce((sum, session) => sum + session.roastedQuantity, 0);
  const totalSalesAmount = userSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Roaster': return 'bg-orange-100 text-orange-800';
      case 'Staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informasi Dasar
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Telepon</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informasi Akun
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Bergabung</p>
                    <p className="font-medium">{user.createdAt.toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Login Terakhir</p>
                    <p className="font-medium">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString('id-ID') : 'Belum pernah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Statistik Aktivitas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Sesi Roasting</p>
                    <p className="text-2xl font-bold text-orange-800">{userRoastingSessions.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔥</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Total: {totalRoastedQuantity}kg
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Transaksi Penjualan</p>
                    <p className="text-2xl font-bold text-green-800">{userSales.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Total: Rp {totalSalesAmount.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Hari Aktif</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 3600 * 24))}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Sejak bergabung
                </p>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Hak Akses Role
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              {user.role === 'Admin' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-800">Administrator</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Akses penuh ke semua fitur sistem</li>
                    <li>• Manajemen user dan hak akses</li>
                    <li>• Laporan keuangan dan analytics</li>
                    <li>• Pengaturan sistem</li>
                    <li>• Backup dan restore data</li>
                  </ul>
                </div>
              )}
              
              {user.role === 'Roaster' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-800">Roaster</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Operasi roasting dan profil</li>
                    <li>• Quality control dan cupping</li>
                    <li>• Perencanaan produksi</li>
                    <li>• Manajemen inventori</li>
                    <li>• Kalkulator harga</li>
                  </ul>
                </div>
              )}
              
              {user.role === 'Staff' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Staff</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Manajemen penjualan</li>
                    <li>• Inventori dasar (view only)</li>
                    <li>• Dashboard operasional</li>
                    <li>• Pengaturan profil</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {(userRoastingSessions.length > 0 || userSales.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Aktivitas Terbaru
              </h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {/* Recent Roasting Sessions */}
                {userRoastingSessions.slice(-3).map(session => (
                  <div key={session.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🔥</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Sesi Roasting</p>
                      <p className="text-xs text-gray-600">
                        {session.roastedQuantity}kg - {session.roastDate.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent Sales */}
                {userSales.slice(-3).map(sale => (
                  <div key={sale.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Penjualan</p>
                      <p className="text-xs text-gray-600">
                        Rp {sale.totalAmount.toLocaleString('id-ID')} - {sale.saleDate.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}