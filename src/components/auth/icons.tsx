export function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 12.27c0-.7-.06-1.37-.18-2.02H12v3.78h5.24a4.5 4.5 0 0 1-1.94 2.95v2.48h3.18c1.86-1.72 2.87-4.25 2.87-7.19Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.66 0 4.89-.88 6.52-2.39l-3.18-2.48c-.88.59-2.01.94-3.34.94-2.57 0-4.74-1.73-5.52-4.06H3.19v2.55A9.84 9.84 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.48 13.76A5.92 5.92 0 0 1 6.17 12c0-.61.11-1.21.31-1.76V7.69H3.19A9.83 9.83 0 0 0 2.15 12c0 1.55.37 3.02 1.04 4.31l3.29-2.55Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.18c1.45 0 2.74.5 3.76 1.47l2.82-2.82A9.45 9.45 0 0 0 12 2.25a9.84 9.84 0 0 0-8.81 5.44l3.29 2.55C7.26 7.91 9.43 6.18 12 6.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function VisibilityIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m4 4 16 16M10.58 10.59a2 2 0 0 0 2.83 2.83M9.36 5.25A11.13 11.13 0 0 1 12 4.93c6.55 0 10 7.07 10 7.07a18.61 18.61 0 0 1-2.07 3.05M6.61 6.61C3.58 8.22 2 12 2 12s3.45 7.07 10 7.07a10.7 10.7 0 0 0 4.13-.82"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
