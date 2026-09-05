import client from './client';
import type { Product } from '@/types';

export interface ProductFilters {
  categoryId?: number;
  search?: string;
  lowStock?: boolean;
}

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    client
      .get<Product[]>('/products', {
        params: {
          categoryId: filters?.categoryId,
          search: filters?.search || undefined,
          lowStock: filters?.lowStock || undefined,
        },
      })
      .then((r) => r.data),

  getOne: (id: number) =>
    client.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: Partial<Product>) =>
    client.post<Product>('/products', data).then((r) => r.data),

  update: (id: number, data: Partial<Product>) =>
    client.patch<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: number) => client.delete(`/products/${id}`).then((r) => r.data),

  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return client
      .post<Product>(`/products/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
