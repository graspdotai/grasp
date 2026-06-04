export type OnboardingDetails = {
  learnerTypes: string[];
  learningInterests: string[];
  lessonLanguage: string;
  lessonLength: string;
};

export type AuthResponse =
  | {
      ok: true;
      redirectTo?: string;
    }
  | {
      ok: false;
      message: string;
    };
