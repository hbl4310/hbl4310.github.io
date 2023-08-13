// script placed at end of html

// theme switcher
let themeIdx = 0; 
let maxThemes = 1;

function switchTheme(currentThemeIdx = themeIdx) {
    const newClassTheme = `theme-${currentThemeIdx + 1}`;
    let i = 0
    document.body.className = newClassTheme;
    // console.log('changing theme to', newClassTheme);
    document.body.className.replace(/(?:^|\s)theme-\d+(?!\S)/g , newClassTheme);
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