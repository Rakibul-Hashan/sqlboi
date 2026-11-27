import { Underline } from "./Doodles";

export function PageHeader({ tag, title, lead }: { tag: React.ReactNode; title: React.ReactNode; lead: React.ReactNode }) {
  return (
    <header>
      <p className="brut-sm w-fit -rotate-2 bg-blue px-3 py-0.5 font-h3 text-sm">{tag}</p>
      <h1 className="relative mt-4 inline-block max-w-full font-h1 text-3xl leading-snug [overflow-wrap:anywhere] sm:text-5xl">
        {title}
        <Underline className="pointer-events-none absolute -bottom-3 left-0 h-5 w-full" />
      </h1>
      <p className="mt-6 max-w-3xl font-body text-lg leading-relaxed sm:text-xl">{lead}</p>
    </header>
  );
}
