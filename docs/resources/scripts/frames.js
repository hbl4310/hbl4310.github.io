// TODO put consts in some config
const framesPath = "/frames";
const frames = ["shapes", "icosahedron", "perlinflow"];
const numFrames = frames.length;
let frameIndex = 0;

const frameIds = ["main-box-iframe"];

function getLoadingElement(frameId) {
    const loadingId = `${frameId}-loading`;
    return document.getElementById(loadingId);
}

function isLoading(iframe) {
    iframe.style.display = "none";
    const loading = getLoadingElement(iframe.id);
    if (loading !== null) {
        loading.style.display = "flex";
    };
}

function isLoaded(iframe) {
    const loading = getLoadingElement(iframe.id);
    if (loading !== null) {
        loading.style.display = "none";
    };
    iframe.style.display = "block";
}

function switchFrames() {
    frameIndex = (frameIndex + 1) % numFrames;
    const frameName = frames[frameIndex];
    const framePath = `${framesPath}/${frameName}.html`;
    const frameTitle = `${frameName.charAt(0).toUpperCase()}${frameName.slice(1)}`
    for (const frameId of frameIds) {
        const iframe = document.getElementById(frameId);
        isLoading(iframe);
        iframe.src = framePath;
        iframe.title = `Main Frame: ${frameTitle}`;
        iframe.name = `main-iframe-${Date.now()}`;  // prevent caching the iframe?
        postTheme(iframe);
    }
}

function handleFrames() {
    for (const frameId of frameIds) {
        const iframe = document.getElementById(frameId);
        // if theme changes (body class changes), update iframe
        attachAttrMutationObserver(document.body, (mutation) => {
            postTheme(iframe);
        }, "class");
        // on load, hide loading placeholder, communicate theme, show iframe
        iframe.addEventListener('load', (e) => {
            postTheme(e.target);
            isLoaded(e.target);
        });
    }
}