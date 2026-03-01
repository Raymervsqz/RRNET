
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wifi, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu,
  X,
  Bell,
  Map as MapIcon,
  Cpu,
  Wallet,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Activity
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { mikrotikService, MikrotikResource } from '../services/mikrotikService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isFinancesOpen, setIsFinancesOpen] = React.useState(true);
  const [routerStatus, setRouterStatus] = React.useState<{online: boolean, data?: MikrotikResource}>({ online: false });
  const location = useLocation();

  // Polling de estado del router principal
  React.useEffect(() => {
    const checkRouter = async () => {
      const routers = storageService.getRouters();
      if (routers.length > 0) {
        const result = await mikrotikService.testConnection(routers[0]);
        setRouterStatus({ online: result.success, data: result.data });
      }
    };

    checkRouter();
    const interval = setInterval(checkRouter, 30000); // Cada 30 seg
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Clientes', icon: Users, path: '/clients' },
    { name: 'Finanzas', icon: Wallet, path: '/finances', isParent: true, subItems: [
        { name: 'Facturación', icon: Receipt, path: '/billing' },
        { name: 'Gastos', icon: ArrowRightLeft, path: '/expenses' },
    ]},
    { name: 'Mapa de Red', icon: MapIcon, path: '/map' },
    { name: 'Reportes', icon: BarChart3, path: '/reports' },
    { name: 'Configuración', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <h1 className="text-3xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
            <Wifi className="w-8 h-8 stroke-[3]" />
            RRNET
          </h1>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.name} className="space-y-1">
                   <button 
                    onClick={() => setIsFinancesOpen(!isFinancesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                   >
                     <div className="flex items-center gap-3">
                       <item.icon className="w-5 h-5" />
                       {item.name}
                     </div>
                     {isFinancesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                   </button>
                   {isFinancesOpen && (
                     <div className="ml-4 pl-4 border-l-2 border-gray-50 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems.map(sub => (
                           <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                              location.pathname === sub.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                            onClick={() => setIsSidebarOpen(false)}
                           >
                            <sub.icon className="w-4 h-4" />
                            {sub.name}
                           </Link>
                        ))}
                     </div>
                   )}
                </div>
              );
            }
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-600'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-50">
          <div className={`rounded-2xl p-5 text-white shadow-xl transition-all overflow-hidden relative group ${routerStatus.online ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-100' : 'bg-gradient-to-br from-gray-600 to-gray-800 shadow-gray-100'}`}>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest relative z-10">Router Central</p>
            <div className="flex items-center gap-2 mt-1 relative z-10">
              <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${routerStatus.online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm font-black tracking-tight">
                {routerStatus.online ? (routerStatus.data?.boardName || 'RB-Mikrotik') : 'Desconectado'}
              </span>
            </div>
            {routerStatus.online && (
              <div className="mt-2 flex items-center gap-3 relative z-10 opacity-80">
                 <div className="flex items-center gap-1 text-[9px] font-bold">
                    <Activity className="w-3 h-3" /> {routerStatus.data?.cpu}
                 </div>
              </div>
            )}
            <Cpu className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-50 flex items-center justify-between px-4 lg:px-10 shrink-0">
          <button 
            className="p-3 text-gray-500 lg:hidden bg-gray-50 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              {location.pathname === '/' ? 'Escritorio' : 
               location.pathname === '/clients' ? 'Abonados' :
               location.pathname === '/billing' ? 'Cobranza' :
               location.pathname === '/expenses' ? 'Gastos de Red' :
               location.pathname === '/reports' ? 'Cuentas del Mes' :
               location.pathname === '/map' ? 'Geolocalización' :
               location.pathname === '/settings' ? 'Panel Técnico' : 'Detalle'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-800 leading-none">Raymer V.</p>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-200 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-black">
                R
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 lg:p-10">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
