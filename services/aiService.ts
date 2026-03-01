
import { GoogleGenAI } from "@google/genai";
import { Client, Invoice, Plan } from "../types";

export const getBusinessInsights = async (clients: Client[], invoices: Invoice[], plans: Plan[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID');
    const totalExpected = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalReceived = invoices.filter(inv => inv.status === 'PAID').reduce((acc, inv) => acc + inv.amount, 0);

    const prompt = `
      Act as a business consultant for RRNET, a small ISP. 
      Analyze the following current state:
      - Total Clients: ${clients.length}
      - Total Invoices: ${invoices.length}
      - Pending Invoices: ${pendingInvoices.length}
      - Total Revenue Expected: $${totalExpected}
      - Total Revenue Received: $${totalReceived}
      - Top Plans: ${plans.map(p => p.name).join(', ')}

      Provide a 2-sentence summary of the business health and 2 actionable recommendations to improve collections or growth.
      Keep it professional and concise in Spanish.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudieron obtener insights en este momento.";
  }
};
