import cn from "@/utils/cn";
import { cva } from "class-variance-authority";
import React from "react";
import { MyComponentProps } from "@/types/midmType";

const textVariants = cva("scroll-m-20 tracking-tight", {
  variants: {
    variant: {
      default: "text-sm",
      title: "text-4xl font-bold",
      heading: "text-2xl font-semibold",
      large: "text-lg font-medium",
      medium: "text-md font-medium",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const MessageText = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, ...props }: MyComponentProps, ref) => {
    return (
      <div className={cn(textVariants({ variant, className }))} ref={ref}>
        {props.children}
      </div>
    );
  }
);

MessageText.displayName = "MessageText";
