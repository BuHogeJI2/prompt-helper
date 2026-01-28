import ActionButtons from "@/components/ActionButtons";

type HeaderProps = {
  status: string;
  onCopy: () => void;
  onClear: () => void;
  onManageTags: () => void;
};

export default function Header({
  status,
  onCopy,
  onClear,
  onManageTags,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-moss">
          Prompt Helper
        </p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">
          Tag-driven prompt composer.
        </h1>
        <p className="max-w-xl text-sm text-ink/70">
          Click a tag to drop open and close brackets into the editor. The
          cursor lands between them, ready for your text.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-ink/60">{status}</span>
        <ActionButtons
          onCopy={onCopy}
          onClear={onClear}
          onManageTags={onManageTags}
        />
      </div>
    </header>
  );
}
