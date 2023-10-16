---
title: SVGs - Super Versatile Graphics
date: 2023-10-13
style: post
---

Images are an important part of modern websites. **Scalable Vector Graphics** (SVGs) are recipes for computers to create graphics. Unlike other static graphics formats like .jpg's, SVGs can scale to different sizes because the recipes can be scaled. You can double the ingredients in a recipe, right? There is plenty of documentation on the web covering how they work, like this [tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial). This post explains SVGs used on the website, and as such, my tinkering with them. 
Let's look at some of our website components (as of posting). 

## Mmmmm Hamburger
<div style="width:30vmin;">
    {% filter indent(width=4) %}{% include "hamburger.svg" %}{% endfilter %}
</div>

The simple hamburger. A staple of healthy website navigation menus, though usually more abstractly minimalist. This one comes from [here](https://www.svgrepo.com/svg/352109/hamburger). I've modified it animate on click (try it). 

### Paths
One of the basic ways to draw an image in SVGs is with paths. Given a canvas size, this tells the computer where to put down and move its pen to create a stroke. A system of x-, y-coordinates are used together with codes for types of lines. 
The command <pre><code>M 0 0</code></pre> means "Move to position x=0 y=0". 
Recognised commands are: 
- M: Move to
- L: Line to 
- H: Horizontal line to
- V: Vertical line to 
- C: Curve to 
- S: Smooth curve to 
- Q: Quadratic Bézier curve to 
- T: smooth quadratic Bézier curve to 
- A: ellipical Arc
- Z: close path

Most of these are straightforward to understand, though some of the curves (Smooth, Bézier, smooth Bézier) may need further explanation. Bézier curves in particular are interesting, and ubiquitous amongst graphics software. 
Each command has an equivalent lowercase version which takes relative coordinates, rather than absolute. I.e. <pre><code>m 3 2</code></pre> means "move by dx=3 dy=2". 
In the hamburger image, this snippet draws the patty:
<pre><code class="language-html">&lt;path d="M464 256H48a48 48 0 0 0 0 96h416a48 48 0 0 0 0-96z">&lt;/path></code></pre>
Having the elements of an image defined in the HTML like this means you can apply CSS styles and animations to them. In the hamburger icon, there are two identically drawn patties, in group tags &lt;g>, which have different animate to the strokes of the "X" when the menu button is clicked. 
Neato. 

Note that paths are not the only way to draw basic shapes in SVGs, and other commands exist to draw standard shapes, 
- rect: rectangle
- circle
- ellipse
- line 
- polyline: a group of connected straight lines
- polygon

## If it Fits
<div style="width:30vmin;">
    {% filter indent(width=4) %}{% include "puzzle.svg" %}{% endfilter %}
</div>

On the [home page](/), there is this puzzle icon, borrowed shamelessly from [here](https://www.svgrepo.com/svg/95443/puzzle). Try clicking it :).

### Animations
You can do more than just draw paths and shapes in SVGs. You can animate different parts of your SVG with the [animate](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate), [animateMotion](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion) and [animateTransform](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform) tags. 
It seems like there is some overlap in functionality with animations in SVG HTML code and animations in CSS. Purists would probably argue that all styling and animations should be in the CSS. However, having self-contained SVGs, with image content as well as styling and animations, means that they are more readily portable and reusable. 

The rotation animation in the puzzle piece looks like: 
<pre><code class="language-html">
&lt;animateTransform 
    attributeName="transform" 
    attributeType="XML" 
    type="rotate" 
    from="0 256 256" 
    to="360 256 256" 
    dur="10s" 
    repeatCount="indefinite"
/>
</code></pre>

The transform types for this tag are similar to those available in CSS: translate, scale, rotate, skewX, skewY. See [reference](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/type#for_the_animatetransform_elements). 
The "from" and "to" fields are formatted as (degrees, centre x, centre y) which defines a starting and ending rotation in degrees around a certain point. 
The "dur" tag defines the duration between the "from" and "to" states and the "repeatCount" specifies how many times the transformation happens. 
Nifty. 

## Let there be Light
<div style="width:30vmin;">
    {% filter indent(width=4) %}{% include "lightbulb.svg" %}{% endfilter %}
</div>

What else can SVGs do? Turns out, a lot. Filters have entered the chat. These modify the whole, or parts of the image. 
Witness my lightbulb, remorselessly thieved from [here](https://www.svgrepo.com/svg/10005/light-bulb). 
The glow is a filter effect with an animation to get the pulsing. 

### Effect Filters

Let's look at this filter. 
<pre><code class="language-html">
&lt;filter id="lightbulb-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
    &lt;feGaussianBlur result="blurOut" stdDeviation="20">
        &lt;animate 
            attributeName="stdDeviation" 
            calcMode="paced" 
            begin="0s" 
            dur="2s" 
            values="0;50;0;" 
            repeatCount="indefinite"
        />
    &lt;/feGaussianBlur>
    &lt;feBlend in="SourceGraphic" in2="blurOut"/>
&lt;/filter>
</code></pre>

We first define the filter's size in the opening tag. The "-50%" values for x and y just re-centre to the top left (I think). 
The first inner tag is "feGaussianBlur" which blurs the filter's input. The amount of blur is controlled by "stdDeviation". 
Within this, we can define an "animate" tag to slide the "stdDeviation" value between values 0 to 50 and back to 0 again to get the pulsing effect. 
The final inner tag in the filter, "feBlend", controls how the filter is applied: it blends the "SourceGraphic", i.e. the input image, with the Gaussian blur effect we labelled as "blurOut". 
To apply this filter to a part of the SVG, we simply add <pre>filter="url(#lightbulb-glow-filter)"</pre> to the path tag which draws the outline of the lightbulb. 
Et voilà.

There are many more filters, and most can be animated and stacked to create complex effects. 
[This](https://sean.brunnock.com/SVG/filter.html) is a very useful tool for experimenting with filters.

## To the Moon
<div style="width:30vmin;">
    {% filter indent(width=4) %}{% include "rocket.svg" %}{% endfilter %}
</div>

We will go to the moon, not because it is easy, but because it is hard. A quote from Abraham Lincoln. 
This rocket is assembled [here](https://www.svgrepo.com/svg/51643/rocket-launch) and the propulsion was engineered from [here](https://codepen.io/PaulLeBeau/pen/EQoraz). 
Let's break it down. 

### Stacking Filters and Effects
In the defs tag, we define a fill effect, filter effect and masking effect to apply to a simple rectangle positioned at the base of the rocket. This creates our flames. 

<pre><code class="language-html">
&lt;radialGradient id="fade" cx="0.5" cy="0" r="1" color-interpolation="sRGB">
    &lt;stop offset="0.5" stop-color="#fff"/>
    &lt;stop offset="0.7" stop-color="#000"/>
&lt;/radialGradient>
&lt;mask id="flame-shape" maskContentUnits = "objectBoundingBox">
    &lt;circle cx="0.5" cy="0.28" r="0.28" fill="white"/>
    &lt;polygon points="0.22,0.3, 0.26,1, 0.74,1, 0.78,0.3" fill="url(#fade)"/>
&lt;/mask>
</code></pre>
Let's start with the simplest def, the mask. This will define the shape of the flame. We draw some shapes and fill with white and everything outside that shape is hidden. 
An extra sophistication is the "radialGradient" which is applied to a polygon and used to get the transparent fall-off at the bottom of the flames. 

This is what the flame mask looks like. 
<div style="width:30vmin;">
    <svg height="100%" width="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" xmlns:xlink="http://www.w3.org/1999/xlink" style="overflow:visible;">
        <g class="rocket-flames">
            <rect x="76" y="10" width="360" height="300" mask="url(#flame-shape)"/>
        </g>
    </svg>
</div>

Next let's look at the flame filter effect. There are a lot of layers here.  
The idea here is a kind of treadmill effect, where the surface has some squashed noise. 
If you stare at it for a bit, you'll notice the pattern repeats.
Here it is in gory detail. 

<pre><code class="language-html">
&lt;filter id="flames" filterUnits="objectBoundingBox" x="0%" y="-100%" width="100%" height="300%">
    &lt;feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" result="noise" stitchTiles="stitch"/>
    &lt;feOffset dy="0" result="off1">
        &lt;animate attributeType="XML" attributeName="dy" from="-300" to="0" dur="3s" repeatCount="indefinite" /> 
    &lt;/feOffset>
    &lt;feOffset in="noise" dy="60" result="off2">
        &lt;animate attributeType="XML" attributeName="dy" from="0" to="300" dur="3s" repeatCount="indefinite" /> 
    &lt;/feOffset>
    &lt;feMerge result="scrolling-noise">
        &lt;feMergeNode in="off1"/>
        &lt;feMergeNode in="off2"/>
    &lt;/feMerge>
    &lt;feComponentTransfer result="brighter-noise">
        &lt;feFuncA type="gamma" amplitude="1" exponent="1"/>
    &lt;/feComponentTransfer>
    &lt;feComposite in="SourceGraphic" in2="brighter-noise" operator="in" result="gradient-noise"/>
    &lt;feComponentTransfer result="threshhold">
        &lt;feFuncA type="discrete" tableValues="0 1"/>
    &lt;/feComponentTransfer>
    &lt;feFlood flood-color="var(--accent)" result="flood1"/>
    &lt;feComposite in2="threshhold" in="flood1" operator="in" result="flood1-threshhold"/>
    &lt;feFlood flood-color="var(--primary)" result="flood2"/>
    &lt;feComponentTransfer in="SourceGraphic" result="exponent-gradient">
        &lt;feFuncA type="gamma" exponent="3"/>
    &lt;/feComponentTransfer>
    &lt;feComposite in="flood2" in2="exponent-gradient" operator="in" result="flood2-gradient"/>
    &lt;feComposite in2="threshhold" in="flood2-gradient" operator="in" result="flood2-gradient-threshhold"/>
    &lt;feMerge>
        &lt;feMergeNode in="flood1-threshhold"/>
        &lt;feMergeNode in="flood2-gradient-threshhold"/>
    &lt;/feMerge>
&lt;/filter>
</code></pre>
Step by step: 
1. feTurbulence: This defines the noise pattern. 
2. feOffset: Two copies of this noise pattern are created, labelled "off1" and "off2", which are shifted and animated to move downwards. This creates the treadmill effect, and any jerkiness is caused by these copies not lining up with each other. 
3. feMerge: Joins the two noise pattern copies. 
4. feComponentTransfer and feComposite: Define and apply a gamma function to the noise to create some "hot spots". 
5. feComponentTransfer: Flatten the noise map by binning the alpha channel values to 0 and 1. This creates the holes in the flames. 
6. feFlood and feComposite: Fills in the base colour of the flames. 
7. feFlood, feComponentTransfer, feComposites: Make another copy of the flames from step 5 and add a gradient fill. 
8. feMerge: Merge the solid base colour flame with the gradient filled copy.

Here's the flame with the mask and filter. If the flame is one colour, try switching the colour theme (lightbulb at the top of the page). 
<div style="width:30vmin;">
    <svg height="100%" width="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" xmlns:xlink="http://www.w3.org/1999/xlink" style="overflow:visible;">
        <g class="rocket-flames">
            <rect x="76" y="10" width="360" height="300" fill="url(#flame-grad)" filter="url(#flames)" mask="url(#flame-shape)"/>
        </g>
    </svg>
</div>

Boom, lift off. 
SVGs are neat. 