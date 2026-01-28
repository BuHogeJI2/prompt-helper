type ActionButtonsProps = {
  onCopy: () => void;
  onClear: () => void;
  onManageTags: () => void;
};

export default function ActionButtons({
  onCopy,
  onClear,
  onManageTags,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-ink/10 bg-ember px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Quick copy
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-ink/20 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onManageTags}
        className="rounded-full border border-ink/20 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Manage tags
      </button>
    </div>
  );
}
