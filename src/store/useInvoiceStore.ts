import { create } from "zustand";
import axios from "axios";
import { Invoice } from "api/db/schema";

interface InvoiceState {
  invoices: Invoice[];
  fetchInvoices: () => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set: any, get: any) => ({
  invoices: [],
  fetchInvoices: async () => {
    try {
      const response = await axios.get("/api/invoice");
      set({ invoices: response.data });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  },
  deleteInvoice: async (id: number) => {
    try {
      await axios.delete(`/api/invoice/${id}`);
      set({ invoices: get().invoices.filter((inv: Invoice) => inv.id !== id) });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  }
}));
