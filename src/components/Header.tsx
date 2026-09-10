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
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-3 py-2">
      <h1 className="mr-auto text-sm font-medium tracking-wide text-foreground">Prompt Helper</h1>
      <div className="flex max-w-full flex-wrap items-center gap-2">
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
