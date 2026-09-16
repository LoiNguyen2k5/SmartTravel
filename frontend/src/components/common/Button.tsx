import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 ' +
    'active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variantStyles = {
    primary: 
      'bg-primary-600 text-white shadow-sm hover:bg-primary-500 hover:shadow-card focus-visible:ring-primary-500 border border-primary-700/20',
    accent: 
      'bg-accent-500 text-white shadow-sm hover:bg-accent-600 hover:shadow-card focus-visible:ring-accent-500 border border-accent-600/30',
    secondary: 
      'bg-primary-950 text-white shadow-sm hover:bg-primary-900 focus-visible:ring-primary-800 border border-primary-900',
    danger: 
      'bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:ring-rose-500',
    outline: 
      'border-2 border-primary-600 text-primary-700 bg-white/80 hover:bg-primary-50 focus-visible:ring-primary-500 shadow-sm',
    ghost: 
      'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
