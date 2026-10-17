import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative flex gap-3 rounded-lg border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      info: "border-primary/30 bg-primary/5 [&>svg]:text-primary",
      success: "border-success/30 bg-success/5 [&>svg]:text-success",
      warning: "border-warning/40 bg-warning/8 [&>svg]:text-warning",
      destructive: "border-destructive/30 bg-destructive/5 [&>svg]:text-destructive",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, destructive: XCircle };

export function Alert({
  className,
  variant = "info",
  title,
  children,
  action,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & VariantProps<typeof alertVariants> & { title?: React.ReactNode; action?: React.ReactNode }) {
  const Icon = icons[variant ?? "info"];
  return (
    <div role={variant === "destructive" ? "alert" : "status"} className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn("text-muted-foreground", title && "mt-0.5")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
