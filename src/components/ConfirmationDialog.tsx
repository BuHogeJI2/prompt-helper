import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { type RefObject, useRef } from "react";

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmFocusRef?: RefObject<HTMLElement | null>;
};

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmFocusRef,
}: ConfirmationDialogProps) {
  const wasConfirmedRef = useRef(false);

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) wasConfirmedRef.current = false;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-canvas/80" />
        <AlertDialog.Content
          onCloseAutoFocus={(event) => {
            if (!wasConfirmedRef.current || !confirmFocusRef?.current) return;

            event.preventDefault();
            confirmFocusRef.current.focus();
            wasConfirmedRef.current = false;
          }}
          className="fixed left-1/2 top-1/2 z-[80] max-h-[90dvh] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-control bg-surface p-4"
        >
          <div className="space-y-3">
            <AlertDialog.Title className="text-base font-medium text-foreground [overflow-wrap:anywhere]">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-xs leading-5 text-muted">
              {description}
            </AlertDialog.Description>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel className="button px-5">Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                wasConfirmedRef.current = true;
                onConfirm();
              }}
              className="button button-danger px-5"
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
