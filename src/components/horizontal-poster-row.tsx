export function HorizontalPosterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:thin]">
      {children}
    </div>
  );
}

export function PosterRowItem({ children }: { children: React.ReactNode }) {
  return <div className="w-32 shrink-0 sm:w-36">{children}</div>;
}
