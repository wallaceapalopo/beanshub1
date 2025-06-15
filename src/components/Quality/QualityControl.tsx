import React, { useState } from 'react';
import { Star, Award, CheckCircle, AlertCircle, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface QualityScore {
  id: string;
  roastingSessionId: string;
  beanVariety: string;
  roastDate: Date;
  appearance: number; // 1-8
  aroma: number; // 1-8
  flavor: number; // 1-8
  acidity: number; // 1-8
  body: number; // 1-8
  overall: number; // calculated average
  notes: string;
  evaluator: string;
  cupping: boolean;
}

export default function QualityControl() {
  const { state } = useAppContext();
  const { roastingSessions, greenBeans, user } = state;
  const [selectedSession, setSelectedSession] = useState('');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock quality scores data
  const [qualityScores] = useState<QualityScore[]>([
    {
      id: '1',
      roastingSessionId: '1',
      beanVariety: 'Arabica Gayo',
      roastDate: new Date('2024-01-28'),
      appearance: 4,
      aroma: 5,
      flavor: 4,
      acidity: 4,
      body: 4,
      overall: 4.2,
      notes: 'Excellent balance, bright acidity with chocolate notes',
      evaluator: 'Master Roaster',
      cupping: true
    }
  ]);

  const [evaluationForm, setEvaluationForm] = useState({
    appearance: 3,
    aroma: 3,
    flavor: 3,
    acidity: 3,
    body: 3,
    notes: '',
    cupping: false
  });

  const calculateOverallScore = () => {
    const { appearance, aroma, flavor, acidity, body } = evaluationForm;
    return ((appearance + aroma + flavor + acidity + body) / 8).toFixed(1);
  };

  const getQualityGrade = (score: number) => {
    if (score >= 7.5) return { grade: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 6.0) return { grade: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 4.5) return { grade: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 4.0) return { grade: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const handleSubmitEvaluation = () => {
    const newScore: QualityScore = {
      id: Date.now().toString(),
      roastingSessionId: selectedSession,
      beanVariety: roastingSessions.find(s => s.id === selectedSession)?.greenBeanId || '',
      roastDate: new Date(),
      ...evaluationForm,
      overall: parseFloat(calculateOverallScore()),
      evaluator: user?.name || 'Unknown'
    };

    // In a real app, this would be dispatched to the context
    console.log('New quality score:', newScore);
    setShowEvaluationModal(false);
    setEvaluationForm({
      appearance: 3,
      aroma: 3,
      flavor: 3,
      acidity: 3,
      body: 3,
      notes: '',
      cupping: false
    });
  };

  const averageQuality = qualityScores.length > 0 
    ? qualityScores.reduce((sum, score) => sum + score.overall, 0) / qualityScores.length 
    : 0;

  const excellentBatches = qualityScores.filter(score => score.overall >= 4.5).length;
  const cuppingScores = qualityScores.filter(score => score.cupping);

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Quality Control</h1>
        <p className="text-gray-600">Monitor dan evaluasi kualitas hasil roasting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Kualitas</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">
                {averageQuality.toFixed(1)}/8.0
              </p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(averageQuality) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <Award className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Batch Excellent</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">{excellentBatches}</p>
              <p className="text-sm text-gray-500">≥ 7.5 rating</p>
            </div>
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluasi</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{qualityScores.length}</p>
            </div>
            <div className="h-6 w-6 lg:h-8 lg:w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs lg:text-sm">#</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cupping Sessions</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{cuppingScores.length}</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih sesi roasting untuk evaluasi...</option>
              {roastingSessions.map(session => {
                const bean = greenBeans.find(b => b.id === session.greenBeanId);
                return (
                  <option key={session.id} value={session.id}>
                    {bean?.variety} - {session.batchNumber} ({session.roastDate.toLocaleDateString('id-ID')})
                  </option>
                );
              })}
            </select>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Periode</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>

          <button
            onClick={() => setShowEvaluationModal(true)}
            disabled={!selectedSession}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Star className="h-5 w-5" />
            <span>Evaluasi Kualitas</span>
          </button>
        </div>
      </div>

      {/* Quality Scores Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Evaluasi Kualitas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Varietas
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skor Detail
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qualityScores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 lg:px-6 py-8 text-center text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada evaluasi kualitas</p>
                    <p className="text-sm">Mulai evaluasi batch roasting Anda</p>
                  </td>
                </tr>
              ) : (
                qualityScores.map((score) => {
                  const grade = getQualityGrade(score.overall);
                  return (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {score.roastDate.toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{score.beanVariety}</div>
                        {score.cupping && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Cupping
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Appearance: {score.appearance}/8</div>
                          <div>Aroma: {score.aroma}/8</div>
                          <div>Flavor: {score.flavor}/8</div>
                          <div>Acidity: {score.acidity}/8</div>
                          <div>Body: {score.body}/8</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-800 mr-2">
                            {score.overall.toFixed(1)}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(score.overall) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.color}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.evaluator}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Evaluasi Kualitas</h2>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overall Score Display */}
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Overall Score</h3>
                <div className="text-3xl font-bold text-blue-600">{calculateOverallScore()}/8.0</div>
                <div className="flex justify-center mt-2">
                  {[...Array(8)].map((_, i) => (8
                    <Star 
                      key={i} 
                      className={`h-6 w-6 ${i < Math.floor(parseFloat(calculateOverallScore())) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'appearance', label: 'Appearance', description: 'Visual quality of beans' },
                  { key: 'aroma', label: 'Aroma', description: 'Fragrance and smell' },
                  { key: 'flavor', label: 'Flavor', description: 'Taste characteristics' },
                  { key: 'acidity', label: 'Acidity', description: 'Brightness and tartness' },
                  { key: 'body', label: 'Body', description: 'Mouthfeel and texture' }
                ].map((criteria) => (
                  <div key={criteria.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {criteria.label}
                    </label>
                    <p className="text-xs text-gray-500">{criteria.description}</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={evaluationForm[criteria.key as keyof typeof evaluationForm] as number}
                        onChange={(e) => setEvaluationForm({
                          ...evaluationForm,
                          [criteria.key]: parseInt(e.target.value)
                        })}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-gray-800 w-8">
                        {evaluationForm[criteria.key as keyof typeof evaluationForm]}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Evaluasi
                </label>
                <textarea
                  value={evaluationForm.notes}
                  onChange={(e) => setEvaluationForm({...evaluationForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan detail tentang kualitas..."
                />
              </div>

              {/* Cupping Session */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cupping"
                  checked={evaluationForm.cupping}
                  onChange={(e) => setEvaluationForm({...evaluationForm, cupping: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="cupping" className="ml-2 block text-sm text-gray-900">
                  Ini adalah sesi cupping formal
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}