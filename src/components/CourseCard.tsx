"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, TrashIcon } from "@phosphor-icons/react";
import CourseThumbnail from "@/components/CourseThumbnail";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCourse, type UserCourseSummary } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { getLocalUserId } from "@/lib/userSession";
import { toast } from "sonner";

interface CourseCardProps {
  course: UserCourseSummary;
}

export default function CourseCard({ course }: CourseCardProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const userId = getLocalUserId() ?? undefined;
      await deleteCourse(course.id, userId);
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.courses(userId),
        });
      }
      void queryClient.removeQueries({ queryKey: queryKeys.course(course.id) });
      toast.success("Course deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative group">
      <Link
        href={`/course/${course.id}`}
        className="block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      >
        <CourseThumbnail
          title={course.title}
          progress={course.progressPercent}
        />

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
          {mounted ? new Date(course.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : ""}
        </p>
      </Link>
    </div>
  );
}
