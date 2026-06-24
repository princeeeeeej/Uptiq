import { ReactNode } from "react";

export default function GlassPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
      border border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      rounded-3xl
      overflow-hidden
    "
    >
      {children}
    </div>
  );
}
