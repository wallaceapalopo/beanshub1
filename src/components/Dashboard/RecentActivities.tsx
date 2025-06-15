import React from 'react';
import { Clock, Package, Flame, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';

export default function RecentActivities() {
  const { state } = useAppContext();
  const { roastingSessions, sales, greenBeans } = state;

  // Combine and sort recent activities
  const activities = [
    ...roastingSessions.slice(-5).map(session => ({
      id: session.id,
      type: 'roasting',
      title: 'Sesi Roasting Selesai',
      description: `${session.roastedQuantity}kg biji kopi di-roasting`,
      timestamp: session.roastDate,
      icon: Flame,
      color: 'text-orange-500'
    })),
    ...sales.slice(-5).map(sale => ({
      id: sale.id,
      type: 'sale',
      title: 'Penjualan Baru',
      description: `${sale.quantity}kg - Rp ${sale.totalAmount.toLocaleString('id-ID')}`,
      timestamp: sale.saleDate,
      icon: ShoppingCart,
      color: 'text-green-500'
    })),
    ...greenBeans.slice(-3).map(bean => ({
      id: bean.id,
      type: 'inventory',
      title: 'Stok Baru Masuk',
      description: `${bean.variety} - ${bean.quantity}kg`,
      timestamp: bean.entryDate,
      icon: Package,
      color: 'text-blue-500'
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-gray-600" />
        Aktivitas Terbaru
      </h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Belum ada aktivitas</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(activity.timestamp, 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}