type HeaderProps = {
  onManageTags: () => void;
  totalTags: number;
  customTagsCount: number;
};

export default function Header({ onManageTags, totalTags, customTagsCount }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[1.6rem] border border-white/55 bg-white/60 p-4 shadow-panel backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-moss">Prompt Helper</p>
        <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-cinder sm:text-[1.75rem]">
          Build structured prompts.
        </h1>
        <p className="mt-1 text-sm leading-6 text-cinder/70">
          Choose a block, write in place, and copy the finished prompt.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <p className="text-sm text-cinder/70">
          <span className="font-semibold text-cinder">{totalTags}</span> tags
          <span aria-hidden="true"> · </span>
          <span className="font-semibold text-cinder">{customTagsCount}</span> custom
        </p>
        <button
          type="button"
          onClick={onManageTags}
          className="inline-flex items-center justify-center rounded-full border border-cinder/10 bg-cinder px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cinder/92 focus:outline-none focus:ring-2 focus:ring-cinder/25 motion-reduce:transition-none"
        >
          Manage tags
        </button>
      </div>
    </header>
  );
}
