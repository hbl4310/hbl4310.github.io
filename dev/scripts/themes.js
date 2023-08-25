const themePattern = /(?:^|\s)theme-\d+(?!\S)/g;

// theme switcher
let themeIdx = 0; 
let maxThemes = 1;

function getTheme() {
    return document.body.className.match(themePattern)[0];
}

function loadTheme(theme) {
    document.body.className = document.body.className.replace(themePattern, theme);
}

function switchTheme(currentThemeIdx = themeIdx) {
    const newClassTheme = `theme-${currentThemeIdx + 1}`;
    // console.log('changing theme to', newClassTheme);
    loadTheme(newClassTheme);
    themeIdx = (currentThemeIdx + 1) % maxThemes;
}

function randomiseTheme() {
    const i = rand(0, maxThemes-1);
    switchTheme(i);
}

function initTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // dark mode defaults are theme-1 and theme-3
        Math.random() > 0.5 ? switchTheme(0) : switchTheme(2);
    } else {
        randomiseTheme();
    }
}

function applyThemes() {
    maxThemes = getComputedStyle(document.body).getPropertyValue("--num-themes");
    window.addEventListener("DOMContentLoaded", initTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // light mode defaults are theme-2 and theme-4
        Math.random() > 0.5 ? switchTheme(1) : switchTheme(3);
    });
}


// iframe functionality
function postTheme(iframe) {
    // console.log("Posting theme to iframe");
    iframe.contentWindow.postMessage(getTheme(), "*");
}

function postThemeToIframes() {
    for (const frameId of frameIds) {
        const iframe = document.getElementById(frameId);
        // if theme changes, update iframe
        attachAttrMutationObserver(document.body, (mutation) => {
            postTheme(iframe);
        }, "class");
        // if iframe changes, update theme
        iframe.addEventListener("load", () => {
            postTheme(iframe)
        });
    }
}

function listenForTheme() {
    window.addEventListener(
        "message",
        function (event) {
            if (event.origin === window.location.origin) {
                loadTheme(event.data);
            }
        },
        false
    );
}