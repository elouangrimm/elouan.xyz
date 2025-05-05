document.addEventListener('DOMContentLoaded', () => {
    const projectsGrid = document.getElementById('projects-grid');
    const projectsDataUrl = '../projects/projects.json'; // Path to your JSON file

    async function loadProjects() {
        try {
            const response = await fetch(projectsDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();

            projectsGrid.innerHTML = ''; // Clear loading message

            if (!Array.isArray(projects) || projects.length === 0) {
                projectsGrid.innerHTML = '<p>No projects found or data is invalid.</p>';
                console.warn("Projects data is not an array or is empty:", projects);
                return;
            }

            projects.forEach(project => {
                // Basic validation for essential fields
                if (!project.title || !project.description || !project.imageUrl || !project.linkUrl) {
                    console.warn("Skipping project due to missing essential data:", project);
                    return; // Skip creating card if essential data is missing
                }
                const card = createProjectCard(project);
                projectsGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching or parsing projects:', error);
            projectsGrid.innerHTML = `<p class="error-message">Could not load projects. ${error.message}</p>`;
        }
    }

    function createProjectCard(project) {
        const cardLink = document.createElement('a');
        cardLink.href = project.linkUrl;
        cardLink.target = '_blank';
        cardLink.rel = 'noopener noreferrer';
        cardLink.className = 'project-card';

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = `Cover image for ${project.title}`;
        img.className = 'project-image';
        img.loading = 'lazy';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'project-content';

        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.title;

        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = project.description;

        // --- Add Tags ---
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'project-tags-container';

        // Check if tags exist and are a non-empty string
        if (project.tags && typeof project.tags === 'string' && project.tags.trim() !== '') {
            const tagsArray = project.tags.split(',') // Split the string by comma
                                      .map(tag => tag.trim()) // Remove leading/trailing spaces from each tag
                                      .filter(tag => tag !== ''); // Remove any empty tags resulting from multiple commas etc.

            tagsArray.forEach(tagText => {
                const tagElement = document.createElement('span'); // Use span for inline elements
                tagElement.className = 'project-tag';
                tagElement.textContent = tagText;
                tagsContainer.appendChild(tagElement); // Add the tag span to the container
            });
        }
        // --- End Add Tags ---


        // Append elements to content container
        contentDiv.appendChild(title);
        contentDiv.appendChild(description);
        // Append tags container only if it actually contains tags
        if (tagsContainer.hasChildNodes()) {
             contentDiv.appendChild(tagsContainer);
        }


        // Append image and content container to the card link
        cardLink.appendChild(img);
        cardLink.appendChild(contentDiv);

        return cardLink;
    }

    // Initialize
    loadProjects();
});