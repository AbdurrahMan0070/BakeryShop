import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CookingPot, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success('Welcome back!', 'You have been signed in.');
      } else {
        await register(name, email, password);
        success('Account created!', 'Welcome to Crust & Crumb.');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      error(mode === 'login' ? 'Sign-in failed' : 'Registration failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[hsl(var(--primary))] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <CookingPot className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-tight">Crust & Crumb</p>
            <p className="text-xs opacity-70 leading-tight">Bakery Management</p>
          </div>
        </div>

        <div>
          <blockquote className="font-display text-3xl font-medium leading-snug mb-4">
            "Every great bakery starts with great management."
          </blockquote>
          <div className="flex gap-3 flex-wrap mt-8">
            {['POS System', 'Inventory', 'Sales Reports', 'Stock Alerts'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/15 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm opacity-50">© 2026 Crust & Crumb. All rights reserved.</p>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[hsl(var(--primary))]">
              <CookingPot className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[hsl(var(--foreground))]">
              Crust & Crumb
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">
              {mode === 'login'
                ? 'Sign in to your bakery management dashboard'
                : 'Set up your bakery management system'}
            </p>
          </div>

          <form id="auth-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                id="full-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            )}

            <Input
              label="Email address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 6 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              id="auth-submit-btn"
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              id="auth-mode-toggle"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[hsl(var(--primary))] font-medium hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
