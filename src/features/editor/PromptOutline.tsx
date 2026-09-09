import type { MoveDirection } from "@/features/editor/organizePrompt";
import type { PromptSection } from "@/features/editor/parsePromptSections";

interface IPromptOutlineProps {
  sections: PromptSection[];
  currentSection: PromptSection | undefined;
  onNavigate: (section: PromptSection) => void;
  onMoveSection: (direction: MoveDirection) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function PromptOutline({
  sections,
  currentSection,
  onNavigate,
  onMoveSection,
  canMoveUp,
  canMoveDown,
}: IPromptOutlineProps) {
  if (!sections.length) return null;

  return (
    <nav
      aria-label="Prompt outline"
      className="min-h-0 shrink-0 border-b border-ink/8 bg-sand/20 p-2 lg:flex lg:w-44 lg:flex-1 lg:shrink lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-l lg:p-3"
    >
      <h2 className="mb-2 shrink-0 px-2 text-xs font-semibold uppercase tracking-wider text-cinder/60">
        Outline
      </h2>
      <ol className="flex gap-1 overflow-x-auto lg:min-h-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
        {sections.map((section) => (
          <li key={section.start} className="min-w-0 shrink-0">
            <button
              type="button"
              aria-label={`Go to ${section.name}, line ${section.line}`}
              aria-current={currentSection === section ? "location" : undefined}
              onClick={() => onNavigate(section)}
              title={`${section.name} · Line ${section.line}`}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-ember/35 ${currentSection === section ? "bg-ember/15 font-semibold text-cinder" : "text-cinder/70 hover:bg-sand/70"}`}
            >
              {section.depth > 0 ? (
                <span aria-hidden="true" className="text-cinder/40">
                  ↳
                </span>
              ) : null}
              <span className="max-w-40 truncate lg:max-w-none">{section.name}</span>
              <span aria-hidden="true" className="ml-auto text-[10px] tabular-nums text-cinder/45">
                {section.line}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-2 shrink-0 border-t border-ink/8 pt-2">
        <p className="mb-1 truncate px-2 text-xs text-cinder/60" title={currentSection?.name}>
          {currentSection ? `Move ${currentSection.name}` : "Choose a section to move"}
        </p>
        <div className="flex gap-1">
          {(["up", "down"] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={`Move section ${direction}`}
              disabled={direction === "up" ? !canMoveUp : !canMoveDown}
              onClick={() => onMoveSection(direction)}
              className="flex-1 rounded-lg px-2 py-2 text-xs font-semibold text-cinder hover:bg-sand/70 focus:outline-none focus:ring-2 focus:ring-ember/35 disabled:cursor-default disabled:opacity-40"
            >
              {direction === "up" ? "↑ Up" : "↓ Down"}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
