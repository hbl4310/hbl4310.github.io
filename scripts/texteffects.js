// config 
// [text-* class name, apply function, unapply function]
const textEffectsAndFuncs = [
    ["magic",           null,                   null], 
    ["typing",          applyTypingText,        unapplyTypingText], 
    ["hacker",          applyHackerText,        unapplyHackerText], 
    ["strikethrough",   null,                   null], 
    ["face-cursor",     applyFaceCursorText,    unapplyFaceCursorText],
    ["rainbow",         null,                   null], 
    ["3d",              null,                   null],
    ["glitch",          applyGlitchText,        unapplyGlitchText],
    ["enter",           applyEnterText,         unapplyEnterText],
    ["fade",            applyFadeText,          unapplyFadeText],
];

// class to signal a switchable text effect
const textSwitchClass = "text-switch";

// standardise text effect name to class label
function getEffectClass(effectName) {
    return `text-${effectName}`;
}

// apply all effects which require js
// TODO check that text effect only applies to childless elements; e.childElementCount == 0
function applyTextEffects() {
    for (const effect of textEffectsAndFuncs) {
        const [effectName, applyFunc, unapplyFunc] = effect;
        if (applyFunc) {
            const effectClass = getEffectClass(effectName);
            // console.log("applying", effectClass);
            for (const e of document.getElementsByClassName(effectClass)) {
                if (e.childElementCount == 0) {
                    applyFunc(e);
                } else {
                    console.warn(`Cannot apply ${effectClass} to ${e} due to presence of children`)
                }
            }
        }
    }
}

// utilities for adding/removing meta-data
function setTextValue(e, literal = true) {
    // only strings (non-literals) can be used in for :before,:after {content}
    const x = literal ? e.textContent : `'${e.textContent}'`;
    e.style.setProperty("--text-value", x);
}
    
function unsetTextValue(e) {
    const text = e.style.getPropertyValue("--text-value");
    if (e.innerHTML != text) {
        e.innerHTML = text;
    }
    e.style.removeProperty("--text-value");
}

function setTextLength(e) {
    e.style.setProperty("--text-length", e.textContent.length);
}

function unsetTextLength(e) {
    e.style.removeProperty("--text-length");
}

function activate(e) {
    e.dataset.active = "true";
}

function deactivate(e) {
    e.dataset.active = "false";
}

// replace inner html text with spans of each part (separated by delim)
function splitTextApplyEffect(e, effect, delim = "") {
    const text = e.style.getPropertyValue("--text-value");
    e.innerHTML = "";
    text.split(delim).map((part, index) => {
        const s = document.createElement("span");
        s.innerHTML = part;
        e.appendChild(effect(s, index));
    });
}

function createPartFunc(effectName) {
    const func = (s, i) => {
        s.classList.add(`_text-${effectName}-part`);
        s.style.setProperty("--part-index", i)
        return s;
    }
    return func;
}

// text effect switching
const textEffectNames = textEffectsAndFuncs.map(i => i[0]);
let textTimers = [];

function switchTextEffects() {
    const activateDelayMs = 200; 
    const deactivateDelayMs = 2500; 
    // clear timers to avoid issues where we have multiple setTimeouts active, e.g. if user spams calls to switchTextEffects
    for (const t of textTimers) {
        clearTimeout(t);
    }
    textTimers = [];
    for (const e of document.getElementsByClassName(textSwitchClass)) {
        let oldIdx = -1;
        let newIdx = -1;
        for (const c of e.classList) {
            const textMatches = c.match(/text-(?!switch)([-\w]+)/);
            if (textMatches && textMatches.length == 2 && textEffectNames.includes(textMatches[1])) {
                oldIdx = textEffectNames.indexOf(textMatches[1]);
                newIdx = rand(0, textEffectNames.length - 1);
                if (newIdx == oldIdx) {
                    newIdx = (oldIdx + 1) % textEffectNames.length;
                }
                break;
            }
        }
        if (newIdx >= 0) {
            deactivate(e);
            const oldTextEffect = getEffectClass(textEffectNames[oldIdx]);
            const newTextEffect = getEffectClass(textEffectNames[newIdx]);
            // console.log('switching text effect from', oldTextEffect, 'to', newTextEffect);
            e.className = e.className.replace(oldTextEffect, newTextEffect);
            const unapplyFunc = textEffectsAndFuncs[oldIdx][2];
            if (unapplyFunc) {
                unapplyFunc(e);
            }
            const applyFunc = textEffectsAndFuncs[newIdx][1];
            if (applyFunc) {
                applyFunc(e);
            }
            // set data-active="true" to set off any animation, then turn it back off to engage hover trigger if applicable
            textTimers.push(setTimeout(activate, activateDelayMs, e));
            textTimers.push(setTimeout(deactivate, deactivateDelayMs, e));
        }
    }
}


// text-typing 
function applyTypingText(e) {
    setTextLength(e);
}
function unapplyTypingText(e) {
    unsetTextLength(e);
}


// text-hacker
const hackerChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&0123456789";
const numHackerChars = hackerChars.length;
const numHackerFlips = 4; 
const hackerTextIntervalMs = 30;

let hackerInterval = null; 
let hackerObserver = null;  // look for data-active="true" to trigger effect

function hackerText(e) {
    let iteration = 0; 
    const trueText = e.target.style.getPropertyValue("--text-value");
    clearInterval(hackerInterval);
    hackerInterval = setInterval(() => {
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
            clearInterval(hackerInterval); 
        }
        iteration += 1 / numHackerFlips;
    }, hackerTextIntervalMs);
}

function applyHackerText(e) {
    setTextValue(e);
    e.addEventListener("mouseover", hackerText);
    e.addEventListener("focus", hackerText);
    hackerObserver = new MutationObserver(attrMutationCallbackCreator(hackerText, "data-active", "true"));
    hackerObserver.observe(e, { attributes: true} );
}

function unapplyHackerText(e) {
    unsetTextValue(e);
    e.removeEventListener("mouseover", hackerText, false);
    e.removeEventListener("focus", hackerText, false);
    hackerObserver.disconnect();
}


// text-face-cursor
function applyFaceCursorText(e) {
    const rect = e.getBoundingClientRect();
    e.style.setProperty("--x0", Math.round(0.5 * (rect.left + rect.right)));
    e.style.setProperty("--y0", Math.round(0.5 * (rect.top + rect.bottom)));
}

function unapplyFaceCursorText(e) {
    e.style.removeProperty("--x0");
    e.style.removeProperty("--y0");
}


// text-glitch
function applyGlitchText(e) {
    setTextValue(e, false);
}

function unapplyGlitchText(e) {
    unsetTextLength(e);
}


// text-enter
function applyEnterText(e) {
    const effect = createPartFunc("enter");
    setTextValue(e);
    setTextLength(e);
    splitTextApplyEffect(e, effect);
}

function unapplyEnterText(e) {
    unsetTextValue(e);
    unsetTextLength(e);
}


// text-fade
function applyFadeText(e) {
    const effect = createPartFunc("fade");
    setTextValue(e);
    setTextLength(e);
    splitTextApplyEffect(e, effect);
}

function unapplyFadeText(e) {
    unsetTextValue(e);
    unsetTextLength(e);
}