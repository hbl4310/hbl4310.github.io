// utilities
function setTextValue(name, literal = true) {
    for(const e of document.getElementsByClassName(name)) {
        // only strings (non-literals) can be used in for :before,:after {content}
        const x = literal ? e.textContent : `'${e.textContent}'`;
        e.style.setProperty("--text-value", x);
    }
}

function setTextLength(name) {
    for(const e of document.getElementsByClassName(name)) {
        e.style.setProperty("--text-length", e.textContent.length);
    }
}


// text-typing 
function applyTypingText() {
    setTextLength("text-typing");
}


// text-hacker
const hackerChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&0123456789";
const numHackerChars = hackerChars.length;
const numHackerFlips = 4; 
const hackerTextIntervalMs = 30;

let interval = null; 

function hackerTextHover(e) {
    let iteration = 0; 
    const trueText = e.target.style.getPropertyValue("--text-value");
    clearInterval(interval);
    interval = setInterval(() => {
        e.target.textContent = e.target.textContent
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return trueText[index];
                }
                return hackerChars[Math.floor(Math.random() * numHackerChars)];
            })
            .join("")
        if (iteration >= trueText.length) {
            clearInterval(interval); 
        }
        iteration += 1 / numHackerFlips;
    }, hackerTextIntervalMs);
}

function applyHackerText() {
    setTextValue("text-hacker");
    for(const e of document.getElementsByClassName("text-hacker")) {
        e.onmouseover = hackerTextHover;
    }
}


// text-face-cursor
function applyFaceCursorText() {
    for(const e of document.getElementsByClassName("text-face-cursor")) {
        const rect = e.getBoundingClientRect();
        e.style.setProperty("--x0", Math.round(0.5 * (rect.left + rect.right)));
        e.style.setProperty("--y0", Math.round(0.5 * (rect.top + rect.bottom)));
    }
}


// text-glitch
function applyGlitchText() {
    setTextValue("text-glitch", false);
}


// apply
applyTypingText();
applyHackerText();
applyFaceCursorText();
applyGlitchText();