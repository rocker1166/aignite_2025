'use client';
import { cn } from '@/lib/utils';
import { X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Children, ReactNode, forwardRef } from 'react';

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
}
export interface StepperItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}
export interface StepperStatusIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status: 'inactive' | 'failed' | 'success' | 'warning' | 'loading';
}
export interface StepperTitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ className, children, activeStep = 0, ...args }, ref) => {
    const childrenArray = Children.toArray(children);
    
    return (
      <div
        ref={ref}
        className={cn(
          'stepper flex flex-row items-center justify-between w-full',
          className,
        )}
        {...args}>
        {childrenArray.map((child, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {child}
            </div>
            {index < childrenArray.length - 1 && (
              <div className="flex-1 px-4">
                <div
                  className={cn(
                    'stepper-divider h-0.5 w-full transition-colors duration-200',
                    activeStep > index ? 'bg-blue-500' : 'bg-neutral-300',
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
);

Stepper.displayName = 'Stepper';

export const StepperItem = forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, ...args }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'stepper-item flex flex-col items-center justify-center gap-2 text-center',
          className,
        )}
        {...args}
      />
    );
  },
);

StepperItem.displayName = 'StepperItem';

const StepperStatusIconStyle: Record<
  StepperStatusIconProps['status'],
  {
    className: string;
    render: React.ReactNode;
  }
> = {
  inactive: {
    className: 'bg-neutral-300 text-neutral-600',
    render: <div className="w-4 h-4" />,
  },
  failed: {
    className: 'bg-red-500 text-white',
    render: <X className="w-4 h-4" />,
  },
  success: {
    className: 'bg-green-500 text-white',
    render: <Check className="w-4 h-4" />,
  },
  warning: {
    className: 'bg-yellow-600 text-white',
    render: <AlertTriangle className="w-4 h-4" />,
  },
  loading: {
    className: 'bg-blue-500 text-white',
    render: <Loader2 className="w-4 h-4 animate-spin" />,
  },
};

export const StepperStatusIcon = forwardRef<
  HTMLDivElement,
  StepperStatusIconProps
>(({ className, status = 'inactive', ...args }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'stepper-status-icon-wrapper w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
        StepperStatusIconStyle[status].className,
        className,
      )}
      {...args}>
      {StepperStatusIconStyle[status].render}
    </div>
  );
});

StepperStatusIcon.displayName = 'StepperStatusIcon';

export const StepperTitle = forwardRef<HTMLParagraphElement, StepperTitleProps>(
  ({ className, ...args }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('stepper-title text-sm font-medium mt-2', className)}
        {...args}
      />
    );
  },
);

StepperTitle.displayName = 'StepperTitle';
