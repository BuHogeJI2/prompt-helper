type HeaderProps = {
  onManageTags: () => void;
  totalTags: number;
  customTagsCount: number;
};

export default function Header({ onManageTags, totalTags, customTagsCount }: HeaderProps) {
  return (
    <header className="grid gap-6 rounded-[2.2rem] border border-white/55 bg-white/60 p-6 shadow-panel backdrop-blur md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-moss">
          Prompt Helper
        </p>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-cinder sm:text-5xl">
            Build structured prompts in one deliberate workspace.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-cinder/68 sm:text-base">
            Choose a block, drop it into the editor, and keep the cursor exactly where
            the writing should start. Built-in tags are grouped, hotkeyed, and easy to
            manage without crowding the editor.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:min-w-[18rem]">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cinder/45">
              Saved tags
            </p>
            <p className="mt-2 text-3xl font-semibold text-cinder">{totalTags}</p>
          </div>
          <div className="rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cinder/45">
              Custom
            </p>
            <p className="mt-2 text-3xl font-semibold text-cinder">{customTagsCount}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onManageTags}
          className="inline-flex items-center justify-center rounded-full border border-cinder/10 bg-cinder px-5 py-3 text-sm font-semibold text-white transition hover:bg-cinder/92 focus:outline-none focus:ring-2 focus:ring-cinder/25"
        >
          Manage tags
        </button>
      </div>
    </header>
  );
}
