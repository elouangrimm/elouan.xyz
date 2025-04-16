document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenContent = document.getElementById('fullscreen-content');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const imageDescription = document.getElementById('image-description');

    const repoOwner = 'elouangrimm';
    const repoName = 'photos';
    const branch = 'main';
    const repoRootUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;
    const rawBaseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;

    let imagesData = []; // Store { src, description, element }
    let currentIndex = -1;

    async function fetchImages() {
        try {
            console.log("Fetching repository contents from:", repoRootUrl);
            const response = await fetch(repoRootUrl); // Fetch root directory contents
            console.log("GitHub API response status:", response.status, response.statusText);

            if (!response.ok) {
                let errorBody = 'Could not read error body.';
                try { errorBody = await response.text(); } catch (e) { /* ignore */ }
                console.error("GitHub API Error Response Body:", errorBody);
                throw new Error(`GitHub API Error: ${response.status} ${response.statusText}.`);
            }

            const files = await response.json();
            console.log("Raw file list received:", files);

            const imageFiles = files.filter(file =>
                file.type === 'file' && /\.(jpe?g|png|gif|webp)$/i.test(file.name)
            );
            console.log("Filtered image files:", imageFiles);

            if (imageFiles.length === 0) {
                gallery.innerHTML = '<p>No images found in the repository root (after filtering).</p>';
                return;
            }

            gallery.innerHTML = ''; // Clear loading message

            // --- Process each image file ---
            imageFiles.forEach((file, index) => {
                const fileName = file.name;
                const fullResUrl = rawBaseUrl + fileName;
                const previewUrl = rawBaseUrl + 'previews/' + fileName;

                const imgElement = document.createElement('img');
                imgElement.alt = fileName; // Set alt text immediately
                imgElement.loading = 'lazy'; // Still lazy load grid images

                // Initial placeholder background (optional)
                imgElement.style.backgroundColor = 'var(--stone-800)';

                // Store comprehensive data
                const imageData = {
                    previewUrl: previewUrl,
                    fullResUrl: fullResUrl,
                    description: `Loading description for ${fileName}...`,
                    element: imgElement,
                    fileName: fileName,
                    hasTriedPreview: false, // Flag to track if preview check completed
                    hasPreview: false      // Flag indicating if preview was successfully loaded
                };
                imagesData.push(imageData); // Store data early

                // Append element to DOM *before* setting src for preview check
                gallery.appendChild(imgElement);

                // --- Add click listener (refers to imageData in closure) ---
                imgElement.addEventListener('click', () => {
                    // Find the index again based on the element, in case order changes later
                    const clickedIndex = imagesData.findIndex(item => item.element === imgElement);
                    if (clickedIndex !== -1) {
                         currentIndex = clickedIndex;
                         openFullscreen(imagesData[currentIndex]);
                    } else {
                        console.error("Could not find image data for clicked element:", imgElement);
                    }
                });

                // --- Asynchronously check for preview and set src ---
                checkAndLoadPreview(imageData, imgElement);
            });

        } catch (error) {
            console.error('Error caught in fetchImages:', error);
            gallery.innerHTML = `<p>Error loading images: ${error.message}. Check console.</p>`;
        }
    }

    // --- Function to check for preview, load it or fallback, then fetch EXIF ---
    function checkAndLoadPreview(imageData, imgElement) {
        const previewTester = new Image(); // Use temporary Image object to test loading

        previewTester.onload = () => {
            // Preview exists and loaded successfully
            console.log(`Preview found for ${imageData.fileName}`);
            imgElement.src = imageData.previewUrl; // Use preview URL for the grid image
            imageData.hasPreview = true;
            imageData.hasTriedPreview = true;
            fetchExifDescription(imageData); // Fetch EXIF (always from full-res)
        };

        previewTester.onerror = () => {
            // Preview doesn't exist or failed to load (e.g., 404)
            console.log(`Preview not found/failed for ${imageData.fileName}, using full resolution.`);
            imgElement.src = imageData.fullResUrl; // Use full-res URL as fallback for the grid
            imageData.hasPreview = false;
            imageData.hasTriedPreview = true;
            fetchExifDescription(imageData); // Fetch EXIF (always from full-res)
        };

        // Start loading the preview image (after handlers are set)
        previewTester.src = imageData.previewUrl;
    }


    // --- Fetch EXIF Description (MODIFIED: uses fullResUrl) ---
    async function fetchExifDescription(imageData) {
        // Only proceed if preview check is done (prevents race conditions if needed)
        // Although EXIF fetch is independent, might be good practice if dependent logic existed
        // if (!imageData.hasTriedPreview) {
        //     console.log(`Skipping EXIF fetch for ${imageData.fileName} until preview check completes.`);
        //     return;
        // }

        try {
            // ALWAYS fetch EXIF from the full-resolution image
            const response = await fetch(imageData.fullResUrl);
            if (!response.ok) throw new Error(`Failed to fetch image for EXIF: ${response.status}`);
            const blob = await response.blob();

            EXIF.getData(blob, function() {
                const description = EXIF.getTag(this, "ImageDescription");
                imageData.description = description || ''; // Store description or empty string

                // Update description if this image is currently fullscreen
                if (currentIndex !== -1 && imagesData[currentIndex] === imageData && fullscreenOverlay.style.display !== 'none') {
                    imageDescription.textContent = imageData.description;
                }
            });
        } catch (error) {
            console.warn(`Could not fetch/read EXIF for ${imageData.fileName} from ${imageData.fullResUrl}:`, error);
            imageData.description = ''; // Set empty description on error
            if (currentIndex !== -1 && imagesData[currentIndex] === imageData && fullscreenOverlay.style.display !== 'none') {
                imageDescription.textContent = ''; // Clear description on error
            }
        }
    }


    // --- Open Fullscreen (MODIFIED: uses fullResUrl) ---
    function openFullscreen(imageData) {
        // Always display the full-resolution image in fullscreen
        fullscreenImage.src = imageData.fullResUrl;
        fullscreenImage.alt = imageData.fileName;
        imageDescription.textContent = imageData.description || 'Loading description...'; // Show placeholder or fetched description
        fullscreenOverlay.style.display = 'flex';
        document.body.classList.add('fullscreen-open');
        document.addEventListener('keydown', handleKeydown);
        fullscreenContent.scrollTop = 0;

        // Preload next and previous full-res images for smoother navigation (optional)
        preloadAdjacentImages(currentIndex);
    }

    // --- Close Fullscreen (no changes needed) ---
    function closeFullscreen() {
        fullscreenOverlay.style.display = 'none';
        fullscreenImage.src = '';
        imageDescription.textContent = '';
        document.body.classList.remove('fullscreen-open');
        document.removeEventListener('keydown', handleKeydown);
        currentIndex = -1;
    }

    // --- Show Image by Index (MODIFIED: uses fullResUrl) ---
    function showImageAtIndex(index) {
        if (index < 0 || index >= imagesData.length) return; // Bounds check

        currentIndex = index;
        const imageData = imagesData[currentIndex];
        // Always show full-res in the fullscreen view
        fullscreenImage.src = imageData.fullResUrl;
        fullscreenImage.alt = imageData.fileName;
        imageDescription.textContent = imageData.description || ''; // Show fetched description or empty

        // Ensure EXIF data is fetched if it somehow wasn't (unlikely with new flow)
        // if (imageData.description.startsWith('Loading description')) {
        //     fetchExifDescription(imageData);
        // }

        fullscreenContent.scrollTop = 0;
        // Preload next/prev when navigating
        preloadAdjacentImages(currentIndex);
    }

    // --- Optional: Preload adjacent full-res images ---
    function preloadAdjacentImages(index) {
        const nextIndex = (index + 1) % imagesData.length;
        const prevIndex = (index - 1 + imagesData.length) % imagesData.length;

        if (nextIndex !== index && imagesData[nextIndex]) {
            const nextImage = new Image();
            nextImage.src = imagesData[nextIndex].fullResUrl;
            // console.log("Preloading next:", imagesData[nextIndex].fileName);
        }
        if (prevIndex !== index && imagesData[prevIndex]) {
            const prevImage = new Image();
            prevImage.src = imagesData[prevIndex].fullResUrl;
             // console.log("Preloading prev:", imagesData[prevIndex].fileName);
        }
    }


    // --- Event Handlers (no changes needed for keydown, overlay click) ---
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeFullscreen();
        } else if (event.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % imagesData.length;
            showImageAtIndex(nextIndex);
        } else if (event.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
            showImageAtIndex(prevIndex);
        }
    }

    fullscreenOverlay.addEventListener('click', (event) => {
        if (event.target === fullscreenOverlay) {
            closeFullscreen();
        }
    });

    // --- Initialize ---
    fetchImages();
});