import SeoBannerGenerator from "@/components/SeoBannerGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Banner Generator",
  description: "Create premium OpenGraph, Twitter Card and social share banners for Grasp dynamically with HTML Canvas.",
};

export default function SeoPage() {
  return <SeoBannerGenerator />;
}
