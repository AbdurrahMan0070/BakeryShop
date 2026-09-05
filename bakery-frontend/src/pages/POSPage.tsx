import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
  X,
  Download,
} from 'lucide-react';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { salesApi } from '@/api/sales';
import { useCart } from '@/store/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PaymentMethod, Product } from '@/types';

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
];

export function POSPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerPhone, setCustomerPhone] = useState('');

  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCart();
  const { success, error } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [receiptDownloading, setReceiptDownloading] = useState(false);

  const downloadReceipt = async (saleId: number) => {
    setReceiptDownloading(true);
    try {
      const res = await fetch(salesApi.getReceiptUrl(saleId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${String(saleId).padStart(4, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setReceiptDownloading(false);
    }
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? p.categoryId === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const createSale = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (sale) => {
      clearCart();
      setCheckoutOpen(false);
      setCustomerPhone('');
      setPaymentMethod('cash');
      success('Sale recorded!', `Total: ${formatCurrency(total)}`);
      if (sale.pdfUrl) setLastSaleId(sale.id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => {
      error('Sale failed', err?.response?.data?.message ?? 'Something went wrong');
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;
    createSale.mutate({
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paymentMethod,
      customerPhone: customerPhone || undefined,
    });
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      {/* Product grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search + category filter */}
        <div className="flex gap-3 shrink-0">
          <Input
            id="pos-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setCategoryFilter(undefined)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              !categoryFilter
                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id === categoryFilter ? undefined : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner size="lg" className="text-[hsl(var(--primary))]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try a different search or category"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => addItem(product)}
                  cartQty={items.find((i) => i.product.id === product.id)?.quantity ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-72 xl:w-80 flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden">
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="font-semibold text-sm">Cart</span>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border))]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
              <ShoppingCart className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-30" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatCurrency(item.product.sellingPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-red-50 dark:hover:bg-red-950 transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        <div className="px-4 py-4 border-t border-[hsl(var(--border))] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Total</span>
            <span className="text-lg font-bold text-[hsl(var(--foreground))] font-display">
              {formatCurrency(total)}
            </span>
          </div>
          <Button
            id="checkout-btn"
            onClick={() => { setLastSaleId(null); setCheckoutOpen(true); }}
            disabled={items.length === 0}
            className="w-full"
            size="lg"
          >
            Checkout
          </Button>
          {lastSaleId && (
            <button
              id="download-last-receipt-btn"
              onClick={() => downloadReceipt(lastSaleId)}
              disabled={receiptDownloading}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.07)] hover:bg-[hsl(var(--primary)/0.14)] border border-[hsl(var(--primary)/0.2)] transition-colors disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              {receiptDownloading ? 'Downloading…' : 'Download Last Receipt'}
            </button>
          )}
        </div>
      </div>

      {/* Checkout modal */}
      <Modal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Complete Sale"
        size="md"
      >
        <div className="flex flex-col gap-5">
          {/* Order summary */}
          <div className="rounded-xl bg-[hsl(var(--muted))] p-4 flex flex-col gap-2 max-h-44 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-[hsl(var(--foreground))]">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(item.product.sellingPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-base font-semibold border-t border-[hsl(var(--border))] pt-3">
            <span>Total</span>
            <span className="text-[hsl(var(--primary))] font-display text-xl">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-medium mb-2.5">Payment Method</p>
            <div className="flex gap-2">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  id={`payment-${value}`}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                    paymentMethod === value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer phone (optional) */}
          <Input
            id="customer-phone"
            label="Customer Phone (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />

          <Button
            id="confirm-sale-btn"
            onClick={handleCheckout}
            isLoading={createSale.isPending}
            size="lg"
            className="w-full"
          >
            Confirm Sale
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  cartQty,
}: {
  product: Product;
  onAdd: () => void;
  cartQty: number;
}) {
  const outOfStock = product.stock === 0;

  return (
    <button
      onClick={onAdd}
      disabled={outOfStock}
      className="relative flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
    >
      {/* Image or placeholder */}
      <div className="w-full aspect-square rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">🍞</span>
        )}
      </div>

      {/* Cart badge */}
      {cartQty > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold flex items-center justify-center">
          {cartQty}
        </span>
      )}

      <div className="w-full">
        <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate leading-tight">
          {product.name}
        </p>
        <p className="text-sm font-bold text-[hsl(var(--primary))] mt-0.5">
          {formatCurrency(product.sellingPrice)}
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {outOfStock ? <span className="text-red-500 font-medium">Out of stock</span> : `${product.stock} left`}
        </p>
      </div>
    </button>
  );
}
