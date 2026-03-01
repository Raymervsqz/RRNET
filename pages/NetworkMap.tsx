
import React from 'react';
import { 
  Users, 
  MapPin, 
  Zap, 
  X, 
  Activity,
  MousePointer2,
  PlusCircle,
  GitBranch,
  Navigation,
  Trash2,
  Save,
  CheckCircle2,
  FileUp,
  Download,
  Box,
  UploadCloud,
  FileJson
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Terminal, Client, Cable } from '../types';

declare const L: any;

type MapMode = 'VIEW' | 'ADD_NAP' | 'DRAW_CABLE';

const NetworkMap: React.FC = () => {
  const mapRef = React.useRef<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mode, setMode] = React.useState<MapMode>('VIEW');
  const [terminals, setTerminals] = React.useState<Terminal[]>([]);
  const [cables, setCables] = React.useState<Cable[]>([]);
  const [clients] = React.useState<Client[]>(storageService.getClients());
  const [selectedTerminal, setSelectedTerminal] = React.useState<Terminal | null>(null);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Drawing state
  const [tempPoints, setTempPoints] = React.useState<[number, number][]>([]);
  const tempPolylineRef = React.useRef<any>(null);
  const markersGroupRef = React.useRef<any>(null);
  const cablesGroupRef = React.useRef<any>(null);

  // Load data
  const loadData = () => {
    const t = storageService.getTerminals();
    const c = storageService.getCables();
    setTerminals(t);
    setCables(c);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Initialize Map
  React.useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('network-map', { 
        zoomControl: false,
        doubleClickZoom: false
      }).setView([10.4806, -66.9036], 13);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 20
      }).addTo(mapRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
      cablesGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  // Sync Layers
  React.useEffect(() => {
    if (!markersGroupRef.current || !cablesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    cablesGroupRef.current.clearLayers();

    cables.forEach(cable => {
      L.polyline(cable.points, { 
        color: cable.color || '#3b82f6', 
        weight: 4,
        opacity: 0.8 
      }).addTo(cablesGroupRef.current).bindPopup(`<b>${cable.name}</b>`);
    });

    terminals.forEach(term => {
      const marker = L.marker([term.lat, term.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-blue-600 p-2 rounded-lg border-2 border-white shadow-xl text-white flex items-center justify-center transition-all hover:scale-125 hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(markersGroupRef.current);

      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        setSelectedTerminal(term);
      });
    });
  }, [terminals, cables]);

  // Handle Map Clicks
  React.useEffect(() => {
    if (!mapRef.current) return;

    const onMapClick = (e: any) => {
      const { lat, lng } = e.latlng;

      if (mode === 'ADD_NAP') {
        const name = prompt('Nombre de la nueva NAP:');
        if (name) {
          const newTerm: Terminal = {
            id: crypto.randomUUID(),
            name,
            lat,
            lng,
            ponSource: 'Pendiente',
            totalPorts: 16
          };
          const updated = [...storageService.getTerminals(), newTerm];
          storageService.saveTerminals(updated);
          setTerminals(updated);
          setNotification(`✅ NAP "${name}" guardada`);
          setMode('VIEW');
        }
      } else if (mode === 'DRAW_CABLE') {
        setTempPoints(prev => [...prev, [lat, lng]]);
      }
    };

    mapRef.current.on('click', onMapClick);
    return () => mapRef.current.off('click', onMapClick);
  }, [mode]);

  // Draw Temp Line
  React.useEffect(() => {
    if (!mapRef.current) return;
    if (tempPolylineRef.current) mapRef.current.removeLayer(tempPolylineRef.current);
    if (tempPoints.length > 0) {
      tempPolylineRef.current = L.polyline(tempPoints, { 
        color: '#ef4444', dashArray: '8, 12', weight: 4, opacity: 0.9
      }).addTo(mapRef.current);
    }
  }, [tempPoints]);

  const saveCurrentCable = () => {
    if (tempPoints.length < 2) return;
    const name = prompt('Nombre del tramo de fibra:');
    if (name) {
      const newCable: Cable = {
        id: crypto.randomUUID(),
        name,
        type: 'DISTRIBUTION',
        points: tempPoints,
        color: '#3b82f6'
      };
      const updated = [...storageService.getCables(), newCable];
      storageService.saveCables(updated);
      setCables(updated);
      setNotification(`✅ Tramo "${name}" guardado`);
    }
    setTempPoints([]);
    setMode('VIEW');
  };

  const processKML = (text: string) => {
    const parser = new DOMParser();
    const kml = parser.parseFromString(text, "text/xml");
    const newTerminals: Terminal[] = [];
    const newCables: Cable[] = [];

    const placemarks = kml.getElementsByTagName("Placemark");
    for (let i = 0; i < placemarks.length; i++) {
      const p = placemarks[i];
      const name = p.getElementsByTagName("name")[0]?.textContent || `Elemento ${i+1}`;
      
      const point = p.getElementsByTagName("Point")[0];
      if (point) {
        const coords = point.getElementsByTagName("coordinates")[0]?.textContent?.trim().split(",");
        if (coords && coords.length >= 2) {
          newTerminals.push({
            id: crypto.randomUUID(),
            name,
            lat: parseFloat(coords[1]),
            lng: parseFloat(coords[0]),
            ponSource: 'Importado de KML',
            totalPorts: 16
          });
        }
      }

      const line = p.getElementsByTagName("LineString")[0];
      if (line) {
        const coordsText = line.getElementsByTagName("coordinates")[0]?.textContent?.trim();
        if (coordsText) {
          const points = coordsText.split(/\s+/).map(pair => {
            const [lng, lat] = pair.split(",").map(Number);
            return [lat, lng] as [number, number];
          }).filter(p => !isNaN(p[0]));

          if (points.length >= 2) {
            newCables.push({
              id: crypto.randomUUID(),
              name,
              type: 'TRUNK',
              points,
              color: '#3b82f6'
            });
          }
        }
      }
    }

    if (newTerminals.length > 0 || newCables.length > 0) {
      const finalTerms = [...storageService.getTerminals(), ...newTerminals];
      const finalCables = [...storageService.getCables(), ...newCables];
      storageService.saveTerminals(finalTerms);
      storageService.saveCables(finalCables);
      setTerminals(finalTerms);
      setCables(finalCables);
      setNotification(`🚀 Importados ${newTerminals.length} NAPs y ${newCables.length} cables.`);
      setIsImportModalOpen(false);
      setSelectedFile(null);
    } else {
      alert('No se encontraron datos válidos en el archivo KML.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const startImport = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processKML(text);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert('Error leyendo el archivo.');
      setIsProcessing(false);
    };
    reader.readAsText(selectedFile);
  };

  const locateMe = () => {
    mapRef.current.locate({ setView: true, maxZoom: 16 });
  };

  const getClientsInTerminal = (termId: string) => clients.filter(c => c.terminalId === termId);

  return (
    <div className="h-full relative flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* Notifications */}
      {notification && (
        <div className="absolute top-24 right-4 z-[3000] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-500">
          <CheckCircle2 className="w-6 h-6 text-blue-200" />
          <p className="font-bold text-sm">{notification}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/50">
        <button onClick={() => { setMode('VIEW'); setTempPoints([]); }} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'VIEW' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}>
          <MousePointer2 className="w-5 h-5" />
          <span className="text-xs font-bold hidden lg:inline">Navegar</span>
        </button>
        <button onClick={() => { setMode('ADD_NAP'); setTempPoints([]); }} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'ADD_NAP' ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'hover:bg-gray-100 text-gray-600'}`}>
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs font-bold hidden lg:inline">Añadir NAP</span>
        </button>
        <button onClick={() => { setMode('DRAW_CABLE'); setTempPoints([]); }} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'DRAW_CABLE' ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'hover:bg-gray-100 text-gray-600'}`}>
          <GitBranch className="w-5 h-5" />
          <span className="text-xs font-bold hidden lg:inline">Trazar Fibra</span>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button onClick={() => setIsImportModalOpen(true)} className="p-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all flex items-center gap-2">
          <FileUp className="w-5 h-5" />
          <span className="text-xs font-bold hidden lg:inline">Subir KML</span>
        </button>
        <button onClick={locateMe} className="p-3 rounded-xl hover:bg-gray-100 text-gray-600 transition-all"><Navigation className="w-5 h-5" /></button>
      </div>

      {/* Draw Actions */}
      {mode === 'DRAW_CABLE' && tempPoints.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex gap-3">
          <button onClick={() => setTempPoints([])} className="bg-white text-gray-600 px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 border border-gray-200 hover:bg-gray-50"><Trash2 className="w-5 h-5" /> Limpiar</button>
          <button onClick={saveCurrentCable} className="bg-green-600 text-white px-10 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all scale-105"><Save className="w-5 h-5" /> Guardar</button>
        </div>
      )}

      {/* Map Surface */}
      <div className="flex-1 relative">
        <div id="network-map" className={`absolute inset-0 bg-gray-200 z-1 ${mode !== 'VIEW' ? 'cursor-crosshair' : ''}`}></div>
      </div>

      {/* New Import Modal (File Upload) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div>
                <h3 className="text-2xl font-bold">Importar Archivo KML</h3>
                <p className="text-blue-100 text-sm">Selecciona el archivo exportado de Google Earth</p>
              </div>
              <button onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-8 h-8" /></button>
            </div>
            
            <div className="p-10 space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer flex flex-col items-center gap-4
                  ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300'}
                `}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".kml" onChange={handleFileUpload} />
                
                {selectedFile ? (
                  <>
                    <div className="bg-green-500 p-4 rounded-full text-white shadow-lg"><FileJson className="w-10 h-10" /></div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">Archivo seleccionado listo para importar</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600"><UploadCloud className="w-10 h-10" /></div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">Seleccionar archivo .kml</p>
                      <p className="text-sm text-gray-500">Haz clic aquí o arrastra tu archivo</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4 border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg"><Download className="w-5 h-5 text-blue-600" /></div>
                <div className="text-xs text-blue-800 leading-relaxed">
                  <p className="font-bold mb-1">Nota importante:</p>
                  <p>Asegúrate de que el archivo sea formato <b>.kml</b> (no .kmz). Los puntos se convertirán en NAPs y las rutas en cables de fibra automáticamente.</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Cancelar</button>
              <button 
                onClick={startImport} 
                disabled={!selectedFile || isProcessing} 
                className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Procesando...' : 'Comenzar Importación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Details */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-2xl z-[2500] transform transition-transform duration-500 border-l border-gray-100 flex flex-col ${selectedTerminal ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedTerminal && (
          <>
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-black text-xl tracking-tight">{selectedTerminal.name}</h3>
              <button onClick={() => setSelectedTerminal(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-7 h-7" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Capacidad</p>
                  <p className="text-2xl font-black text-gray-800">{selectedTerminal.totalPorts}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Clientes</p>
                  <p className="text-2xl font-black text-blue-700">{getClientsInTerminal(selectedTerminal.id).length}</p>
                </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Abonados Activos</h4>
                 <div className="space-y-3">
                    {getClientsInTerminal(selectedTerminal.id).map(client => (
                      <div key={client.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-gray-800">{client.firstName} {client.lastName}</p>
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">P-{client.portNumber}</span>
                         </div>
                         <p className="text-xs text-gray-400 font-mono">{client.pppoeUser}</p>
                      </div>
                    ))}
                    {getClientsInTerminal(selectedTerminal.id).length === 0 && <p className="text-center py-6 text-gray-400 italic text-sm">Sin abonados.</p>}
                 </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
               <button onClick={() => { if(confirm('¿Eliminar esta NAP?')) { const updated = terminals.filter(t => t.id !== selectedTerminal.id); storageService.saveTerminals(updated); setTerminals(updated); setSelectedTerminal(null); setNotification('🗑️ NAP eliminada'); } }} className="flex items-center justify-center gap-2 py-4 text-red-600 font-bold text-xs hover:bg-red-50 rounded-2xl transition-colors border border-red-100"><Trash2 className="w-4 h-4" /> Eliminar</button>
               <button onClick={() => setSelectedTerminal(null)} className="flex items-center justify-center gap-2 py-4 text-gray-600 font-bold text-xs hover:bg-gray-100 rounded-2xl transition-colors border border-gray-200">Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkMap;
