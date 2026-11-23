import { Underline } from "./Doodles";

/** নতুন পাতাগুলোর (চিট শিট, রিভিশন, শব্দকোষ) একই রকম শিরোনাম */
export function PageHeader({ tag, title, lead }: { tag: string; title: string; lead: string }) {
  return (
    <header>
      <p className="brut-sm w-fit -rotate-2 bg-blue px-3 py-0.5 font-h3 text-sm">{tag}</p>
      <h1 className="relative mt-4 inline-block font-h1 text-4xl leading-snug sm:text-5xl">
        {title}
        <Underline className="absolute -bottom-3 left-0 h-5 w-full" />
      </h1>
      <p className="mt-6 max-w-3xl font-body text-lg leading-relaxed sm:text-xl">{lead}</p>
    </header>
  );
}
