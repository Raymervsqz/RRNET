
/**
 * RRNET Meta API Service (Simulation)
 * In a real environment, this would call:
 * https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages
 */

export const metaService = {
  sendWhatsAppMessage: async (phone: string, template: string, components: any[]) => {
    console.log(`[Meta API Simulation] Sending message to ${phone} using template ${template}`);
    console.log(`Components:`, components);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock success
    return { success: true, message_id: `wa_${Math.random().toString(36).substr(2, 9)}` };
  },

  sendInvoiceNotification: async (clientName: string, phone: string, amount: number, dueDate: string) => {
    return metaService.sendWhatsAppMessage(phone, 'invoice_generated', [
      { type: 'body', parameters: [
        { type: 'text', text: clientName },
        { type: 'text', text: `$${amount.toFixed(2)}` },
        { type: 'text', text: dueDate }
      ]}
    ]);
  },

  sendPaymentReminder: async (clientName: string, phone: string, dueDate: string) => {
    return metaService.sendWhatsAppMessage(phone, 'payment_reminder', [
      { type: 'body', parameters: [
        { type: 'text', text: clientName },
        { type: 'text', text: dueDate }
      ]}
    ]);
  },

  sendPaymentReceipt: async (clientName: string, phone: string, amount: number, reference: string) => {
    return metaService.sendWhatsAppMessage(phone, 'payment_receipt', [
      { type: 'body', parameters: [
        { type: 'text', text: clientName },
        { type: 'text', text: `$${amount.toFixed(2)}` },
        { type: 'text', text: reference }
      ]}
    ]);
  }
};
