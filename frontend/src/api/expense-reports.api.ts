import { apiGet, apiPost } from './client';
import { ExpenseReport, FilterState } from '../types/expense-report.types';
import { mockExpenseReports } from '../mocks/expense-reports.mock';

export interface GetExpenseReportsParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  categories?: string[];
  sortBy?: string;
  sortOrder?: string;
}

// Helper pour construire les query params
const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const expenseReportsApi = {
  getAll: async (filters: FilterState): Promise<ExpenseReport[]> => {
    // Pour le moment, utiliser les données mockées
    // TODO: Remplacer par l'appel API réel quand le backend sera prêt
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockExpenseReports];
        
        // Filtrer par recherche
        if (filters.search) {
          filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        // Filtrer par statut
        if (filters.status) {
          filtered = filtered.filter(r => r.status === filters.status);
        }
        
        // Filtrer par montant
        filtered = filtered.filter(r =>
          r.totalAmount >= filters.amountMin && r.totalAmount <= filters.amountMax
        );
        
        // Trier
        filtered.sort((a, b) => {
          if (filters.sortBy === 'amount') {
            return filters.sortOrder === 'asc'
              ? a.totalAmount - b.totalAmount
              : b.totalAmount - a.totalAmount;
          } else {
            return filters.sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        });
        
        resolve(filtered);
      }, 300); // Simuler un délai réseau
    });
    
    /* Code pour l'API réelle (à activer plus tard):
    const params: GetExpenseReportsParams = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      amountMin: filters.amountMin,
      amountMax: filters.amountMax,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    const queryString = buildQueryString(params);
    return await apiGet<ExpenseReport[]>(`/expense-reports${queryString}`);
    */
  },

  getById: async (id: string): Promise<ExpenseReport> => {
    return await apiGet<ExpenseReport>(`/expense-reports/${id}`);
  },

  create: async (data: Partial<ExpenseReport>): Promise<ExpenseReport> => {
    return await apiPost<ExpenseReport>(`/expense-reports`, data);
  },

  update: async (id: string, data: Partial<ExpenseReport>): Promise<ExpenseReport> => {
    // Note: apiPost peut être utilisé pour PATCH aussi
    return await apiPost<ExpenseReport>(`/expense-reports/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiPost<void>(`/expense-reports/${id}`, { _method: 'DELETE' });
  },
};
