import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ResponsiveCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export const ResponsiveCard = ({ title, icon: Icon, children, className = '' }: ResponsiveCardProps) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg lg:text-xl">
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {children}
      </CardContent>
    </Card>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, lg: 2 },
  gap = "4"
}: ResponsiveGridProps) => {
  const getGridClass = () => {
    const classes = [`gap-${gap}`];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return `grid ${classes.join(' ')}`;
  };

  return (
    <div className={getGridClass()}>
      {children}
    </div>
  );
};