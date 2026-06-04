"use client";

import Navbar from "@/components/Navbar";
import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { useUserCourses } from "@/hooks/useCourses";
import { getLocalUserId } from "@/lib/userSession";

export default function Home() {
  const userId = getLocalUserId();
  const { data: courses = [], isLoading, isFetched } = useUserCourses();
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

        {isFetched && !userId && (
          <p className="col-span-full text-sm text-neutral-500 py-4">
            <Link href="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>{" "}
            to see your courses.
          </p>
        )}

        {isFetched && userId && courses.length === 0 && (
          <p className="col-span-full text-sm text-neutral-500 py-4">
            No courses yet. Create one with the card on the left.
          </p>
        )}

        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  );
}
