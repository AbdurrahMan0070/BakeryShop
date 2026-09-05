import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 p-5 pb-3', className)}>{children}</div>
  );
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('font-semibold text-base leading-tight', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('p-5 pt-2', className)}>{children}</div>;
}
