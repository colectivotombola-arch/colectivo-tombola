import { ReactNode } from 'react';

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
}

export const MobileContainer = ({ children, className = '' }: MobileOptimizedProps) => (
  <div className={`mobile-container ${className}`}>
    {children}
  </div>
);

export const MobileCard = ({ children, className = '' }: MobileOptimizedProps) => (
  <div className={`mobile-card bg-card border border-border rounded-lg ${className}`}>
    {children}
  </div>
);

export const ResponsiveGrid = ({ children, className = '' }: MobileOptimizedProps) => (
  <div className={`mobile-grid ${className}`}>
    {children}
  </div>
);

export const TouchTarget = ({ children, className = '' }: MobileOptimizedProps) => (
  <div className={`touch-target flex items-center justify-center ${className}`}>
    {children}
  </div>
);

export const ResponsiveText = ({ 
  children, 
  variant = 'body',
  className = '' 
}: MobileOptimizedProps & { variant?: 'title' | 'subtitle' | 'body' }) => {
  const variantClasses = {
    title: 'responsive-title font-bold',
    subtitle: 'responsive-subtitle font-semibold',
    body: 'mobile-text'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const MobileSection = ({ children, className = '' }: MobileOptimizedProps) => (
  <section className={`mobile-section ${className}`}>
    {children}
  </section>
);