// utilities
function setTextValue(name, literal = true) {
    for(const e of document.getElementsByClassName(name)) {
        // only strings (non-literals) can be used in for :before,:after {content}
        const x = literal ? e.textContent : `'${e.textContent}'`;
        e.style.setProperty("--text-value", x);
    }
}

function unsetTextValue(e) {
    e.style.removeProperty("--text-value");
}

function setTextLength(name) {
    for(const e of document.getElementsByClassName(name)) {
        e.style.setProperty("--text-length", e.textContent.length);
    }
}

function unsetTextLength(e) {
    e.style.removeProperty("--text-length");
}


// [text-* class name, apply function, unapply function]
const textSwitchEffectsAndFuncs = [
    ["magic",           null,                   null], 
    ["typing",          applyTypingText,        unapplyTypingText], 
    ["hacker",          applyHackerText,        unapplyHackerText], 
    ["strikethrough",   null,                   null], 
    ["face-cursor",     applyFaceCursorText,    unapplyFaceCursorText],
    ["rainbow",         null,                   null], 
    ["3d",              null,                   null],
    ["glitch",          applyGlitchText,        unapplyGlitchText]
];
const textSwitchEffects = textSwitchEffectsAndFuncs.map(i => i[0]);

function switchTextEffects() {
    for (const e of document.getElementsByClassName("text-switch")) {
        let oldIdx = -1;
        let newIdx = -1;
        for (const c of e.classList) {
            const textMatches = c.match(/text-(?!switch)([-\w]+)/);
            if (textMatches && textMatches.length == 2 && textSwitchEffects.includes(textMatches[1])) {
                oldIdx = textSwitchEffects.indexOf(textMatches[1]);
                newIdx = rand(0, textSwitchEffects.length - 1);
                break;
            }
        }
        if (newIdx >= 0) {
            const oldTextEffect = `text-${textSwitchEffects[oldIdx]}`;
            const newTextEffect = `text-${textSwitchEffects[newIdx]}`;
            console.log('switching text effect from', oldTextEffect, 'to', newTextEffect);
            e.className = e.className.replace(oldTextEffect, newTextEffect);
            const unapplyFunc = textSwitchEffectsAndFuncs[oldIdx][2];
            if (unapplyFunc) {
                unapplyFunc(e);
            }
            const applyFunc = textSwitchEffectsAndFuncs[newIdx][1];
            if (applyFunc) {
                applyFunc();
            }
        }
    }
}


// text-typing 
function applyTypingText() {
    setTextLength("text-typing");
}
function unapplyTypingText(e) {
    unsetTextLength(e);
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
        e.addEventListener("mouseover", hackerTextHover);
    }
}

function unapplyHackerText(e) {
    unsetTextValue(e);
    e.removeEventListener("mouseover", hackerTextHover, false);
}


// text-face-cursor
function applyFaceCursorText() {
    for(const e of document.getElementsByClassName("text-face-cursor")) {
        const rect = e.getBoundingClientRect();
        e.style.setProperty("--x0", Math.round(0.5 * (rect.left + rect.right)));
        e.style.setProperty("--y0", Math.round(0.5 * (rect.top + rect.bottom)));
    }
}

function unapplyFaceCursorText(e) {
    e.style.removeProperty("--x0");
    e.style.removeProperty("--y0");
}


// text-glitch
function applyGlitchText() {
    setTextValue("text-glitch", false);
}

function unapplyGlitchText(e) {
    unsetTextLength(e);
}


// apply
applyTypingText();
applyHackerText();
applyFaceCursorText();
applyGlitchText();