---
tags:
  - index
  - ideas

---

# Ideas

Unstructured captures. Promote to [[Projects/Projects|Projects]] when ready to act.

---

```dataviewjs
const ideas = dv.pages('"Ideas"')
  .where(p => (p.tags ?? []).includes("idea"))
  .sort(p => p.created, "desc");

if (ideas.length === 0) {
  dv.el("div", "No ideas captured yet.", { attr: { style: "font-size:var(--text-sm);color:var(--color-faint);font-style:italic;padding:0.3rem 0.2rem" } });
} else {
  for (const p of ideas) {
    const content = await dv.io.load(p.file.path);
    const match = /## What is it\?\s*\n+([^\n#]*)/.exec(content ?? "");
    const summary = match ? match[1].trim() : "";

    const row = dv.el("div", "", { attr: { style: "margin-bottom:0.6rem" } });
    const header = row.createEl("div", { attr: { style: "display:flex;align-items:baseline;gap:0.5rem" } });
    const link = header.createEl("a", { text: p.file.name, attr: { href: p.file.path } });
    link.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(p.file.path, "", false); });
    if (p.status) {
      header.createEl("span", { text: p.status, attr: { style: "font-size:var(--text-xs);color:var(--color-faint)" } });
    }
    if (summary) {
      row.createEl("div", { text: summary, attr: { style: "font-size:var(--text-sm);color:var(--color-muted)" } });
    }
  }
}
```
