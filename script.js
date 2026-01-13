const track = document.querySelector('.carousel-track');
const nav = document.querySelector('.carousel-nav');
const slides = Array.from(track.children);
const carousel = document.querySelector('.carousel');

// 1. CLONING
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
track.appendChild(firstClone);
track.prepend(lastClone);

let currentIndex = 1;
const originalLength = slides.length;

// Generate dots
slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    nav.appendChild(dot);
    dot.onclick = (e) => {
        e.stopPropagation();
        currentIndex = i + 1;
        updateCarousel();
    };
});

const dots = document.querySelectorAll('.dot');

function updateCarousel(withTransition = true) {
    const width = carousel.offsetWidth;
    // Safety: if window is resized or hidden, width might be 0
    if (width === 0) return;

    track.style.transition = withTransition ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(${-currentIndex * width}px)`;

    // Update dots
    let dotIndex = currentIndex - 1;
    if (currentIndex > originalLength) dotIndex = 0;
    else if (currentIndex < 1) dotIndex = originalLength - 1;
    dots.forEach((d, i) => d.classList.toggle('active', i === dotIndex));
}

// 2. THE SNAP RESET (Enhanced)
function checkBoundary() {
    const width = carousel.offsetWidth;
    if (currentIndex >= originalLength + 1) {
        track.style.transition = 'none';
        currentIndex = 1;
        track.style.transform = `translateX(${-currentIndex * width}px)`;
    }
    if (currentIndex <= 0) {
        track.style.transition = 'none';
        currentIndex = originalLength;
        track.style.transform = `translateX(${-currentIndex * width}px)`;
    }
}

// Listen for the end of the animation to snap back
track.addEventListener('transitionend', checkBoundary);

// 3. DRAG & CLICK LOGIC
let isDragging = false, startX = 0, currentTranslate = 0, isSwipe = false;

const dragStart = (e) => {
    isDragging = true;
    isSwipe = false;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    track.style.transition = 'none';
};

const dragMove = (e) => {
    if (!isDragging) return;
    const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    currentTranslate = x - startX;
    if (Math.abs(currentTranslate) > 10) isSwipe = true;

    const width = carousel.offsetWidth;
    track.style.transform = `translateX(${-currentIndex * width + currentTranslate}px)`;
};

const dragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    const width = carousel.offsetWidth;

    if (!isSwipe) {
        const rect = carousel.getBoundingClientRect();
        if ((startX - rect.left) > width / 2) currentIndex++;
        else currentIndex--;
    } else {
        if (currentTranslate < -width * 0.2) currentIndex++;
        else if (currentTranslate > width * 0.2) currentIndex--;
    }

    currentTranslate = 0;
    updateCarousel(true);
};

// LISTENERS
carousel.addEventListener('mousedown', dragStart);
carousel.addEventListener('touchstart', dragStart, { passive: true });
window.addEventListener('mousemove', dragMove);
window.addEventListener('touchmove', dragMove, { passive: true });
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);
carousel.addEventListener('dragstart', (e) => e.preventDefault());

// 4. THE "BLANK SPACE" RECOVERY
// If the user tabs away and comes back, the transitionend might not fire.
// This visibility change listener fixes that.
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkBoundary();
        updateCarousel(false);
    }
});

window.onload = () => updateCarousel(false);
window.onresize = () => updateCarousel(false);

// 5. AUTO PLAY
setInterval(() => {
    if (!isDragging) {
        currentIndex++;
        updateCarousel(true);
    }
}, 4000);