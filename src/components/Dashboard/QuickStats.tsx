import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { subDays, startOfDay } from 'date-fns';

interface QuickStatsProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

function StatCard({ title, value, icon: Icon, color, change, changeType }: QuickStatsProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-800 truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {getChangeIcon()}
              <span className={`text-sm font-medium ml-1 ${getChangeColor()}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs kemarin</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 lg:w-12 lg:h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function QuickStats() {
  const { state } = useAppContext();
  const { sales, roastingSessions, greenBeans } = state;

  // Calculate today's stats
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  const todaySales = sales.filter(sale => startOfDay(sale.saleDate).getTime() === today.getTime());
  const yesterdaySales = sales.filter(sale => startOfDay(sale.saleDate).getTime() === yesterday.getTime());

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const todayRoasting = roastingSessions.filter(session => startOfDay(session.roastDate).getTime() === today.getTime());
  const yesterdayRoasting = roastingSessions.filter(session => startOfDay(session.roastDate).getTime() === yesterday.getTime());

  const todayRoastedQuantity = todayRoasting.reduce((sum, session) => sum + session.roastedQuantity, 0);
  const yesterdayRoastedQuantity = yesterdayRoasting.reduce((sum, session) => sum + session.roastedQuantity, 0);

  // Calculate percentage changes
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const roastingChange = yesterdayRoastedQuantity > 0 ? ((todayRoastedQuantity - yesterdayRoastedQuantity) / yesterdayRoastedQuantity) * 100 : 0;

  const totalInventoryValue = greenBeans.reduce((sum, bean) => sum + (bean.quantity * bean.purchasePricePerKg), 0);
  const lowStockItems = greenBeans.filter(bean => bean.quantity <= bean.lowStockThreshold);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatCard
        title="Pendapatan Hari Ini"
        value={`Rp ${todayRevenue.toLocaleString('id-ID')}`}
        icon={({ className }) => <span className={className}>Rp</span>}
        color="bg-green-500"
        change={revenueChange}
        changeType={revenueChange > 0 ? 'increase' : revenueChange < 0 ? 'decrease' : 'neutral'}
      />
      
      <StatCard
        title="Roasting Hari Ini"
        value={`${todayRoastedQuantity} kg`}
        icon={({ className }) => <span className={className}>🔥</span>}
        color="bg-orange-500"
        change={roastingChange}
        changeType={roastingChange > 0 ? 'increase' : roastingChange < 0 ? 'decrease' : 'neutral'}
      />
      
      <StatCard
        title="Nilai Inventori"
        value={`Rp ${totalInventoryValue.toLocaleString('id-ID')}`}
        icon={({ className }) => <span className={className}>📦</span>}
        color="bg-blue-500"
      />
      
      <StatCard
        title="Stok Rendah"
        value={lowStockItems.length.toString()}
        icon={({ className }) => <span className={className}>⚠️</span>}
        color={lowStockItems.length > 0 ? "bg-red-500" : "bg-gray-500"}
      />
    </div>
  );
}