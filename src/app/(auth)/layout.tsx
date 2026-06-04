import BrandPanel from "@/components/auth/BrandPanel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white p-4 text-slate-900 sm:p-6">
      <div className="grid min-h-[calc(100vh-48px)] lg:grid-cols-2 lg:gap-6">
        <BrandPanel />
        {children}
      </div>
    </main>
  );
}
