document.addEventListener('DOMContentLoaded', function () {
    const imagePaths = [
      '/photos/images/image1.png',
    ];
    let currentIndex = -1;
  
    const gallery = document.querySelector('.gallery');
    const overlay = document.querySelector('.fullscreen-overlay');
    const fullscreenImage = document.querySelector('.fullscreen-image');
    const closeButton = document.querySelector('.close-button');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
  
    function openFullscreen(index) {
      currentIndex = index;
      fullscreenImage.src = imagePaths[index];
      overlay.style.display = 'flex';
    }
  
    function closeFullscreen() {
      overlay.style.display = 'none';
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
      const img = document.createElement('img');
      img.src = path;
      img.alt = 'Gallery Image';
      img.addEventListener('click', () => openFullscreen(index));
      gallery.appendChild(img);
    });
  
    closeButton.addEventListener('click', closeFullscreen);
    leftArrow.addEventListener('click', prevImage);
    rightArrow.addEventListener('click', nextImage);
  
    document.addEventListener('keydown', function (event) {
      if (overlay.style.display === 'flex') {
        if (event.key === 'ArrowLeft') {
          prevImage();
        } else if (event.key === 'ArrowRight') {
          nextImage();
        } else if (event.key === 'Escape') {
          closeFullscreen();
        }
      }
    });
  });
  