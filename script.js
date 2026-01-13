const track = document.querySelector('.carousel-track');
const nav = document.querySelector('.carousel-nav');
const slides = Array.from(track.children);
const carousel = document.querySelector('.carousel');

let currentIndex = 0;

// Dynamic Dot Creation
slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    nav.appendChild(dot);
    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = index;
        updateCarousel();
    });
});

const dots = document.querySelectorAll('.dot');

function updateCarousel() {
    // GET THE CURRENT WIDTH (Responsive)
    const currentWidth = carousel.offsetWidth; 
    
    track.style.transition = 'transform 0.5s ease-out';
    const amountToMove = currentIndex * -currentWidth;
    track.style.transform = `translateX(${amountToMove}px)`;
    
    dots.forEach(d => d.classList.remove('active'));
    dots[currentIndex].classList.add('active');
}

// Update the position if the user resizes the browser window
window.addEventListener('resize', updateCarousel);

// --- DRAG & CLICK LOGIC (Responsive) ---
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;

carousel.addEventListener('mousedown', dragStart);
carousel.addEventListener('touchstart', dragStart);
carousel.addEventListener('mouseup', dragEnd);
carousel.addEventListener('touchend', dragEnd);
carousel.addEventListener('mousemove', dragMove);
carousel.addEventListener('touchmove', dragMove);

function dragStart(e) {
    isDragging = true;
    startPos = getPositionX(e);
    track.style.transition = 'none';
}

function dragMove(e) {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    const currentWidth = carousel.offsetWidth;
    // Show live dragging
    track.style.transform = `translateX(${(currentIndex * -currentWidth) + diff}px)`;
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    const endPos = (e.type.includes('mouse')) ? e.clientX : e.changedTouches[0].clientX;
    const moveDiff = endPos - startPos;
    const currentWidth = carousel.offsetWidth;

    // Logic: Click vs Swipe
    if (Math.abs(moveDiff) < 5) {
        // Handle Click
        const rect = carousel.getBoundingClientRect();
        const clickX = startPos - rect.left;
        if (clickX > currentWidth / 2) currentIndex++;
        else currentIndex--;
    } else {
        // Handle Swipe
        if (moveDiff < -100) currentIndex++;
        if (moveDiff > 100) currentIndex--;
    }

    // Wrap around
    if (currentIndex < 0) currentIndex = slides.length - 1;
    if (currentIndex >= slides.length) currentIndex = 0;

    updateCarousel();
}

function getPositionX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
}

// Start auto-play
setInterval(() => {
    if(!isDragging) {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    }
}, 4000);