export function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="px-6 pt-16 text-2xl font-semibold tracking-[0.1em] text-zinc-300 sm:px-10 sm:pt-20 sm:text-3xl">
      {children}
    </h1>
  );
}
