import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { reportsApi } from '@/api/reports';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatCurrencyShort } from '@/utils/formatCurrency';
import { TrendingUp, IndianRupee, ShoppingBag, Crown } from 'lucide-react';

const PRESETS = [
  { label: 'Last 7 days', from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 30 days', from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') },
  { label: 'This month', from: format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: format(endOfMonth(new Date()), 'yyyy-MM-dd') },
  { label: 'Last month', from: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), to: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-lg text-sm">
        <p className="font-medium text-[hsl(var(--foreground))] mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-[hsl(var(--muted-foreground))]">
            <span style={{ color: p.color }}>{p.name}: </span>
            {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsPage() {
  const [from, setFrom] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [groupBy, setGroupBy] = useState<'day' | 'week'>('day');
  const [activePreset, setActivePreset] = useState<string>('Last 30 days');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', from, to, groupBy],
    queryFn: () => reportsApi.getReport(from, to, groupBy),
    enabled: !!from && !!to,
  });

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFrom(preset.from);
    setTo(preset.to);
    setActivePreset(preset.label);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              id={`preset-${p.label.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activePreset === p.label
                  ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Input
            id="report-from"
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setActivePreset(''); }}
            className="w-40"
          />
          <span className="text-[hsl(var(--muted-foreground))] text-sm">to</span>
          <Input
            id="report-to"
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setActivePreset(''); }}
            className="w-40"
          />

          {/* Group by toggle */}
          <div className="flex items-center border border-[hsl(var(--border))] rounded-lg overflow-hidden">
            <button
              id="group-by-day"
              onClick={() => setGroupBy('day')}
              className={`px-3 py-2 text-xs font-medium transition-all ${
                groupBy === 'day'
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              Daily
            </button>
            <button
              id="group-by-week"
              onClick={() => setGroupBy('week')}
              className={`px-3 py-2 text-xs font-medium transition-all ${
                groupBy === 'week'
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" className="text-[hsl(var(--primary))]" />
        </div>
      ) : !data ? null : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Revenue',
                value: formatCurrencyShort(data.totalSales),
                full: formatCurrency(data.totalSales),
                icon: IndianRupee,
                color: 'bg-[hsl(var(--primary))]',
              },
              {
                label: 'Total Profit',
                value: formatCurrencyShort(data.totalProfit),
                full: formatCurrency(data.totalProfit),
                icon: TrendingUp,
                color: 'bg-emerald-500',
              },
              {
                label: 'Total Bills',
                value: String(data.totalBills),
                full: `${data.totalBills} transactions`,
                icon: ShoppingBag,
                color: 'bg-blue-500',
              },
            ].map(({ label, value, full, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
                      <p className="text-2xl font-bold font-display text-[hsl(var(--foreground))]">
                        {value}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{full}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.salesData}>
                    <defs>
                      <linearGradient id="rSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(32 90% 48%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(32 90% 48%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Revenue"
                      stroke="hsl(32 90% 48%)"
                      fill="url(#rSales)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke="#10b981"
                      fill="url(#rProfit)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Best sellers */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <CardTitle>Best Selling Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data.bestSelling.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
                    No sales data for this period
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.bestSelling.slice(0, 6).map((item, idx) => (
                      <div key={item.productName} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] w-5 text-right shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                              {item.productName}
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 ml-2">
                              {item.quantity} sold
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                              style={{
                                width: `${Math.min(100, (item.quantity / (data.bestSelling[0]?.quantity || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[hsl(var(--foreground))] shrink-0">
                          {formatCurrencyShort(item.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
