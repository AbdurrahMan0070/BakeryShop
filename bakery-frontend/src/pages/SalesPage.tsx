import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Receipt,
  Package,
  CreditCard,
  Smartphone,
  Banknote,
  Download,
  MessageCircle,
  Send,
} from 'lucide-react';
import { salesApi } from '@/api/sales';
import { settingsApi } from '@/api/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime, formatRelative } from '@/utils/formatDate';
import { getWhatsAppReceiptUrl } from '@/utils/whatsapp';
import type { Sale, PaymentMethod } from '@/types';

const paymentIcons: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

const paymentColors: Record<PaymentMethod, string> = {
  cash: 'success',
  upi: 'info',
  card: 'default',
};

export function SalesPage() {
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('');

  const { data: storeSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const downloadReceipt = async (sale: Sale) => {
    setDownloading(true);
    try {
      const blob = await salesApi.downloadReceiptBlob(sale.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${String(sale.id).padStart(4, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_err) {
      console.error('Receipt download failed', _err);
    } finally {
      setDownloading(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, fromDate, toDate],
    queryFn: () =>
      salesApi.getAll(
        page,
        20,
        fromDate || undefined,
        toDate ? `${toDate}T23:59:59` : undefined,
      ),
  });

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[hsl(var(--muted-foreground))]">From</label>
          <Input
            id="sales-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[hsl(var(--muted-foreground))]">To</label>
          <Input
            id="sales-to-date"
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className="w-40"
          />
        </div>
        {(fromDate || toDate) && (
          <Button
            id="clear-date-filter"
            variant="ghost"
            size="sm"
            onClick={() => { setFromDate(''); setToDate(''); setPage(1); }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto text-sm text-[hsl(var(--muted-foreground))]">
          {total} bill{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" className="text-[hsl(var(--primary))]" />
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-14 h-14" />}
            title="No sales found"
            description="Sales will appear here after you complete a transaction"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="text-left px-4 py-3 font-medium">Bill #</th>
                  <th className="text-left px-4 py-3 font-medium">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium">Items</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {sales.map((sale) => {
                  const PayIcon = paymentIcons[sale.paymentMethod as PaymentMethod] ?? Banknote;
                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-[hsl(var(--muted)/0.4)] transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                        #{String(sale.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[hsl(var(--foreground))]">
                            {formatRelative(sale.createdAt)}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formatDateTime(sale.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={(paymentColors[sale.paymentMethod as PaymentMethod] ?? 'default') as any}>
                          <PayIcon className="w-3 h-3" />
                          {sale.paymentMethod.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {sale.customerPhone ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[hsl(var(--foreground))]">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          id={`view-sale-${sale.id}`}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 rounded-lg"
                          onClick={() => {
                            setSelectedSale(sale);
                            setWhatsappPhoneInput(sale.customerPhone || '');
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            id="prev-page-btn"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Page {page} of {totalPages}
          </span>
          <Button
            id="next-page-btn"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Modal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title={`Bill #${String(selectedSale?.id ?? '').padStart(4, '0')}`}
        size="md"
      >
        {selectedSale && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>{formatDateTime(selectedSale.createdAt)}</span>
              <Badge variant={(paymentColors[selectedSale.paymentMethod as PaymentMethod] ?? 'default') as any}>
                {selectedSale.paymentMethod.toUpperCase()}
              </Badge>
            </div>

            {selectedSale.customerPhone && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Customer: <span className="font-medium text-[hsl(var(--foreground))]">{selectedSale.customerPhone}</span>
              </p>
            )}

            {/* Line items */}
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
                    <th className="text-left px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Item</th>
                    <th className="text-right px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Qty</th>
                    <th className="text-right px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Price</th>
                    <th className="text-right px-3 py-2 font-medium text-[hsl(var(--muted-foreground))]">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {selectedSale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        {item.product.name}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[hsl(var(--muted-foreground))]">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-[hsl(var(--muted-foreground))]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center border-t border-[hsl(var(--border))] pt-3">
              <span className="text-sm font-medium">Total</span>
              <span className="text-xl font-bold font-display text-[hsl(var(--primary))]">
                {formatCurrency(selectedSale.total)}
              </span>
            </div>

            {/* WhatsApp Digital Receipt Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Send Receipt on WhatsApp</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="whatsapp-sale-phone"
                  placeholder="Customer Phone (e.g. 9876543210)"
                  value={whatsappPhoneInput}
                  onChange={(e) => setWhatsappPhoneInput(e.target.value)}
                  className="flex-1 text-xs h-9"
                />
                <Button
                  id="send-whatsapp-sale-btn"
                  onClick={() => {
                    const { url } = getWhatsAppReceiptUrl(
                      {
                        saleId: selectedSale.id,
                        total: selectedSale.total,
                        paymentMethod: selectedSale.paymentMethod,
                        customerPhone: selectedSale.customerPhone,
                        items: selectedSale.items,
                        createdAt: selectedSale.createdAt,
                        storeName: storeSettings?.storeName || 'Arzoo Bakery',
                      },
                      whatsappPhoneInput,
                    );
                    window.open(url, '_blank');
                  }}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white shrink-0 font-medium text-xs h-9 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Download Receipt */}
            <button
              onClick={() => downloadReceipt(selectedSale)}
              disabled={downloading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--primary)/0.08)] hover:bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-sm font-medium transition-colors border border-[hsl(var(--primary)/0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading…' : 'Download Receipt (PDF)'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
