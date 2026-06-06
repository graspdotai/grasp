"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  CrosshairIcon,
  GearIcon,
  InfoIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { useCourse } from "@/hooks/useCourse";
import { deleteCourse, isUuid } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { getLocalUserId } from "@/lib/userSession";
import DeleteCourseModal from "@/components/modals/DeleteCourseModal";

function Row({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p
          className={`text-sm font-medium text-neutral-800 mt-0.5 ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.courses(userId),
      });
    }
    router.push("/");
  }

  if (!isLiveCourse) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="p-6 max-w-7xl mx-auto">
          <Navbar />
          <p className="mt-8 text-sm text-neutral-600">
            Settings are only available for saved courses.
          </p>
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

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GearIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                Course settings
              </h1>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <section className="bg-white rounded-3xl border border-neutral-100 p-4">
              <Row
                icon={<InfoIcon size={20} />}
                label="About this course"
                value={data?.course.summary || "No summary available"}
              />
              <Row
                icon={<CrosshairIcon size={20} />}
                label="Course goal"
                value={data?.course.goal || "No goal set"}
              />
            </section>

            <section className="bg-white rounded-3xl border border-danger-100 p-6">
              <h2 className="font-semibold text-danger-700">Delete course</h2>
              <p className="text-sm text-neutral-500 mb-4">
                Removes this course, all modules, and progress. This cannot be
                undone.
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
