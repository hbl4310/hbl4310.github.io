const numSteps = 16;
const stepAnimationMs = 1300;
const scaleR = 60, minR = 4, maxR = 15;
let step = 0;
let faceColourObservers = [];
let icosahedronSizeListeners = [];

function toggleHidden(name) {
  for (const e of document.getElementsByClassName(name)) {
    e.classList.toggle("hidden");
  };
}

function getStepName(i) {
  return `step-${i}`;
}

function resetSteps(construct) {
    for (let i = 1; i <= numSteps; i++) {
        toggleHidden(getStepName(i));
    }
    step = 0;
    construct.dataset.step = "0";
}

function nextStep(construct) {
    step += 1; 
    toggleHidden(getStepName(step));
    construct.dataset.step += ` ${step}`;
}

function nextStepReset(construct) {
    if (step < numSteps) {
        nextStep(construct);
    } else {
        resetSteps(construct);
    }
}

function animateSteps(construct) {
    // last deconstruction step manually triggered
    if (step < numSteps - 1) {
        nextStep(construct);
        setTimeout(animateSteps, stepAnimationMs, construct);
    }
}

function setFaceColour(construct) {
    addHSLAlpha(construct, "--face-colour-solid", "--face-colour", getComputedStyle(construct).getPropertyValue("--face-colour-alpha"));
}

function setR(construct) {
    const R = clamp(vmin() / scaleR, minR, maxR);
    construct.style.setProperty("--R-nounit", R);
}

function icosahedronTrigger(e) {
    if (step < numSteps - 1) {
        // TODO pause animation?
        // nextStep(e);
        return;
    } else if (step === numSteps - 1) {
        // deconstruction step
        nextStep(e);
    }
    setTimeout(resetSteps, stepAnimationMs, e);
    setTimeout(animateSteps, 2.5 * stepAnimationMs, e);
}

function icosahedronRun() {
    for (const e of document.getElementsByClassName("construct")) {
        setFaceColour(e);
        faceColourObservers.push(attachAttrMutationObserver(document.body, (mutation) => {
            setFaceColour(e);
        }, "class"));
        icosahedronSizeListeners.push(window.addEventListener("DOMContentLoaded", () => { setR(e) }));
        icosahedronSizeListeners.push(window.addEventListener("resize", () => { setR(e) }));
        setTimeout(animateSteps, stepAnimationMs, e);
    }
}