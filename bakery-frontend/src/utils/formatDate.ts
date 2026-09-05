import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'hh:mm a');
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return `Today, ${format(d, 'hh:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'hh:mm a')}`;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isExpiringSoon(date: string | null, days = 7): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function isExpired(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}
