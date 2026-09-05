import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    refetchInterval: 60_000,
  });

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      <h1 className="text-xl font-display font-semibold text-[hsl(var(--foreground))]">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          id="theme-toggle"
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0 rounded-full"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            id="notifications-btn"
            variant="ghost"
            size="sm"
            onClick={() => { setShowNotif((s) => !s); setShowUser(false); }}
            className="w-9 h-9 p-0 rounded-full relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[9px] text-white font-bold">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </Button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl z-50">
              <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[hsl(var(--border))]">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center text-[hsl(var(--muted-foreground))]">
                    All clear! No alerts.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 w-2 h-2 rounded-full shrink-0',
                          n.type === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-red-500',
                        )}
                      />
                      <div>
                        <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                          {n.productName}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {n.type === 'LOW_STOCK'
                            ? `Low stock: ${n.stock} left`
                            : `Expiring: ${n.expiryDate ? new Date(n.expiryDate).toLocaleDateString() : ''}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            id="user-menu-btn"
            onClick={() => { setShowUser((s) => !s); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white text-xs font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[hsl(var(--foreground))] hidden md:block">
              {user?.name}
            </span>
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl z-50 py-1">
              <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">{user?.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
