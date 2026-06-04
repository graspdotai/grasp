import { LinkSimpleIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import type { CourseSourceLink } from "@/lib/sectionSources";

interface SectionReferenceLinksProps {
  sources: CourseSourceLink[];
}

export default function SectionReferenceLinks({
  sources,
}: SectionReferenceLinksProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-16 bg-white max-w-full">
      <h4 className="text-xl font-semibold text-[#1f1f1f] mb-4 flex items-center gap-2">
        <LinkSimpleIcon size={18} className="text-[#1f1f1f]" />
        Resources
      </h4>
      <div className="flex flex-col gap-3">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-neutral-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 group transition-all duration-200"
          >
            <div className="flex flex-col gap-1 min-w-0 pr-4">
              <span className="font-semibold text-sm text-neutral-800 group-hover:text-primary transition-colors">
                {source.title || "Source"}
              </span>
              <span className="text-xs text-neutral-400 truncate">
                {source.url}
              </span>
            </div>
            <ArrowUpRightIcon
              size={16}
              className="text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
