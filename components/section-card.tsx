import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  footer,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}) {
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("pt-4", contentClassName)}>{children}</CardContent>
      {footer}
    </Card>
  );
}
