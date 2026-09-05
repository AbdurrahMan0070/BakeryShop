import client from './client';
import type { Category } from '@/types';

export const categoriesApi = {
  getAll: () => client.get<Category[]>('/categories').then((r) => r.data),
  create: (name: string) =>
    client.post<Category>('/categories', { name }).then((r) => r.data),
  update: (id: number, name: string) =>
    client.patch<Category>(`/categories/${id}`, { name }).then((r) => r.data),
  delete: (id: number) => client.delete(`/categories/${id}`).then((r) => r.data),
};
