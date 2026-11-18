const { Plugin, ItemView, moment } = require("obsidian");

const VIEW_TYPE = "hv-sidenav-view";
const COLLAPSE_AT = 900;
const EXPAND_AT = 960;

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  projects: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  ideas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  resources: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  vault: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  // Single shared icon for every project nav child, regardless of project type.
  projectItem: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  launcher: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
};

// Per-icon accent, keyed by icon name so it stays consistent with the Home
// dashboard Recent card, where each row icon is tinted by its vault section:
// resources (Tools/Reference/Design), projects, journal, ideas; everything
// else falls back to the primary accent. Colors reference the same Faded Ink
// CSS variables the sidenav root already defines.
const ICON_COLORS = {
  home: "var(--color-accent)",
  launcher: "var(--color-accent)",
  journal: "var(--color-journal)",
  ideas: "var(--color-ideas)",
  resources: "var(--color-resources)",
  vault: "var(--color-accent)",
  inbox: "var(--color-accent)",
  projects: "var(--color-projects)",
  projectItem: "var(--color-projects)",
};

const PROJECT_ITEM_ICON = "projectItem";

const PROJECTS_INDEX_PATH = "Projects/Projects.md";

const STATIC_NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { icon: "home", label: "Home", path: "Home" },
      { icon: "launcher", label: "Launcher", path: "Launcher" },
      { icon: "journal", label: "Journal", path: "Journal/Journal" },
      { icon: "ideas", label: "Ideas", path: "Ideas/Ideas" },
      { icon: "resources", label: "Tools", path: "Tools/Tools" },
      { icon: "resources", label: "Reference", path: "Reference/Reference" },
      { icon: "resources", label: "Design", path: "Design/Design" },
    ],
  },
  // "Vaults" section is injected from .vault-meta/hub-config.json ("vaults": [{label, path}]).
  {
    label: "Quick Access",
    items: [{ icon: "inbox", label: "Inbox", path: "Inbox" }],
  },
];

