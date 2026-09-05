import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Phone, MapPin, MessageCircle, FileText, Save } from 'lucide-react';
import { settingsApi } from '@/api/settings';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Settings } from '@/types';

export function SettingsPage() {
  const [form, setForm] = useState<Partial<Settings>>({});
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        storeAddress: settings.storeAddress,
        phone: settings.phone,
        whatsappNumber: settings.whatsappNumber,
        receiptFooter: settings.receiptFooter,
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      success('Settings saved!', 'Your store settings have been updated.');
    },
    onError: (err: any) => {
      error('Failed to save', err?.response?.data?.message ?? 'Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const setField = (field: keyof Settings, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" className="text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <form id="settings-form" onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Store info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[hsl(var(--primary))]" />
            <CardTitle>Store Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            id="store-name"
            label="Store Name"
            placeholder="Crust & Crumb Bakery"
            value={form.storeName ?? ''}
            onChange={(e) => setField('storeName', e.target.value)}
          />
          <Input
            id="store-address"
            label="Store Address"
            placeholder="123 Baker Street, City"
            value={form.storeAddress ?? ''}
            onChange={(e) => setField('storeAddress', e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[hsl(var(--primary))]" />
            <CardTitle>Contact Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            id="store-phone"
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone ?? ''}
            onChange={(e) => setField('phone', e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            id="whatsapp-number"
            label="WhatsApp Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.whatsappNumber ?? ''}
            onChange={(e) => setField('whatsappNumber', e.target.value)}
            leftIcon={<MessageCircle className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Receipt */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
            <CardTitle>Receipt Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="receipt-footer"
              className="text-sm font-medium text-[hsl(var(--foreground))]"
            >
              Receipt Footer Message
            </label>
            <textarea
              id="receipt-footer"
              rows={3}
              placeholder="Thank you for visiting! Come back soon."
              value={form.receiptFooter ?? ''}
              onChange={(e) => setField('receiptFooter', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm px-3 py-2 resize-none transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          id="save-settings-btn"
          type="submit"
          size="lg"
          isLoading={updateMutation.isPending}
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}
