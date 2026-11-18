---
title: Launcher
type: meta
tags:
  - launcher
  - dashboard
created: 2026-09-29
related:
  - "[[Projects]]"
  - "[[Vault Data Layer Standard]]"
last_updated: 2026-10-02T21:56
---

# Launcher

One button per build of every project. The buttons are built from each project page's `launch:` frontmatter. To add or change a button, edit that project page, not this one.

**Entry format** (one string per button): `'Label | target'`
- target ends in `.exe`, `.bat`, `.cmd`, `.lnk`, `.msi` or `.ps1`: a file. A relative path is resolved against the page's `vault` folder; write relative paths with forward slashes. The button is greyed out while the file does not exist (not built yet).
- anything else: a shell command, run in a new console window in the page's `vault` folder (e.g. `gradlew.bat run`).

```dataviewjs
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const FILE_EXT = /\.(exe|bat|cmd|lnk|msi|ps1)$/i;
// Pin cmd.exe: exec otherwise uses %ComSpec%, which may be PowerShell (where `start` = Start-Process).
const CMD = path.join(process.env.SystemRoot || "C:/Windows", "System32", "cmd.exe");

const pages = dv.pages().where(p => p.launch && dv.array(p.launch).length > 0)
  .sort(p => p.file.name);

if (pages.length === 0) {
  dv.paragraph("No project has a `launch:` field yet.");
}

// Optional per-project worktree rows, configured in .vault-meta/hub-config.json:
// "launcherWorktrees": [{"project":"Name","base":"C:/path/to/worktrees","buttons":[{"label":"Run","cmd":"gradlew.bat run","cta":true}]}]
let HUB_CFG = {};
try { HUB_CFG = JSON.parse(await app.vault.adapter.read(".vault-meta/hub-config.json")); } catch (e) {}
function getWorktrees(base) {
  if (!base || !fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({ name: d.name, path: path.join(base, d.name) }));
}

for (const p of pages) {
    const root = p.vault ? String(p.vault) : null;
    const box = dv.el("div", "", { cls: "launcher-project" });
  box.style.cssText = "margin:0 0 1.2em 0;padding:.8em 1em;border:1px solid var(--background-modifier-border);border-radius:8px;";
  const head = box.createEl("div");
  head.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.6em;";
  const link = head.createEl("a", { text: p.title ?? p.file.name, cls: "internal-link", href: p.file.path });
  link.setAttr("data-href", p.file.path);
  link.style.fontWeight = "600";
  if (root) head.createEl("code", { text: root });
  const row = box.createEl("div");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:.5em;";

  for (const entry of dv.array(p.launch)) {
    const [label, ...rest] = String(entry).split("|");
    const target = rest.join("|").trim();
    const btn = row.createEl("button", { text: label.trim() });
    if (!target) { btn.disabled = true; btn.title = "Entry has no target"; continue; }

    if (FILE_EXT.test(target)) {
      const file = path.isAbsolute(target) || !root ? target : path.join(root, target);
      btn.title = file;
      if (!fs.existsSync(file)) { btn.disabled = true; btn.title = "Not found: " + file; continue; }
      btn.addClass("mod-cta");
      const isBatch = /\.bat|\.cmd$/i.test(file);
      const cmd = isBatch ? `${CMD} /c "${file}"` : `start "${label.trim()}" "${file}"`;
      btn.onclick = () => {
        console.log("Launcher executing:", cmd, "cwd:", path.dirname(file), "shell:", CMD);
        exec(cmd, { cwd: path.dirname(file), shell: CMD },
          err => err && new Notice("Launch failed: " + err.message));
      };
    } else {
      if (!root || !fs.existsSync(root)) { btn.disabled = true; btn.title = "No vault folder for: " + target; continue; }
      btn.title = `${target}  (in ${root})`;
      btn.onclick = () => exec(`start "${label.trim()}" "${CMD}" /k ${target}`, { cwd: root, shell: CMD },
        err => err && new Notice("Launch failed: " + err.message));
    }
  }

  for (const cfg of (HUB_CFG.launcherWorktrees ?? []).filter(c => c.project === p.file.name)) {
    for (const wt of getWorktrees(cfg.base)) {
      const wtRow = box.createEl("div");
      wtRow.style.cssText = "display:flex;flex-wrap:wrap;gap:.5em;margin-top:.4em;align-items:center;";
      wtRow.createEl("code", { text: wt.name, style: "min-width:160px;" });
      for (const b of (cfg.buttons ?? [])) {
        const btn = wtRow.createEl("button", { text: b.label });
        if (b.cta) btn.addClass("mod-cta");
        btn.onclick = () => exec(`start "${wt.name} ${b.label}" "${CMD}" /k ${b.cmd}`, { cwd: wt.path, shell: CMD },
          err => err && new Notice("Launch failed: " + err.message));
      }
    }
  }
}
```
