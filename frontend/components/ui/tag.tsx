import { cn } from "@/lib/utils"

export function Tag({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-black text-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
