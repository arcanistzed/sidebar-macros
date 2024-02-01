const SM = {
	ID: "sidebar-macros",
};

// Register settings
Hooks.on("init", () => {
	game.settings.register(SM.ID, "hideMacroHotbar", {
		name: "sidebar-macros.settings.hideMacroHotbar.Name",
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {
			ui.hotbar.render();
		},
	});

	game.settings.register(SM.ID, "clickExecute", {
		name: "sidebar-macros.settings.clickExecute.name",
		hint: "sidebar-macros.settings.clickExecute.hint",
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {
			ui.macros.render();
		},
	});

	game.settings.register(SM.ID, "hideDirectoryButton", {
		name: "sidebar-macros.settings.hideDirectoryButton.name",
		hint: "sidebar-macros.settings.hideDirectoryButton.hint",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: () => {
			ui.hotbar.render();
		},
	});
});

// Hook into the sidebar rendering
Hooks.on("renderSidebar", (_app, html) => {
	// Calculate new tab width
	html[0]
		.querySelector("#sidebar-tabs")
		.style.setProperty(
			"--sidebar-tab-width",
			`${Math.floor(
				parseInt(getComputedStyle(html[0]).getPropertyValue("--sidebar-width")) /
					(document.querySelector("#sidebar-tabs").childElementCount + 1)
			)}px`
		);

	// Create Macro tab
	createTab();
});

// Hook into the sidebar tab rendering
Hooks.on("renderSidebarTab", (doc, html) => {
	// If we are rendering the "macros" sidebar tab
	if (doc.tabName === "macros" && !doc.popOut) {
		// Create the Macro directory
		createDirectory(html[0]);
	}
});

// Hook into the macro hotbar rendering
Hooks.on("renderHotbar", (_app, html) => {
	// Remove default Macro directory button
	const directory = html[0].querySelector("#macro-directory, #custom-macro-directory");

	if (directory && game.settings.get(SM.ID, "hideDirectoryButton")) directory.style.display = "none";
	else
		directory.addEventListener(
			"click",
			event => {
				event.preventDefault();
				event.stopImmediatePropagation();
				ui.sidebar.activateTab("macros");
			},
			true
		);

	// If enabled, hide the hotbar
	if (game.settings.get(SM.ID, "hideMacroHotbar")) html[0].style.display = "none";
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
	tab.dataset.tab = "macros";
	tab.dataset.tooltip = "DOCUMENT.Macros";

	// Add a title if tooltips don't exist
	if (!("tooltip" in game)) tab.title = "Macros";

	// Add icon for tab
	const icon = document.createElement("i");
	icon.setAttribute("class", CONFIG.Macro.sidebarIcon);
	tab.append(icon);

	// Add Macro tab to sidebar before compendiums if it's not already there
	if (!document.querySelector("#sidebar-tabs > [data-tab='macros']"))
		document.querySelector("#sidebar-tabs > [data-tab='compendium']").before(tab);
};

// Override default macro class as the UI for macros
Hooks.on("init", () => (CONFIG.ui.macros = MacroSidebarDirectory));

// The following code up to line 110 was mostly taken from `foundry.js` to ensure that this module works and is licensed under the Foundry Virtual Tabletop Limited License Agreement for module development
/**
 * The directory, displayed in the Sidebar, which organizes and displays world-level Macro documents.
 * @extends {DocumentDirectory}
 *
 * @see {MacroDirectory}  The Macro Directory not displayed in the Sidebar
 * @see {Macros}          The WorldCollection of Macro Entities
 * @see {Macro}           The Macro Entity
 * @see {MacroConfig}     The Macro Configuration Sheet
 */
class MacroSidebarDirectory extends DocumentDirectory {
	/** @override */
	static documentName = "Macro";

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		if (game.settings.get(SM.ID, "clickExecute"))
			html[0].querySelectorAll(".directory-list .thumbnail, .directory-list .profile").forEach(el => {
				el.classList.add("sidebar-macros-execute");
				el.addEventListener("click", this._onClickThumbnail.bind(this));
			});
	}

	/** @override */
	_getEntryContextOptions() {
		let options = super._getEntryContextOptions();
		return [
			{
				name: "Execute",
				icon: `<i class="fas fa-terminal"></i>`,
				condition: data => {
					const macro = game.macros.get(data[0].dataset.entityId || data[0].dataset.documentId);
					return macro.canExecute;
				},
				callback: data => {
					const macro = game.macros.get(data[0].dataset.entityId || data[0].dataset.documentId);
					macro.execute();
				},
			},
		].concat(options);
	}

	/**
	 * Handle clicking on a Document thumbnail in the Macro Sidebar directory
	 * @param {Event} event   The originating click event
	 * @protected
	 */
	_onClickThumbnail(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const documentId = element.parentElement.dataset.documentId ?? element.parentElement.dataset.entityId;
		const document = this.collection.get(documentId);
		document.execute();
	}
}
globalThis.MacroSidebarDirectory = MacroSidebarDirectory;

// Call default render hook
Hooks.on("renderMacroSidebarDirectory", (...args) => Hooks.callAll("renderMacroDirectory", ...args));
