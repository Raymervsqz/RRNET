
import React from 'react';
import { 
  Users, 
  DollarSign, 
  WifiOff, 
  ArrowUpRight, 
  BrainCircuit,
  Loader2,
  // Fix: Added missing Receipt icon import
  Receipt
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { getBusinessInsights } from '../services/aiService';
import { ClientStatus, InvoiceStatus } from '../types';

const Dashboard: React.FC = () => {
  const clients = storageService.getClients();
  const invoices = storageService.getInvoices();
  const plans = storageService.getPlans();
  
  const [insights, setInsights] = React.useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);

  const stats = [
    { label: 'Clientes Activos', value: clients.filter(c => c.status === ClientStatus.ACTIVE).length, icon: Users, color: 'bg-green-500' },
    { label: 'Ingresos del Mes', value: `$${invoices.filter(i => i.status === InvoiceStatus.PAID).reduce((acc, inv) => acc + inv.amount, 0).toFixed(2)}`, icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Cortes Pendientes', value: clients.filter(c => c.status === ClientStatus.CUT).length, icon: WifiOff, color: 'bg-red-500' },
    { label: 'Morosidad', value: `${invoices.length > 0 ? ((invoices.filter(i => i.status === InvoiceStatus.PENDING).length / invoices.length) * 100).toFixed(1) : 0}%`, icon: ArrowUpRight, color: 'bg-yellow-500' },
  ];

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const result = await getBusinessInsights(clients, invoices, plans);
    setInsights(result);
    setLoadingInsights(false);
  };

  React.useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-6 h-6 text-blue-200" />
            <h3 className="text-lg font-semibold">Insights Estratégicos (AI)</h3>
          </div>
          {loadingInsights ? (
            <div className="flex items-center gap-2 text-blue-100">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analizando datos de RRNET...</span>
            </div>
          ) : (
            <p className="text-blue-50 leading-relaxed max-w-3xl">
              {insights || "Sin datos suficientes para generar insights."}
            </p>
          )}
          <button 
            onClick={fetchInsights}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            Actualizar Análisis
          </button>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Clientes Recientes</h3>
          <div className="space-y-4">
            {clients.slice(-5).reverse().map(client => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                    <p className="text-xs text-gray-500">{client.pppoeUser}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === ClientStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {client.status}
                </span>
              </div>
            ))}
            {clients.length === 0 && <p className="text-center text-gray-500 py-4">No hay clientes registrados.</p>}
          </div>
        </div>

        {/* Collection Status Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Estado de Cobranza (Este Mes)</h3>
          <div className="flex items-center justify-center h-48">
             <div className="text-center">
               <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
               <p className="text-gray-500">Visualización de ingresos en construcción</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
