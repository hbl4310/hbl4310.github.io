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


// load html into div content
// https://stackoverflow.com/questions/17636528/how-do-i-load-an-html-page-in-a-div-using-javascript
// might need: https://stackoverflow.com/questions/72666698/github-pages-how-to-fetch-file-in-js-from-repo
async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

async function loadContent(div, url) {
    div.innerHTML = await fetchHtmlAsText(url);
}


// generic mutation observer for catching changes in element attributes
//     callback: function to call when relevant mutation detected
//     attrName: data attribute to look for mutations
//     attrTriggerValue: data attribute value to trigger callback
function attrMutationCallbackCreator(callback, attrName, attrTriggerValue) {
    const mutationCallback = (mutations) => {
        for (const mutation of mutations) {
            if (
                mutation.type !== 'attributes' || 
                mutation.attributeName !== attrName ||
                mutation.target.getAttribute(attrName) !== attrTriggerValue
            ) {
                return;
            } 
            callback(mutation);
        }
    }
    return mutationCallback;
}