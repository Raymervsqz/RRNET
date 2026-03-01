
import React from 'react';
import { 
  Cpu, Wifi, MessageSquare, ShieldCheck, Plus, Trash2, 
  RefreshCw, CheckCircle, AlertTriangle, Loader2, X, Globe, Lock
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { mikrotikService, MikrotikResource } from '../services/mikrotikService';
import { RouterConfig, Plan, WhatsAppConfig, Terminal } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'routers' | 'plans' | 'whatsapp' | 'infrastructure' | 'system'>('routers');
  const [routers, setRouters] = React.useState<RouterConfig[]>(storageService.getRouters());
  const [isAddRouterModalOpen, setIsAddRouterModalOpen] = React.useState(false);
  
  // Form State for New Router
  const [newRouter, setNewRouter] = React.useState({
    name: '',
    host: '',
    port: 80,
    user: 'ai_bot',
    pass: ''
  });

  const [testingRouterId, setTestingRouterId] = React.useState<string | null>(null);
  const [testResults, setTestResults] = React.useState<Record<string, {success: boolean, data?: MikrotikResource, error?: string}>>({});

  const handleAddRouter = (e: React.FormEvent) => {
    e.preventDefault();
    const router: RouterConfig = {
      id: crypto.randomUUID(),
      ...newRouter,
      status: 'OFFLINE'
    };
    const updated = [...routers, router];
    setRouters(updated);
    storageService.saveRouters(updated);
    setIsAddRouterModalOpen(false);
    setNewRouter({ name: '', host: '', port: 80, user: 'ai_bot', pass: '' });
  };

  const handleTestConnection = async (router: RouterConfig) => {
    setTestingRouterId(router.id);
    const result = await mikrotikService.testConnection(router);
    setTestResults(prev => ({ ...prev, [router.id]: result }));
    
    const updatedStatus = result.success ? 'ONLINE' : 'OFFLINE';
    const updated = routers.map(r => r.id === router.id ? { ...r, status: updatedStatus as any } : r);
    setRouters(updated);
    storageService.saveRouters(updated);
    setTestingRouterId(null);
  };

  const deleteRouter = (id: string) => {
    if (confirm('¿Eliminar conexión de router?')) {
      const updated = routers.filter(r => r.id !== id);
      setRouters(updated);
      storageService.saveRouters(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'routers', label: 'Routers', icon: Cpu },
          { id: 'infrastructure', label: 'Infraestructura', icon: Globe },
          { id: 'plans', label: 'Planes', icon: Wifi },
          { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'routers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nodos Mikrotik</h3>
              <p className="text-sm text-gray-500 font-medium">RB4011 detectado - API REST activa.</p>
            </div>
            <button 
              onClick={() => setIsAddRouterModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Añadir Nuevo Router
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routers.map(router => {
              const result = testResults[router.id];
              const isTesting = testingRouterId === router.id;
              return (
                <div key={router.id} className="bg-white p-8 rounded-[40px] border-2 border-gray-50">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-3xl ${router.status === 'ONLINE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      <Cpu className="w-8 h-8" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleTestConnection(router)} disabled={isTesting} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100">
                        {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                      </button>
                      <button onClick={() => deleteRouter(router.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-black text-xl text-gray-900">{router.name}</h4>
                  <p className="text-sm text-gray-400 font-mono">{router.host}:{router.port}</p>
                  
                  {result && (
                    <div className={`mt-4 p-4 rounded-2xl ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                        {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {result.success ? 'Conectado' : 'Error'}
                      </div>
                      {result.data && <p className="text-[10px] mt-1">CPU: {result.data.cpu} | Modelo: {result.data.boardName}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Añadir Router */}
      {isAddRouterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-xs">Configurar MikroTik</h3>
              <button onClick={() => setIsAddRouterModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddRouter} className="p-10 space-y-4">
              <input required placeholder="Nombre (Ej: RB4011 Central)" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={newRouter.name} onChange={e => setNewRouter({...newRouter, name: e.target.value})} />
              <input required placeholder="IP (192.168.0.1)" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={newRouter.host} onChange={e => setNewRouter({...newRouter, host: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Puerto (80 o 443)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newRouter.port} onChange={e => setNewRouter({...newRouter, port: parseInt(e.target.value)})} />
                <input placeholder="Usuario (ai_bot)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newRouter.user} onChange={e => setNewRouter({...newRouter, user: e.target.value})} />
              </div>
              <input type="password" placeholder="Contraseña" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={newRouter.pass} onChange={e => setNewRouter({...newRouter, pass: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Guardar Configuración</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
