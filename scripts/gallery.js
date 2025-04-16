document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenContent = document.getElementById('fullscreen-content');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const imageDescription = document.getElementById('image-description');

    const repoOwner = 'elouangrimm';
    const repoName = 'photos';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

    let imagesData = []; // Store { src, description, element }
    let currentIndex = -1;

    // --- Fetch images from GitHub ---
    async function fetchImages() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
            }
            const files = await response.json();

            const imageFiles = files.filter(file =>
                file.type === 'file' && /\.(jpe?g|png|gif|webp)$/i.test(file.name)
            );

            if (imageFiles.length === 0) {
                gallery.innerHTML = '<p>Images failed loading! :( <br> The repo is empty!</p>';
                return;
            }

            gallery.innerHTML = ''; // Clear loading message

            // Create gallery items and store data
            imageFiles.forEach((file, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = file.download_url;
                imgElement.alt = file.name;
                imgElement.loading = 'lazy'; // Lazy load gallery images

                // Store data before adding listener
                const imageData = {
                    src: file.download_url,
                    description: `Getting description for ${file.name}...`, // Placeholder
                    element: imgElement,
                    fileName: file.name
                };
                imagesData.push(imageData);

                imgElement.addEventListener('click', () => {
                    currentIndex = index;
                    openFullscreen(imageData);
                });

                gallery.appendChild(imgElement);

                // Fetch EXIF data asynchronously for this image
                fetchExifDescription(imageData);
            });

        } catch (error) {
            console.error('Error fetching images:', error);
            gallery.innerHTML = `<p>Error loading images: ${error.message}. Check the console!!!</p>`;
        }
    }

    // --- Fetch EXIF Description ---
    async function fetchExifDescription(imageData) {
        try {
            // Fetch the image as a blob to read EXIF
            const response = await fetch(imageData.src);
            if (!response.ok) throw new Error(`Failed to fetch image for EXIF: ${response.status}`);
            const blob = await response.blob();

            // Use exif-js to get EXIF data
            EXIF.getData(blob, function() {
                const description = EXIF.getTag(this, "image_description");
                imageData.description = description || ''; // Store description or empty string

                // If this image is currently displayed fullscreen, update the description
                if (imagesData[currentIndex] === imageData && fullscreenOverlay.style.display !== 'none') {
                     imageDescription.textContent = imageData.description;
                }
            });
        } catch (error) {
            console.warn(`Could not fetch/read EXIF for ${imageData.fileName}:`, error);
            imageData.description = ''; // Set description to empty on error
             if (imagesData[currentIndex] === imageData && fullscreenOverlay.style.display !== 'none') {
                 imageDescription.textContent = ''; // Clear description on error
             }
        }
    }


    // --- Open Fullscreen ---
    function openFullscreen(imageData) {
        fullscreenImage.src = imageData.src;
        fullscreenImage.alt = imageData.fileName;
        imageDescription.textContent = imageData.description || 'Loading...'; // Show placeholder or fetched description
        fullscreenOverlay.style.display = 'flex'; // Use flex to enable centering
        document.body.classList.add('fullscreen-open'); // Prevent body scroll
        document.addEventListener('keydown', handleKeydown);

        // Scroll content area to top when opening a new image
        fullscreenContent.scrollTop = 0;
    }

    // --- Close Fullscreen ---
    function closeFullscreen() {
        fullscreenOverlay.style.display = 'none';
        fullscreenImage.src = ''; // Clear src to stop loading potentially large image
        imageDescription.textContent = '';
        document.body.classList.remove('fullscreen-open'); // Allow body scroll again
        document.removeEventListener('keydown', handleKeydown);
        currentIndex = -1; // Reset index
    }

    // --- Show Image by Index (for navigation) ---
    function showImageAtIndex(index) {
        if (index < 0 || index >= imagesData.length) return; // Bounds check

        currentIndex = index;
        const imageData = imagesData[currentIndex];
        fullscreenImage.src = imageData.src;
        fullscreenImage.alt = imageData.fileName;
        imageDescription.textContent = imageData.description || ''; // Show already fetched description or empty

        // Ensure EXIF data is fetched if it wasn't already (might happen on rapid navigation)
        if (imageData.description.startsWith('Loading description')) {
            fetchExifDescription(imageData); // Re-trigger fetch if needed
        }

        // Scroll content area to top when changing image
        fullscreenContent.scrollTop = 0;
    }


    // --- Event Handlers ---
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeFullscreen();
        } else if (event.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % imagesData.length; // Wrap around
            showImageAtIndex(nextIndex);
        } else if (event.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + imagesData.length) % imagesData.length; // Wrap around
            showImageAtIndex(prevIndex);
        }
    }

    // Close overlay when clicking outside the content area
    fullscreenOverlay.addEventListener('click', (event) => {
        // Check if the click is directly on the overlay, not its children
        if (event.target === fullscreenOverlay) {
            closeFullscreen();
        }
    });

    // --- Initialize ---
    fetchImages();
});