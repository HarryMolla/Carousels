// SELECTORS
const track = document.querySelector('.carousel-track');
const nav = document.querySelector('.carousel-nav');
// Select all images to count them
const slides = Array.from(track.children); 
const carousel = document.querySelector('.carousel');

const slideWidth = 600;
let currentIndex = 0;

// --- DYNAMIC DOT CREATION ---
// 1. Clear existing dots (just in case)
nav.innerHTML = '';

// 2. Loop through slides and create a dot for each
slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active'); // Set first one active
    nav.appendChild(dot);
    
    // Add click event to the new dot
    dot.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from triggering slide movement
        currentIndex = index;
        updateCarousel();
        restartAutoPlay();
    });
});

// Re-select dots now that they exist in the DOM
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;


// --- CAROUSEL LOGIC ---
let autoPlayInterval;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

function updateCarousel() {
    // Move Track
    track.style.transition = 'transform 0.5s ease-out';
    currentTranslate = currentIndex * -slideWidth;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
    
    // Update Dots
    dots.forEach(d => d.classList.remove('active'));
    dots[currentIndex].classList.add('active');
}

// Auto Play Logic
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= totalSlides) currentIndex = 0;
        updateCarousel();
    }, 3000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// Event Listeners for Drag/Swipe
carousel.addEventListener('mousedown', touchStart);
carousel.addEventListener('touchstart', touchStart);

carousel.addEventListener('mouseup', touchEnd);
carousel.addEventListener('touchend', touchEnd);
carousel.addEventListener('mouseleave', () => {
    if(isDragging) touchEnd();
});

carousel.addEventListener('mousemove', touchMove);
carousel.addEventListener('touchmove', touchMove);

function touchStart(index) {
    stopAutoPlay();
    isDragging = true;
    startPos = getPositionX(index);
    animationID = requestAnimationFrame(animation);
    track.style.transition = 'none'; // Instant move for drag
}

function touchMove(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        const currentMove = currentPosition - startPos;
        currentTranslate = prevTranslate + currentMove;
    }
}

function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    const movedBy = currentTranslate - prevTranslate;

    // Detect Click vs Drag (Threshold: 5px)
    if (Math.abs(movedBy) < 5) {
        // It was a click
        const clickX = startPos - carousel.getBoundingClientRect().left;
        const middle = slideWidth / 2;

        if (clickX > middle) {
            currentIndex++; // Click Right
        } else {
            currentIndex--; // Click Left
        }
    } else {
        // It was a Drag/Swipe (Threshold: 100px)
        if (movedBy < -100) currentIndex++;
        if (movedBy > 100) currentIndex--;
    }

    // Boundary Checks (Infinite Loop)
    if (currentIndex < 0) currentIndex = totalSlides - 1;
    if (currentIndex >= totalSlides) currentIndex = 0;

    updateCarousel();
    startAutoPlay();
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
}

function animation() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

// Start System
startAutoPlay();