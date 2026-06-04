"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowRightIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import CourseThumbnail from "@/components/CourseThumbnail";
import { fetchUserCourses, type UserCourseSummary } from "@/lib/courseApi";
import { getLocalUserId } from "@/lib/userSession";

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Home() {
  const [courses, setCourses] = useState<UserCourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = getLocalUserId();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetchUserCourses(userId)
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const courseCount = courses.length;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <Navbar />

      <div className="flex items-center gap-3">
        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5">Courses</h1>
        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5 text-neutral-300">
          {isLoading ? "…" : courseCount}
        </h1>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/new"
          className="relative overflow-hidden flex flex-col justify-between bg-primary-600 rounded-2xl w-full aspect-video p-8 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[40px] border-white/[0.07]" />
          <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full border-[50px] border-white/[0.05]" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center text-white">
              <PlusIcon size={22} />
            </div>
            <span className="text-[11px] font-medium tracking-widest text-white/45 uppercase">
              New
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="font-serif text-[28px] text-white leading-tight">
                Learn something new
              </p>
              <p className="text-sm text-white/60">Start a new course</p>
            </div>
          </div>
        </Link>

        {isLoading && (
          <p className="col-span-full text-sm text-neutral-500 py-8">Loading your courses…</p>
        )}

        {!isLoading && courses.length === 0 && (
          <p className="col-span-full text-sm text-neutral-500 py-4">
            No courses yet. Create one with the card on the left, or{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline">
              sign in
            </Link>{" "}
            to see courses linked to your account.
          </p>
        )}

        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className="group block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
          >
            <CourseThumbnail title={course.title} progress={course.progressPercent} />

            <div className="flex items-center w-full justify-between mt-5">
              <div>
                <p className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                  {course.title}
                </p>
                <p className="font-medium text-neutral-500 leading-tight text-sm">
                  {course.moduleCount} sections
                </p>
              </div>

              <div className="bg-neutral-100 rounded-full h-10 w-10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 group-hover:scale-105">
                <ArrowRightIcon size={18} />
              </div>
            </div>

            <p className="text-xs font-medium text-neutral-400 mt-2">
              Created {formatCreatedAt(course.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
