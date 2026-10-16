import Link from "next/link";

export function ToolNav() {
  return <nav className="tool-nav" aria-label="Tools">
    <Link href="/">MMR</Link>
    <Link href="/smr">SMR</Link>
    <Link href="/wordtohtml">Word to HTML</Link>
  </nav>;
}
