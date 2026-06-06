import { App, Component, MarkdownRenderer, Modal } from "obsidian";

/**
 * Renders a release-notes Markdown string in a modal. Content is built by the
 * pure helpers in `changelog.ts`; this class is the thin Obsidian adapter.
 */
export class ReleaseNotesModal extends Modal {
  constructor(
    app: App,
    private readonly owner: Component,
    private readonly title: string,
    private readonly markdown: string,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(this.title);
    void MarkdownRenderer.render(
      this.app,
      this.markdown,
      this.contentEl,
      "",
      this.owner,
    );
    const footer = this.contentEl.createDiv({ cls: "modal-button-container" });
    const close = footer.createEl("button", { text: "Close" });
    close.addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
