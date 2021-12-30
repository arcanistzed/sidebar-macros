// Register settings
Hooks.on("init", () => {
    game.settings.register("sidebar-macros", "hideMacroHotbar", {
        name: game.i18n.localize("sidebar-macros.settings.hideMacroHotbar.Name"),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => { ui.hotbar.render() },
    });
});

// Hook into the sidebar rendering
Hooks.on("renderSidebar", (_app, html) => {
    // Add CSS variables if not v9
    if ((game.version && !isNewerVersion(game.version, 9)) ?? true) {
        html[0].style.setProperty("--sidebar-width", getComputedStyle(html[0]).width);
        html[0].querySelectorAll("#sidebar-tabs > .item ").forEach(el => el.style.flex = "0 0 var(--sidebar-tab-width)");
    };

    // Calculate new tab width
    html[0].querySelector("#sidebar-tabs").style.setProperty("--sidebar-tab-width",
        Math.floor(parseInt(getComputedStyle(html[0]).getPropertyValue("--sidebar-width")) / (document.querySelector("#sidebar-tabs").childElementCount + 1)) - 1 + "px");

    // Create Macro tab
    createTab();
});

// Hook into the sidebar tab rendering
Hooks.on("renderSidebarTab", (doc, html) => {
    // If we are rendering the "macros" sidebar tab
    if (doc.tabName === "macros") {
        // Create the Macro directory
        createDirectory(html[0]);
    };
});

// Hook into the macro hotbar rendering
Hooks.on("renderHotbar", (_app, html) => {
    // Remove default Macro directory button
    html[0].querySelector("#macro-directory").style.display = "none";

    // If enabled, hide the hotbar
    if (game.settings.get("sidebar-macros", "hideMacroHotbar")) html[0].style.display = "none";
});

/**
 * Create the Macro directory in the sidebar
 * @param {HTMLElement} html - The html element of the Macro sidebar tab
 */
const createDirectory = html => {

    // Move Macros directory to sidebar if there isn't already one there
    if (document.querySelectorAll("#macros").length <= 1) document.querySelector("#sidebar").append(html);

    document.querySelector("#macros").classList.add("tab");

    // Make the directory display properly and not all of the time
    html.style.display = "";
};

/**
 * Create the Macro tab in the sidebar
 */
const createTab = () => {
    // Create Macros tab
    const tab = document.createElement("a");
    tab.classList.add("item");
    tab.title = "Macros";
    tab.dataset.tab = "macros";

    // Add icon for tab
    const icon = document.createElement("i");
    icon.setAttribute("class", CONFIG.Macro.sidebarIcon);
    tab.append(icon);

    // Add Macro tab to sidebar before compendiums if it's not already there
    if (!document.querySelector("#sidebar-tabs > [data-tab='macros']")) document.querySelector("#sidebar-tabs > [data-tab='compendium']").before(tab);
};

// Override default macro class as the UI for macros
Hooks.on("init", () => CONFIG.ui.macros = MacroSidebarDirectory);

// Register with Permission Viewer
Hooks.on('renderMacroSidebarDirectory', (...args) => {
    if (game.modules.get("permission_viewer")?.active) {
        PermissionViewer.directoryRendered(...args);
    };
});


// The following code was largely taken from `foundry.js` to ensure that this module works and is licensed under the Foundry Virtual Tabletop Limited License Agreement for module development
/**
 * The directory, displayed in the Sidebar, which organizes and displays world-level Macro documents.
 * @extends {SidebarDirectory}
 *
 * @see {@link MacroDirectory}  The Macro Directory not displayed in the Sidebar
 * @see {@link Macros}          The WorldCollection of Macro Entities
 * @see {@link Macro}           The Macro Entity
 * @see {@link MacroConfig}     The Macro Configuration Sheet
 */
class MacroSidebarDirectory extends SidebarDirectory {
    constructor(options = {}) {
        super(options);
        ui.sidebar.tabs.macros = this;
        game.macros.apps.push(this);
    }

    /** @override */
    static documentName = "Macro";
}

MacroSidebarDirectory.prototype._getEntryContextOptions = function newMacroContext() {
    const options = SidebarDirectory.prototype._getEntryContextOptions.call(this);
    return [
        {
            name: "Execute",
            icon: `<i class="fas fa-terminal"></i>`,
            condition: li => {
                const macro = game.macros.get(li.data("entityId"));
                return macro.data.img !== CONST.DEFAULT_TOKEN;
            },
            callback: li => {
                const macro = game.macros.get(li.data("entityId"));
                macro.execute();
            }
        }
    ].concat(options);
}
