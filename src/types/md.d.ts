// Markdown files imported as raw text via esbuild's `text` loader
// (used to bundle CHANGELOG.md into main.js). See ADR-0003.
declare module "*.md" {
  const content: string;
  export default content;
}
