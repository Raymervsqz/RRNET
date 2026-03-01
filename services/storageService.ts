
import { Client, Plan, Invoice, RouterConfig, WhatsAppConfig, Terminal, Cable, Expense, FixedExpense } from '../types';

const KEYS = {
  CLIENTS: 'rrnet_clients',
  PLANS: 'rrnet_plans',
  INVOICES: 'rrnet_invoices',
  ROUTERS: 'rrnet_routers',
  WA_CONFIG: 'rrnet_wa_config',
  TERMINALS: 'rrnet_terminals',
  CABLES: 'rrnet_cables',
  EXPENSES: 'rrnet_expenses',
  FIXED_EXPENSES: 'rrnet_fixed_expenses'
};

const DEFAULT_PLANS: Plan[] = [
  { id: 'p10mb', name: '10MB_PPPoE', speed: '10 Mbps', price: 500.00 },
  { id: 'p20mb', name: '20MB_PPPoE', speed: '20 Mbps', price: 1000.00 },
  { id: 'p30mb', name: '30MB_PPPoE', speed: '30 Mbps', price: 1500.00 },
  { id: 'p40mb', name: '40MB_PPPoE', speed: '20 Mbps', price: 2000.00 },
  { id: 'p50mb', name: '50MB_PPPoE', speed: '50 Mbps', price: 2500.00 },
  { id: 'p60mb', name: '60MB_PPPoE', speed: '60 Mbps', price: 3000.00 },
];

const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  { id: 'f1', label: 'Dedicado', amount: 5000 },
  { id: 'f2', label: 'Starlink', amount: 3200 },
  { id: 'f3', label: 'Cuentas Netflix', amount: 800 },
];

export const storageService = {
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },
  getPlans: (): Plan[] => {
    const data = localStorage.getItem(KEYS.PLANS);
    return data ? JSON.parse(data) : DEFAULT_PLANS;
  },
  savePlans: (plans: Plan[]) => {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  },
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },
  getFixedExpenses: (): FixedExpense[] => {
    const data = localStorage.getItem(KEYS.FIXED_EXPENSES);
    return data ? JSON.parse(data) : DEFAULT_FIXED_EXPENSES;
  },
  saveFixedExpenses: (fixed: FixedExpense[]) => {
    localStorage.setItem(KEYS.FIXED_EXPENSES, JSON.stringify(fixed));
  },
  getRouters: (): RouterConfig[] => {
    const data = localStorage.getItem(KEYS.ROUTERS);
    return data ? JSON.parse(data) : [];
  },
  saveRouters: (routers: RouterConfig[]) => {
    localStorage.setItem(KEYS.ROUTERS, JSON.stringify(routers));
  },
  getWhatsAppConfig: (): WhatsAppConfig | null => {
    const data = localStorage.getItem(KEYS.WA_CONFIG);
    return data ? JSON.parse(data) : null;
  },
  saveWhatsAppConfig: (config: WhatsAppConfig) => {
    localStorage.setItem(KEYS.WA_CONFIG, JSON.stringify(config));
  },
  getTerminals: (): Terminal[] => {
    const data = localStorage.getItem(KEYS.TERMINALS);
    return data ? JSON.parse(data) : [];
  },
  saveTerminals: (terminals: Terminal[]) => {
    localStorage.setItem(KEYS.TERMINALS, JSON.stringify(terminals));
  },
  getCables: (): Cable[] => {
    const data = localStorage.getItem(KEYS.CABLES);
    return data ? JSON.parse(data) : [];
  },
  saveCables: (cables: Cable[]) => {
    localStorage.setItem(KEYS.CABLES, JSON.stringify(cables));
  }
};
