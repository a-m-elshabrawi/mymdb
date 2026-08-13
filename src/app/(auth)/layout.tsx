export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <span className="mb-8 text-2xl font-semibold tracking-tight text-foreground">MyMDB</span>
      {children}
    </main>
  );
}
