import { Children, isValidElement } from "react";
import type { DbName } from "@/lib/sql-engine";
import { SqlRunner } from "./SqlRunner";

/** MDX-এর ```sql ব্লক থেকে আসল লেখাটা বের করা (CodeBlock যেভাবে করে) */
function findCode(node: React.ReactNode): string {
  let found = "";
  Children.forEach(node, (child) => {
    if (found || !isValidElement<{ children?: React.ReactNode; className?: string }>(child)) return;
    const { children, className } = child.props;
    if (typeof className === "string" && className.startsWith("language-")) {
      found = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
      return;
    }
    found = findCode(children);
  });
  return found.replace(/\n$/, "");
}

/**
 * MDX-এ ব্যবহার:
 *
 * <Run db="q1-course">
 * ```sql
 * SELECT ...;
 * ```
 * </Run>
 *
 * কোড ব্লকটা আগের মতোই (হাইলাইট, কপি) সার্ভারে আঁকা হয়; নিচে "চালাও" যোগ হয়।
 */
export function Run({ db, children }: { db: DbName; children: React.ReactNode }) {
  const code = findCode(children);
  return (
    <div className="run-block">
      {children}
      <SqlRunner db={db} code={code} />
    </div>
  );
}
