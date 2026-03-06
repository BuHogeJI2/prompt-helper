import * as AlertDialog from "@radix-ui/react-alert-dialog";

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/40 bg-[#fbf7f0] p-6 shadow-[0_35px_80px_-45px_rgba(13,27,30,0.55)]">
          <div className="space-y-3">
            <AlertDialog.Title className="text-2xl font-semibold text-ink">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm leading-6 text-ink/70">
              {description}
            </AlertDialog.Description>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel className="rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ember/35">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink/30"
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
