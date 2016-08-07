# AnimPanel

A utility panel to make working with [Greensock Animation Platform](http://greensock.com) timeline animations easier.

---

## Intro

AnimPanel simplifies the process of building complex timeline-based animations using the [Greensock Animation Platform](http://greensock.com) by adding a handful of extremely useful debugging tools, including:

- Play, Pause, and Restart buttons
- A visual playback scrubber
- Buttons to dynamically change the playback speed (1x, 0.5x, 0.2x, etc)
- A display of the current timeline time
- For `TimelineMax` timelines, automatically-added buttons to jump to each label in the timeline
- The ability to easily set custom loop in and out times for focusing on a specific span of the overall timeline, including making these in/out points persistent between page refreshes

## Demo

[View the demo on CodePen](http://codepen.io/cmalven/pen/rLQxaY)

## Install

You can install AnimPanel via npm:

```
npm install anim-panel --save
```

or simply include it in your HTML:

```html
<script src="anim_panel.js"></script>
```

## Use

```js
// Require the module if you're using something like browserify or webpack
var AnimPanel = require('anim-panel')

// Create your Greensock timeline using TimelineLite or TimelineMax
// (using TimelineMax gets you extra goodies like label buttons)
var tl = new TimelineMax({});

// Add some stuff to your timeline (see the gsap docs if you don't know how to do this)
tl.add(…);

// Create the AnimPanel, passing it your Timeline instance
new AnimPanel(tl);
```

## Dev

`npm start`: Automatically builds on file change and starts a live reload server with an example at [http://localhost:3000/example/](http://localhost:3000/example/)

`npm run build`: Builds production-ready files