// text-typing 
function applyTypingText() {
    for(const e of document.getElementsByClassName("text-typing")) {
        e.style.setProperty("--text-length", e.innerHTML.length);
    }
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
    for(const e of document.getElementsByClassName("text-hacker")) {
        e.style.setProperty("--text-value", e.textContent);
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



// apply
applyTypingText();
applyHackerText();
applyFaceCursorText();