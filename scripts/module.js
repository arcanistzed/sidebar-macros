// Hook into the sidebar tab rendering
Hooks.on("renderSidebarTab", (doc, html) => {
    // If we are rendering the "macros" sidebar tab
    if (doc.tabName === "macros") {
        // Create the Macro directory
        createDirectory(html[0]);

        // Remove default Macro directory button
        document.querySelector("#macro-directory").style.display = "none";
    };
});

// Update appearance whenever the sidebar is expanded or collapsed
Hooks.on("collapseSidebar", (_sidebar, collapsed) => onCollapse(collapsed));

// Adjust the sidebar appearance initially as un-collapsed
Hooks.on("renderSidebar", () => onCollapse(false));

/**
 * Executes whenever the sidebar is collapsed or expanded
 * @param {Boolean} collapsed - Whether the sidebar is collapsed or not
 */
const onCollapse = collapsed => {
    if (collapsed) {
        // Resize collapsed sidebar to leave room for the additional icon
        document.querySelector("#sidebar").style.height = "auto";

        // Make sure it's narrow again
        document.querySelector("#sidebar").style.width = "30px";
    } else {
        // Resize sidebar to leave room for the additional tab if GM
        if (game.user.isGM) document.querySelector("#sidebar").style.width = "330px";
    };
};

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
Hooks.on("setup", () => CONFIG.ui.macros = MacroSidebarDirectory);


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
