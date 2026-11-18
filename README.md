# Obsidian Hub Scaffold

Dashboard scaffold for an Obsidian vault: Home dashboard, Launcher, sidenav plugin, CSS, templates.

## Use

1. Install community plugins: dataview (enable JS queries), homepage, templater, meta-bind, charts.
2. Run `sh sync.sh /path/to/vault`.
3. Edit `/path/to/vault/.vault-meta/hub-config.json` (see `hub-config.example.json`).
4. Enable the `hv-sidenav` plugin and the `design-system` and `hv-dashboard` CSS snippets.

## Layout

- `managed/`: overwritten on every sync. Do not edit in the vault; edit here.
- `seed/`: copied only when missing. Your content.

## Config keys (`.vault-meta/hub-config.json`)

- `featuredProject`: Home "Active Project" card. `null` shows `Projects/`.
- `vaults`: extra sidenav links.
- `launcherWorktrees`: per-project worktree rows on the Launcher.
