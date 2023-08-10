// script placed at end of html

// theme switcher
let themeIdx = 0; 
const maxThemes = getComputedStyle(document.body).getPropertyValue("--num-themes");

function switchTheme(currentThemeIdx = themeIdx) {
    themeIdx = (currentThemeIdx + 1) % maxThemes;
    const newClassTheme = `theme-${themeIdx + 1}`;
    let i = 0
    document.body.className = newClassTheme;
    document.body.className.replace(/(?:^|\s)theme-\d+(?!\S)/g , newClassTheme);
}

function randomiseTheme() {
    const i = rand(0, maxThemes-1);
    switchTheme(i);
}

window.addEventListener("DOMContentLoaded", randomiseTheme)
