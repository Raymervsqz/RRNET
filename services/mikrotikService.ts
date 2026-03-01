
import { RouterConfig } from '../types';

export interface MikrotikResource {
  cpu: string;
  uptime: string;
  version: string;
  boardName: string;
}

export interface AuthorizedClient {
  id: string;
  address: string;
  list: string;
  comment?: string;
  disabled: string;
}

export const mikrotikService = {
  getAuthHeader: (router: RouterConfig) => {
    const auth = btoa(`${router.user}:${router.pass}`);
    return { 'Authorization': `Basic ${auth}` };
  },

  testConnection: async (router: RouterConfig): Promise<{success: boolean, data?: MikrotikResource, error?: string}> => {
    try {
      // Usamos el puerto configurado (80 o 443 para REST API en v7)
      const protocol = router.port === 443 ? 'https' : 'http';
      const url = `${protocol}://${router.host}:${router.port}/rest/system/resource`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...mikrotikService.getAuthHeader(router),
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      return { 
        success: true, 
        data: {
          cpu: `${data['cpu-load']}%`,
          uptime: data.uptime,
          version: data.version,
          boardName: data['board-name']
        }
      };
    } catch (err: any) {
      console.error('Mikrotik Connection Error:', err);
      return { 
        success: false, 
        error: err.message || 'Error de conexión. Verifique IP y API REST.' 
      };
    }
  },

  /**
   * Obtiene los clientes en la address-list: ips_autorizadas_wisphub
   */
  getAuthorizedClients: async (router: RouterConfig): Promise<AuthorizedClient[]> => {
    try {
      const protocol = router.port === 443 ? 'https' : 'http';
      const url = `${protocol}://${router.host}:${router.port}/rest/ip/firewall/address-list?list=ips_autorizadas_wisphub`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: mikrotikService.getAuthHeader(router),
        mode: 'cors'
      });

      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error('Error obteniendo address-list:', err);
      return [];
    }
  }
};
