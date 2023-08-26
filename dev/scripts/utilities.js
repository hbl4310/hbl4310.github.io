// script placed at start of html, so doesn't have access to computed styles or body elements

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min); 
}

function vh() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function vw() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}

function vmin() {
    return Math.min(vh(), vw());
}

function vmax() {
    return Math.max(vh(), vw());
}

function clamp(x, lower, upper) {
    return Math.min(Math.max(x, lower), upper);
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


// save relative position of element to style properties; useful for calculating cursor positions relative to elements
function createSetElementPositionCallback(className) {
    const setElementPosition = event => {
        for (const e of document.getElementsByClassName(className)) {
            // add window.scroll{X,Y} to cover case where user refreshes window while scrolled
            const rect = e.getBoundingClientRect(), 
                  x = rect.left + window.scrollX, 
                  y = rect.top + window.scrollY;
            e.style.setProperty("--left", `${x}px`);
            e.style.setProperty("--top", `${y}px`);
        }
    };
    return setElementPosition;
}
// maintain correct relative mouse position even if user scrolls
function createSetScrollOffsetCallback(className) {
    const setScrollOffset = event => {
        for (const e of document.getElementsByClassName(className)) {
            const x = window.scrollX, 
                  y = window.scrollY;
            e.style.setProperty("--scroll-x", `${x}px`);
            e.style.setProperty("--scroll-y", `${y}px`);
        }
    };
    return setScrollOffset;
}


// generic mutation observer and helper functions for catching changes in element attributes
function mutationLoopCallbackCreator(callback) {
    const mutationCallback = (mutations) => {
        for (const mutation of mutations) {
            callback(mutation);
        }
    }
    return mutationCallback;
}

function newMutationAttrValue(mutation, attrName, attrValue) {
    return (mutation.attributeName === attrName) && (mutation.target.getAttribute(attrName) === attrValue);
}

function attachAttrMutationObserver(e, callback, attrName) {
    observer = new MutationObserver(mutationLoopCallbackCreator(callback));
    observer.observe(e, { attributes: true , attributeFilter : [attrName] } );
    return observer; 
}


// replace hsl property value with hsla
function addHSLAlpha(e, propertyNameRead, propertyNameSet, alpha) {
    const style = getComputedStyle(e);
    const hsl = style.getPropertyValue(propertyNameRead).toString();
    let hsla = hsl;
    if (hsl.startsWith("hsl")) {
        const [hue, saturation, lightness] = hsl.match(/\d+/g).map(Number);
        hsla = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        e.style.setProperty(propertyNameSet, hsla)
    }
    return hsla;
}