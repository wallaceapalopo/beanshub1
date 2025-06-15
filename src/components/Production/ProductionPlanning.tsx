import React, { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp, Package, AlertCircle, Plus, Edit } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface ProductionPlan {
  id: string;
  date: Date;
  greenBeanId: string;
  plannedQuantity: number;
  profileId: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  notes?: string;
  estimatedDuration: number;
}

export default function ProductionPlanning() {
  const { state } = useAppContext();
  const { greenBeans, roastingProfiles, roastingSessions } = state;
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);

  // Mock production plans
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([
    {
      id: '1',
      date: new Date(),
      greenBeanId: '1',
      plannedQuantity: 50,
      profileId: '1',
      priority: 'high',
      status: 'planned',
      notes: 'Rush order for Cafe Arabica',
      estimatedDuration: 12
    },
    {
      id: '2',
      date: addDays(new Date(), 1),
      greenBeanId: '2',
      plannedQuantity: 30,
      profileId: '2',
      priority: 'medium',
      status: 'planned',
      estimatedDuration: 15
    }
  ]);

  const [planForm, setPlanForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    greenBeanId: '',
    plannedQuantity: '',
    profileId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const weekPlans = productionPlans.filter(plan => 
    plan.date >= weekStart && plan.date <= weekEnd
  );

  const calculateWeeklyCapacity = () => {
    const totalPlanned = weekPlans.reduce((sum, plan) => sum + plan.plannedQuantity, 0);
    const totalDuration = weekPlans.reduce((sum, plan) => sum + plan.estimatedDuration, 0);
    const maxDailyCapacity = 8 * 60; // 8 hours in minutes
    const weeklyCapacity = maxDailyCapacity * 6; // 6 working days
    
    return {
      totalPlanned,
      totalDuration,
      weeklyCapacity,
      utilizationRate: (totalDuration / weeklyCapacity) * 100
    };
  };

  const capacity = calculateWeeklyCapacity();

  const getDayPlans = (date: Date) => {
    return productionPlans.filter(plan => 
      plan.date.toDateString() === date.toDateString()
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitPlan = () => {
    const newPlan: ProductionPlan = {
      id: editingPlan?.id || Date.now().toString(),
      date: new Date(planForm.date),
      greenBeanId: planForm.greenBeanId,
      plannedQuantity: parseFloat(planForm.plannedQuantity),
      profileId: planForm.profileId,
      priority: planForm.priority,
      status: 'planned',
      notes: planForm.notes,
      estimatedDuration: roastingProfiles.find(p => p.id === planForm.profileId)?.targetDuration || 12
    };

    if (editingPlan) {
      setProductionPlans(plans => plans.map(p => p.id === editingPlan.id ? newPlan : p));
    } else {
      setProductionPlans(plans => [...plans, newPlan]);
    }

    resetForm();
  };

  const resetForm = () => {
    setPlanForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      greenBeanId: '',
      plannedQuantity: '',
      profileId: '',
      priority: 'medium',
      notes: ''
    });
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleEditPlan = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      date: format(plan.date, 'yyyy-MM-dd'),
      greenBeanId: plan.greenBeanId,
      plannedQuantity: plan.plannedQuantity.toString(),
      profileId: plan.profileId,
      priority: plan.priority,
      notes: plan.notes || ''
    });
    setShowPlanModal(true);
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Perencanaan Produksi</h1>
        <p className="text-gray-600">Rencanakan dan kelola jadwal produksi roasting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rencana Minggu Ini</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{weekPlans.length}</p>
            </div>
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Target Produksi</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{capacity.totalPlanned} kg</p>
            </div>
            <Target className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisasi Kapasitas</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {capacity.utilizationRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prioritas Tinggi</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {weekPlans.filter(p => p.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Week Navigation & Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Minggu Sebelumnya
            </button>
            <div className="text-center">
              <h3 className="font-semibold text-gray-800">
                {format(weekStart, 'dd MMM')} - {format(weekEnd, 'dd MMM yyyy')}
              </h3>
            </div>
            <button
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Minggu Berikutnya →
            </button>
          </div>

          <button
            onClick={() => setShowPlanModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Rencana</span>
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Kalender Produksi Mingguan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const dayPlans = getDayPlans(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div key={i} className={`p-4 min-h-[200px] ${isWeekend ? 'bg-gray-50' : ''}`}>
                <div className={`text-center mb-3 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                  <div className="text-sm font-medium">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {format(date, 'd')}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayPlans.map(plan => {
                    const bean = greenBeans.find(b => b.id === plan.greenBeanId);
                    const profile = roastingProfiles.find(p => p.id === plan.profileId);
                    
                    return (
                      <div
                        key={plan.id}
                        className={`p-2 rounded-lg border text-xs cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(plan.priority)}`}
                        onClick={() => handleEditPlan(plan)}
                      >
                        <div className="font-medium truncate">{bean?.variety}</div>
                        <div className="text-xs opacity-75">{plan.plannedQuantity}kg</div>
                        <div className="text-xs opacity-75">{profile?.name}</div>
                        <span className={`inline-block px-1 py-0.5 rounded text-xs mt-1 ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Plans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Daftar Rencana Produksi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biji Kopi
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuantitas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profil
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weekPlans.map((plan) => {
                const bean = greenBeans.find(b => b.id === plan.greenBeanId);
                const profile = roastingProfiles.find(p => p.id === plan.profileId);
                
                return (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {plan.date.toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bean?.variety}</div>
                      <div className="text-sm text-gray-500">{bean?.origin}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.plannedQuantity} kg
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile?.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {plan.estimatedDuration} menit
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                        {plan.priority}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingPlan ? 'Edit Rencana Produksi' : 'Tambah Rencana Produksi'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Produksi
                </label>
                <input
                  type="date"
                  value={planForm.date}
                  onChange={(e) => setPlanForm({...planForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biji Kopi
                </label>
                <select
                  value={planForm.greenBeanId}
                  onChange={(e) => setPlanForm({...planForm, greenBeanId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih biji kopi...</option>
                  {greenBeans.map(bean => (
                    <option key={bean.id} value={bean.id}>
                      {bean.variety} - {bean.origin} (Stok: {bean.quantity}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kuantitas Rencana (kg)
                </label>
                <input
                  type="number"
                  value={planForm.plannedQuantity}
                  onChange={(e) => setPlanForm({...planForm, plannedQuantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profil Roasting
                </label>
                <select
                  value={planForm.profileId}
                  onChange={(e) => setPlanForm({...planForm, profileId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Prioritas
                </label>
                <select
                  value={planForm.priority}
                  onChange={(e) => setPlanForm({...planForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={planForm.notes}
                  onChange={(e) => setPlanForm({...planForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan khusus..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitPlan}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPlan ? 'Update' : 'Simpan'} Rencana
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}