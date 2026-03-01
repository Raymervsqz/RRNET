
import React from 'react';
import { Plus, Wifi, Edit2, Trash2, Zap } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Plan } from '../types';

const Plans: React.FC = () => {
  const [plans, setPlans] = React.useState<Plan[]>(storageService.getPlans());

  const addPlan = () => {
    const name = prompt('Nombre del Plan:');
    const speed = prompt('Velocidad (ej: 20 Mbps):');
    const price = prompt('Precio Mensual:');
    
    if (name && speed && price) {
      const newPlan: Plan = {
        id: crypto.randomUUID(),
        name,
        speed,
        price: parseFloat(price)
      };
      const updated = [...plans, newPlan];
      setPlans(updated);
      storageService.savePlans(updated);
    }
  };

  const deletePlan = (id: string) => {
    if (confirm('¿Deseas eliminar este plan?')) {
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated);
      storageService.savePlans(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={addPlan}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Crear Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <Wifi className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-6">
                <Zap className="w-4 h-4" />
                {plan.speed}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">${plan.price.toFixed(2)}</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Corte Automático</span>
                 <span className="text-green-600 font-medium">Habilitado</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
