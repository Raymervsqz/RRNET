
import React from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Filter,
  ArrowRight,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { metaService } from '../services/metaService';
import { Client, Invoice, InvoiceStatus, Plan } from '../types';

const Billing: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>(storageService.getInvoices());
  const [clients] = React.useState<Client[]>(storageService.getClients());
  const [plans] = React.useState<Plan[]>(storageService.getPlans());
  const [filter, setFilter] = React.useState<InvoiceStatus | 'ALL'>('ALL');
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [bulkText, setBulkText] = React.useState('');
  const [notification, setNotification] = React.useState<string | null>(null);

  const generateMonthInvoices = () => {
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const existing = invoices.find(inv => inv.period === currentPeriod);
    
    if (existing && !confirm('Ya existen facturas para este periodo. ¿Generar nuevas de todos modos?')) return;

    const newInvoices: Invoice[] = clients.map(client => {
      const plan = plans.find(p => p.id === client.planId);
      return {
        id: crypto.randomUUID(),
        clientId: client.id,
        amount: plan?.price || 0,
        period: currentPeriod,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: InvoiceStatus.PENDING
      };
    });

    const updated = [...invoices, ...newInvoices];
    setInvoices(updated);
    storageService.saveInvoices(updated);
    showNotify(`${newInvoices.length} facturas generadas correctamente.`);
  };

  const handleImportPayments = () => {
    const lines = bulkText.split('\n').filter(l => l.trim() !== '');
    const firstLine = lines[0].toLowerCase();
    const startIndex = firstLine.includes('ip servicio') ? 1 : 0;
    
    const newInvoices: Invoice[] = [];
    let count = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('"')) continue;

      // Regex para separar CSV con comillas
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
      
      // Formato esperado: ["", "", "IP", "Monto", "Nombre", "Fecha", "Estado"]
      if (parts.length >= 6) {
        const ip = parts[2];
        const amount = parseFloat(parts[3]);
        const dateStr = parts[5]; // "07/01/2026 15:24"
        const status = parts[6];

        if (status.toLowerCase() === 'pagada') {
          const client = clients.find(c => c.pppoeUser === ip);
          if (client) {
            // Evitar duplicados simples (IP + Fecha de Pago)
            const isDuplicate = invoices.some(inv => 
              inv.clientId === client.id && 
              inv.paidAt?.includes(dateStr.split(' ')[0])
            );

            if (!isDuplicate) {
              newInvoices.push({
                id: crypto.randomUUID(),
                clientId: client.id,
                amount: amount,
                period: dateStr.split('/')[1] + '-' + dateStr.split('/')[2].split(' ')[0], // Mes-Año
                dueDate: dateStr,
                status: InvoiceStatus.PAID,
                paidAt: dateStr
              });
              count++;
            }
          }
        }
      }
    }

    if (newInvoices.length > 0) {
      const updated = [...invoices, ...newInvoices];
      setInvoices(updated);
      storageService.saveInvoices(updated);
      showNotify(`¡Éxito! Se registraron ${count} cobros nuevos.`);
    } else {
      showNotify('No se encontraron cobros nuevos o válidos para importar.');
    }
    
    setIsBulkModalOpen(false);
    setBulkText('');
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const markAsPaid = async (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const client = clients.find(c => c.id === inv.clientId);
        if (client) {
           metaService.sendPaymentReceipt(
             `${client.firstName} ${client.lastName}`, 
             client.phone, 
             inv.amount, 
             inv.id.slice(0, 8)
           );
        }
        return { ...inv, status: InvoiceStatus.PAID, paidAt: new Date().toISOString() };
      }
      return inv;
    });
    setInvoices(updated);
    storageService.saveInvoices(updated);
  };

  const sendReminder = async (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) return;
    
    await metaService.sendPaymentReminder(
      `${client.firstName} ${client.lastName}`,
      client.phone,
      new Date(invoice.dueDate).toLocaleDateString()
    );
    showNotify('Recordatorio enviado por WhatsApp');
  };

  const filteredInvoices = invoices.filter(inv => filter === 'ALL' || inv.status === filter);

  return (
    <div className="space-y-6 h-full flex flex-col p-4 sm:p-0 relative">
      
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{notification}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter(InvoiceStatus.PENDING)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === InvoiceStatus.PENDING ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFilter(InvoiceStatus.PAID)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === InvoiceStatus.PAID ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            Pagadas
          </button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-100 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar Cobros
          </button>
          <button 
            onClick={generateMonthInvoices}
            className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold text-xs uppercase tracking-widest"
          >
            <FileText className="w-4 h-4" />
            Generar Facturas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Abonado / IP</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto / Periodo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Pago</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.slice().reverse().map((inv) => {
                const client = clients.find(c => c.id === inv.clientId);
                return (
                  <tr key={inv.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{client?.firstName} {client?.lastName}</div>
                      <div className="text-[10px] font-mono text-blue-500 font-bold">{client?.pppoeUser}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900">${inv.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{inv.period}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                        {inv.paidAt ? inv.paidAt.split(' ')[0] : 'Pendiente'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 border shadow-sm ${
                        inv.status === InvoiceStatus.PAID ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inv.status === InvoiceStatus.PAID ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status === InvoiceStatus.PENDING && (
                          <>
                            <button 
                              onClick={() => sendReminder(inv)}
                              className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                              title="Enviar Recordatorio WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => markAsPaid(inv.id)}
                              className="p-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-100 transition-all shadow-sm"
                              title="Registrar Pago"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {inv.status === InvoiceStatus.PAID && (
                          <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 italic">
                            Sincronizado
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
               <FileText className="w-12 h-12 text-gray-200" />
               <p className="text-gray-400 italic font-medium">No hay facturas registradas en este filtro.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Import Payments Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-600 text-white">
              <div>
                <h3 className="text-xl font-bold">Importar Cobros (WISPHUB)</h3>
                <p className="text-[10px] opacity-80 uppercase font-black tracking-widest mt-1">Sincroniza tus pagos externos</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                  <div className="text-xs text-blue-800 space-y-1">
                    <p className="font-bold">¿Cómo funciona?</p>
                    <p>Pega el reporte de facturación. El sistema identificará al abonado por su <b>IP</b> y registrará el monto como un pago recibido hoy.</p>
                  </div>
               </div>
               <textarea 
                  className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-xs resize-none"
                  placeholder="Pega aquí las líneas del reporte CSV..."
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
               />
               <div className="flex gap-4">
                  <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancelar</button>
                  <button 
                    onClick={handleImportPayments}
                    disabled={!bulkText.trim()}
                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    Sincronizar Pagos
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
