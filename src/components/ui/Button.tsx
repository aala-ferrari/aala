import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'dark';

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkButtonProps = BaseProps & { href: string };

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  dark: 'btn-dark',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    const cls = cn(VARIANT_CLASS[variant], className);

    if ('href' in props && props.href) {
      return (
        <Link href={props.href} className={cls}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cls} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
