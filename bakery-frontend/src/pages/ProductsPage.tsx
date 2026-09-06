import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  Calendar,
  ImagePlus,
  X as XIcon,
} from 'lucide-react';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, isExpiringSoon, isExpired } from '@/utils/formatDate';
import type { Product } from '@/types';

interface ProductFormState {
  name: string;
  categoryId: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  expiryDate: string;
}

const emptyForm: ProductFormState = {
  name: '',
  categoryId: '',
  purchasePrice: '',
  sellingPrice: '',
  stock: '',
  expiryDate: '',
};

// ─── Image Upload Zone ─────────────────────────────────────────────────────

function ImageUploadZone({
  currentImageUrl,
  onFileSelect,
  preview,
  onClearPreview,
}: {
  currentImageUrl?: string | null;
  onFileSelect: (file: File) => void;
  preview: string | null;
  onClearPreview: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = preview ?? currentImageUrl ?? null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const imgSrc = displaySrc
    ? displaySrc.startsWith('data:') || displaySrc.startsWith('blob:')
      ? displaySrc
      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${displaySrc}`
    : null;

  return (
    <div
      className="relative group cursor-pointer rounded-xl border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors overflow-hidden bg-[hsl(var(--muted)/0.4)]"
      style={{ height: 96 }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {imgSrc ? (
        <>
          <img src={imgSrc} alt="Product" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <ImagePlus className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-medium">Change image</span>
          </div>
          {preview && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClearPreview(); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <XIcon className="w-3 h-3 text-white" />
            </button>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
          <ImagePlus className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center leading-tight">
            Click or drag & drop<br />
            <span className="text-[10px]">JPG, PNG, WebP — max 5 MB</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormState>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: async (product) => {
      if (imageFile) {
        try { await productsApi.uploadImage(product.id, imageFile); } catch (_) {}
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Product created!');
      closeModal();
    },
    onError: (err: any) => error('Failed', err?.response?.data?.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productsApi.update(id, data),
    onSuccess: async (product) => {
      if (imageFile) {
        try { await productsApi.uploadImage(product.id, imageFile); } catch (_) {}
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Product updated!');
      closeModal();
    },
    onError: (err: any) => error('Failed', err?.response?.data?.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Product deleted.');
      setDeleteModal(null);
    },
    onError: (err: any) => error('Failed', err?.response?.data?.message),
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? p.categoryId === parseInt(categoryFilter) : true;
      const matchLowStock = lowStockFilter ? p.stock <= 5 : true;
      return matchSearch && matchCat && matchLowStock;
    });
  }, [products, search, categoryFilter, lowStockFilter]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      categoryId: String(product.categoryId),
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: String(product.stock),
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().split('T')[0]
        : '',
    });
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errors: Partial<ProductFormState> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    if (!form.purchasePrice || isNaN(Number(form.purchasePrice)))
      errors.purchasePrice = 'Valid price required';
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice)))
      errors.sellingPrice = 'Valid price required';
    if (!form.stock || isNaN(Number(form.stock))) errors.stock = 'Valid stock required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      categoryId: parseInt(form.categoryId),
      purchasePrice: parseFloat(form.purchasePrice),
      sellingPrice: parseFloat(form.sellingPrice),
      stock: parseInt(form.stock),
      expiryDate: form.expiryDate || undefined,
    };
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const setField = (field: keyof ProductFormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <Input
            id="product-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-56"
          />
          <Select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-44"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <button
            id="low-stock-toggle"
            onClick={() => setLowStockFilter((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              lowStockFilter
                ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock
          </button>
        </div>
        <Button id="add-product-btn" onClick={openCreate} className="shrink-0">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" className="text-[hsl(var(--primary))]" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Add your first product or adjust the filters"
            action={
              <Button id="empty-add-product-btn" size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Buy Price</th>
                  <th className="text-right px-4 py-3 font-medium">Sell Price</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredProducts.map((product) => {
                  const expired = isExpired(product.expiryDate);
                  const expiringSoon = isExpiringSoon(product.expiryDate);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[hsl(var(--muted)/0.4)] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            )}
                          </div>
                          <span className="font-medium text-[hsl(var(--foreground))]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{product.category.name}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-[hsl(var(--muted-foreground))]">
                        {formatCurrency(product.purchasePrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant={
                            product.stock === 0
                              ? 'danger'
                              : product.stock <= 5
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {product.stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {product.expiryDate ? (
                          <span
                            className={`flex items-center gap-1 text-xs ${
                              expired
                                ? 'text-red-600 dark:text-red-400'
                                : expiringSoon
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-[hsl(var(--muted-foreground))]'
                            }`}
                          >
                            {(expired || expiringSoon) && (
                              <Calendar className="w-3 h-3" />
                            )}
                            {formatDate(product.expiryDate)}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--muted-foreground))] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            id={`edit-product-${product.id}`}
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 rounded-lg"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            id={`delete-product-${product.id}`}
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 rounded-lg text-[hsl(var(--destructive))] hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => setDeleteModal(product)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              Product Image <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
            </label>
            <ImageUploadZone
              currentImageUrl={editProduct?.imageUrl}
              onFileSelect={handleImageSelect}
              preview={imagePreview}
              onClearPreview={() => { setImageFile(null); setImagePreview(null); }}
            />
          </div>

          <Input
            id="product-name"
            label="Product Name"
            placeholder="e.g. Sourdough Loaf"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            error={formErrors.name}
            required
          />

          <Select
            id="product-category"
            label="Category"
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            placeholder="Select a category"
            error={formErrors.categoryId}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="purchase-price"
              label="Purchase Price (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.purchasePrice}
              onChange={(e) => setField('purchasePrice', e.target.value)}
              error={formErrors.purchasePrice}
              required
            />
            <Input
              id="selling-price"
              label="Selling Price (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.sellingPrice}
              onChange={(e) => setField('sellingPrice', e.target.value)}
              error={formErrors.sellingPrice}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="product-stock"
              label="Stock Quantity"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              error={formErrors.stock}
              required
            />
            <Input
              id="product-expiry"
              label="Expiry Date (optional)"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setField('expiryDate', e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              id="product-form-cancel"
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button id="product-form-submit" type="submit" isLoading={isPending}>
              {editProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Are you sure you want to delete{' '}
            <strong className="text-[hsl(var(--foreground))]">{deleteModal?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              id="delete-cancel-btn"
              variant="outline"
              onClick={() => setDeleteModal(null)}
            >
              Cancel
            </Button>
            <Button
              id="delete-confirm-btn"
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteModal && deleteMutation.mutate(deleteModal.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
