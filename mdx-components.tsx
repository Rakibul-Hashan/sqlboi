import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Analogy, BugMonster, ErrorBox, Flow, Mission, Note, Remember, Solution, Story, Success, Tip } from "@/components/Boxes";
import { Boss, Challenge, Quest } from "@/components/Tasks";
import { Checkpoint } from "@/components/Checkpoint";
import { CodeBlock } from "@/components/CodeBlock";
import { ERDiagram } from "@/components/ERDiagram";
import { LevelRef, Term } from "@/components/CrossRef";
import { Summary } from "@/components/Summary";
import { Run } from "@/components/Run";
import { ColsVsRows, CrossGrid, JoinMatch, JoinSchema, JoinVenn, JoinVennGrid } from "@/components/JoinDiagram";
import { Playground } from "@/components/SqlRunner";

const components: MDXComponents = {
  pre: CodeBlock,
  h2: ({ children, ...props }) => (
    <h2 {...props}>
      <span className="hl">{children}</span>
    </h2>
  ),
  a: ({ href = "", children, ...props }) => {
    // ভেতরের লিংক: পাতা রিলোড ছাড়া; বাইরের লিংক: নতুন ট্যাবে, নিরাপদে
    if (href.startsWith("/") && !href.startsWith("//") && !/\.\w+$/.test(href)) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {external && (
          <>
            <ExternalLink className="ml-0.5 inline size-3.5 align-[-0.1em]" strokeWidth={2.6} aria-hidden />
            <span className="sr-only"> (নতুন ট্যাবে খোলে)</span>
          </>
        )}
      </a>
    );
  },
  table: (props) => (
    <div className="table-wrap" tabIndex={0}>
      <table {...props} />
    </div>
  ),
  Mission,
  Flow,
  Story,
  Analogy,
  Tip,
  Remember,
  Note,
  Success,
  ErrorBox,
  BugMonster,
  Solution,
  Quest,
  Challenge,
  Boss,
  Checkpoint,
  ERDiagram,
  Term,
  Summary,
  LevelRef,
  Run,
  Playground,
  JoinSchema,
  ColsVsRows,
  JoinVenn,
  JoinVennGrid,
  JoinMatch,
  CrossGrid,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
