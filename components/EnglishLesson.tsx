import { englishLessons } from "@/lib/english-lessons";
import { CodeBlock } from "./CodeBlock";
import { SqlRunner } from "./SqlRunner";
import { Checkpoint } from "./Checkpoint";
import { englishCheckpoints } from "@/lib/english-checkpoints";
import PracticeArena from "@/content/en/practice-arena.mdx";

export function EnglishLesson({ slug }: { slug: string }) {
  const lesson = englishLessons[slug];
  return (
    <>
      {lesson.sections.map(({ heading, text }, index) => (
        <section key={heading}>
          <h2 id={`en-section-${index + 1}`}><span className="hl">{heading}</span></h2>
          <p>{text}</p>
        </section>
      ))}
      {lesson.sql && (
        <div className="run-block mt-5">
          <CodeBlock><code className="language-sql">{lesson.sql}</code></CodeBlock>
          {lesson.database && <SqlRunner db={lesson.database} code={lesson.sql} english />}
          {lesson.database && <p className="!mt-2 text-sm text-muted">The browser runner uses SQLite for this example.</p>}
        </div>
      )}
      {slug === "level-4-5" ? <PracticeArena /> : (
        <>
          <h2><span className="hl">Try it yourself</span></h2>
          <p>{lesson.practice}</p>
        </>
      )}
      <Checkpoint questions={englishCheckpoints[slug]} />
    </>
  );
}
