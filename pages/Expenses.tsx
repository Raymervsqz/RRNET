
import React from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  X,
  CreditCard,
  Zap,
  CheckCircle2,
  DollarSign,
  Settings2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Expense, FixedExpense } from '../types';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = React.useState<Expense[]>(storageService.getExpenses());
  const [fixedExpenses, setFixedExpenses] = React.useState<FixedExpense[]>(storageService.getFixedExpenses());
  const [showModal, setShowModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [notification, setNotification] = React.useState<string | null>(null);
  
  const [newExpense, setNewExpense] = React.useState({ 
    description: '', 
    amount: 0,
    category: 'Variable'
  });

  const handleUpdateFixed = (id: string, newAmount: number) => {
    const updated = fixedExpenses.map(f => f.id === id ? { ...f, amount: newAmount } : f);
    setFixedExpenses(updated);
    storageService.saveFixedExpenses(updated);
  };

  const handleAddExpense = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newExpense.description || newExpense.amount <= 0) return;
    
    const expense: Expense = {
      id: crypto.randomUUID(),
      description: newExpense.description,
      amount: newExpense.amount,
      category: 'Variable',
      date: new Date().toISOString()
    };
    const updated = [...expenses, expense];
    setExpenses(updated);
    storageService.saveExpenses(updated);
    setShowModal(false);
    resetForm();
    showNotify('Gasto variable registrado con éxito');
  };

  const deleteExpense = (id: string) => {
    if (confirm('¿Eliminar este registro de gasto?')) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      storageService.saveExpenses(updated);
    }
  };

  const resetForm = () => {
    setNewExpense({ description: '', amount: 0, category: 'Variable' });
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{notification}</p>
        </div>
      )}

      {/* Sección Gastos Fijos (Editables) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fixedExpenses.map(fixed => (
          <div key={fixed.id} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col gap-3 group">
            <div className="flex justify-between items-center">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
               </div>
               <Settings2 className="w-4 h-4 text-gray-200 group-hover:text-blue-400" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{fixed.label}</p>
               <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none font-black text-lg transition-all"
                    value={fixed.amount}
                    onChange={(e) => handleUpdateFixed(fixed.id, parseFloat(e.target.value) || 0)}
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Gastos Variables */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar gastos variables..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Añadir Gasto Adicional
        </button>
      </div>

      {/* Tabla Gastos Variables */}
      <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-y-auto no-scrollbar flex-1">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 sticky top-0 backdrop-blur-md z-10">
              <tr className="border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gasto Variable</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.slice().reverse().map(exp => (
                <tr key={exp.id} className="group hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{exp.description}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="font-black text-gray-900">RD${exp.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => deleteExpense(exp.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 opacity-30">
              <Zap className="w-16 h-16 text-gray-400" />
              <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Sin gastos adicionales este mes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Gastos Adicionales */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs">Añadir Gasto Extra</h4>
                <p className="text-[10px] text-blue-100 mt-1 uppercase font-bold tracking-tight">Registro para el balance mensual</p>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-10 space-y-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Concepto</label>
                  <input 
                    required
                    autoFocus
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" 
                    placeholder="Ej: Cable de red, conectores"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto RD$</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="number" 
                      className="w-full p-4 pl-10 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black transition-all" 
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                 Registrar Pago
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
