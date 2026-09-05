import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import { formatCurrency, formatCurrencyShort } from '@/utils/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useNavigate } from 'react-router-dom';

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  color,
  onClick,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{title}</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] font-display">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{sub}</p>
            )}
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Alert banners */}
      {(stats.lowStockCount > 0 || stats.expiringCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.lowStockCount > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/products?lowStock=true')}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{stats.lowStockCount}</strong> product{stats.lowStockCount !== 1 ? 's' : ''} low on stock
              </span>
            </div>
          )}
          {stats.expiringCount > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/products')}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                <strong>{stats.expiringCount}</strong> product{stats.expiringCount !== 1 ? 's' : ''} expiring soon
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrencyShort(stats.todaySales)}
          icon={IndianRupee}
          color="bg-[hsl(var(--primary))]"
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrencyShort(stats.todayProfit)}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard
          title="Bills Today"
          value={String(stats.todayBills)}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={String(stats.totalProducts)}
          icon={Package}
          sub={`${stats.lowStockCount} low stock`}
          color="bg-violet-500"
          onClick={() => navigate('/products')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.dailySalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(32 90% 48%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(32 90% 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  fill="url(#salesGrad)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#10b981"
                  fill="url(#profitGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Profit — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailySalesData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Revenue" fill="hsl(32 90% 48%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
