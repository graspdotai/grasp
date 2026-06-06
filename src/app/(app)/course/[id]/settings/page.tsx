"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, GearIcon } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { useCourse } from "@/hooks/useCourse";
import { deleteCourse, isUuid } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { getLocalUserId } from "@/lib/userSession";
import DeleteCourseModal from "@/components/modals/DeleteCourseModal";

export default function CourseSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: courseId } = use(params);
  const isLiveCourse = isUuid(courseId);
  const { data, isLoading, error } = useCourse(courseId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const courseTitle = data?.course.title ?? "Course";

  async function handleDeleteCourse() {
    const userId = getLocalUserId();
    await deleteCourse(courseId, userId ?? undefined);
    void queryClient.removeQueries({ queryKey: queryKeys.course(courseId) });
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses(userId) });
    }
    router.push("/");
  }

  if (!isLiveCourse) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="p-6 max-w-7xl mx-auto">
          <Navbar />
          <p className="mt-8 text-sm text-neutral-600">Settings are only available for saved courses.</p>
          <Link
            href={`/course/${courseId}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            Back to course
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        <Navbar />

        <Link
          href={`/course/${courseId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 mt-6 mb-8"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          Back to course
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <GearIcon size={22} weight="duotone" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
              Course settings
            </h1>
            {isLoading ? (
              <p className="text-sm text-neutral-500 mt-0.5">Loading…</p>
            ) : error ? (
              <p className="text-sm text-red-600 mt-0.5">Could not load course</p>
            ) : (
              <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{courseTitle}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <section className="bg-white rounded-3xl border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-2">About this course</h2>
            <div className="max-w-xl">
              {data?.course.summary && (
                <p className="text-sm text-neutral-600 leading-relaxed">{data.course.summary}</p>
              )}
              {data?.course.goal && (
                <p className="text-sm text-neutral-500 mt-2">
                  <span className="font-medium text-neutral-700">Goal:</span> {data.course.goal}
                </p>
              )}
              {!isLoading && !data && (
                <p className="text-sm text-neutral-500">Course details unavailable.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-danger-100 p-6">
            <h2 className="text-sm font-semibold text-danger-700 mb-2">Delete course</h2>
            <p className="text-sm text-neutral-500 mb-4">
              Removes this course, all modules, and progress. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className="rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50"
            >
              Delete course
            </button>
          </section>
        </div>
      </div>

      <DeleteCourseModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteCourse}
        courseTitle={courseTitle}
      />
    </main>
  );
}
