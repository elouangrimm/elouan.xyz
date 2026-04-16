document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenContent = document.getElementById('fullscreen-content');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const imageDescription = document.getElementById('image-description');

    const repoOwner = 'elouangrimm';
    const repoName = 'photos';
    const branch = 'main';
    const treeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
    const rawBaseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;

    const state = {
        images: [],
        currentIndex: -1,
        descriptionLoads: new Map()
    };

    function isImagePath(path) {
        return /\.(avif|gif|jpe?g|png|webp)$/i.test(path);
    }

    function isPreviewPath(path) {
        return /(^|\/)previews\//i.test(path);
    }

    function encodePath(path) {
        return path
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/');
    }

    function getRawUrl(path) {
        return `${rawBaseUrl}${encodePath(path)}`;
    }

    function getFileName(path) {
        return path.split('/').pop() || path;
    }

    function getFallbackDescription(path) {
        const label = getFileName(path)
            .replace(/\.[^.]+$/, '')
            .replace(/[._-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return label;
    }

    function renderMessage(message) {
        gallery.innerHTML = `<p>${message}</p>`;
    }

    async function fetchImageList() {
        const response = await fetch(treeUrl);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const paths = new Set(
            (data.tree || [])
                .filter((item) => item.type === 'blob')
                .map((item) => item.path)
        );

        return Array.from(paths)
            .filter((path) => isImagePath(path) && !isPreviewPath(path))
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
            .map((path) => {
                return {
                    path,
                    fileName: getFileName(path),
                    url: getRawUrl(path),
                    description: getFallbackDescription(path),
                    descriptionLoaded: false
                };
            });
    }

    function renderGallery() {
        if (state.images.length === 0) {
            renderMessage('No photos found.');
            return;
        }

        const fragment = document.createDocumentFragment();

        state.images.forEach((image, index) => {
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || `Photo ${index + 1}`;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.dataset.index = String(index);
            img.style.backgroundColor = 'var(--c800)';
            fragment.appendChild(img);
        });

        gallery.replaceChildren(fragment);
    }

    function updateFullscreen(image) {
        fullscreenImage.src = image.url;
        fullscreenImage.alt = image.description || image.fileName;
        imageDescription.textContent = image.description || '';
        fullscreenContent.scrollTop = 0;
    }

    async function loadExifDescription(image) {
        if (image.descriptionLoaded || typeof EXIF === 'undefined') {
            return;
        }

        if (state.descriptionLoads.has(image.path)) {
            return state.descriptionLoads.get(image.path);
        }

        const request = (async () => {
            try {
                const response = await fetch(image.url);
                if (!response.ok) {
                    throw new Error(`Failed to load EXIF: ${response.status}`);
                }

                const blob = await response.blob();
                const description = await new Promise((resolve) => {
                    EXIF.getData(blob, function () {
                        resolve(EXIF.getTag(this, 'ImageDescription') || '');
                    });
                });

                if (typeof description === 'string' && description.trim()) {
                    image.description = description.trim();
                }
            } catch (error) {
                console.warn(`Could not read EXIF for ${image.fileName}:`, error);
            } finally {
                image.descriptionLoaded = true;
                state.descriptionLoads.delete(image.path);

                if (state.currentIndex !== -1 && state.images[state.currentIndex] === image) {
                    imageDescription.textContent = image.description || '';
                }
            }
        })();

        state.descriptionLoads.set(image.path, request);
        return request;
    }

    function preloadAdjacentImages(index) {
        if (state.images.length < 2) {
            return;
        }

        const nextIndex = (index + 1) % state.images.length;
        const prevIndex = (index - 1 + state.images.length) % state.images.length;

        [nextIndex, prevIndex].forEach((imageIndex) => {
            const image = state.images[imageIndex];
            if (!image) {
                return;
            }

            const preloadImage = new Image();
            preloadImage.src = image.url;
        });
    }

    function showImageAtIndex(index) {
        if (state.images.length === 0) {
            return;
        }

        state.currentIndex = (index + state.images.length) % state.images.length;
        const image = state.images[state.currentIndex];
        updateFullscreen(image);
        preloadAdjacentImages(state.currentIndex);
        loadExifDescription(image);
    }

    function openFullscreen(index) {
        fullscreenOverlay.style.display = 'flex';
        document.body.classList.add('fullscreen-open');
        document.addEventListener('keydown', handleKeydown);
        showImageAtIndex(index);
    }

    function closeFullscreen() {
        fullscreenOverlay.style.display = 'none';
        fullscreenImage.src = '';
        imageDescription.textContent = '';
        document.body.classList.remove('fullscreen-open');
        document.removeEventListener('keydown', handleKeydown);
        state.currentIndex = -1;
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeFullscreen();
            return;
        }

        if (event.key === 'ArrowRight') {
            showImageAtIndex(state.currentIndex + 1);
        }

        if (event.key === 'ArrowLeft') {
            showImageAtIndex(state.currentIndex - 1);
        }
    }

    gallery.addEventListener('click', (event) => {
        const clickedImage = event.target.closest('img[data-index]');
        if (!clickedImage) {
            return;
        }

        openFullscreen(Number(clickedImage.dataset.index));
    });

    fullscreenOverlay.addEventListener('click', (event) => {
        if (event.target === fullscreenOverlay) {
            closeFullscreen();
        }
    });

    async function init() {
        renderMessage('Loading my photos...');

        try {
            state.images = await fetchImageList();
            renderGallery();
        } catch (error) {
            console.error('Error loading photos:', error);
            renderMessage(`Error loading photos: ${error.message}`);
        }
    }

    init();
});