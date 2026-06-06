import React from "react";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export default function Spinner({
  size = 16,
  className = "",
  style,
  ...props
}: SpinnerProps) {
  const sizePx = typeof size === "number" ? `${size}px` : size;
  return (
    <svg
      className={`animate-[spin_0.8s_linear_infinite] fill-current shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{ width: sizePx, height: sizePx, ...style }}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
        data-original="#000000"
      />
    </svg>
  );
}
