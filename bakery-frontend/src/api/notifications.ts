import client from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: () =>
    client.get<Notification[]>('/notifications').then((r) => r.data),
};
