import client from './client';
import type { ReportSummary } from '@/types';

export const reportsApi = {
  getReport: (from: string, to: string, groupBy: 'day' | 'week' = 'day') =>
    client
      .get<ReportSummary>('/reports', { params: { from, to, groupBy } })
      .then((r) => r.data),
};
