// inspired by https://twitter.com/takawo/status/1166578237755011077
// we're deliberately not using p5 and reimplementing perlin noise because we're masochists

// https://en.wikipedia.org/wiki/Perlin_noise
// https://github.com/processing/p5.js/blob/v1.7.0/src/math/noise.js#L101
let perlin;  // lazily loaded array
const PERLIN_BASE = 4;  // side of cube is 2^BASE
const PERLIN_YWRAPB = PERLIN_BASE;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;    // y-values YWRAP apart = 2^YWRAPB
const PERLIN_ZWRAPB = 2 * PERLIN_BASE;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;    // z-values ZWRAP apart = 2^ZWRAPB
const PERLIN_SIZE = (1 << (3 * PERLIN_BASE)) - 1;   // 4096 = 16^3

// create grid of random unit-length gradient vectors
function initialisePerlin() {
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = Math.random();
    }
    return perlin;
}

function getPerlinCorners(xi, yi, zi) {
    // xi + yi * 2^YWRAPB + zi * 2^ZWRAPB
    const i = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
    // TODO should each coordinate get wrapped separately? probably little difference
    const i2 = i + PERLIN_ZWRAP;
    return [
        perlin[i & PERLIN_SIZE],                         // x0, y0, z0
        perlin[(i + 1) & PERLIN_SIZE],                   // x1, y0, z0
        perlin[(i + PERLIN_YWRAP) & PERLIN_SIZE],        // x0, y1, z0
        perlin[(i + PERLIN_YWRAP + 1) & PERLIN_SIZE],    // x1, y1, z0
        perlin[i2 & PERLIN_SIZE],                        // x0, y0, z1
        perlin[(i2 + 1) & PERLIN_SIZE],                  // x1, y0, z1
        perlin[(i2 + PERLIN_YWRAP) & PERLIN_SIZE],       // x0, y1, z1
        perlin[(i2 + PERLIN_YWRAP + 1) & PERLIN_SIZE],   // x1, y1, z1
    ]
}

// TODO try other interpolations: https://mrl.cs.nyu.edu/~perlin/paper445.pdf
const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
function perlinCosineInterpolation(xi, yi, zi, xf, yf, zf) {
    let rxf, ryf, rzf;
    let n1, n2, n3;
    rxf = scaled_cosine(xf);
    ryf = scaled_cosine(yf);
    rzf = scaled_cosine(zf)
    let [c1, c2, c3, c4, c5, c6, c7, c8] = getPerlinCorners(xi, yi, zi);
    n1 = c1 + rxf * (c2 - c1);
    n2 = c3 + rxf * (c4 - c3);
    n1 += ryf * (n2 - n1);
    n2 = c5 + rxf * (c6 - c5);
    n3 = c7 + rxf * (c8 - c7);
    n2 += ryf * (n3 - n2);
    n1 += rzf * (n2 - n1);
    return n1;
}

// smoothing
function perlinHarmonicSmoothing(perlinInterpolation, amplitude, numOctaves, amplitudeFalloff) {
    // double values and increment 
    increment = (vi, vf) => {
        vi <<= 1; 
        vf *= 2;
        if (vf >= 1.0) {
            vi++;
            vf--;
        }
        return [vi, vf];
    }
    f = (xi, yi, zi, xf, yf, zf) => {
        let r = 0;
        let ampl = amplitude;
        for (let o=0; o < numOctaves; o++) {
            r += perlinInterpolation(xi, yi, zi, xf, yf, zf) * ampl;
            ampl *= amplitudeFalloff;
            [xi, xf] = increment(xi, xf);
            [yi, yf] = increment(yi, yf);
            [zi, zf] = increment(zi, zf);
        }
        return r;
    }
    return f;
}

splitValue = (v) => {
    if (v < 0) {
        v = -v; 
    }
    vi = Math.floor(v);
    vf = v - vi; 
    return [vi, vf];
}

const defaultPerlinInterpolation = perlinHarmonicSmoothing(perlinCosineInterpolation, 0.5, 4, 0.5);
function perlinNoise(x, y = 0, z = 0, interpolationFunc=defaultPerlinInterpolation) {
    if (perlin == null) {
        initialisePerlin();
    }
    let [xi, xf] = splitValue(Math.max(x, -x));
    let [yi, yf] = splitValue(Math.max(y, -y));
    let [zi, zf] = splitValue(Math.max(z, -z));
    return interpolationFunc(xi, yi, zi, xf, yf, zf);
}




// canvas utilities (TODO move to common js)
// https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
function drawPixel(ctx, x, y, fill="rgba(255,255,255,1)") {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, 1, 1);
}

function clearCanvas(canvas) {
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

function refillCanvas(canvas) {
    const lineColour = getPerlinColour(canvas);
}


let perlinParticles = [];
const numPerlinParticles = 8000;
// let a = 800;
let a = 500;
let frame = 0;
const maxFrames = 100;
const frameRefreshMs = 150;

let flowTimeout; 

const TAU = 2 * Math.PI;

function getPerlinTransparency(f) {
    return 0.3 + 0.7 * f/maxFrames;
}

function getPerlinColour(canvas) {
    return extractHSL(window.getComputedStyle(canvas).getPropertyValue("--line-colour"));
}

function setup(canvas) {
    canvas.width = a; 
    canvas.height = a;
}

function draw(ctx, lineColour) {
    if (frame == 0) {
        for (let i = 0; i < numPerlinParticles; i++) {
            perlinParticles[i] = {x: rand(0, a-1), y: rand(0, a-1)};
        }
    }
    const fill = `hsla(${lineColour[0]},${lineColour[1]},${lineColour[2]},${getPerlinTransparency(frame)})`
    for (p of perlinParticles){
        d = perlinNoise(p.x/99, p.y/99) * TAU;
        p.x += Math.cos(d);
        p.y += Math.sin(d);
        l = 0.05*a;  // margin
        u = a - l;
        drawPixel(ctx, clamp(p.x,l,u), clamp(p.y,l,u), fill);
    }
    if (frame < maxFrames) {
        frame++;
        flowTimeout = setTimeout(draw, frameRefreshMs, ctx, lineColour);
    }
} 

function _runFlow(canvas) {
    const lineColour = getPerlinColour(canvas);
    const ctx = canvas.getContext("2d");
    draw(ctx, lineColour);
}

function runFlow() {
    const canvas = document.getElementById("perlin-flow");
    if (canvas.getContext) {
        setup(canvas);
        window.addEventListener("DOMContentLoaded", () => { 
            // wait a bit after load to run
            flowTimeout = setTimeout(_runFlow, 1000, canvas);
        });
    } else {
        // canvas-unsupported code here
    }
}

function refreshFlow(canvas) {
    clearTimeout(flowTimeout);
    clearCanvas(canvas);
    frame = 0;
    _runFlow(canvas);
}

// TODO: handle resize, randomise colours?, handle theme change