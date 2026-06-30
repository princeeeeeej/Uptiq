import { ReactNode } from 'react';
export default function FloatCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
      absolute
      pointer-events-none
      rounded-2xl
      px-4
      py-3
      border
      border-white/10
      bg-black/60
      backdrop-blur-xl
      ${className}
      `}
    >
      {children}
    </div>
  );
}
