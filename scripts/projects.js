document.addEventListener("DOMContentLoaded", () => {
    const projectsGrid = document.getElementById("projects-grid");
    const projectsDataUrl = "../projects/projects.json"; // Path to your JSON file

    async function loadProjects() {
        try {
            const response = await fetch(projectsDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();

            projectsGrid.innerHTML = ""; // Clear loading message

            if (!Array.isArray(projects) || projects.length === 0) {
                projectsGrid.innerHTML =
                    "<p>No projects found or data is invalid.</p>";
                console.warn(
                    "Projects data is not an array or is empty:",
                    projects
                );
                return;
            }

            projects.forEach((project) => {
                // Basic validation for essential fields
                if (
                    !project.title ||
                    !project.description ||
                    !project.imageUrl ||
                    !project.linkUrl
                ) {
                    console.warn(
                        "Skipping project due to missing essential data:",
                        project
                    );
                    return; // Skip creating card if essential data is missing
                }
                const card = createProjectCard(project);
                projectsGrid.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching or parsing projects:", error);
            projectsGrid.innerHTML = `<p class="error-message">Could not load projects. ${error.message}</p>`;
        }
    }

    function createProjectCard(project) {
        // The card is a link that wraps everything
        const cardLink = document.createElement("a");
        cardLink.href = project.linkUrl;
        cardLink.target = "_blank";
        cardLink.rel = "noopener noreferrer";
        cardLink.className = "project-card";
        // Add a title attribute for accessibility and native tooltips
        cardLink.title = `View project: ${project.title}`;

        // The background image
        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = `Cover image for ${project.title}`;
        img.className = "project-image";
        img.loading = "lazy";

        // The overlay div that holds all text content
        const overlayDiv = document.createElement("div");
        overlayDiv.className = "project-overlay";

        // The title
        const title = document.createElement("h3");
        title.className = "project-title";
        title.textContent = project.title;

        // The description
        const description = document.createElement("p");
        description.className = "project-description";
        description.textContent = project.description;

        // The container for tags
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "project-tags-container";

        // Check for tags and create them (this logic is still good)
        if (
            project.tags &&
            typeof project.tags === "string" &&
            project.tags.trim() !== ""
        ) {
            project.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag)
                .forEach((tagText) => {
                    const tagElement = document.createElement("span");
                    tagElement.className = "project-tag";
                    tagElement.textContent = tagText;
                    tagsContainer.appendChild(tagElement);
                });
        }

        // --- Assemble the card ---

        // 1. Add content to the overlay
        overlayDiv.appendChild(title);
        overlayDiv.appendChild(description);
        if (tagsContainer.hasChildNodes()) {
            overlayDiv.appendChild(tagsContainer);
        }

        // 2. Add the image and the overlay to the main link/card
        cardLink.appendChild(img);
        cardLink.appendChild(overlayDiv);

        return cardLink;
    }

    // Initialize
    loadProjects();
});
