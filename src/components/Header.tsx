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
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border border-line bg-surface px-3 py-2 sm:px-4">
      <h1 className="mr-auto text-base font-semibold tracking-tight text-foreground">
        Prompt Helper
      </h1>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isDesktop ? (
          <button
            type="button"
            aria-expanded={isPaletteOpen}
            aria-controls="tag-palette"
            onClick={onTogglePalette}
            className="button"
          >
            {isPaletteOpen ? "Hide blocks" : "Show blocks"}
          </button>
        ) : null}
        <button type="button" onClick={onManageTags} className="button button-quiet">
          Manage tags
        </button>
        <button type="button" onClick={onCopy} className="button button-primary sm:px-4">
          Copy prompt
        </button>
      </div>
    </header>
  );
}
