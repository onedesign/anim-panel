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
- The ability to easily set custom loop in and out ranges for focusing on a specific span of the overall timeline, including making these in/out points persistent between page refreshes
- Keyboard shortcuts for common actions

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

## Keyboard Shortcuts

AnimPanel includes keyboard-shorcuts for a variety of common actions.

| Action                          | Keyboard Shortcut                         |
| ------------------------------- | ----------------------------------------- |
| Toggle play/pause               | space                                     |
| Set speed to 1x                 | 1                                         |
| Set speed to 0.5x               | 2                                         |
| Set speed to 0.25x              | 3                                         |
| Set range start                 | b                                         |
| Set range end                   | n                                         |
| Toggle range                    | shift + space                             |
| Clear ranges                    | shift + x                                 |
| Jump forward 0.1 seconds        | alt + right arrow or page down            |
| Jump backward 0.1 seconds       | alt + left arrow or page up               |
| Jump forward 1 second      | shift + alt + right arrow or shift + page down |
| Jump backward 1 second     | shift + alt + left arrow or shift + page down  |
| Jump to start of timeline/range | return or enter                           |
| Expand range by 0.1 seconds     | alt + up arrow                            |
| Contract range by 0.1 seconds   | alt + down arrow                          |
| Expand range by 1 second        | shift + alt + up arrow                    |
| Contract range by 1 second      | shift + alt + down arrow                  |

### Customizing Shortcuts

If any of these shortcut defaults don't work for you, you can customize them when initializing AnimPanel:

```
new AnimPanel(tl, {
  shortcuts: {
    togglePlay: 'tab',
    setRangeStart: 'i',
    setRangeEnd: 'o'
  }
});
```

## Dev

`npm start`: Automatically builds on file change and starts a live reload server with an example at [http://localhost:3000/example/](http://localhost:3000/example/)

`npm run build`: Builds production-ready files

## Changelog

See the [release page](https://github.com/onedesign/anim-panel/releases).