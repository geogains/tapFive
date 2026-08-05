import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function Container({ as: Tag = "div", children, className }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[var(--tf-container)] px-6 sm:px-8 lg:px-10", className)}>
      {children}
    </Tag>
  );
}
