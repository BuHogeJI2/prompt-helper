type HeaderProps = {
  onManageTags: () => void;
  onCopy: () => void;
  isDesktop: boolean;
  isPaletteOpen: boolean;
  onTogglePalette: () => void;
};

export default function Header({
  onManageTags,
  onCopy,
  isDesktop,
  isPaletteOpen,
  onTogglePalette,
}: HeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/65 bg-white/80 px-3 py-2 shadow-soft sm:px-4">
      <h1 className="mr-auto text-base font-semibold tracking-tight text-cinder">Prompt Helper</h1>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isDesktop ? (
          <button
            type="button"
            aria-expanded={isPaletteOpen}
            aria-controls="tag-palette"
            onClick={onTogglePalette}
            className="rounded-lg border border-ink/10 px-3 py-2 text-sm font-medium text-cinder hover:bg-sand/55 focus:outline-none focus:ring-2 focus:ring-ember/30"
          >
            {isPaletteOpen ? "Hide blocks" : "Show blocks"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onManageTags}
          className="rounded-lg px-3 py-2 text-sm font-medium text-cinder/75 hover:bg-sand/55 focus:outline-none focus:ring-2 focus:ring-ember/30"
        >
          Manage tags
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg bg-ember px-3 py-2 text-sm font-semibold text-ink hover:bg-ember/85 focus:outline-none focus:ring-2 focus:ring-ember/30 sm:px-4"
        >
          Copy prompt
        </button>
      </div>
    </header>
  );
}
