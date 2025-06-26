"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowyButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function GlowyButton({ children, href, onClick, className }: GlowyButtonProps) {
  const Component = href ? 'a' : 'button';
  
  const buttonStyle = {
    '--clr-font-main': 'hsla(0 0% 20% / 100)',
    '--btn-bg-1': 'hsla(194 100% 69% / 1)',
    '--btn-bg-2': 'hsla(217 100% 56% / 1)',
    '--btn-bg-color': 'hsla(360 100% 100% / 1)',
    '--radii': '0.5em',
    cursor: 'pointer',
    padding: '0.9em 1.4em',
    minWidth: '120px',
    minHeight: '44px',
    fontSize: 'var(--size, 1rem)',
    fontWeight: '500',
    transition: '0.8s',
    backgroundSize: '280% auto',
    backgroundImage: 'linear-gradient(325deg, var(--btn-bg-2) 0%, var(--btn-bg-1) 55%, var(--btn-bg-2) 90%)',
    border: 'none',
    borderRadius: 'var(--radii)',
    color: 'var(--btn-bg-color)',
    boxShadow: '0px 0px 20px rgba(71, 184, 255, 0.5), 0px 5px 5px -1px rgba(58, 125, 233, 0.25), inset 4px 4px 8px rgba(175, 230, 255, 0.5), inset -4px -4px 8px rgba(19, 95, 216, 0.35)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none'
  } as React.CSSProperties;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn("glowy-btn", className)}
      style={buttonStyle}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.backgroundPosition = 'right top';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.backgroundPosition = 'left top';
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.outline = 'none';
        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--btn-bg-color), 0 0 0 6px var(--btn-bg-2)';
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.boxShadow = '0px 0px 20px rgba(71, 184, 255, 0.5), 0px 5px 5px -1px rgba(58, 125, 233, 0.25), inset 4px 4px 8px rgba(175, 230, 255, 0.5), inset -4px -4px 8px rgba(19, 95, 216, 0.35)';
      }}
    >
      {children}
    </Component>
  );
} 