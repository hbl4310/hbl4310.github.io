// script placed at start of html, so doesn't have access to computed styles or body elements

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min); 
}


// https://dev.to/thalitadev/step-by-step-guide-pass-your-cursor-position-using-css-variables-c7b
const cursorPos = {x: 0, y: 0}; 

// save absolute position of the mouse
function saveCursorPosition(e) {
    cursorPos.x = e.clientX; 
    cursorPos.y = e.clientY;
    document.documentElement.style.setProperty('--cursor-x', cursorPos.x);
    document.documentElement.style.setProperty('--cursor-y', cursorPos.y);
    // console.log(x,y);
}

document.addEventListener('mousemove', saveCursorPosition)