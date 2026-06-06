declare module "react-katex" {
  import * as React from "react";

  interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error | TypeError) => React.ReactNode;
    settings?: Record<string, unknown>;
  }

  export const InlineMath: React.FC<KatexProps>;
  export const BlockMath: React.FC<KatexProps>;
}
