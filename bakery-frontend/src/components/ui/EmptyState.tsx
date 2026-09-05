import { cn } from '@/utils/cn';
import { PackageX } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="text-[hsl(var(--muted-foreground))] opacity-40">
        {icon ?? <PackageX className="w-14 h-14" />}
      </div>
      <div>
        <p className="text-base font-medium text-[hsl(var(--foreground))]">{title}</p>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
