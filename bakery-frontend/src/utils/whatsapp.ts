import { formatCurrency } from './formatCurrency';

export interface WhatsAppReceiptParams {
  saleId: number;
  total: number | string;
  paymentMethod: string;
  customerPhone?: string | null;
  items?: Array<{
    product?: { name: string };
    quantity: number;
    subtotal: number | string;
    unitPrice?: number | string;
  }>;
  createdAt?: string;
  storeName?: string;
}

/**
 * Clean phone number and ensure country code (default 91 for India if 10 digits)
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}

/**
 * Builds a formatted WhatsApp text receipt and returns the wa.me URL
 */
export function getWhatsAppReceiptUrl(
  params: WhatsAppReceiptParams,
  overridePhone?: string,
): { url: string; phone: string; hasPhone: boolean } {
  const rawPhone = overridePhone || params.customerPhone || '';
  const phone = formatWhatsAppPhone(rawPhone);
  const store = params.storeName || 'Arzoo Bakery';
  const receiptId = String(params.saleId).padStart(4, '0');
  const dateStr = params.createdAt
    ? new Date(params.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  let itemsList = '';
  if (params.items && params.items.length > 0) {
    itemsList = params.items
      .map(
        (i) =>
          `• *${i.product?.name ?? 'Item'}* × ${i.quantity} : ${formatCurrency(
            typeof i.subtotal === 'string' ? parseFloat(i.subtotal) : i.subtotal,
          )}`,
      )
      .join('\n');
  }

  const numTotal =
    typeof params.total === 'string' ? parseFloat(params.total) : params.total;

  const message = `🍞 *${store.toUpperCase()}*
----------------------------------------
🧾 *Bill No:* #${receiptId}
📅 *Date:* ${dateStr}
💳 *Payment:* ${params.paymentMethod.toUpperCase()}
----------------------------------------
*ITEMS:*
${itemsList || '• Bakery Items'}
----------------------------------------
💰 *TOTAL PAID:* ${formatCurrency(numTotal)}
----------------------------------------
Thank you for visiting ${store}!
Have a sweet day! 🥐✨`;

  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return { url, phone, hasPhone: Boolean(phone) };
}
