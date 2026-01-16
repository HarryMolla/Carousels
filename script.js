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
let isTouching = false; 

// --- DYNAMIC DOTS UI SETUP ---
nav.innerHTML = ''; 
const dotsTrack = document.createElement('div');
dotsTrack.className = 'dots-track';
nav.appendChild(dotsTrack);

// Create dots for every original slide
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

    // 3. Update Dot Styles
    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'small', 'hidden');
        
        const distance = Math.abs(i - activeDotIndex);

        if (i === activeDotIndex) {
            dot.classList.add('active');
        } 
        else if (distance <= 4) {
            if (distance === 4) {
                dot.classList.add('small');
            }
        } 
        else {
            dot.classList.add('hidden');
        }
    });

    // 4. THE SLIDE MATH 
    const DOT_UNIT = 14;
    const NAV_WIDTH = 70;
    
    let translateX = 35 - (activeDotIndex * 14) - 7;
    if (translateX > 0) translateX = 0;
    const maxScroll = -((dots.length * DOT_UNIT) - NAV_WIDTH);
    if (translateX < maxScroll) translateX = maxScroll;
    
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

// 3. DRAG & CLICK LOGIC
let isDragging = false, startX = 0, currentTranslate = 0, isSwipe = false;

const dragStart = (e) => {
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

// LISTENERS
carousel.addEventListener('mousedown', dragStart);
carousel.addEventListener('touchstart', dragStart, { passive: true });
window.addEventListener('mousemove', dragMove);
window.addEventListener('touchmove', dragMove, { passive: true });
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);

// 4. PREVENTIONS
carousel.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { checkBoundary(); updateCarousel(false); }
});

window.onload = () => updateCarousel(false);
window.onresize = () => updateCarousel(false);

// 6. QUICK VIEW (HOVER PREVIEW) — ONE TIME, PURE EASE-IN-OUT
let hasQuickViewed = false;
let quickViewActive = false;

carousel.addEventListener('mousemove', (e) => {
    if (isDragging || hasQuickViewed || quickViewActive) return;

    const width = carousel.offsetWidth;
    const rect = carousel.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < width * 0.35 || x > width * 0.65) {
        quickViewActive = true;

        const direction = x < width * 0.35 ? 1 : -1;
        const previewOffset = width * 0.06;

        // Ease-in-out preview
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(${-currentIndex * width + direction * previewOffset}px)`;

        // Return with same ease
        setTimeout(() => {
            track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(${-currentIndex * width}px)`;
            hasQuickViewed = true;
            quickViewActive = false;
        }, 750);
    }
});

// 6.1 MOBILE QUICK VIEW (AUTO — ONE TIME)
window.addEventListener('load', () => {
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

