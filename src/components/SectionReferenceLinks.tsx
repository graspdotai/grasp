import { LinkSimpleIcon } from "@phosphor-icons/react";
import type { CourseSourceLink } from "@/lib/sectionSources";

interface SectionReferenceLinksProps {
  sources: CourseSourceLink[];
}

export default function SectionReferenceLinks({ sources }: SectionReferenceLinksProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-neutral-100 max-w-2xl">
      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <LinkSimpleIcon size={14} weight="bold" />
        Relevant links
      </h4>
      <ul className="flex flex-col gap-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-col gap-0.5 text-sm text-primary hover:underline"
            >
              <span className="font-medium text-neutral-800 group-hover:text-primary">
                {source.title || "Source"}
              </span>
              <span className="text-xs text-neutral-400 truncate max-w-full">
                {source.url}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
