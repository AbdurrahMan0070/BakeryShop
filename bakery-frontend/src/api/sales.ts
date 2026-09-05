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

  /** Returns the URL to download the PDF receipt for a given sale */
  getReceiptUrl: (id: number) => `/api/sales/${id}/receipt`,
};
