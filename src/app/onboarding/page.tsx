import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalize Your Learning Profile",
  description: "Set up your onboarding profile on Grasp to receive custom-tailored courses aligned with your goals and experience level.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