// Reads the "## Active" table of Projects/Projects.md and turns each
// `| [[Label]] | ... |` row into a nav item, so the sidebar can't drift
// out of sync with the index the way the old hardcoded list did.
//
// Items whose resolved file lives directly under a subfolder of Projects/
// (e.g. Projects/HoHW/SaveManager.md) are folded into a collapsible group
// named after that subfolder, rather than staying flat — this mirrors the
// on-disk folder grouping instead of listing every project note as a peer.
async function parseProjectsIndex(app) {
  const file = app.vault.getAbstractFileByPath(PROJECTS_INDEX_PATH);
  if (!file) return [];
  const content = await app.vault.read(file);

  const activeStart = content.indexOf("## Active");
  if (activeStart === -1) return [];
  const nextHeading = content.indexOf("\n## ", activeStart + 1);
  const section = content.slice(activeStart, nextHeading === -1 ? undefined : nextHeading);

  const flat = [];
  // Column 2 (Location) holds the project's real filesystem path, e.g.
  // `C:\path	o\project` — independent of where the note itself
  // lives, which is what the terminal button needs to cd into.
  const rowPattern = /^\|\s*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]\s*\|\s*`([^`]+)`\s*\|/gm;
  let match;
  while ((match = rowPattern.exec(section)) !== null) {
    const label = match[1].trim();
    const folderPath = match[2].trim();
    const dest = app.metadataCache.getFirstLinkpathDest(label, PROJECTS_INDEX_PATH);
    const path = dest ? dest.path.replace(/\.md$/, "") : `Projects/${label}`;
    flat.push({ icon: PROJECT_ITEM_ICON, label, path, folderPath });
  }

  const items = [];
  const groups = new Map(); // groupName -> group item, to keep first-seen order
  for (const entry of flat) {
    const groupMatch = /^Projects\/([^/]+)\/[^/]+$/.exec(entry.path);
    if (!groupMatch) {
      items.push(entry);
      continue;
    }
    const groupName = groupMatch[1];
    let group = groups.get(groupName);
    if (!group) {
      group = { icon: "projects", label: groupName, isGroup: true, children: [] };
      groups.set(groupName, group);
      items.push(group);
    }
    group.children.push(entry);
  }
  return items;
}

// Spawns a detached external Windows Terminal window, cd'd into the
// project's real folder and running `claude` — independent of the
// PowerShell profile's claude-<name> shortcuts, and independent of the
// Obsidian process (survives if Obsidian closes).
function openExternalTerminal(folderPath) {
  const { spawn } = require("child_process");
  const escaped = folderPath.replace(/'/g, "''");
  // wt.exe's own CLI parser treats a bare ';' in the command line as its
  // tab/pane separator (splitting into a second wt subcommand), even
  // though this whole string is one argv slot for pwsh's -Command — so a
  // newline is used here instead of ';' to join the two statements.
  const command = `Set-Location -LiteralPath '${escaped}'\nclaude`;
  spawn("wt.exe", ["pwsh", "-NoExit", "-Command", command], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

class HvSidenavView extends ItemView {
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Hub Vault"; }
  getIcon() { return "layout-grid"; }

  async onOpen() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("hv-sidenav-root");
    this.rootEl = root;

    await this.renderNav(root);
    this.setupFlyout(root);

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.updateActiveState();
      })
    );
    this.updateActiveState();

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file.path === PROJECTS_INDEX_PATH) this.renderNav(this.rootEl);
      })
    );

    this.registerDomEvent(window, "resize", () => {
      this.updateCollapsedState(window.innerWidth);
    });
    this.updateCollapsedState(window.innerWidth);
  }

  onClose() {
    this.collapseFlyout();
    this.flyoutEl?.remove();
  }

  updateCollapsedState(width) {
    // Hysteresis band avoids feedback: collapsing shrinks the sidebar and
    // grows the content pane, but width here is the window width, which
    // the collapse action doesn't itself affect — so this is just belt
    // and suspenders against any other transient layout jitter.
    const isCollapsed = this.rootEl?.hasClass("is-collapsed");
    if (!isCollapsed && width < COLLAPSE_AT) {
      this.rootEl?.addClass("is-collapsed");
    } else if (isCollapsed && width > EXPAND_AT) {
      this.rootEl?.removeClass("is-collapsed");
    }
  }

  setupFlyout(root) {
    root.addEventListener("mouseenter", () => {
      if (root.hasClass("is-collapsed")) this.expandFlyout();
    });
    root.addEventListener("mouseleave", () => {
      if (!this.flyoutEl?.matches(":hover")) this.collapseFlyout();
    });
  }

  expandFlyout() {
    if (this.flyoutEl) return;
    const rect = this.rootEl.getBoundingClientRect();
    const flyout = document.createElement("div");
    flyout.className = "hv-sidenav-flyout";
    flyout.style.top = `${rect.top}px`;
    flyout.style.left = `${rect.left}px`;
    flyout.style.bottom = `${window.innerHeight - rect.bottom}px`;
    flyout.addEventListener("mouseleave", () => this.collapseFlyout());
    document.body.appendChild(flyout);
    flyout.appendChild(this.navEl);
    this.flyoutEl = flyout;
  }

  collapseFlyout() {
    if (!this.flyoutEl) return;
    this.rootEl.appendChild(this.navEl);
    this.flyoutEl.remove();
    this.flyoutEl = null;
  }

  async renderNav(root) {
    const projectItems = await parseProjectsIndex(this.app);
    let cfg = {};
    try { cfg = JSON.parse(await this.app.vault.adapter.read(".vault-meta/hub-config.json")); } catch (e) {}
    const vaultItems = (cfg.vaults ?? []).map(v => ({ icon: "vault", label: v.label, path: v.path }));
    const sections = [
      STATIC_NAV_SECTIONS[0],
      { label: "Projects", items: projectItems },
      ...(vaultItems.length ? [{ label: "Vaults", items: vaultItems }] : []),
      ...STATIC_NAV_SECTIONS.slice(1),
    ];

    // Re-render replaces the old nav element in place (it may currently
    // live in the flyout rather than root if the sidebar is collapsed).
    const previousNav = this.navEl;
    const parent = previousNav?.parentElement ?? root;

    this.navItems = [];
    const nav = document.createElement("div");
    nav.className = "hv-nav";
    this.navEl = nav;
    for (const section of sections) {
      const label = document.createElement("div");
      label.textContent = section.label;
      label.className = "hv-nav-section-label";
      nav.appendChild(label);
      for (const entry of section.items) {
        if (entry.isGroup) {
          nav.appendChild(this.buildGroupEl(entry));
        } else {
          nav.appendChild(this.buildItemEl(entry));
        }
      }
    }

    if (previousNav) {
      parent.replaceChild(nav, previousNav);
    } else {
      parent.appendChild(nav);
    }
    this.updateActiveState();
  }

  buildItemEl(entry, isChild) {
    const item = document.createElement("div");
    item.className = isChild ? "hv-nav-item hv-nav-item-child" : "hv-nav-item";
    const iconWrap = document.createElement("span");
    iconWrap.className = "hv-nav-icon";
    iconWrap.innerHTML = ICONS[entry.icon];
    if (ICON_COLORS[entry.icon]) iconWrap.style.color = ICON_COLORS[entry.icon];
    item.appendChild(iconWrap);
    const labelSpan = document.createElement("span");
    labelSpan.textContent = entry.label;
    labelSpan.className = "hv-nav-label";
    item.appendChild(labelSpan);
    if (entry.folderPath) {
      const termBtn = document.createElement("span");
      termBtn.className = "hv-nav-term-btn";
      termBtn.innerHTML = ICONS.terminal;
      termBtn.setAttribute("aria-label", `Open terminal in ${entry.label}`);
      termBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openExternalTerminal(entry.folderPath);
      });
      item.appendChild(termBtn);
    }
    item.addEventListener("click", () =>
      this.app.workspace.openLinkText(entry.path, "", false)
    );
    this.navItems.push({ el: item, path: entry.path });
    return item;
  }

  // A group has no note of its own to open — clicking it only toggles
  // its children's visibility, mirroring a folder row in a file tree.
  buildGroupEl(entry) {
    const wrap = document.createElement("div");
    wrap.className = "hv-nav-group is-open";

    const header = document.createElement("div");
    header.className = "hv-nav-item hv-nav-group-header";
    const chevron = document.createElement("span");
    chevron.className = "hv-nav-chevron";
    chevron.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    header.appendChild(chevron);
    const iconWrap = document.createElement("span");
    iconWrap.className = "hv-nav-icon";
    iconWrap.innerHTML = ICONS[entry.icon];
    if (ICON_COLORS[entry.icon]) iconWrap.style.color = ICON_COLORS[entry.icon];
    header.appendChild(iconWrap);
    const labelSpan = document.createElement("span");
    labelSpan.textContent = entry.label;
    labelSpan.className = "hv-nav-label";
    header.appendChild(labelSpan);
    header.addEventListener("click", () => wrap.classList.toggle("is-open"));
    wrap.appendChild(header);

    const childrenEl = document.createElement("div");
    childrenEl.className = "hv-nav-group-children";
    for (const child of entry.children) {
      childrenEl.appendChild(this.buildItemEl(child, true));
    }
    wrap.appendChild(childrenEl);

    return wrap;
  }

  updateActiveState() {
    const activePath = this.app.workspace.getActiveFile()?.path;
    for (const { el, path } of this.navItems) {
      el.toggleClass("active", activePath === `${path}.md`);
    }
  }
}

module.exports = class HvSidenavPlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => new HvSidenavView(leaf));
    this.app.workspace.onLayoutReady(() => {
      this.activateView();
      this.injectTopbar();
    });
  }

  onunload() {
    const wrapper = this.topbarEl?.parentElement;
    if (wrapper?.classList.contains("hv-root-wrapper")) {
      const rootEl = this.app.workspace.rootSplit.containerEl;
      wrapper.parentElement.insertBefore(rootEl, wrapper);
      rootEl.style.flex = "";
      rootEl.style.minHeight = "";
      wrapper.remove();
    } else {
      this.topbarEl?.remove();
    }
  }

  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeftLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  injectTopbar() {
    if (this.topbarEl?.isConnected) return;
    const bar = document.createElement("div");
    bar.className = "hv-main-topbar";

    const left = bar.createDiv({ cls: "hv-topbar-left" });
    const d = moment();
    left.createEl("span", { text: d.format("dddd, MMMM D, YYYY"), cls: "hv-topbar-date" });
    left.createEl("span", { text: d.format("[Week] W"), cls: "hv-topbar-week" });

    const right = bar.createDiv({ cls: "hv-topbar-right" });
    this.renderTerminalButton(right);
    this.renderNewNoteButton(right);
    right.createEl("a", { text: "+ New Task", cls: "hv-topbar-btn hv-topbar-primary" })
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.app.workspace.openLinkText("Journal/Journal", "", false);
      });

    // rootSplit.containerEl (.workspace-split.mod-root) is a flex ROW item
    // sharing its parent (.workspace) with the left/right sidebar splits —
    // both inserting inside it (prior bug) and inserting beside it in its
    // parent produce a vertical strip, since either way the bar becomes
    // another column in that row. Wrap rootSplit in a self-contained
    // flex-column div instead, so stacking the bar above it doesn't depend
    // on the ambient layout direction of any ancestor.
    const rootEl = this.app.workspace.rootSplit.containerEl;
    if (rootEl.parentElement.classList.contains("hv-root-wrapper")) {
      // already wrapped from a previous load; reuse the wrapper
      rootEl.parentElement.prepend(bar);
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "hv-root-wrapper";
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.height = "100%";
      wrapper.style.width = "100%";
      wrapper.style.minWidth = "0";
      rootEl.style.flex = "1 1 auto";
      rootEl.style.minHeight = "0";
      rootEl.parentElement.insertBefore(wrapper, rootEl);
      wrapper.appendChild(bar);
      wrapper.appendChild(rootEl);
    }
    this.topbarEl = bar;
  }

  renderTerminalButton(right) {
    const TERMINAL_VIEW = "terminal-view";
    const terminalAgents = [
      { label: "Claude", command: "claude" },
      { label: "Cursor", command: "agent" },
    ];
    const openTerminalWithAgent = async (command) => {
      const plugin = this.app.plugins.plugins["lean-terminal"];
      const adapter = this.app.vault.adapter;
      const cwd = adapter?.getBasePath?.() ?? "";
      const opts = { resumeCommand: command, cwd };
      const leaves = this.app.workspace.getLeavesOfType(TERMINAL_VIEW);
      if (leaves.length > 0) {
        const tabManager = leaves[0].view.getTabManager?.();
        if (tabManager) {
          tabManager.createTab(opts);
          this.app.workspace.revealLeaf(leaves[0]);
          return;
        }
      }
      if (!plugin) {
        this.app.commands.executeCommandById("lean-terminal:open-terminal");
        return;
      }
      let leaf;
      switch (plugin.settings.defaultLocation) {
        case "right": leaf = this.app.workspace.getRightLeaf(false); break;
        case "tab": leaf = this.app.workspace.getLeaf("tab"); break;
        case "split-right": leaf = this.app.workspace.getLeaf("split", "vertical"); break;
        default: leaf = this.app.workspace.getLeaf("split", "horizontal");
      }
      if (!leaf) return;
      await leaf.setViewState({ type: TERMINAL_VIEW, active: true });
      this.app.workspace.revealLeaf(leaf);
      const tabManager = leaf.view.getTabManager?.();
      if (tabManager) {
        tabManager.destroyAll(false);
        tabManager.createTab(opts);
      }
    };

    const termBtn = right.createEl("a", { text: "> Terminal ▾", cls: "hv-topbar-btn hv-topbar-ghost" });
    const closeAgentMenu = (menu) => {
      menu?.remove();
      termBtn.classList.remove("hv-menu-open");
      termBtn.style.backgroundColor = "";
    };
    termBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const existing = document.querySelector(".hv-terminal-agent-menu");
      if (existing) { closeAgentMenu(existing); return; }
      const menu = document.createElement("div");
      menu.className = "hv-terminal-agent-menu";
      const rect = termBtn.getBoundingClientRect();
      menu.style.top = `${Math.round(rect.bottom) - 1}px`;
      menu.style.left = `${Math.round(rect.left)}px`;
      menu.style.width = `${Math.round(rect.width)}px`;
      const btnStyle = getComputedStyle(termBtn);
      const border = btnStyle.borderRightColor;
      menu.style.borderRightColor = border;
      menu.style.borderBottomColor = border;
      menu.style.borderLeftColor = border;
      menu.style.setProperty("--hv-menu-divider", border);
      const bg = getComputedStyle(this.topbarEl).backgroundColor;
      menu.style.backgroundColor = bg;
      termBtn.style.backgroundColor = bg;
      for (const agent of terminalAgents) {
        const item = document.createElement("button");
        item.className = "hv-terminal-agent-menu-item";
        item.textContent = agent.label;
        item.addEventListener("click", async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          closeAgentMenu(menu);
          await openTerminalWithAgent(agent.command);
        });
        menu.appendChild(item);
      }
      document.body.appendChild(menu);
      termBtn.classList.add("hv-menu-open");
      requestAnimationFrame(() => {
        const onOutside = (ev) => {
          if (!menu.contains(ev.target) && ev.target !== termBtn) {
            closeAgentMenu(menu);
            document.removeEventListener("click", onOutside, true);
          }
        };
        document.addEventListener("click", onOutside, true);
      });
    });
  }

  renderNewNoteButton(right) {
    const newNoteBtn = right.createEl("a", { text: "+ New Note", cls: "hv-topbar-btn hv-topbar-ghost" });
    newNoteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const overlay = document.createElement("div");
      overlay.className = "hv-modal-overlay";
      overlay.innerHTML = `<div class="hv-modal"><div class="hv-modal-header">New Note</div><input class="hv-modal-title" type="text" placeholder="Title" /><textarea class="hv-modal-body" placeholder="Start writing..."></textarea><div class="hv-modal-actions"><button class="hv-modal-cancel">Cancel</button><button class="hv-modal-save">Save</button></div></div>`;
      document.body.appendChild(overlay);
      const titleEl = overlay.querySelector(".hv-modal-title");
      const bodyEl = overlay.querySelector(".hv-modal-body");
      titleEl.focus();
      const close = () => overlay.remove();
      overlay.querySelector(".hv-modal-cancel").addEventListener("click", close);
      overlay.addEventListener("click", (ev) => { if (ev.target === overlay) close(); });
      overlay.querySelector(".hv-modal-save").addEventListener("click", async () => {
        const name = titleEl.value.trim() || "Untitled";
        const path = "Notes/" + name + ".md";
        const existing = this.app.vault.getAbstractFileByPath(path);
        const file = existing ?? await this.app.vault.create(path, bodyEl.value);
        close();
        await this.app.workspace.getLeaf().openFile(file);
      });
    });
  }
};
