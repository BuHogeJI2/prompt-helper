import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";

import { type ReactNode, useState } from "react";

interface IInfoPopoverProps {
  label: string;
  title: string;
  children: ReactNode;
  triggerClassName?: string;
}

export default function InfoPopover({
  label,
  title,
  children,
  triggerClassName = "",
}: IInfoPopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setIsPopoverOpen(isOpen);
    if (isOpen) setIsTooltipOpen(false);
  };

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Tooltip.Root
        open={isTooltipOpen && !isPopoverOpen}
        onOpenChange={(isOpen) => {
          if (!isPopoverOpen) setIsTooltipOpen(isOpen);
        }}
      >
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label={label}
              className={`inline-flex size-10 shrink-0 items-center justify-center text-muted transition hover:bg-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${triggerClassName}`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-[1.125rem] fill-none stroke-current"
              >
                <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                <path d="M12 10.75v6" strokeLinecap="round" strokeWidth="1.8" />
                <circle cx="12" cy="7.5" r="1" className="fill-current stroke-none" />
              </svg>
            </button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-[70] border border-control bg-elevated px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            {label}
            <Tooltip.Arrow className="fill-elevated" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Popover.Portal>
        <Popover.Content
          aria-label={title}
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] w-[min(20rem,calc(100vw-2rem))] border border-control bg-surface p-4 text-foreground outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold">{title}</h3>
            <Popover.Close
              aria-label={`Close ${title}`}
              className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center text-lg leading-none text-muted transition hover:bg-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none"
            >
              <span aria-hidden="true">×</span>
            </Popover.Close>
          </div>
          <div className="mt-3 space-y-3 text-sm leading-6 text-muted">{children}</div>
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
