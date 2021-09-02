Hooks.on("renderSidebarTab", (doc, html) => {
    if (doc.tabName === "macros") {
        // Move Macros directory to sidebar
        html[0].style.display = ""; // So that it is displayed properly and not all of the time
        document.querySelector("#sidebar").append(html[0]);

        // Create Macros tab
        const tab = document.createElement("a");
        tab.classList.add("item");
        tab.title = "Macros";
        tab.dataset.tab = "macros";

        // Add icon for tab
        const icon = document.createElement("i");
        icon.classList.add("fas")
        icon.classList.add("fa-code");
        tab.append(icon);

        // Add Macro tab to sidebar before compendiums
        document.querySelector("#sidebar-tabs > [data-tab='compendium']").before(tab);

        // Resize sidebar to leave room for the additional tab
        document.querySelector("#sidebar").style.width = "330px";
    };
});
