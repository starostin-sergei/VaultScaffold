---
cssclasses:
  - hv-dashboard
last_updated: 2026-11-07T21:55
---

> [!capture-row]
> > [!btn-note] Note
> > ```dataviewjs
> > const a = dv.el("a", "", {});
> > a.addEventListener("click", e => {
> >   e.preventDefault();
> >   const overlay = document.createElement("div");
> >   overlay.className = "hv-modal-overlay";
> >   overlay.innerHTML = `<div class="hv-modal"><div class="hv-modal-header">New Note</div><input class="hv-modal-title" type="text" placeholder="Title" /><textarea class="hv-modal-body" placeholder="Start writing..."></textarea><div class="hv-modal-actions"><button class="hv-modal-cancel">Cancel</button><button class="hv-modal-save">Save</button></div></div>`;
> >   document.body.appendChild(overlay);
> >   const titleEl = overlay.querySelector(".hv-modal-title");
> >   const bodyEl = overlay.querySelector(".hv-modal-body");
> >   titleEl.focus();
> >   const close = () => overlay.remove();
> >   overlay.querySelector(".hv-modal-cancel").addEventListener("click", close);
> >   overlay.addEventListener("click", ev => { if (ev.target === overlay) close(); });
> >   overlay.querySelector(".hv-modal-save").addEventListener("click", async () => {
> >     const name = titleEl.value.trim() || "Untitled";
> >     const path = "Notes/" + name + ".md";
> >     const existing = app.vault.getAbstractFileByPath(path);
> >     const file = existing ?? await app.vault.create(path, bodyEl.value);
> >     close();
> >     await app.workspace.getLeaf().openFile(file);
> >   });
> > });
> > ```
>
> > [!btn-idea] Idea
> > ```dataviewjs
> > const a = dv.el("a", "", {});
> > a.addEventListener("click", e => {
> >   e.preventDefault();
> >   const overlay = document.createElement("div");
> >   overlay.className = "hv-modal-overlay";
> >   overlay.innerHTML = `<div class="hv-modal"><div class="hv-modal-header">New Idea</div><input class="hv-modal-title" type="text" placeholder="Title" /><textarea class="hv-modal-body" placeholder="What is it?"></textarea><div class="hv-modal-actions"><button class="hv-modal-cancel">Cancel</button><button class="hv-modal-save">Save</button></div></div>`;
> >   document.body.appendChild(overlay);
> >   const titleEl = overlay.querySelector(".hv-modal-title");
> >   const bodyEl = overlay.querySelector(".hv-modal-body");
> >   titleEl.focus();
> >   const close = () => overlay.remove();
> >   overlay.querySelector(".hv-modal-cancel").addEventListener("click", close);
> >   overlay.addEventListener("click", ev => { if (ev.target === overlay) close(); });
> >   overlay.querySelector(".hv-modal-save").addEventListener("click", async () => {
> >     const name = titleEl.value.trim() || "Untitled";
> >     const date = moment().format("YYYY-MM-DD");
> >     const content = `---\ntitle: ${name}\ntags: [idea]\nstatus: raw\ncreated: ${date}\nupdated: ${date}\n---\n\n# ${name}\n\n## What is it?\n\n${bodyEl.value.trim()}\n\n## Why interesting?\n\n## Next step\n\n- [ ] `;
> >     const path = "Ideas/" + name + ".md";
> >     const existing = app.vault.getAbstractFileByPath(path);
> >     const file = existing ?? await app.vault.create(path, content);
> >     close();
> >     await app.workspace.getLeaf().openFile(file);
> >   });
> > });
> > ```
>
> > [!btn-task] Task
> > ```dataviewjs
> > const a = dv.el("a", "", {});
> > a.addEventListener("click", e => {
> >   e.preventDefault();
> >   const overlay = document.createElement("div");
> >   overlay.className = "hv-modal-overlay";
> >   overlay.innerHTML = `<div class="hv-modal"><div class="hv-modal-header">New Task</div><input class="hv-modal-title" type="text" placeholder="Title" /><textarea class="hv-modal-body" placeholder="What needs to be done?"></textarea><label class="hv-modal-due-label">Due date</label><input class="hv-modal-due" type="date" /><div class="hv-modal-actions"><button class="hv-modal-cancel">Cancel</button><button class="hv-modal-save">Save</button></div></div>`;
> >   document.body.appendChild(overlay);
> >   const titleEl = overlay.querySelector(".hv-modal-title");
> >   const bodyEl = overlay.querySelector(".hv-modal-body");
> >   const dueEl = overlay.querySelector(".hv-modal-due");
> >   dueEl.value = moment().format("YYYY-MM-DD");
> >   titleEl.focus();
> >   const close = () => overlay.remove();
> >   overlay.querySelector(".hv-modal-cancel").addEventListener("click", close);
> >   overlay.addEventListener("click", ev => { if (ev.target === overlay) close(); });
> >   overlay.querySelector(".hv-modal-save").addEventListener("click", async () => {
> >     const name = titleEl.value.trim();
> >     if (!name || !bodyEl.value.trim()) return;
> >     const date = moment().format("YYYY-MM-DD");
> >     const due = dueEl.value || "";
> >     const content = `---\ntitle: ${name}\ntags: [task]\nstatus: open\ncreated: ${date}\nupdated: ${date}${due ? `\ndue: ${due}` : ""}\n---\n\n# ${name}\n\n## What needs to be done?\n\n${bodyEl.value.trim()}\n\n- [ ] `;
> >     const path = "Tasks/" + name + ".md";
> >     if (!app.vault.getAbstractFileByPath("Tasks")) await app.vault.createFolder("Tasks");
> >     const existing = app.vault.getAbstractFileByPath(path);
> >     const file = existing ?? await app.vault.create(path, content);
> >     close();
> >     await app.workspace.getLeaf().openFile(file);
> >   });
> > });
> > ```
>
> > [!btn-inbox] Inbox
> > [[Inbox|]]
>
> > [!btn-inbox] Backlog
> > [[Backlog|]]

> [!row-mid]
> > [!hv-today] Today
> > ```dataviewjs
> > const d = moment();
> > dv.el("div", d.format("D"), { cls: "hv-today-date" });
> > dv.el("div", d.format("dddd · MMMM YYYY · [Week] W"), { cls: "hv-today-sub" });
> > dv.el("hr", "", { attr: { style: "border:none;border-top:1px solid var(--color-border-dim);margin:0.4rem 0 0.6rem" } });
> > const today = d.format("YYYY-MM-DD");
> > const dueStr = (p) => p.due ? String(p.due).slice(0, 10) : null;
> > const allTasks = dv.pages('"Tasks"').where(p => dueStr(p) === today);
> > const pending = allTasks.where(p => p.status !== "done");
> > const done    = allTasks.where(p => p.status === "done");
> > const overdue = dv.pages('"Tasks"').where(p => dueStr(p) && dueStr(p) < today && p.status !== "done");
> > const wrap = dv.el("div", "", {});
> > if (allTasks.length === 0 && overdue.length === 0) {
> >   wrap.createEl("div", { text: "No tasks due today.", attr: { style: "font-size:var(--text-sm);color:var(--color-faint);font-style:italic;padding:0.3rem 0.2rem" } });
> > } else {
> >   const hdr = wrap.createEl("div", { cls: "hv-task-section-row" });
> >   hdr.createEl("span", { text: "Tasks", cls: "hv-task-section-title" });
> >   const leftCount = pending.length + overdue.length;
> >   if (leftCount > 0)
> >     hdr.createEl("span", { text: `${leftCount} left`, cls: "hv-task-badge" });
> >   const list = wrap.createEl("div", {});
> >   const ordered = [...overdue, ...done, ...pending];
> >   const visible = ordered.slice(0, 3);
> >   const rest = ordered.length - 3;
> >   for (const p of visible) {
> >     const isDone = p.status === "done";
> >     const isOverdue = !isDone && dueStr(p) && dueStr(p) < today;
> >     const row = list.createEl("div", { cls: "hv-task-row" });
> >     const dot = row.createEl("span", { cls: "hv-task-dot" + (isDone ? " done" : isOverdue ? " overdue" : "") });
> >     const link = row.createEl("a", { text: p.file.name, cls: "hv-task-text" + (isDone ? " done" : isOverdue ? " overdue" : ""), attr: { href: p.file.path } });
> >     link.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(p.file.path, "", false); });
> >     dot.addEventListener("click", async e => {
> >       e.preventDefault();
> >       e.stopPropagation();
> >       const file = app.vault.getAbstractFileByPath(p.file.path);
> >       if (!file) return;
> >       const nowDone = p.status !== "done";
> >       await app.fileManager.processFrontMatter(file, fm => { fm.status = nowDone ? "done" : "open"; });
> >       p.status = nowDone ? "done" : "open";
> >       const nowOverdue = !nowDone && dueStr(p) && dueStr(p) < today;
> >       dot.className = "hv-task-dot" + (nowDone ? " done" : nowOverdue ? " overdue" : "");
> >       link.className = "hv-task-text" + (nowDone ? " done" : nowOverdue ? " overdue" : "");
> >     });
> >   }
> >   if (rest > 0) {
> >     const more = wrap.createEl("a", { text: `See ${rest} more`, cls: "hv-task-more", attr: { href: "Tasks/" } });
> >     more.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText("Tasks", "", false); });
> >   }
> > }
> > ```
>
> > [!hv-project] Active Project
> > ```dataviewjs
> > let cfg = {};
> > try { cfg = JSON.parse(await app.vault.adapter.read(".vault-meta/hub-config.json")); } catch (e) {}
> > const fp = cfg.featuredProject ?? { name: "Projects", folder: "Projects", page: "Projects/Projects", badges: ["Active"] };
> > const vault = fp.folder;
> > const head = dv.el("div", "", { cls: "hv-project-name-row" });
> > head.createEl("div", { text: fp.name, cls: "hv-project-name" });
> > const badges = head.createEl("div"); badges.style.cssText = "display:flex;gap:0.4rem";
> > for (const b of fp.badges ?? []) badges.createEl("span", { text: b, cls: "hv-badge hv-badge-" + b.toLowerCase() });
> > dv.el("div", "", { cls: "hv-project-divider" });
> > dv.el("div", "Recently Touched", { cls: "hv-project-recent-label" });
> > const list = dv.el("div", "", { cls: "hv-project-recent-list" });
> > const fileIconSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
> > const pages = dv.pages(`"${vault}"`).sort(p => p.file.mtime, "desc").limit(2);
> > for (const p of pages) {
> >   const item = list.createEl("div", { cls: "hv-project-recent-item" });
> >   const icon = item.createEl("div", { cls: "hv-project-recent-icon" });
> >   icon.innerHTML = fileIconSvg;
> >   const text = item.createEl("div", { cls: "hv-project-recent-text" });
> >   text.createEl("div", { text: p.file.name, cls: "hv-project-recent-name" });
> >   const parts = (p.file.folder || "Root").split("/");
> >   const folder = parts.length > 2 ? `.../${parts.slice(-2).join("/")}` : parts.join("/");
> >   const ago = moment(p.file.mtime.toISO()).fromNow();
> >   text.createEl("div", { text: `${folder} · ${ago}`, cls: "hv-project-recent-meta" });
> >   item.addEventListener("click", () => app.workspace.openLinkText(p.file.path, "", false));
> > }
> > const footer = dv.el("a", "Open page", { cls: "hv-project-open" });
> > footer.style.cssText = "margin-top:0.5rem;display:inline-flex;align-items:center;gap:0.3rem";
> > footer.innerHTML += ` <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
> > footer.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(fp.page, "", false); });
> > ```
>
> > [!hv-recent] Recent
> > ```dataviewjs
> > // ── Search-first Recent card ───────────────────────────────────────
> > const icons = {
> >   book: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
> >   file: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
> >   pen: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
> >   bulb: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
> > };
> > // Map top-level folder to accent color + icon.
> > const styleFor = (folder) => {
> >   const top = (folder || "").split("/")[0];
> >   if (["Reference", "Tools", "Library", "Design"].includes(top))
> >     return { cc: "var(--color-resources)", cd: "var(--color-resources-dim)", icon: icons.book };
> >   if (top === "Projects")
> >     return { cc: "var(--color-projects)", cd: "var(--color-projects-dim)", icon: icons.file };
> >   if (top === "Journal")
> >     return { cc: "var(--color-journal)", cd: "var(--color-journal-dim)", icon: icons.pen };
> >   if (top === "Ideas")
> >     return { cc: "var(--color-ideas)", cd: "var(--color-ideas-dim)", icon: icons.bulb };
> >   return { cc: "var(--color-accent)", cd: "var(--color-accent-dim)", icon: icons.file };
> > };
> > // Compact relative time: now / 12m / 2h / 3d / 5w / 2mo / 1y
> > const compactAgo = (mtime) => {
> >   const mins = moment().diff(moment(mtime.toISO()), "minutes");
> >   if (mins < 1) return "now";
> >   if (mins < 60) return `${mins}m`;
> >   const hrs = Math.floor(mins / 60);
> >   if (hrs < 24) return `${hrs}h`;
> >   const days = Math.floor(hrs / 24);
> >   if (days < 7) return `${days}d`;
> >   const weeks = Math.floor(days / 7);
> >   if (days < 30) return `${weeks}w`;
> >   const months = Math.floor(days / 30);
> >   if (days < 365) return `${months}mo`;
> >   return `${Math.floor(days / 365)}y`;
> > };
> >
> > const searchSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`;
> > const search = dv.el("label", "", { cls: "hv-recent-search" });
> > const glyph = search.createEl("span", { cls: "hv-recent-glyph" });
> > glyph.innerHTML = searchSvg;
> > const input = search.createEl("input", { attr: { type: "text", placeholder: "Jump to a page…", "aria-label": "Search recent pages" } });
> >
> > const list = dv.el("div", "", { cls: "hv-recent-list" });
> > // Empty query: 5 most-recent pages. Query: all vault pages whose name
> > // matches, mtime-sorted, capped at 5.
> > const recentPages = () => dv.pages()
> >   .where(p => p.file.name !== "Home")
> >   .sort(p => p.file.mtime, "desc")
> >   .limit(5);
> > const searchPages = (q) => dv.pages()
> >   .where(p => p.file.name !== "Home" && p.file.name.toLowerCase().includes(q))
> >   .sort(p => p.file.mtime, "desc")
> >   .limit(5);
> > const renderRows = (pages) => {
> >   list.empty();
> >   for (const p of pages) {
> >     const st = styleFor(p.file.folder);
> >     const row = list.createEl("a", { cls: "hv-recent-item", attr: { href: p.file.path, style: `--cc:${st.cc};--cd:${st.cd}` } });
> >     const icon = row.createEl("span", { cls: "hv-recent-icon" });
> >     icon.innerHTML = st.icon;
> >     row.createEl("span", { text: p.file.name, cls: "hv-recent-name" });
> >     row.createEl("span", { text: compactAgo(p.file.mtime), cls: "hv-recent-time" });
> >     row.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(p.file.path, "", false); });
> >   }
> > };
> > renderRows(recentPages());
> >
> > input.addEventListener("input", () => {
> >   const q = input.value.trim().toLowerCase();
> >   renderRows(q ? searchPages(q) : recentPages());
> > });
> > input.addEventListener("keydown", e => {
> >   if (e.key !== "Enter") return;
> >   e.preventDefault();
> >   const first = list.querySelector(".hv-recent-item");
> >   if (first) app.workspace.openLinkText(first.getAttribute("href"), "", false);
> > });
> > ```
>
> > [!hv-calendar] Calendar
> > ```dataviewjs
> > // ── Mini calendar (DataviewJS) ─────────────────────────────────────
> > // When Full Calendar plugin (obsidian-full-calendar) is installed,
> > // replace this entire block with the plugin's embed syntax.
> > const now = moment();
> > const year = now.year();
> > const month = now.month(); // 0-indexed
> > const todayDay = now.date();
> > const monthName = now.format("MMMM YYYY");
> > const firstDow = moment([year, month, 1]).day(); // 0=Sun
> > const daysInMonth = now.daysInMonth();
> > 
> > let html = `<div class="cal-header">${monthName}</div>`;
> > html += `<table class="cal-table"><thead><tr>`;
> > ["S","M","T","W","T","F","S"].forEach(d => { html += `<th>${d}</th>`; });
> > html += `</tr></thead><tbody><tr>`;
> > for (let i = 0; i < firstDow; i++) html += `<td class="cal-empty"></td>`;
> > let col = firstDow;
> > for (let d = 1; d <= daysInMonth; d++) {
> >   const cls = d === todayDay ? "cal-today" : "";
> >   html += `<td class="${cls}">${d}</td>`;
> >   col++;
> >   if (col % 7 === 0 && d < daysInMonth) html += `</tr><tr>`;
> > }
> > html += `</tr></tbody></table>`;
> > dv.el("div", html, { cls: "cal-grid", attr: { style: "font-size:var(--text-sm)" } });
> > ```
>
> > [!hv-journal] Journal
> > [View all](Journal/Journal)
> > > What are you working on today?
> >
> > ```dataviewjs
> > const entries = dv.pages('"Journal"')
> >   .where(p => !p.file.tags.includes("index") && !p.file.tags.includes("journal"))
> >   .sort(p => p.file.name, "desc")
> >   .limit(3);
> > if (entries.length === 0) {
> >   dv.el("div", "No entries yet.", { attr: { style: "font-size:var(--text-sm);color:var(--color-faint);font-style:italic;padding:0.3rem 0.4rem" } });
> > } else {
> >   dv.list(entries.map(p => `[[${p.file.path}|${p.file.name}]]`));
> > }
> > ```
> >
> > [+ New session entry](Journal/Journal)

> [!stats-row]
> > [!stat-projects] Active Projects
> > ```dataviewjs
> > const count = dv.pages().where(p => p.file.tags.includes("project") && p.status === "Active").length;
> > dv.el("div", String(count), { attr: { style: "font-size:var(--text-stat);font-weight:800;color:var(--color-text);line-height:1;margin-bottom:0.1rem" } });
> > const names = dv.pages().where(p => p.file.tags.includes("project") && p.status === "Active").map(p => p.file.name).join(", ");
> > dv.el("div", names || "None yet", { attr: { style: "font-size:var(--text-xs);color:var(--color-projects)" } });
> > ```
>
> > [!stat-journal] Journal Entries
> > ```dataviewjs
> > const count = dv.pages('"Journal"').where(p => !p.file.tags.includes("index") && !p.file.tags.includes("journal")).length;
> > dv.el("div", String(count), { attr: { style: "font-size:var(--text-stat);font-weight:800;color:var(--color-text);line-height:1;margin-bottom:0.1rem" } });
> > dv.el("div", count === 0 ? "Start your first entry" : `${count} session${count === 1 ? "" : "s"} logged`, { attr: { style: "font-size:var(--text-xs);color:var(--color-journal)" } });
> > ```
>
> > [!stat-ideas] Ideas
> > ```dataviewjs
> > const count = dv.pages().where(p => p.file.tags.includes("idea")).length;
> > dv.el("div", String(count), { attr: { style: "font-size:var(--text-stat);font-weight:800;color:var(--color-text);line-height:1;margin-bottom:0.1rem" } });
> > dv.el("div", count === 0 ? "Nothing captured yet" : `${count} idea${count === 1 ? "" : "s"}`, { attr: { style: "font-size:var(--text-xs);color:var(--color-ideas)" } });
> > ```
>
> > [!stat-resources] Library
> > ```dataviewjs
> > const count = dv.pages('"Tools" or "Reference" or "Design"').where(p => !p.file.tags.includes("index")).length;
> > dv.el("div", String(count), { attr: { style: "font-size:var(--text-stat);font-weight:800;color:var(--color-text);line-height:1;margin-bottom:0.1rem" } });
> > const labels = dv.pages('"Tools" or "Reference" or "Design"').where(p => !p.file.tags.includes("index")).map(p => p.file.name).slice(0, 3).join(", ");
> > dv.el("div", labels || "None yet", { attr: { style: "font-size:var(--text-xs);color:var(--color-resources)" } });
> > ```

> [!widget-zone]
> + Add widget
