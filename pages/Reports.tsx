
import React from 'react';
import { 
  Download, 
  Trash2, 
  TrendingUp, 
  ArrowDownCircle,
  PiggyBank,
  PieChart as PieIcon,
  ShieldAlert,
  Info,
  CalendarCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { InvoiceStatus, ZoneType, Expense, FixedExpense, Client, Invoice } from '../types';

const Reports: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>(storageService.getInvoices());
  const [clients] = React.useState<Client[]>(storageService.getClients());
  const [expenses, setExpenses] = React.useState<Expense[]>(storageService.getExpenses());
  const [fixedExpenses] = React.useState<FixedExpense[]>(storageService.getFixedExpenses());
  const [notification, setNotification] = React.useState<string | null>(null);
  
  // Agrupar Ingresos por Zona
  const getIncomeByZone = (zone: ZoneType) => {
    return invoices
      .filter(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        return inv.status === InvoiceStatus.PAID && client?.zone === zone;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const incomeRR = getIncomeByZone('R&RNETWORK');
  const incomeRV = getIncomeByZone('RV NETWORK');
  const incomeRB = getIncomeByZone('RB NETWORK');
  const totalGross = incomeRR + incomeRV + incomeRB;

  // Cálculo de gastos totales
  const totalFixedExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVariableExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  
  // REGLA DE INVERSION / IMPREVISTOS
  const savingsAmount = 10000;
  const savingsPerPartner = 5000;

  // Repartición Socios
  const raymerNet = (incomeRV + (incomeRR * 0.65)) - (totalExpenses * 0.65) - savingsPerPartner;
  const memoNet = (incomeRB + (incomeRR * 0.35)) - (totalExpenses * 0.35) - savingsPerPartner;
  const totalNet = totalGross - totalExpenses - savingsAmount;

  const handleCloseMonth = () => {
    if (!confirm('¿ESTÁS SEGURO? Esta acción cerrará el ciclo actual:\n1. Se eliminarán los cobros ya realizados (Pagados).\n2. Se reiniciarán los gastos variables adicionales.\n3. Se mantienen gastos fijos y facturas pendientes.')) return;

    // Solo mantenemos las facturas que NO han sido pagadas (Morosos)
    const remainingInvoices = invoices.filter(inv => inv.status !== InvoiceStatus.PAID);
    storageService.saveInvoices(remainingInvoices);
    setInvoices(remainingInvoices);

    // Reiniciamos gastos variables
    storageService.saveExpenses([]);
    setExpenses([]);

    showNotify('🚀 Mes cerrado y balance reiniciado exitosamente');
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);
  };

  return (
    <div className="p-2 sm:p-0 space-y-8 max-w-4xl mx-auto h-full overflow-y-auto no-scrollbar pb-24 relative">
      
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{notification}</p>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
           <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Liquidación Mensual</h2>
           <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em] mt-2">{new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Bruto</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalGross)}</p>
           </div>
           <button className="bg-blue-50 text-blue-600 p-4 rounded-3xl hover:bg-blue-100 transition-all border border-blue-100">
             <Download className="w-6 h-6" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* INGRESOS POR ZONAS */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-6 px-10 flex justify-between items-center border-b border-gray-50">
            <h3 className="font-black uppercase tracking-widest text-[11px] text-gray-400">Distribución de Ingresos (Cobrados)</h3>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="p-6 px-10 space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">ZONA R&RNETWORK</span>
                <span className="font-black text-gray-900">{formatCurrency(incomeRR)}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">ZONA RV NETWORK (Raymer)</span>
                <span className="font-black text-gray-900">{formatCurrency(incomeRV)}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">ZONA RB NETWORK (Memo)</span>
                <span className="font-black text-gray-900">{formatCurrency(incomeRB)}</span>
             </div>
          </div>
          <div className="bg-blue-600 p-6 px-10 flex justify-between items-center text-white">
            <span className="text-xs font-black uppercase tracking-widest">Recaudación Cobrada Total</span>
            <span className="text-xl font-black">{formatCurrency(totalGross)}</span>
          </div>
        </div>

        {/* GASTOS OPERATIVOS INTEGRADOS */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-6 px-10 flex justify-between items-center border-b border-gray-50">
            <h3 className="font-black uppercase tracking-widest text-[11px] text-gray-400">Gastos de Operación (Fijos + Variables)</h3>
            <ArrowDownCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="p-8 px-10 space-y-4">
             {/* Fijos */}
             <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Gastos Fijos</p>
                {fixedExpenses.map(fixed => (
                   <div key={fixed.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-sm font-bold text-gray-600">{fixed.label}</span>
                      </div>
                      <span className="font-bold text-gray-800">-{formatCurrency(fixed.amount)}</span>
                   </div>
                ))}
             </div>

             {/* Variables */}
             {expenses.length > 0 && (
               <div className="space-y-2 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Variables del Mes</p>
                  {expenses.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">{exp.description}</span>
                        <span className="font-bold text-gray-800">-{formatCurrency(exp.amount)}</span>
                      </div>
                  ))}
               </div>
             )}

             {expenses.length === 0 && (
                <div className="pt-4 border-t border-gray-50 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                   Sin gastos adicionales este mes
                </div>
             )}
          </div>
          <div className="bg-orange-50 p-6 px-10 flex justify-between items-center text-orange-700 border-t border-orange-100/50">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Gastos Operativos</span>
            <span className="text-lg font-black">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* RESERVA E INVERSION */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] shadow-xl p-10 text-white relative overflow-hidden group">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                 <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md">
                    <PiggyBank className="w-10 h-10" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tighter">Inversión o Imprevisto</h3>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Retenido cada cierre de reporte</p>
                 </div>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Monto Retenido</p>
                 <p className="text-4xl font-black mt-1">-{formatCurrency(savingsAmount)}</p>
                 <p className="text-[11px] font-bold mt-2 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/20">mita y mita ($5,000 c/u)</p>
              </div>
           </div>
           <ShieldAlert className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
        </div>

        {/* DISTRIBUCION FINAL SOCIOS */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-6 px-10 flex justify-between items-center border-b border-gray-50">
            <h3 className="font-black uppercase tracking-widest text-[11px] text-gray-400">Reparto Neto Final</h3>
            <PieIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="p-8 px-10 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[35px] border-2 border-blue-50 bg-blue-50/20">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Raymer Vasquez</p>
                <p className="text-xs font-bold text-gray-500 mt-1 italic">65% residual + propio - ahorro</p>
                <p className="text-3xl font-black text-blue-700 mt-4">{formatCurrency(raymerNet)}</p>
             </div>
             <div className="p-8 rounded-[35px] border-2 border-indigo-50 bg-indigo-50/20">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Luis "Memo" E.</p>
                <p className="text-xs font-bold text-gray-500 mt-1 italic">35% residual + propio - ahorro</p>
                <p className="text-3xl font-black text-indigo-700 mt-4">{formatCurrency(memoNet)}</p>
             </div>
          </div>
          
          <div className="bg-emerald-600 p-8 px-10 flex justify-between items-center text-white">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Ganancia Neta Total</p>
               <p className="text-[10px] font-bold mt-1 opacity-60 italic">(Neto después de deducir todo)</p>
            </div>
            <span className="text-4xl font-black tracking-tighter">{formatCurrency(totalNet)}</span>
          </div>
        </div>

        {/* ACCION DE CIERRE DE MES */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 items-center gap-3 bg-blue-50 p-6 rounded-[35px] border border-blue-100 flex">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-[10px] font-bold text-blue-800 leading-tight uppercase tracking-wider">
                El cierre mensual reinicia los gastos variables y cobros realizados, manteniendo los cargos fijos configurados.
              </p>
           </div>
           <button 
              onClick={handleCloseMonth}
              className="md:w-64 bg-red-600 text-white p-8 rounded-[35px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
           >
              <CalendarCheck className="w-8 h-8" />
              Cerrar Ciclo Mensual
           </button>
        </div>

      </div>
    </div>
  );
};

export default Reports;
