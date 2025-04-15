document.addEventListener("DOMContentLoaded", function () {
    const imagePaths = [
        "/photos/images/image1.JPG",
        "/photos/images/image2.JPG",
        "/photos/images/image3.JPG",
        "/photos/images/image4.JPG",
        "/photos/images/image5.JPG",
        "/photos/images/image6.JPG",
        "/photos/images/image7.JPG",

    ];
    let currentIndex = -1;

    const gallery = document.querySelector(".gallery");
    const overlay = document.querySelector(".fullscreen-overlay");
    const fullscreenContent = document.querySelector(".fullscreen-content");
    const fullscreenImage = document.querySelector(".fullscreen-image");
    const closeButton = document.querySelector(".close-button");
    const imageDescription = document.querySelector(".image-description");

    function openFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = imagePaths[index];
        overlay.style.display = "flex";

        EXIF.getData(fullscreenImage, function () {
            const description = EXIF.getTag(this, "ImageDescription") || "";
            imageDescription.textContent = description;
        });
    }

    function closeFullscreen() {
        overlay.style.display = "none";
    }

    function nextImage() {
        if (currentIndex < imagePaths.length - 1) {
            openFullscreen(currentIndex + 1);
        }
    }

    function prevImage() {
        if (currentIndex > 0) {
            openFullscreen(currentIndex - 1);
        }
    }

    imagePaths.forEach((path, index) => {
        const img = document.createElement("img");
        img.src = path;
        img.alt = "Gallery Image";
        img.addEventListener("click", () => openFullscreen(index));
        gallery.appendChild(img);
    });

    closeButton.addEventListener("click", closeFullscreen);

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            closeFullscreen();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (overlay.style.display === "flex") {
            if (event.key === "ArrowLeft") {
                prevImage();
            } else if (event.key === "ArrowRight") {
                nextImage();
            } else if (event.key === "Escape") {
                closeFullscreen();
            }
        }
    });
});
