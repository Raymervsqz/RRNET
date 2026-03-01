
import React from 'react';
import { 
  Plus, 
  Search, 
  UserCheck, 
  UserX, 
  Trash2,
  Wifi,
  WifiOff,
  X,
  MapPin,
  Activity,
  UserCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  UserMinus
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Client, ClientStatus, Plan, Terminal, ZoneType } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = React.useState<Client[]>(storageService.getClients());
  const [plans] = React.useState<Plan[]>(storageService.getPlans());
  const [terminals] = React.useState<Terminal[]>(storageService.getTerminals());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [bulkText, setBulkText] = React.useState('');
  const [notification, setNotification] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    planId: plans[0]?.id || '',
    pppoeUser: '',
    addressList: 'MOROSOS',
    terminalId: '',
    portNumber: 1,
    zone: 'R&RNETWORK' as ZoneType
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: crypto.randomUUID(),
      ...formData,
      status: ClientStatus.ACTIVE,
      createdAt: new Date().toISOString()
    };
    const updated = [...clients, newClient];
    setClients(updated);
    storageService.saveClients(updated);
    setIsModalOpen(false);
    resetForm();
    showNotify('Cliente guardado con éxito');
  };

  const handleBulkImport = () => {
    const lines = bulkText.split('\n').filter(l => l.trim() !== '');
    const newClients: Client[] = [];
    
    // Saltamos cabecera si existe
    const firstLine = lines[0].toLowerCase();
    const startIndex = (firstLine.includes('zona') || firstLine.includes('ip servicio')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      let parts: string[] = [];

      // Detección de formato: si tiene comillas, es el reporte de cobros (CSV estándar)
      if (line.includes('"')) {
        // Regex para separar por comas ignorando comas dentro de comillas
        parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        
        // Formato Reporte: ["", "", "IP", "Monto", "Nombre", "Fecha", "Estado", "Cajero"]
        if (parts.length >= 5) {
          const pppoeUser = parts[2];
          const amount = parseFloat(parts[3]);
          const fullName = parts[4];
          
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');

          // Buscamos un plan que coincida con el precio cobrado
          const matchedPlan = plans.find(p => Math.abs(p.price - amount) < 10) || plans[0];

          newClients.push({
            id: crypto.randomUUID(),
            firstName,
            lastName,
            phone: '8090000000',
            idNumber: 'S/D',
            planId: matchedPlan.id,
            pppoeUser,
            addressList: 'MOROSOS',
            status: ClientStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            zone: 'R&RNETWORK'
          });
        }
      } else {
        // Formato Simple: Separado por |, tabulación o punto y coma
        parts = line.split(/[|\t;]/).map(p => p.trim());
        if (parts.length >= 3) {
          const zoneInput = parts[0].toUpperCase();
          const zone: ZoneType = zoneInput.includes('RB') ? 'RB NETWORK' : 
                            zoneInput.includes('RV') ? 'RV NETWORK' : 'R&RNETWORK';
          
          const fullName = parts[1];
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          const pppoeUser = parts[2];
          
          const planRaw = parts[3]?.toLowerCase() || '10mb';
          const matchedPlan = plans.find(p => p.name.toLowerCase().includes(planRaw.replace('mb',''))) || plans[0];

          newClients.push({
            id: crypto.randomUUID(),
            firstName,
            lastName,
            phone: '8090000000',
            idNumber: 'S/D',
            planId: matchedPlan.id,
            pppoeUser,
            addressList: 'MOROSOS',
            status: ClientStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            zone
          });
        }
      }
    }

    if (newClients.length > 0) {
      // Evitar duplicados por IP si ya existen
      const currentIps = new Set(clients.map(c => c.pppoeUser));
      const uniqueNewClients = newClients.filter(nc => !currentIps.has(nc.pppoeUser));

      const updated = [...clients, ...uniqueNewClients];
      setClients(updated);
      storageService.saveClients(updated);
      setIsBulkModalOpen(false);
      setBulkText('');
      showNotify(`¡Éxito! Se importaron ${uniqueNewClients.length} clientes nuevos.`);
    }
  };

  const clearAllClients = () => {
    if (confirm('¿ESTÁS SEGURO? Esta acción eliminará TODOS los clientes de la base de datos de forma permanente.')) {
      setClients([]);
      storageService.saveClients([]);
      showNotify('Base de datos de clientes vaciada');
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', phone: '', idNumber: '',
      planId: plans[0]?.id || '', pppoeUser: '', addressList: 'MOROSOS',
      terminalId: '', portNumber: 1, zone: 'R&RNETWORK'
    });
  };

  const toggleStatus = (id: string) => {
    const updated = clients.map(c => 
      c.id === id ? { ...c, status: c.status === ClientStatus.ACTIVE ? ClientStatus.CUT : ClientStatus.ACTIVE } : c
    );
    setClients(updated);
    storageService.saveClients(updated);
  };

  const deleteClient = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      storageService.saveClients(updated);
    }
  };

  const filteredClients = clients.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.idNumber.includes(searchTerm) ||
    c.pppoeUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col p-4 sm:p-0">
      
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{notification}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o usuario PPPoE..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={clearAllClients}
            title="Vaciar toda la lista"
            className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
          >
            <UserMinus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-100 transition-all font-bold text-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Importar Lista
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Zona</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PPPoE / IP</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Actual</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredClients.map((client) => {
                const plan = plans.find(p => p.id === client.planId);
                return (
                  <tr key={client.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{client.firstName} {client.lastName}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border shadow-sm ${
                          client.zone === 'RV NETWORK' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          client.zone === 'RB NETWORK' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {client.zone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-lg border border-blue-100">
                        {client.pppoeUser}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-black text-gray-700">{plan?.name || 'S/P'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 border shadow-sm ${
                        client.status === ClientStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${client.status === ClientStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleStatus(client.id)} className={`p-2.5 rounded-xl transition-all shadow-sm border ${client.status === ClientStatus.ACTIVE ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}>
                          {client.status === ClientStatus.ACTIVE ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteClient(client.id)} className="p-2.5 bg-red-50 text-red-400 border border-red-100 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="bg-gray-50 p-6 rounded-full">
                 <UserCircle className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-gray-400 italic font-medium">No hay clientes registrados. ¡Importa tu lista o crea uno nuevo!</p>
            </div>
          )}
        </div>
      </div>

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-600 text-white">
              <div>
                <h3 className="text-xl font-bold">Importación Masiva</h3>
                <p className="text-[10px] opacity-80 uppercase font-black tracking-widest mt-1">Soporta Reportes de Cobro y Listas Simple</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                  <div className="text-xs text-blue-800 space-y-1">
                    <p className="font-bold">Formatos Soportados:</p>
                    <p>1. <b>Reporte WISPHUB:</b> Pegar CSV tal cual con comillas.</p>
                    <p>2. <b>Lista Simple:</b> <code className="bg-blue-100 px-1 rounded">Zona;Nombre;IP;Plan</code></p>
                  </div>
               </div>
               <textarea 
                  className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-xs resize-none"
                  placeholder="Pega aquí los datos de tu archivo..."
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
               />
               <div className="flex gap-4">
                  <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancelar</button>
                  <button 
                    onClick={handleBulkImport}
                    disabled={!bulkText.trim()}
                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    Procesar e Importar
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-bold">Registrar Nuevo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</label>
                  <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apellido</label>
                  <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</label>
                  <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cédula / Documento</label>
                  <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Socio / Zona de Cobro</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['R&RNETWORK', 'RV NETWORK', 'RB NETWORK'] as ZoneType[]).map(z => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setFormData({...formData, zone: z})}
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all ${formData.zone === z ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Caja NAP</label>
                    <select className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold" value={formData.terminalId} onChange={e => setFormData({...formData, terminalId: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {terminals.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Puerto Fibra</label>
                    <input type="number" min="1" max="16" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold" value={formData.portNumber} onChange={e => setFormData({...formData, portNumber: parseInt(e.target.value)})} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan de Internet</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})}>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario PPPoE / IP</label>
                  <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold" value={formData.pppoeUser} onChange={e => setFormData({...formData, pppoeUser: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all">Registrar Abonado</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
