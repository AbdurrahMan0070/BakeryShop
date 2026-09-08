import client from './client';
import type { Sale, CreateSaleDto, PaginatedResponse } from '@/types';

export const salesApi = {
  create: (dto: CreateSaleDto) =>
    client.post<Sale>('/sales', dto).then((r) => r.data),

  getAll: (page = 1, limit = 20, from?: string, to?: string) =>
    client
      .get<PaginatedResponse<Sale>>('/sales', {
        params: { page, limit, from, to },
      })
      .then((r) => r.data),

  getOne: (id: number) =>
    client.get<Sale>(`/sales/${id}`).then((r) => r.data),

  /** Downloads receipt PDF directly as a Blob using authenticated axios client */
  downloadReceiptBlob: async (id: number): Promise<Blob> => {
    const res = await client.get(`/sales/${id}/receipt`, {
      responseType: 'blob',
    });
    return res.data;
  },

  /** Returns the full URL to download the PDF receipt for a given sale */
  getReceiptUrl: (id: number) => {
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    return `${base}/sales/${id}/receipt`;
  },
};
