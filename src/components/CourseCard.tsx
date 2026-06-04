"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, TrashIcon } from "@phosphor-icons/react";
import CourseThumbnail from "@/components/CourseThumbnail";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCourse, type UserCourseSummary } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { getLocalUserId } from "@/lib/userSession";

interface CourseCardProps {
  course: UserCourseSummary;
}

export default function CourseCard({ course }: CourseCardProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !window.confirm(
        `Delete "${course.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const userId = getLocalUserId() ?? undefined;
      await deleteCourse(course.id, userId);
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.courses(userId) });
      }
      void queryClient.removeQueries({ queryKey: queryKeys.course(course.id) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative group">
      <Link
        href={`/course/${course.id}`}
        className="block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      >
        <CourseThumbnail title={course.title} progress={course.progressPercent} />

        <div className="flex items-center w-full justify-between mt-5">
          <div className="pr-10">
            <p className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              {course.title}
            </p>
            <p className="font-medium text-neutral-500 leading-tight text-sm">
              {course.moduleCount} sections
            </p>
          </div>

          <div className="bg-neutral-100 rounded-full h-10 w-10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 group-hover:scale-105 shrink-0">
            <ArrowRightIcon size={18} />
          </div>
        </div>

        <p className="text-xs font-medium text-neutral-400 mt-2">
          Created{" "}
          {new Date(course.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete ${course.title}`}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm border border-neutral-200 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
      >
        <TrashIcon size={16} weight="bold" />
      </button>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
