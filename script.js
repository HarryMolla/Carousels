const track = document.querySelector('.carousel-track');
const nav = document.querySelector('.carousel-nav');
const slides = Array.from(track.children);
const carousel = document.querySelector('.carousel');


// 1. CLONING FOR INFINITE LOOP
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
track.appendChild(firstClone);
track.prepend(lastClone);

let currentIndex = 1;
// Hide navigation if only one image exists
const originalLength = slides.length;
if (originalLength <= 1) {
    nav.style.display = 'none';
}
let isTouching = false; 

// --- DYNAMIC DOTS UI SETUP ---
nav.innerHTML = ''; 
const dotsTrack = document.createElement('div');
dotsTrack.className = 'dots-track';
nav.appendChild(dotsTrack);

slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dotsTrack.appendChild(dot);
    
    dot.onclick = (e) => {
        e.stopPropagation();
        currentIndex = i + 1;
        updateCarousel();
    };
});

const dots = document.querySelectorAll('.dot');

/**
 * Updates the Carousel position and the Dynamic Dots
 */
function updateCarousel(withTransition = true) {
    const width = carousel.offsetWidth;
    if (width === 0) return;

    // 1. Move Images
    track.style.transition = withTransition ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(${-currentIndex * width}px)`;

    // 2. Identify "Real" Index
    let realIndex = currentIndex;
    if (currentIndex > originalLength) realIndex = 1;
    else if (currentIndex < 1) realIndex = originalLength;
    const activeDotIndex = realIndex - 1;

    // 3. Dot Scaling & Visibility Logic
    let windowStart = activeDotIndex - 2;
    if (windowStart < 0) windowStart = 0;
    if (windowStart + 5 > dots.length) windowStart = Math.max(0, dots.length - 5);
    
    let windowEnd = windowStart + 4;

    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'small', 'hidden');

        if (i === activeDotIndex) {
            dot.classList.add('active');
        }

        if (dots.length > 5) {
            if (i < windowStart || i > windowEnd) {
                dot.classList.add('hidden');
            } else if (i === windowStart || i === windowEnd) {
                if ((i === windowStart && i > 0) || (i === windowEnd && i < dots.length - 1)) {
                    dot.classList.add('small');
                }
            }
        }
    });

    // 4. THE FIX: CENTERING LOGIC
    const DOT_UNIT = 14; 
    const NAV_WIDTH = 70;
    const totalDotsWidth = dots.length * DOT_UNIT;
    let translateX = 0;

    if (totalDotsWidth <= NAV_WIDTH) {
        // CASE: Less than 5 dots - Center the track perfectly
        translateX = (NAV_WIDTH - totalDotsWidth) / 2;
    } else {
        // CASE: More than 5 dots - Use sliding window math
        translateX = -(windowStart * DOT_UNIT);
    }
    
    dotsTrack.style.transform = `translateX(${translateX}px)`;
}

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

track.addEventListener('transitionend', checkBoundary);

// 5. DRAG & CLICK LOGIC
let isDragging = false, startX = 0, currentTranslate = 0, isSwipe = false;

const dragStart = (e) => {
    if (originalLength <= 1) return;
    if (e.type === 'mousedown' && isTouching) return;
    if (e.type === 'touchstart') isTouching = true;

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

const dragEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const width = carousel.offsetWidth;

    if (!isSwipe) {
        const rect = carousel.getBoundingClientRect();
        const clickX = startX - rect.left;
        if (clickX > width / 2) currentIndex++;
        else currentIndex--;
    } else {
        if (currentTranslate < -width * 0.2) currentIndex++;
        else if (currentTranslate > width * 0.2) currentIndex--;
    }

    currentTranslate = 0;
    updateCarousel(true);
    setTimeout(() => { isTouching = false; }, 500);
};

carousel.addEventListener('mousedown', dragStart);
carousel.addEventListener('touchstart', dragStart, { passive: true });
window.addEventListener('mousemove', dragMove);
window.addEventListener('touchmove', dragMove, { passive: true });
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);

carousel.addEventListener('dragstart', (e) => e.preventDefault());

window.onload = () => updateCarousel(false);
window.onresize = () => updateCarousel(false);


// Desktop QUICK VIEW (HOVER PREVIEW) — ONE TIME
let hasQuickViewed = false;
let quickViewActive = false;

carousel.addEventListener('mousemove', (e) => {
    if (isDragging || hasQuickViewed || quickViewActive) return;
    if (originalLength <= 1) return;

    const width = carousel.offsetWidth;
    const rect = carousel.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const leftZone = width * 0.35;

    // Decide direction
    let direction;
    if (x < leftZone) {
        // LEFT area → left quick view
        direction = 1;
    } else {
        // CENTER + RIGHT → right quick view
        direction = -1;
    }

    quickViewActive = true;

    const previewOffset = width * 0.06;

    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform =
        `translateX(${-currentIndex * width + direction * previewOffset}px)`;

    setTimeout(() => {
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(${-currentIndex * width}px)`;
        hasQuickViewed = true;
        quickViewActive = false;
    }, 750);
});


// MOBILE QUICK VIEW
window.addEventListener('load', () => {
    if (originalLength <= 1) return;
    if (window.matchMedia('(hover: hover)').matches) return; // skip desktop
    if (hasQuickViewed) return;
    const width = carousel.offsetWidth;
    if (!width) return;
    quickViewActive = true;
    const previewOffset = width * 0.06;
    // Preview next slide (right direction feels natural on mobile)
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = `translateX(${-currentIndex * width - previewOffset}px)`;
    // Return smoothly
    setTimeout(() => {
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(${-currentIndex * width}px)`;
        hasQuickViewed = true;
        quickViewActive = false;
    }, 750);
});