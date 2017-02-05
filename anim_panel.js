(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AnimPanel"] = factory();
	else
		root["AnimPanel"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var styles = __webpack_require__(1);
	var markup = __webpack_require__(3);
	var Progress = __webpack_require__(5);
	var defaultsDeep = __webpack_require__(44);
	var Combokeys = __webpack_require__(11);

	module.exports = function(timeline, options) {
	      /*
	      PARAMS:
	      timeline            The TimelineLite/TimelineMax object 
	                          to be controlled
	                          [TimelineLite/TimelineMax] (required)
	      */
	     
	      //
	      //   Private Vars
	      //
	      //////////////////////////////////////////////////////////////////////
	     
	      var self = {
	        animPanelBaseClass: 'anim-panel',
	        timelineTimeDataAttr: 'data-timeline-time',
	        playPauseSelector: '.js-play-pause',
	        restartSelector: '.js-restart',
	        timescaleSelector: '.js-timescale',
	        activeTimescaleClass: 'is-active',
	        labelsSelector: '.js-anim-panel-labels',
	        timeSelector: '.js-time',
	        shouldUpdateSliderFromTimeline: true,
	        dropdownSelector: '.js-anim-panel-dropdown',
	        dropdownTriggerSelector: '.js-anim-panel-dropdown-trigger',
	        dropdownOptionsSelector: '.js-anim-panel-dropdown-options',
	        progress: null,
	        combokeys: new Combokeys(document.documentElement),
	        timescales: [1, 0.5, 0.25]
	      };
	     
	     
	      //
	      //   Public Vars
	      //
	      //////////////////////////////////////////////////////////////////////

	      self.settings = defaultsDeep(options, {
	        shortcuts: {
	          togglePlay: 'space',
	          setRangeStart: 'b',
	          setRangeEnd: 'n',
	          toggleRange: 'shift+space',
	          clearRange: 'shift+x',
	          jumpForward: ['option+right', 'pagedown'],
	          jumpBackward: ['option+left', 'pageup'],
	          jumpForwardBig: ['shift+option+right', 'shift+pagedown'],
	          jumpBackwardBig: ['shift+option+left', 'shift+pageup'],
	          jumpToStart: ['return', 'enter'],
	          expandRange: ['option+up'],
	          contractRange: ['option+down'],
	          expandRangeBig: ['shift+option+up'],
	          contractRangeBig: ['shift+option+down']
	        }
	      });
	     
	     
	      //
	      //   Private Methods
	      //
	      //////////////////////////////////////////////////////////////////////
	     
	      var _init = function() {
	        _appendPanel();
	        _addStyles();
	        _addProgress();
	        _addLabelButtons();
	        _addEventListeners();
	        _updatePlayPauseState();
	        _bindShortcuts();
	      };

	      var _appendPanel = function() {
	        var div = document.createElement('div');
	        div.className += self.animPanelBaseClass;
	        div.innerHTML = markup;
	        document.getElementsByTagName('body')[0].appendChild(div);
	      };

	      var _addStyles = function() {
	        var head = document.head || document.getElementsByTagName('head')[0];
	        var style = document.createElement('style');

	        style.type = 'text/css';
	        if (style.styleSheet){
	          style.styleSheet.cssText += styles;
	        } else {
	          style.appendChild(document.createTextNode(styles));
	        }

	        head.appendChild(style);
	      };

	      var _addProgress = function() {
	        self.progress = new Progress(timeline, {
	          onPlayPause: _updatePlayPauseState
	        });
	      };

	      var _addLabelButtons = function() {
	        var labelContainer = document.querySelector(self.labelsSelector);

	        // Automatically grabbing labels is only
	        // supported by TimelineMax, so display
	        // a message for TimelineLite users
	        if (typeof timeline.getLabelsArray === 'undefined') {
	          var message = document.createElement('p');
	          message.innerHTML = 'Use TimelineMax to show labels.';
	          labelContainer.appendChild(message);
	          return;
	        }

	        // …automatically grab timeline labels
	        // and add buttons for each
	        var labels = timeline.getLabelsArray();

	        labels.forEach(function(label, idx) {
	          var labelButton = document.createElement('p');
	          labelButton.setAttribute('type', 'p');
	          labelButton.setAttribute(self.timelineTimeDataAttr, label.time);
	          labelButton.innerHTML = label.name;
	          labelContainer.appendChild(labelButton);
	          labelButton.addEventListener('click', function(evt) {
	            timeline.gotoAndPlay(label.name);
	            _updatePlayPauseState();
	          })
	        });
	      };
	     
	      var _addEventListeners = function() {
	        // Playback Controls
	        document.querySelector(self.playPauseSelector).addEventListener('click', self.togglePlay);
	        document.querySelector(self.restartSelector).addEventListener('click', self.gotoStart);

	        // Dropdowns
	        var dropdowns = document.querySelectorAll(self.dropdownTriggerSelector);
	        dropdowns.forEach(function(el, idx) {
	          el.addEventListener('click', _toggleDropdown.bind(self));
	        });
	        
	        // Setting Timescale
	        var timescaleLinks = document.querySelectorAll(self.timescaleSelector);
	        for (var idx = 0; idx < timescaleLinks.length; idx++) {
	          var timescaleLink = timescaleLinks[idx];
	          var timescale = timescaleLink.getAttribute('data-timescale');
	          timescaleLink.addEventListener('click', _updateTimescale.bind(self, timescaleLink, timescale));
	        }

	        // Listen for the playhead to change
	        timeline.eventCallback('onUpdate', _onTimelineUpdate.bind(self));
	      };

	      var _bindShortcuts = function() {
	        // Play/Pause
	        self.combokeys.bind(self.settings.shortcuts.togglePlay, self.togglePlay);

	        // Timescale
	        for (var idx = 0, length = self.timescales.length; idx < length; idx++) {
	          self.combokeys.bind(String(idx + 1), self.setTimescale.bind(self, self.timescales[idx]));
	        }

	        // Changing Range Start/End
	        self.combokeys.bind(self.settings.shortcuts.setRangeStart, function() { 
	          self.progress.setLoopIn(timeline.time());
	          self.progress.updateStyles();
	        });
	        self.combokeys.bind(self.settings.shortcuts.setRangeEnd, function() { 
	          self.progress.setLoopOut(timeline.time());
	          self.progress.updateStyles();
	        });

	        // Showing/Hiding Range
	        self.combokeys.bind(self.settings.shortcuts.toggleRange, self.progress.toggleRange);

	        // Clearing Range
	        self.combokeys.bind(self.settings.shortcuts.clearRange, function() {
	          self.progress.clearRange();
	          self.progress.updateStyles();
	        });

	        // Expanding the range on either side
	        self.combokeys.bind(self.settings.shortcuts.expandRange, self.progress.expandRange.bind(self, 1));
	        self.combokeys.bind(self.settings.shortcuts.contractRange, self.progress.contractRange.bind(self, 1));
	        self.combokeys.bind(self.settings.shortcuts.expandRangeBig, self.progress.expandRange.bind(self, 10));
	        self.combokeys.bind(self.settings.shortcuts.contractRangeBig, self.progress.contractRange.bind(self, 10));

	        // Jumping in time
	        self.combokeys.bind(self.settings.shortcuts.jumpForward, self.jumpForward.bind(self, 1));
	        self.combokeys.bind(self.settings.shortcuts.jumpBackward, self.jumpBackward.bind(self, 1));
	        self.combokeys.bind(self.settings.shortcuts.jumpForwardBig, self.jumpForward.bind(self, 10));
	        self.combokeys.bind(self.settings.shortcuts.jumpBackwardBig, self.jumpBackward.bind(self, 10));

	        // Restart timeline
	        self.combokeys.bind(self.settings.shortcuts.jumpToStart, self.gotoStart);
	      };

	      var _toggleDropdown = function(evt) {
	        var container = evt.target.parentNode;
	        container.classList.toggle('is-active');
	      };

	      var _onTimelineUpdate = function() {
	        // Update the displayed time
	        _updateTime(timeline.totalTime());

	        // Don't worry about loop if we're dragging
	        if (self.progress.isDragging) return;

	        // If we're at the loop out point, jump to the loop in point
	        var isOverRangeOut = timeline.totalTime() >= self.progress.loopOut && self.progress.isShowingRange;
	        var isOverTimelineDuration = timeline.totalTime() >= timeline.totalDuration();
	        if (!timeline.paused() && isOverRangeOut || isOverTimelineDuration) {
	          timeline.time(self.progress.isShowingRange ? self.progress.loopIn : 0);
	        }

	        // Update slider based on timeline
	        var progressPercentage = timeline.progress() * 100;
	        self.progress.setPercentage(progressPercentage);
	      };

	      var _updateTime = function(timelineTime) {
	        var timeEl = document.querySelector(self.timeSelector);
	        var roundedTime = Math.round(timelineTime * 100) / 100
	        timeEl.innerHTML = roundedTime;
	      };

	      var _updateTimescale = function(selectedTimescale, timescale) {
	        var timescaleItems = document.querySelectorAll(self.timescaleSelector);
	        
	        for (var idx = 0; idx < timescaleItems.length; idx++) {
	          var item = timescaleItems[idx];
	          item.classList.remove(self.activeTimescaleClass);
	        }
	        
	        selectedTimescale.classList.add(self.activeTimescaleClass)
	        timeline.timeScale(timescale).play();
	        _updatePlayPauseState();
	      };

	      var _updatePlayPauseState = function() {
	        if (timeline.paused()) {
	          document.querySelector(self.playPauseSelector).classList.remove('is-playing');
	        } else {
	          document.querySelector(self.playPauseSelector).classList.add('is-playing');
	        }
	      };

	      var _jump = function(direction, units) {
	        var timeUnit = 0.1;
	        var direction = (typeof direction === 'number' ? direction : 1);
	        var timeToJump = (timeUnit * units) * direction;
	        var newTime = timeline.time() + timeToJump;
	        self.pause();
	        if (newTime < 0) newTime = 0;
	        if (newTime > timeline.totalDuration()) newTime = timeline.totalDuration();
	        timeline.time(newTime);
	      }


	      //
	      //   Public Methods
	      //
	      //////////////////////////////////////////////////////////////////////

	      self.play = function() {
	        timeline.play();
	        _updatePlayPauseState();
	      };

	      self.pause = function() {
	        timeline.pause();
	        _updatePlayPauseState();
	      };

	      self.togglePlay = function(evt) {
	        if (timeline.paused()) {
	          self.play();
	        } else {
	          self.pause();
	        }
	      };

	      self.gotoStart = function(evt) {
	        timeline.time(self.progress.isShowingRange ? self.progress.loopIn : 0);
	      };

	      self.gotoEnd = function(evt) {
	        timeline.time(self.progress.isShowingRange ? self.progress.loopOut : timeline.totalDuration());
	      };

	      self.setTimescale = function(multiplier) {
	        var matchingEl = document.querySelectorAll(self.timescaleSelector + '[data-timescale="' + multiplier + '"]')[0];
	        matchingEl.click();
	      };

	      self.jumpForward = function(units) {
	        _jump(1, units);
	      }

	      self.jumpBackward = function(units) {
	        _jump(-1, units);
	      }
	     
	     
	      //
	      //   Initialize
	      //
	      //////////////////////////////////////////////////////////////////////
	     
	      _init();
	     
	      // Return the Object
	      return self;
	    }

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(2)();
	// imports


	// module
	exports.push([module.id, ".anim-panel {\n  position: fixed;\n  top: -1px;\n  left: 0;\n  right: 0;\n  width: 100%;\n  font-family: \"Menlo\", \"Lucida Grande\", \"Lucida Sans Unicode\", \"Lucida Sans\", Geneva, Verdana, sans-serif;\n  font-size: 11px;\n  display: flex;\n  justify-content: space-between;\n  background-color: rgba(0, 0, 0, 0.9); }\n  .anim-panel > .js-slider {\n    margin-top: 8px; }\n\n.anim-panel__control-set {\n  display: flex; }\n\n.anim-panel__timescale-set {\n  display: flex; }\n\n.anim-panel__loop-set {\n  display: flex; }\n\n.anim-panel__slider-set {\n  flex: 1; }\n\n.anim-panel__button {\n  width: 43px;\n  padding: 15px 0;\n  text-align: center;\n  cursor: pointer;\n  margin: 0;\n  background-position: center center;\n  background-repeat: no-repeat;\n  text-indent: -9999px; }\n  .anim-panel__button:hover {\n    background-color: rgba(255, 255, 255, 0.05); }\n\n.anim-panel__button--play-pause {\n  background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"><title>play</title><polygon points=\"20.657 14.5 11 20.157 11 8.843 20.657 14.5\" style=\"fill:#fff\"/></svg>'); }\n  .anim-panel__button--play-pause.is-playing {\n    background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"><title>pause</title><rect x=\"10\" y=\"9\" width=\"2\" height=\"11\" style=\"fill:#fff\"/><rect x=\"18\" y=\"9\" width=\"2\" height=\"11\" style=\"fill:#fff\"/></svg>'); }\n\n.anim-panel__button--restart {\n  background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"><title>restart</title><polygon points=\"10.343 14.5 20 20.157 20 8.843 10.343 14.5\" style=\"fill:#fff\"/><rect x=\"8\" y=\"9\" width=\"2\" height=\"11\" style=\"fill:#fff\"/></svg>'); }\n\n.anim-panel__button--labels {\n  background-image: url('data:image/svg+xml;utf8,<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"> <path fill=\"#fff\" d=\"M20 20l-5-4-5 4V9h10z\"/></svg>'); }\n\n.anim-panel__button--range {\n  background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"><path fill=\"#fff\" d=\"M11 21h2V8h-2c-.6 0-1 .4-1 1v11c0 .5.4 1 1 1zM19 21h-2V8h2c.6 0 1 .4 1 1v11c0 .5-.5 1-1 1zM7 14h3v1H7zM20 14h3v1h-3z\"/><path fill=\"none\" d=\"M0 0h30v30H0z\"/></svg>'); }\n  .anim-panel__button--range.is-active {\n    background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\"><path fill=\"#0085a1\" d=\"M11 21h2V8h-2c-.6 0-1 .4-1 1v11c0 .5.4 1 1 1zM19 21h-2V8h2c.6 0 1 .4 1 1v11c0 .5-.5 1-1 1zM7 14h3v1H7zM20 14h3v1h-3z\"/><path fill=\"none\" d=\"M0 0h30v30H0z\"/></svg>'); }\n\n@keyframes active-control {\n  0%, 100% {\n    opacity: 1; }\n  50% {\n    opacity: 0.3; } }\n\n.anim-panel__timescale-button {\n  margin: 0;\n  padding: 15px 12px;\n  text-align: center;\n  cursor: pointer;\n  color: #666; }\n  .anim-panel__timescale-button:hover {\n    color: #aaa; }\n  .anim-panel__timescale-button.is-active {\n    color: #fff; }\n\n.anim-panel__dropdown {\n  position: relative; }\n\n.anim-panel__dropdown-options {\n  position: absolute;\n  background-color: red;\n  display: none; }\n  .anim-panel__dropdown-options > p {\n    margin: 0;\n    padding: 11px 14px;\n    color: #fff;\n    background-color: #555;\n    cursor: pointer; }\n  .anim-panel__dropdown-options > p:hover {\n    background-color: #444; }\n\n.anim-panel__dropdown.is-active .anim-panel__dropdown-labels-button {\n  background-color: #333; }\n\n.anim-panel__dropdown.is-active .anim-panel__dropdown-options {\n  display: block; }\n\n.anim-panel__time {\n  width: 60px;\n  margin: 0; }\n  .anim-panel__time > p {\n    margin: 0;\n    margin-top: 14px;\n    margin-left: 17px;\n    color: #fff; }\n\n.anim-panel__slider-track {\n  width: 100%;\n  height: 42px;\n  position: relative; }\n  .anim-panel__slider-track:before {\n    content: \"\";\n    display: block;\n    position: absolute;\n    height: 6px;\n    left: 18px;\n    right: 18px;\n    top: 18px;\n    background-color: rgba(255, 255, 255, 0.3);\n    border-radius: 3px; }\n\n.anim-panel__slider-playhead {\n  width: 42px;\n  height: 42px;\n  display: block;\n  position: relative;\n  cursor: pointer; }\n  .anim-panel__slider-playhead:before {\n    content: \"\";\n    display: block;\n    width: 6px;\n    height: 6px;\n    border-radius: 3px;\n    background-color: #fff;\n    transform-origin: 50% 50%;\n    position: absolute;\n    left: 18px;\n    top: 18px;\n    transition: transform 0.2s; }\n\n.anim-panel__slider-range {\n  display: none; }\n  .anim-panel__slider-range.is-active {\n    display: block; }\n\n.anim-panel__slider-range-handle {\n  width: 42px;\n  height: 42px;\n  display: block;\n  position: absolute;\n  top: 0;\n  cursor: pointer; }\n  .anim-panel__slider-range-handle:after {\n    content: \"\";\n    display: block;\n    position: absolute;\n    width: 6px;\n    height: 24px;\n    background-color: #0085a1;\n    top: 9px; }\n  .anim-panel__slider-range-handle:nth-child(1):after {\n    border-top-left-radius: 3px;\n    border-bottom-left-radius: 3px;\n    left: 11px; }\n  .anim-panel__slider-range-handle:nth-child(2) {\n    right: 0; }\n    .anim-panel__slider-range-handle:nth-child(2):after {\n      right: 11px;\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px; }\n\n.anim-panel__slider-range-span {\n  display: block;\n  background-color: #0085a1;\n  height: 6px;\n  pointer-events: none;\n  position: absolute;\n  top: 18px;\n  left: 18px;\n  border-radius: 3px; }\n  .anim-panel__slider-range-span + .anim-panel__slider-range-span {\n    left: auto;\n    right: 18px; }\n\n.anim-panel__slider:hover .anim-panel__slider-playhead:before {\n  transform: scale(2.5); }\n", ""]);

	// exports


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "<div class=\"anim-panel__control-set\">\n  <p class=\"anim-panel__button anim-panel__button--play-pause js-play-pause\" title=\"Play/Pause\">Play/Pause</p>\n  <p class=\"anim-panel__button anim-panel__button--restart js-restart\" title=\"Restart\">Restart</p>  \n</div>\n\n<div class=\"anim-panel__timescale-set\">\n  <p class=\"anim-panel__timescale-button js-timescale is-active\" data-timescale=\"1\">1x</p>\n  <p class=\"anim-panel__timescale-button js-timescale\" data-timescale=\"0.5\">0.5x</p>\n  <p class=\"anim-panel__timescale-button js-timescale\" data-timescale=\"0.25\">0.25x</p>\n</div>\n\n<div class=\"anim-panel__labels\">\n  <div class=\"anim-panel__dropdown js-anim-panel-dropdown\">\n    <div class=\"anim-panel__button anim-panel__button--labels js-anim-panel-dropdown-trigger\">L</div>\n    <div class=\"anim-panel__dropdown-options js-anim-panel-labels js-anim-panel-dropdown-options\"></div>\n  </div>\n</div>\n\n<div class=\"anim-panel__range\">\n  <p class=\"anim-panel__button anim-panel__button--range js-range-toggle\" title=\"Hide/Show Range\">Hide/Show Range</p>\n</div>\n\n<div class=\"anim-panel__slider-set\">\n  <div class=\"anim-panel__slider js-anim-panel-slider\">\n    <div class=\"anim-panel__slider-track js-anim-panel-slider-track\">\n      <div class=\"anim-panel__slider-range js-slider-range\">\n        <span class=\"anim-panel__slider-range-handle js-anim-panel-slider-range-handle-start\"></span>\n        <span class=\"anim-panel__slider-range-handle js-anim-panel-slider-range-handle-end\"></span>\n        \n        <span class=\"anim-panel__slider-range-span anim-panel__slider-range-span--before js-anim-panel-slider-range-before\"></span>\n        <span class=\"anim-panel__slider-range-span anim-panel__slider-range-span--after js-anim-panel-slider-range-after\"></span>\n      </div>\n      <span class=\"anim-panel__slider-playhead js-anim-panel-slider-playhead\"></span>\n    </div>\n  </div>\n</div>\n\n<div class=\"anim-panel__time\">\n  <p class=\"js-time\">0</p>\n</div>\n";

/***/ },
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Draggabilly = __webpack_require__(6);

	module.exports = function(timeline, options) {
	  //
	  //   Private Vars
	  //
	  //////////////////////////////////////////////////////////////////////
	 
	  var self = {
	    sliderTrackSelector: '.js-anim-panel-slider-track',
	    sliderPlayheadSelector: '.js-anim-panel-slider-playhead',
	    sliderRangeSelector: '.js-slider-range',
	    sliderRangeStartSelector: '.js-anim-panel-slider-range-handle-start',
	    sliderRangeEndSelector: '.js-anim-panel-slider-range-handle-end',
	    rangeSpanBeforeSelector: '.js-anim-panel-slider-range-before',
	    rangeSpanAfterSelector: '.js-anim-panel-slider-range-after',
	    toggleRangeSelector: '.js-range-toggle',

	    sliderTrackEl: null,
	    sliderPlayheadEl: null,
	    sliderRangeEl: null,
	    sliderRangeStartEl: null,
	    sliderRangeEndEl: null,
	    rangeSpanBeforeEl: null,
	    rangeSpanAfterEl: null,
	    toggleRangeEl: null,

	    showRangeActiveClass: 'is-active',
	    rangeGap: 7,
	    draggablePlayhead: null,
	    isDragging: false,
	    loopIn: null,
	    loopOut: null,
	    isShowingRange: false
	  };
	 
	 
	  //
	  //   Private Methods
	  //
	  //////////////////////////////////////////////////////////////////////
	 
	  var _init = function() {
	    _assignVariables();
	    _createDraggables();
	    _addEventListeners();
	    _setIsShowingRange();
	    _setLoop();
	  };

	  var _assignVariables = function() {
	    self.sliderTrackEl = document.querySelector(self.sliderTrackSelector);
	    self.sliderPlayheadEl = document.querySelector(self.sliderPlayheadSelector);
	    self.sliderRangeEl = document.querySelector(self.sliderRangeSelector);
	    self.sliderRangeStartEl = document.querySelector(self.sliderRangeStartSelector);
	    self.sliderRangeEndEl = document.querySelector(self.sliderRangeEndSelector);
	    self.rangeSpanBeforeEl = document.querySelector(self.rangeSpanBeforeSelector);
	    self.rangeSpanAfterEl = document.querySelector(self.rangeSpanAfterSelector);
	    self.toggleRangeEl = document.querySelector(self.toggleRangeSelector);
	  };

	  var _createDraggables = function() {
	    self.draggablePlayhead = new Draggabilly(self.sliderPlayheadSelector, {
	      containment: self.sliderTrackSelector,
	      axis: 'x'
	    });

	    self.draggableStart = new Draggabilly(self.sliderRangeStartSelector, {
	      containment: self.sliderTrackSelector,
	      axis: 'x'
	    });

	    self.draggableEnd = new Draggabilly(self.sliderRangeEndSelector, {
	      containment: self.sliderTrackSelector,
	      axis: 'x'
	    });
	  };
	 
	  var _addEventListeners = function() {
	    self.draggablePlayhead.on('pointerDown', function(evt, pointer) {
	      timeline.pause(); 
	      _playPauseCallback();
	      self.isDragging = true;
	    });

	    self.draggablePlayhead.on('pointerUp', function(evt, pointer) {
	      self.isDragging = false;
	    });

	    self.draggablePlayhead.on('dragMove', function(evt, pointer, moveVector) {
	      timeline.progress(_getProgressPercentage()).pause();
	    });

	    self.draggableStart.on('dragMove', function(evt, pointer, moveVector) {
	      self.setLoopIn(_getTimeFromDraggablePosition(self.draggableStart));
	      timeline.pause();
	      _playPauseCallback();
	      timeline.seek(self.loopIn);
	    });

	    self.draggableEnd.on('dragMove', function(evt, pointer, moveVector) {
	      self.setLoopOut(_getTimeFromDraggablePosition(self.draggableEnd));
	      timeline.pause();
	      _playPauseCallback();
	      timeline.seek(self.loopOut);
	    });

	    self.sliderTrackEl.addEventListener('click', _trackClicked.bind(self));
	    self.toggleRangeEl.addEventListener('click', self.toggleRange);

	    window.onresize = self.updateStyles;
	  };

	  var _setIsShowingRange = function() {
	    if (localStorage.getItem('isShowingRange') == 'true') {
	      self.toggleRange();
	    }
	  };

	  var _trackClicked = function(evt) {
	    if (evt.target === self.sliderPlayheadEl) return;
	    if (evt.target === self.sliderRangeStartEl) return;
	    if (evt.target === self.sliderRangeEndEl) return;

	    var playheadWidth = self.sliderPlayheadEl.offsetWidth;
	    var clickPos = evt.offsetX - playheadWidth / 2;
	    var progressPercentage = clickPos / _getMaxPlayheadPosition() * 100;
	    self.setPercentage(progressPercentage);
	    timeline.progress(_getProgressPercentage()).pause();
	    _playPauseCallback();
	  };

	  var _getMaxPlayheadPosition = function() {
	    var playheadWidth = self.sliderPlayheadEl.offsetWidth;
	    var trackWidth = self.sliderTrackEl.offsetWidth;
	    var max = trackWidth - playheadWidth;
	    return max;
	  };

	  var _getMaxRangePosition = function() {
	    var rangeWidth = self.sliderRangeStartEl.offsetWidth;
	    var trackWidth = self.sliderTrackEl.offsetWidth;
	    var max = trackWidth - rangeWidth;
	    return max;
	  };

	  var _getProgressPercentage = function() {
	    return self.draggablePlayhead.position.x / _getMaxPlayheadPosition();
	  };

	  var _getTimeFromDraggablePosition = function(draggable) {
	    var positionPercentage = draggable.position.x / _getMaxRangePosition();
	    var positionTime = timeline.totalDuration() * positionPercentage;
	    return positionTime;
	  };

	  var _playPauseCallback = function() {
	    if (typeof options !== 'undefined' && typeof options.onPlayPause === 'function') {
	      options.onPlayPause();
	    }
	  };

	  var _setLoop = function() {
	    // Set default values
	    _setLoopDefaults();

	    // Check for local storage values
	    var loopIn = Number(localStorage.getItem('loopIn'));
	    if (loopIn < 0) loopIn = 0;
	    self.loopIn = loopIn;
	    if (self.isShowingRange) timeline.time(self.loopIn);

	    var loopOut = Number(localStorage.getItem('loopOut'));
	    if (loopOut > timeline.totalDuration()) loopOut = timeline.totalDuration();
	    self.loopOut = loopOut;

	    _updateRangePositions();
	    _updateRangeSpans();
	  };

	  var _updateRangePositions = function() {
	    var startPosition = _getRangeHandlePositionFromTime(self.loopIn);
	    var endPosition = _getRangeHandlePositionFromTime(self.loopOut);
	    var rangeStartEl = self.sliderRangeStartEl;
	    var rangeEndEl = self.sliderRangeEndEl;

	    self.draggableStart.position.x = startPosition;
	    rangeStartEl.style.left = startPosition + 'px';

	    self.draggableEnd.position.x = endPosition;
	    rangeEndEl.style.left = endPosition + 'px';
	  };

	  var _setLoopDefaults = function(evt) {
	    self.loopIn = 0;
	    self.loopOut = timeline.totalDuration();
	    console.log('Loop Reset: In ' + self.loopIn + ', Out ' + self.loopOut);
	  };

	  var _getRangeHandlePositionFromTime = function(time) {
	    var timePercentage = time / timeline.totalDuration();
	    var position = timePercentage * _getMaxRangePosition();
	    return position; 
	  };

	  var _updateRangeSpans = function() {
	    var rangeHandleOffset = 3;
	    var rangeHandleWidth = self.sliderRangeStartEl.offsetWidth;
	    var maxWidth = self.sliderTrackEl.offsetWidth;

	    var beforeHandlePos = _getRangeHandlePositionFromTime(self.loopIn);
	    var afterHandlePos = _getRangeHandlePositionFromTime(self.loopOut);

	    var beforeWidth = beforeHandlePos - rangeHandleOffset;
	    var afterWidth = maxWidth - (afterHandlePos + rangeHandleWidth + rangeHandleOffset);
	    if (beforeWidth < 0) beforeWidth = 0;
	    if (afterWidth < 0) afterWidth = 0;

	    self.rangeSpanBeforeEl.style.width = beforeWidth + (beforeWidth > 0 ? 'px' : '');
	    self.rangeSpanAfterEl.style.width = afterWidth + (afterWidth > 0 ? 'px' : '');
	  };
	 
	 
	  //
	  //   Public Methods
	  //
	  //////////////////////////////////////////////////////////////////////
	  
	  
	  self.setPercentage = function(percentage) {
	    var max = _getMaxPlayheadPosition();
	    var playheadEl = self.sliderPlayheadEl;
	    var position = max * (percentage / 100);
	    self.draggablePlayhead.position.x = position;
	    playheadEl.style.left = position + 'px';
	  };

	  self.toggleRange = function() {
	    self.isShowingRange = !self.isShowingRange;
	    localStorage.setItem('isShowingRange', self.isShowingRange);
	    if (self.isShowingRange) {
	      self.sliderRangeEl.classList.add(self.showRangeActiveClass);
	      self.toggleRangeEl.classList.add(self.showRangeActiveClass);
	    } else {
	      self.sliderRangeEl.classList.remove(self.showRangeActiveClass);
	      self.toggleRangeEl.classList.remove(self.showRangeActiveClass);
	    }
	    _updateRangePositions();
	    _updateRangeSpans();
	  }

	  self.setLoopIn = function(time) {
	    if (time >= self.loopOut) time = self.loopOut - 0.1;
	    if (time < 0) time = 0;
	    localStorage.setItem('loopIn', time);
	    self.loopIn = time;
	    _updateRangeSpans();
	    console.log('Loop In Set: ', time);
	  };

	  self.setLoopOut = function(time) {
	    if (time <= self.loopIn) time = self.loopIn + 0.1;
	    if (time > timeline.totalDuration()) time = timeline.totalDuration();
	    localStorage.setItem('loopOut', time);
	    self.loopOut = time;
	    _updateRangeSpans();
	    console.log('Loop Out Set: ', time);
	  };

	  self.updateStyles = function() {
	    _updateRangeSpans();
	    _updateRangePositions();
	  }

	  self.clearRange = function() {
	    self.setLoopIn(0);
	    self.setLoopOut(timeline.totalDuration());
	  }
	  
	  self.expandRange = function(units) {
	    var unit = 0.1;
	    var units = (typeof units === 'number' ? units : 1);
	    var amount = unit * units;
	    self.setLoopIn(self.loopIn - amount);
	    self.setLoopOut(self.loopOut + amount);
	    self.updateStyles();
	  }
	  
	  self.contractRange = function(units) {
	    var unit = 0.1;
	    var units = (typeof units === 'number' ? units : 1);
	    var amount = unit * units;
	    self.setLoopIn(self.loopIn + amount);
	    self.setLoopOut(self.loopOut - amount);
	    self.updateStyles();
	  }
	 
	 
	  //
	  //   Initialize
	  //
	  //////////////////////////////////////////////////////////////////////
	 
	  _init();
	 
	  // Return the Object
	  return self;
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Draggabilly v2.1.1
	 * Make that shiz draggable
	 * http://draggabilly.desandro.com
	 * MIT license
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true */

	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */ /*globals define, module, require */
	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(7),
	        __webpack_require__(8)
	      ], __WEBPACK_AMD_DEFINE_RESULT__ = function( getSize, Unidragger ) {
	        return factory( window, getSize, Unidragger );
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof module == 'object' && module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('get-size'),
	      require('unidragger')
	    );
	  } else {
	    // browser global
	    window.Draggabilly = factory(
	      window,
	      window.getSize,
	      window.Unidragger
	    );
	  }

	}( window, function factory( window, getSize, Unidragger ) {

	'use strict';

	// vars
	var document = window.document;

	function noop() {}

	// -------------------------- helpers -------------------------- //

	// extend objects
	function extend( a, b ) {
	  for ( var prop in b ) {
	    a[ prop ] = b[ prop ];
	  }
	  return a;
	}

	function isElement( obj ) {
	  return obj instanceof HTMLElement;
	}

	// -------------------------- requestAnimationFrame -------------------------- //

	// get rAF, prefixed, if present
	var requestAnimationFrame = window.requestAnimationFrame ||
	  window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

	// fallback to setTimeout
	var lastTime = 0;
	if ( !requestAnimationFrame )  {
	  requestAnimationFrame = function( callback ) {
	    var currTime = new Date().getTime();
	    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
	    var id = setTimeout( callback, timeToCall );
	    lastTime = currTime + timeToCall;
	    return id;
	  };
	}

	// -------------------------- support -------------------------- //

	var docElem = document.documentElement;
	var transformProperty = typeof docElem.style.transform == 'string' ?
	  'transform' : 'WebkitTransform';

	var jQuery = window.jQuery;

	// --------------------------  -------------------------- //

	function Draggabilly( element, options ) {
	  // querySelector if string
	  this.element = typeof element == 'string' ?
	    document.querySelector( element ) : element;

	  if ( jQuery ) {
	    this.$element = jQuery( this.element );
	  }

	  // options
	  this.options = extend( {}, this.constructor.defaults );
	  this.option( options );

	  this._create();
	}

	// inherit Unidragger methods
	var proto = Draggabilly.prototype = Object.create( Unidragger.prototype );

	Draggabilly.defaults = {
	};

	/**
	 * set options
	 * @param {Object} opts
	 */
	proto.option = function( opts ) {
	  extend( this.options, opts );
	};

	// css position values that don't need to be set
	var positionValues = {
	  relative: true,
	  absolute: true,
	  fixed: true
	};

	proto._create = function() {

	  // properties
	  this.position = {};
	  this._getPosition();

	  this.startPoint = { x: 0, y: 0 };
	  this.dragPoint = { x: 0, y: 0 };

	  this.startPosition = extend( {}, this.position );

	  // set relative positioning
	  var style = getComputedStyle( this.element );
	  if ( !positionValues[ style.position ] ) {
	    this.element.style.position = 'relative';
	  }

	  this.enable();
	  this.setHandles();

	};

	/**
	 * set this.handles and bind start events to 'em
	 */
	proto.setHandles = function() {
	  this.handles = this.options.handle ?
	    this.element.querySelectorAll( this.options.handle ) : [ this.element ];

	  this.bindHandles();
	};

	/**
	 * emits events via EvEmitter and jQuery events
	 * @param {String} type - name of event
	 * @param {Event} event - original event
	 * @param {Array} args - extra arguments
	 */
	proto.dispatchEvent = function( type, event, args ) {
	  var emitArgs = [ event ].concat( args );
	  this.emitEvent( type, emitArgs );
	  var jQuery = window.jQuery;
	  // trigger jQuery event
	  if ( jQuery && this.$element ) {
	    if ( event ) {
	      // create jQuery event
	      var $event = jQuery.Event( event );
	      $event.type = type;
	      this.$element.trigger( $event, args );
	    } else {
	      // just trigger with type if no event available
	      this.$element.trigger( type, args );
	    }
	  }
	};

	// -------------------------- position -------------------------- //

	// get x/y position from style
	proto._getPosition = function() {
	  var style = getComputedStyle( this.element );
	  var x = this._getPositionCoord( style.left, 'width' );
	  var y = this._getPositionCoord( style.top, 'height' );
	  // clean up 'auto' or other non-integer values
	  this.position.x = isNaN( x ) ? 0 : x;
	  this.position.y = isNaN( y ) ? 0 : y;

	  this._addTransformPosition( style );
	};

	proto._getPositionCoord = function( styleSide, measure ) {
	  if ( styleSide.indexOf('%') != -1 ) {
	    // convert percent into pixel for Safari, #75
	    var parentSize = getSize( this.element.parentNode );
	    // prevent not-in-DOM element throwing bug, #131
	    return !parentSize ? 0 :
	      ( parseFloat( styleSide ) / 100 ) * parentSize[ measure ];
	  }
	  return parseInt( styleSide, 10 );
	};

	// add transform: translate( x, y ) to position
	proto._addTransformPosition = function( style ) {
	  var transform = style[ transformProperty ];
	  // bail out if value is 'none'
	  if ( transform.indexOf('matrix') !== 0 ) {
	    return;
	  }
	  // split matrix(1, 0, 0, 1, x, y)
	  var matrixValues = transform.split(',');
	  // translate X value is in 12th or 4th position
	  var xIndex = transform.indexOf('matrix3d') === 0 ? 12 : 4;
	  var translateX = parseInt( matrixValues[ xIndex ], 10 );
	  // translate Y value is in 13th or 5th position
	  var translateY = parseInt( matrixValues[ xIndex + 1 ], 10 );
	  this.position.x += translateX;
	  this.position.y += translateY;
	};

	// -------------------------- events -------------------------- //

	/**
	 * pointer start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerDown = function( event, pointer ) {
	  this._dragPointerDown( event, pointer );
	  // kludge to blur focused inputs in dragger
	  var focused = document.activeElement;
	  // do not blur body for IE10, metafizzy/flickity#117
	  if ( focused && focused.blur && focused != document.body ) {
	    focused.blur();
	  }
	  // bind move and end events
	  this._bindPostStartEvents( event );
	  this.element.classList.add('is-pointer-down');
	  this.dispatchEvent( 'pointerDown', event, [ pointer ] );
	};

	/**
	 * drag move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerMove = function( event, pointer ) {
	  var moveVector = this._dragPointerMove( event, pointer );
	  this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
	  this._dragMove( event, pointer, moveVector );
	};

	/**
	 * drag start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.dragStart = function( event, pointer ) {
	  if ( !this.isEnabled ) {
	    return;
	  }
	  this._getPosition();
	  this.measureContainment();
	  // position _when_ drag began
	  this.startPosition.x = this.position.x;
	  this.startPosition.y = this.position.y;
	  // reset left/top style
	  this.setLeftTop();

	  this.dragPoint.x = 0;
	  this.dragPoint.y = 0;

	  this.element.classList.add('is-dragging');
	  this.dispatchEvent( 'dragStart', event, [ pointer ] );
	  // start animation
	  this.animate();
	};

	proto.measureContainment = function() {
	  var containment = this.options.containment;
	  if ( !containment ) {
	    return;
	  }

	  // use element if element
	  var container = isElement( containment ) ? containment :
	    // fallback to querySelector if string
	    typeof containment == 'string' ? document.querySelector( containment ) :
	    // otherwise just `true`, use the parent
	    this.element.parentNode;

	  var elemSize = getSize( this.element );
	  var containerSize = getSize( container );
	  var elemRect = this.element.getBoundingClientRect();
	  var containerRect = container.getBoundingClientRect();

	  var borderSizeX = containerSize.borderLeftWidth + containerSize.borderRightWidth;
	  var borderSizeY = containerSize.borderTopWidth + containerSize.borderBottomWidth;

	  var position = this.relativeStartPosition = {
	    x: elemRect.left - ( containerRect.left + containerSize.borderLeftWidth ),
	    y: elemRect.top - ( containerRect.top + containerSize.borderTopWidth )
	  };

	  this.containSize = {
	    width: ( containerSize.width - borderSizeX ) - position.x - elemSize.width,
	    height: ( containerSize.height - borderSizeY ) - position.y - elemSize.height
	  };
	};

	// ----- move event ----- //

	/**
	 * drag move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.dragMove = function( event, pointer, moveVector ) {
	  if ( !this.isEnabled ) {
	    return;
	  }
	  var dragX = moveVector.x;
	  var dragY = moveVector.y;

	  var grid = this.options.grid;
	  var gridX = grid && grid[0];
	  var gridY = grid && grid[1];

	  dragX = applyGrid( dragX, gridX );
	  dragY = applyGrid( dragY, gridY );

	  dragX = this.containDrag( 'x', dragX, gridX );
	  dragY = this.containDrag( 'y', dragY, gridY );

	  // constrain to axis
	  dragX = this.options.axis == 'y' ? 0 : dragX;
	  dragY = this.options.axis == 'x' ? 0 : dragY;

	  this.position.x = this.startPosition.x + dragX;
	  this.position.y = this.startPosition.y + dragY;
	  // set dragPoint properties
	  this.dragPoint.x = dragX;
	  this.dragPoint.y = dragY;

	  this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
	};

	function applyGrid( value, grid, method ) {
	  method = method || 'round';
	  return grid ? Math[ method ]( value / grid ) * grid : value;
	}

	proto.containDrag = function( axis, drag, grid ) {
	  if ( !this.options.containment ) {
	    return drag;
	  }
	  var measure = axis == 'x' ? 'width' : 'height';

	  var rel = this.relativeStartPosition[ axis ];
	  var min = applyGrid( -rel, grid, 'ceil' );
	  var max = this.containSize[ measure ];
	  max = applyGrid( max, grid, 'floor' );
	  return  Math.min( max, Math.max( min, drag ) );
	};

	// ----- end event ----- //

	/**
	 * pointer up
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerUp = function( event, pointer ) {
	  this.element.classList.remove('is-pointer-down');
	  this.dispatchEvent( 'pointerUp', event, [ pointer ] );
	  this._dragPointerUp( event, pointer );
	};

	/**
	 * drag end
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.dragEnd = function( event, pointer ) {
	  if ( !this.isEnabled ) {
	    return;
	  }
	  // use top left position when complete
	  if ( transformProperty ) {
	    this.element.style[ transformProperty ] = '';
	    this.setLeftTop();
	  }
	  this.element.classList.remove('is-dragging');
	  this.dispatchEvent( 'dragEnd', event, [ pointer ] );
	};

	// -------------------------- animation -------------------------- //

	proto.animate = function() {
	  // only render and animate if dragging
	  if ( !this.isDragging ) {
	    return;
	  }

	  this.positionDrag();

	  var _this = this;
	  requestAnimationFrame( function animateFrame() {
	    _this.animate();
	  });

	};

	// left/top positioning
	proto.setLeftTop = function() {
	  this.element.style.left = this.position.x + 'px';
	  this.element.style.top  = this.position.y + 'px';
	};

	proto.positionDrag = function() {
	  this.element.style[ transformProperty ] = 'translate3d( ' + this.dragPoint.x +
	    'px, ' + this.dragPoint.y + 'px, 0)';
	};

	// ----- staticClick ----- //

	proto.staticClick = function( event, pointer ) {
	  this.dispatchEvent( 'staticClick', event, [ pointer ] );
	};

	// ----- methods ----- //

	proto.enable = function() {
	  this.isEnabled = true;
	};

	proto.disable = function() {
	  this.isEnabled = false;
	  if ( this.isDragging ) {
	    this.dragEnd();
	  }
	};

	proto.destroy = function() {
	  this.disable();
	  // reset styles
	  this.element.style[ transformProperty ] = '';
	  this.element.style.left = '';
	  this.element.style.top = '';
	  this.element.style.position = '';
	  // unbind handles
	  this.unbindHandles();
	  // remove jQuery data
	  if ( this.$element ) {
	    this.$element.removeData('draggabilly');
	  }
	};

	// ----- jQuery bridget ----- //

	// required for jQuery bridget
	proto._init = noop;

	if ( jQuery && jQuery.bridget ) {
	  jQuery.bridget( 'draggabilly', Draggabilly );
	}

	// -----  ----- //

	return Draggabilly;

	}));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * getSize v2.0.2
	 * measure size of elements
	 * MIT license
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true */
	/*global define: false, module: false, console: false */

	( function( window, factory ) {
	  'use strict';

	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return factory();
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof module == 'object' && module.exports ) {
	    // CommonJS
	    module.exports = factory();
	  } else {
	    // browser global
	    window.getSize = factory();
	  }

	})( window, function factory() {
	'use strict';

	// -------------------------- helpers -------------------------- //

	// get a number from a string, not a percentage
	function getStyleSize( value ) {
	  var num = parseFloat( value );
	  // not a percent like '100%', and a number
	  var isValid = value.indexOf('%') == -1 && !isNaN( num );
	  return isValid && num;
	}

	function noop() {}

	var logError = typeof console == 'undefined' ? noop :
	  function( message ) {
	    console.error( message );
	  };

	// -------------------------- measurements -------------------------- //

	var measurements = [
	  'paddingLeft',
	  'paddingRight',
	  'paddingTop',
	  'paddingBottom',
	  'marginLeft',
	  'marginRight',
	  'marginTop',
	  'marginBottom',
	  'borderLeftWidth',
	  'borderRightWidth',
	  'borderTopWidth',
	  'borderBottomWidth'
	];

	var measurementsLength = measurements.length;

	function getZeroSize() {
	  var size = {
	    width: 0,
	    height: 0,
	    innerWidth: 0,
	    innerHeight: 0,
	    outerWidth: 0,
	    outerHeight: 0
	  };
	  for ( var i=0; i < measurementsLength; i++ ) {
	    var measurement = measurements[i];
	    size[ measurement ] = 0;
	  }
	  return size;
	}

	// -------------------------- getStyle -------------------------- //

	/**
	 * getStyle, get style of element, check for Firefox bug
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
	 */
	function getStyle( elem ) {
	  var style = getComputedStyle( elem );
	  if ( !style ) {
	    logError( 'Style returned ' + style +
	      '. Are you running this code in a hidden iframe on Firefox? ' +
	      'See http://bit.ly/getsizebug1' );
	  }
	  return style;
	}

	// -------------------------- setup -------------------------- //

	var isSetup = false;

	var isBoxSizeOuter;

	/**
	 * setup
	 * check isBoxSizerOuter
	 * do on first getSize() rather than on page load for Firefox bug
	 */
	function setup() {
	  // setup once
	  if ( isSetup ) {
	    return;
	  }
	  isSetup = true;

	  // -------------------------- box sizing -------------------------- //

	  /**
	   * WebKit measures the outer-width on style.width on border-box elems
	   * IE & Firefox<29 measures the inner-width
	   */
	  var div = document.createElement('div');
	  div.style.width = '200px';
	  div.style.padding = '1px 2px 3px 4px';
	  div.style.borderStyle = 'solid';
	  div.style.borderWidth = '1px 2px 3px 4px';
	  div.style.boxSizing = 'border-box';

	  var body = document.body || document.documentElement;
	  body.appendChild( div );
	  var style = getStyle( div );

	  getSize.isBoxSizeOuter = isBoxSizeOuter = getStyleSize( style.width ) == 200;
	  body.removeChild( div );

	}

	// -------------------------- getSize -------------------------- //

	function getSize( elem ) {
	  setup();

	  // use querySeletor if elem is string
	  if ( typeof elem == 'string' ) {
	    elem = document.querySelector( elem );
	  }

	  // do not proceed on non-objects
	  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
	    return;
	  }

	  var style = getStyle( elem );

	  // if hidden, everything is 0
	  if ( style.display == 'none' ) {
	    return getZeroSize();
	  }

	  var size = {};
	  size.width = elem.offsetWidth;
	  size.height = elem.offsetHeight;

	  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

	  // get all measurements
	  for ( var i=0; i < measurementsLength; i++ ) {
	    var measurement = measurements[i];
	    var value = style[ measurement ];
	    var num = parseFloat( value );
	    // any 'auto', 'medium' value will be 0
	    size[ measurement ] = !isNaN( num ) ? num : 0;
	  }

	  var paddingWidth = size.paddingLeft + size.paddingRight;
	  var paddingHeight = size.paddingTop + size.paddingBottom;
	  var marginWidth = size.marginLeft + size.marginRight;
	  var marginHeight = size.marginTop + size.marginBottom;
	  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
	  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

	  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

	  // overwrite width and height if we can get it from style
	  var styleWidth = getStyleSize( style.width );
	  if ( styleWidth !== false ) {
	    size.width = styleWidth +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
	  }

	  var styleHeight = getStyleSize( style.height );
	  if ( styleHeight !== false ) {
	    size.height = styleHeight +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
	  }

	  size.innerWidth = size.width - ( paddingWidth + borderWidth );
	  size.innerHeight = size.height - ( paddingHeight + borderHeight );

	  size.outerWidth = size.width + marginWidth;
	  size.outerHeight = size.height + marginHeight;

	  return size;
	}

	return getSize;

	});


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Unidragger v2.1.0
	 * Draggable base class
	 * MIT license
	 */

	/*jshint browser: true, unused: true, undef: true, strict: true */

	( function( window, factory ) {
	  // universal module definition
	  /*jshint strict: false */ /*globals define, module, require */

	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	      __webpack_require__(9)
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function( Unipointer ) {
	      return factory( window, Unipointer );
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof module == 'object' && module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('unipointer')
	    );
	  } else {
	    // browser global
	    window.Unidragger = factory(
	      window,
	      window.Unipointer
	    );
	  }

	}( window, function factory( window, Unipointer ) {

	'use strict';

	// -----  ----- //

	function noop() {}

	// -------------------------- Unidragger -------------------------- //

	function Unidragger() {}

	// inherit Unipointer & EvEmitter
	var proto = Unidragger.prototype = Object.create( Unipointer.prototype );

	// ----- bind start ----- //

	proto.bindHandles = function() {
	  this._bindHandles( true );
	};

	proto.unbindHandles = function() {
	  this._bindHandles( false );
	};

	var navigator = window.navigator;
	/**
	 * works as unbinder, as you can .bindHandles( false ) to unbind
	 * @param {Boolean} isBind - will unbind if falsey
	 */
	proto._bindHandles = function( isBind ) {
	  // munge isBind, default to true
	  isBind = isBind === undefined ? true : !!isBind;
	  // extra bind logic
	  var binderExtra;
	  if ( navigator.pointerEnabled ) {
	    binderExtra = function( handle ) {
	      // disable scrolling on the element
	      handle.style.touchAction = isBind ? 'none' : '';
	    };
	  } else if ( navigator.msPointerEnabled ) {
	    binderExtra = function( handle ) {
	      // disable scrolling on the element
	      handle.style.msTouchAction = isBind ? 'none' : '';
	    };
	  } else {
	    binderExtra = noop;
	  }
	  // bind each handle
	  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';
	  for ( var i=0; i < this.handles.length; i++ ) {
	    var handle = this.handles[i];
	    this._bindStartEvent( handle, isBind );
	    binderExtra( handle );
	    handle[ bindMethod ]( 'click', this );
	  }
	};

	// ----- start event ----- //

	/**
	 * pointer start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerDown = function( event, pointer ) {
	  // dismiss range sliders
	  if ( event.target.nodeName == 'INPUT' && event.target.type == 'range' ) {
	    // reset pointerDown logic
	    this.isPointerDown = false;
	    delete this.pointerIdentifier;
	    return;
	  }

	  this._dragPointerDown( event, pointer );
	  // kludge to blur focused inputs in dragger
	  var focused = document.activeElement;
	  if ( focused && focused.blur ) {
	    focused.blur();
	  }
	  // bind move and end events
	  this._bindPostStartEvents( event );
	  this.emitEvent( 'pointerDown', [ event, pointer ] );
	};

	// base pointer down logic
	proto._dragPointerDown = function( event, pointer ) {
	  // track to see when dragging starts
	  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );

	  var canPreventDefault = this.canPreventDefaultOnPointerDown( event, pointer );
	  if ( canPreventDefault ) {
	    event.preventDefault();
	  }
	};

	// overwriteable method so Flickity can prevent for scrolling
	proto.canPreventDefaultOnPointerDown = function( event ) {
	  // prevent default, unless touchstart or <select>
	  return event.target.nodeName != 'SELECT';
	};

	// ----- move event ----- //

	/**
	 * drag move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerMove = function( event, pointer ) {
	  var moveVector = this._dragPointerMove( event, pointer );
	  this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );
	  this._dragMove( event, pointer, moveVector );
	};

	// base pointer move logic
	proto._dragPointerMove = function( event, pointer ) {
	  var movePoint = Unipointer.getPointerPoint( pointer );
	  var moveVector = {
	    x: movePoint.x - this.pointerDownPoint.x,
	    y: movePoint.y - this.pointerDownPoint.y
	  };
	  // start drag if pointer has moved far enough to start drag
	  if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
	    this._dragStart( event, pointer );
	  }
	  return moveVector;
	};

	// condition if pointer has moved far enough to start drag
	proto.hasDragStarted = function( moveVector ) {
	  return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;
	};


	// ----- end event ----- //

	/**
	 * pointer up
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerUp = function( event, pointer ) {
	  this.emitEvent( 'pointerUp', [ event, pointer ] );
	  this._dragPointerUp( event, pointer );
	};

	proto._dragPointerUp = function( event, pointer ) {
	  if ( this.isDragging ) {
	    this._dragEnd( event, pointer );
	  } else {
	    // pointer didn't move enough for drag to start
	    this._staticClick( event, pointer );
	  }
	};

	// -------------------------- drag -------------------------- //

	// dragStart
	proto._dragStart = function( event, pointer ) {
	  this.isDragging = true;
	  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
	  // prevent clicks
	  this.isPreventingClicks = true;

	  this.dragStart( event, pointer );
	};

	proto.dragStart = function( event, pointer ) {
	  this.emitEvent( 'dragStart', [ event, pointer ] );
	};

	// dragMove
	proto._dragMove = function( event, pointer, moveVector ) {
	  // do not drag if not dragging yet
	  if ( !this.isDragging ) {
	    return;
	  }

	  this.dragMove( event, pointer, moveVector );
	};

	proto.dragMove = function( event, pointer, moveVector ) {
	  event.preventDefault();
	  this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );
	};

	// dragEnd
	proto._dragEnd = function( event, pointer ) {
	  // set flags
	  this.isDragging = false;
	  // re-enable clicking async
	  setTimeout( function() {
	    delete this.isPreventingClicks;
	  }.bind( this ) );

	  this.dragEnd( event, pointer );
	};

	proto.dragEnd = function( event, pointer ) {
	  this.emitEvent( 'dragEnd', [ event, pointer ] );
	};

	// ----- onclick ----- //

	// handle all clicks and prevent clicks when dragging
	proto.onclick = function( event ) {
	  if ( this.isPreventingClicks ) {
	    event.preventDefault();
	  }
	};

	// ----- staticClick ----- //

	// triggered after pointer down & up with no/tiny movement
	proto._staticClick = function( event, pointer ) {
	  // ignore emulated mouse up clicks
	  if ( this.isIgnoringMouseUp && event.type == 'mouseup' ) {
	    return;
	  }

	  // allow click in <input>s and <textarea>s
	  var nodeName = event.target.nodeName;
	  if ( nodeName == 'INPUT' || nodeName == 'TEXTAREA' ) {
	    event.target.focus();
	  }
	  this.staticClick( event, pointer );

	  // set flag for emulated clicks 300ms after touchend
	  if ( event.type != 'mouseup' ) {
	    this.isIgnoringMouseUp = true;
	    // reset flag after 300ms
	    setTimeout( function() {
	      delete this.isIgnoringMouseUp;
	    }.bind( this ), 400 );
	  }
	};

	proto.staticClick = function( event, pointer ) {
	  this.emitEvent( 'staticClick', [ event, pointer ] );
	};

	// ----- utils ----- //

	Unidragger.getPointerPoint = Unipointer.getPointerPoint;

	// -----  ----- //

	return Unidragger;

	}));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Unipointer v2.1.0
	 * base class for doing one thing with pointer event
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true, strict: true */

	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */ /*global define, module, require */
	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	      __webpack_require__(10)
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function( EvEmitter ) {
	      return factory( window, EvEmitter );
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof module == 'object' && module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('ev-emitter')
	    );
	  } else {
	    // browser global
	    window.Unipointer = factory(
	      window,
	      window.EvEmitter
	    );
	  }

	}( window, function factory( window, EvEmitter ) {

	'use strict';

	function noop() {}

	function Unipointer() {}

	// inherit EvEmitter
	var proto = Unipointer.prototype = Object.create( EvEmitter.prototype );

	proto.bindStartEvent = function( elem ) {
	  this._bindStartEvent( elem, true );
	};

	proto.unbindStartEvent = function( elem ) {
	  this._bindStartEvent( elem, false );
	};

	/**
	 * works as unbinder, as you can ._bindStart( false ) to unbind
	 * @param {Boolean} isBind - will unbind if falsey
	 */
	proto._bindStartEvent = function( elem, isBind ) {
	  // munge isBind, default to true
	  isBind = isBind === undefined ? true : !!isBind;
	  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';

	  if ( window.navigator.pointerEnabled ) {
	    // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
	    elem[ bindMethod ]( 'pointerdown', this );
	  } else if ( window.navigator.msPointerEnabled ) {
	    // IE10 Pointer Events
	    elem[ bindMethod ]( 'MSPointerDown', this );
	  } else {
	    // listen for both, for devices like Chrome Pixel
	    elem[ bindMethod ]( 'mousedown', this );
	    elem[ bindMethod ]( 'touchstart', this );
	  }
	};

	// trigger handler methods for events
	proto.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	// returns the touch that we're keeping track of
	proto.getTouch = function( touches ) {
	  for ( var i=0; i < touches.length; i++ ) {
	    var touch = touches[i];
	    if ( touch.identifier == this.pointerIdentifier ) {
	      return touch;
	    }
	  }
	};

	// ----- start event ----- //

	proto.onmousedown = function( event ) {
	  // dismiss clicks from right or middle buttons
	  var button = event.button;
	  if ( button && ( button !== 0 && button !== 1 ) ) {
	    return;
	  }
	  this._pointerDown( event, event );
	};

	proto.ontouchstart = function( event ) {
	  this._pointerDown( event, event.changedTouches[0] );
	};

	proto.onMSPointerDown =
	proto.onpointerdown = function( event ) {
	  this._pointerDown( event, event );
	};

	/**
	 * pointer start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto._pointerDown = function( event, pointer ) {
	  // dismiss other pointers
	  if ( this.isPointerDown ) {
	    return;
	  }

	  this.isPointerDown = true;
	  // save pointer identifier to match up touch events
	  this.pointerIdentifier = pointer.pointerId !== undefined ?
	    // pointerId for pointer events, touch.indentifier for touch events
	    pointer.pointerId : pointer.identifier;

	  this.pointerDown( event, pointer );
	};

	proto.pointerDown = function( event, pointer ) {
	  this._bindPostStartEvents( event );
	  this.emitEvent( 'pointerDown', [ event, pointer ] );
	};

	// hash of events to be bound after start event
	var postStartEvents = {
	  mousedown: [ 'mousemove', 'mouseup' ],
	  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
	  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
	  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
	};

	proto._bindPostStartEvents = function( event ) {
	  if ( !event ) {
	    return;
	  }
	  // get proper events to match start event
	  var events = postStartEvents[ event.type ];
	  // bind events to node
	  events.forEach( function( eventName ) {
	    window.addEventListener( eventName, this );
	  }, this );
	  // save these arguments
	  this._boundPointerEvents = events;
	};

	proto._unbindPostStartEvents = function() {
	  // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
	  if ( !this._boundPointerEvents ) {
	    return;
	  }
	  this._boundPointerEvents.forEach( function( eventName ) {
	    window.removeEventListener( eventName, this );
	  }, this );

	  delete this._boundPointerEvents;
	};

	// ----- move event ----- //

	proto.onmousemove = function( event ) {
	  this._pointerMove( event, event );
	};

	proto.onMSPointerMove =
	proto.onpointermove = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerMove( event, event );
	  }
	};

	proto.ontouchmove = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerMove( event, touch );
	  }
	};

	/**
	 * pointer move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerMove = function( event, pointer ) {
	  this.pointerMove( event, pointer );
	};

	// public
	proto.pointerMove = function( event, pointer ) {
	  this.emitEvent( 'pointerMove', [ event, pointer ] );
	};

	// ----- end event ----- //


	proto.onmouseup = function( event ) {
	  this._pointerUp( event, event );
	};

	proto.onMSPointerUp =
	proto.onpointerup = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerUp( event, event );
	  }
	};

	proto.ontouchend = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerUp( event, touch );
	  }
	};

	/**
	 * pointer up
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerUp = function( event, pointer ) {
	  this._pointerDone();
	  this.pointerUp( event, pointer );
	};

	// public
	proto.pointerUp = function( event, pointer ) {
	  this.emitEvent( 'pointerUp', [ event, pointer ] );
	};

	// ----- pointer done ----- //

	// triggered on pointer up & pointer cancel
	proto._pointerDone = function() {
	  // reset properties
	  this.isPointerDown = false;
	  delete this.pointerIdentifier;
	  // remove events
	  this._unbindPostStartEvents();
	  this.pointerDone();
	};

	proto.pointerDone = noop;

	// ----- pointer cancel ----- //

	proto.onMSPointerCancel =
	proto.onpointercancel = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerCancel( event, event );
	  }
	};

	proto.ontouchcancel = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerCancel( event, touch );
	  }
	};

	/**
	 * pointer cancel
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerCancel = function( event, pointer ) {
	  this._pointerDone();
	  this.pointerCancel( event, pointer );
	};

	// public
	proto.pointerCancel = function( event, pointer ) {
	  this.emitEvent( 'pointerCancel', [ event, pointer ] );
	};

	// -----  ----- //

	// utility function for getting x/y coords from event
	Unipointer.getPointerPoint = function( pointer ) {
	  return {
	    x: pointer.pageX,
	    y: pointer.pageY
	  };
	};

	// -----  ----- //

	return Unipointer;

	}));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * EvEmitter v1.0.3
	 * Lil' event emitter
	 * MIT License
	 */

	/* jshint unused: true, undef: true, strict: true */

	( function( global, factory ) {
	  // universal module definition
	  /* jshint strict: false */ /* globals define, module, window */
	  if ( true ) {
	    // AMD - RequireJS
	    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof module == 'object' && module.exports ) {
	    // CommonJS - Browserify, Webpack
	    module.exports = factory();
	  } else {
	    // Browser globals
	    global.EvEmitter = factory();
	  }

	}( typeof window != 'undefined' ? window : this, function() {

	"use strict";

	function EvEmitter() {}

	var proto = EvEmitter.prototype;

	proto.on = function( eventName, listener ) {
	  if ( !eventName || !listener ) {
	    return;
	  }
	  // set events hash
	  var events = this._events = this._events || {};
	  // set listeners array
	  var listeners = events[ eventName ] = events[ eventName ] || [];
	  // only add once
	  if ( listeners.indexOf( listener ) == -1 ) {
	    listeners.push( listener );
	  }

	  return this;
	};

	proto.once = function( eventName, listener ) {
	  if ( !eventName || !listener ) {
	    return;
	  }
	  // add event
	  this.on( eventName, listener );
	  // set once flag
	  // set onceEvents hash
	  var onceEvents = this._onceEvents = this._onceEvents || {};
	  // set onceListeners object
	  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
	  // set flag
	  onceListeners[ listener ] = true;

	  return this;
	};

	proto.off = function( eventName, listener ) {
	  var listeners = this._events && this._events[ eventName ];
	  if ( !listeners || !listeners.length ) {
	    return;
	  }
	  var index = listeners.indexOf( listener );
	  if ( index != -1 ) {
	    listeners.splice( index, 1 );
	  }

	  return this;
	};

	proto.emitEvent = function( eventName, args ) {
	  var listeners = this._events && this._events[ eventName ];
	  if ( !listeners || !listeners.length ) {
	    return;
	  }
	  var i = 0;
	  var listener = listeners[i];
	  args = args || [];
	  // once stuff
	  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

	  while ( listener ) {
	    var isOnce = onceListeners && onceListeners[ listener ];
	    if ( isOnce ) {
	      // remove listener
	      // remove before trigger to prevent recursion
	      this.off( eventName, listener );
	      // unset once flag
	      delete onceListeners[ listener ];
	    }
	    // trigger listener
	    listener.apply( this, args );
	    // get next listener
	    i += isOnce ? 0 : 1;
	    listener = listeners[i];
	  }

	  return this;
	};

	return EvEmitter;

	}));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	module.exports = function (element) {
	  var self = this
	  var Combokeys = self.constructor

	  /**
	   * a list of all the callbacks setup via Combokeys.bind()
	   *
	   * @type {Object}
	   */
	  self.callbacks = {}

	  /**
	   * direct map of string combinations to callbacks used for trigger()
	   *
	   * @type {Object}
	   */
	  self.directMap = {}

	  /**
	   * keeps track of what level each sequence is at since multiple
	   * sequences can start out with the same sequence
	   *
	   * @type {Object}
	   */
	  self.sequenceLevels = {}

	  /**
	   * variable to store the setTimeout call
	   *
	   * @type {null|number}
	   */
	  self.resetTimer

	  /**
	   * temporary state where we will ignore the next keyup
	   *
	   * @type {boolean|string}
	   */
	  self.ignoreNextKeyup = false

	  /**
	   * temporary state where we will ignore the next keypress
	   *
	   * @type {boolean}
	   */
	  self.ignoreNextKeypress = false

	  /**
	   * are we currently inside of a sequence?
	   * type of action ("keyup" or "keydown" or "keypress") or false
	   *
	   * @type {boolean|string}
	   */
	  self.nextExpectedAction = false

	  self.element = element

	  self.addEvents()

	  Combokeys.instances.push(self)
	  return self
	}

	module.exports.prototype.bind = __webpack_require__(12)
	module.exports.prototype.bindMultiple = __webpack_require__(13)
	module.exports.prototype.unbind = __webpack_require__(14)
	module.exports.prototype.trigger = __webpack_require__(15)
	module.exports.prototype.reset = __webpack_require__(16)
	module.exports.prototype.stopCallback = __webpack_require__(17)
	module.exports.prototype.handleKey = __webpack_require__(18)
	module.exports.prototype.addEvents = __webpack_require__(20)
	module.exports.prototype.bindSingle = __webpack_require__(27)
	module.exports.prototype.getKeyInfo = __webpack_require__(28)
	module.exports.prototype.pickBestAction = __webpack_require__(32)
	module.exports.prototype.getReverseMap = __webpack_require__(33)
	module.exports.prototype.getMatches = __webpack_require__(34)
	module.exports.prototype.resetSequences = __webpack_require__(36)
	module.exports.prototype.fireCallback = __webpack_require__(37)
	module.exports.prototype.bindSequence = __webpack_require__(40)
	module.exports.prototype.resetSequenceTimer = __webpack_require__(41)
	module.exports.prototype.detach = __webpack_require__(42)

	module.exports.instances = []
	module.exports.reset = __webpack_require__(43)

	/**
	 * variable to store the flipped version of MAP from above
	 * needed to check if we should use keypress or not when no action
	 * is specified
	 *
	 * @type {Object|undefined}
	 */
	module.exports.REVERSE_MAP = null


/***/ },
/* 12 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * binds an event to Combokeys
	 *
	 * can be a single key, a combination of keys separated with +,
	 * an array of keys, or a sequence of keys separated by spaces
	 *
	 * be sure to list the modifier keys first to make sure that the
	 * correct key ends up getting bound (the last key in the pattern)
	 *
	 * @param {string|Array} keys
	 * @param {Function} callback
	 * @param {string=} action - "keypress", "keydown", or "keyup"
	 * @returns void
	 */
	module.exports = function (keys, callback, action) {
	  var self = this

	  keys = keys instanceof Array ? keys : [keys]
	  self.bindMultiple(keys, callback, action)
	  return self
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * binds multiple combinations to the same callback
	 *
	 * @param {Array} combinations
	 * @param {Function} callback
	 * @param {string|undefined} action
	 * @returns void
	 */
	module.exports = function (combinations, callback, action) {
	  var self = this

	  for (var j = 0; j < combinations.length; ++j) {
	    self.bindSingle(combinations[j], callback, action)
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * unbinds an event to Combokeys
	 *
	 * the unbinding sets the callback function of the specified key combo
	 * to an empty function and deletes the corresponding key in the
	 * directMap dict.
	 *
	 * TODO: actually remove this from the callbacks dictionary instead
	 * of binding an empty function
	 *
	 * the keycombo+action has to be exactly the same as
	 * it was defined in the bind method
	 *
	 * @param {string|Array} keys
	 * @param {string} action
	 * @returns void
	 */
	module.exports = function (keys, action) {
	  var self = this

	  return self.bind(keys, function () {}, action)
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * triggers an event that has already been bound
	 *
	 * @param {string} keys
	 * @param {string=} action
	 * @returns void
	 */
	module.exports = function (keys, action) {
	  var self = this
	  if (self.directMap[keys + ':' + action]) {
	    self.directMap[keys + ':' + action]({}, keys)
	  }
	  return this
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * resets the library back to its initial state. This is useful
	 * if you want to clear out the current keyboard shortcuts and bind
	 * new ones - for example if you switch to another page
	 *
	 * @returns void
	 */
	module.exports = function () {
	  var self = this
	  self.callbacks = {}
	  self.directMap = {}
	  return this
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	* should we stop this event before firing off callbacks
	*
	* @param {Event} e
	* @param {Element} element
	* @return {boolean}
	*/
	module.exports = function (e, element) {
	  // if the element has the class "combokeys" then no need to stop
	  if ((' ' + element.className + ' ').indexOf(' combokeys ') > -1) {
	    return false
	  }

	  var tagName = element.tagName.toLowerCase()

	  // stop for input, select, and textarea
	  return tagName === 'input' || tagName === 'select' || tagName === 'textarea' || element.isContentEditable
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * handles a character key event
	 *
	 * @param {string} character
	 * @param {Array} modifiers
	 * @param {Event} e
	 * @returns void
	 */
	module.exports = function (character, modifiers, e) {
	  var self = this
	  var callbacks
	  var j
	  var doNotReset = {}
	  var maxLevel = 0
	  var processedSequenceCallback = false
	  var isModifier
	  var ignoreThisKeypress

	  callbacks = self.getMatches(character, modifiers, e)
	  // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
	  for (j = 0; j < callbacks.length; ++j) {
	    if (callbacks[j].seq) {
	      maxLevel = Math.max(maxLevel, callbacks[j].level)
	    }
	  }

	  // loop through matching callbacks for this key event
	  for (j = 0; j < callbacks.length; ++j) {
	    // fire for all sequence callbacks
	    // this is because if for example you have multiple sequences
	    // bound such as "g i" and "g t" they both need to fire the
	    // callback for matching g cause otherwise you can only ever
	    // match the first one
	    if (callbacks[j].seq) {
	      // only fire callbacks for the maxLevel to prevent
	      // subsequences from also firing
	      //
	      // for example 'a option b' should not cause 'option b' to fire
	      // even though 'option b' is part of the other sequence
	      //
	      // any sequences that do not match here will be discarded
	      // below by the resetSequences call
	      if (callbacks[j].level !== maxLevel) {
	        continue
	      }

	      processedSequenceCallback = true

	      // keep a list of which sequences were matches for later
	      doNotReset[callbacks[j].seq] = 1
	      self.fireCallback(callbacks[j].callback, e, callbacks[j].combo, callbacks[j].seq)
	      continue
	    }

	    // if there were no sequence matches but we are still here
	    // that means this is a regular match so we should fire that
	    if (!processedSequenceCallback) {
	      self.fireCallback(callbacks[j].callback, e, callbacks[j].combo)
	    }
	  }

	  // if the key you pressed matches the type of sequence without
	  // being a modifier (ie "keyup" or "keypress") then we should
	  // reset all sequences that were not matched by this event
	  //
	  // this is so, for example, if you have the sequence "h a t" and you
	  // type "h e a r t" it does not match.  in this case the "e" will
	  // cause the sequence to reset
	  //
	  // modifier keys are ignored because you can have a sequence
	  // that contains modifiers such as "enter ctrl+space" and in most
	  // cases the modifier key will be pressed before the next key
	  //
	  // also if you have a sequence such as "ctrl+b a" then pressing the
	  // "b" key will trigger a "keypress" and a "keydown"
	  //
	  // the "keydown" is expected when there is a modifier, but the
	  // "keypress" ends up matching the nextExpectedAction since it occurs
	  // after and that causes the sequence to reset
	  //
	  // we ignore keypresses in a sequence that directly follow a keydown
	  // for the same character
	  ignoreThisKeypress = e.type === 'keypress' && self.ignoreNextKeypress
	  isModifier = __webpack_require__(19)
	  if (e.type === self.nextExpectedAction && !isModifier(character) && !ignoreThisKeypress) {
	    self.resetSequences(doNotReset)
	  }

	  self.ignoreNextKeypress = processedSequenceCallback && e.type === 'keydown'
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * determines if the keycode specified is a modifier key or not
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	module.exports = function (key) {
	  return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta'
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'
	module.exports = function () {
	  var self = this
	  var on = __webpack_require__(21)
	  var element = self.element

	  self.eventHandler = __webpack_require__(22).bind(self)

	  on(element, 'keypress', self.eventHandler)
	  on(element, 'keydown', self.eventHandler)
	  on(element, 'keyup', self.eventHandler)
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = on
	module.exports.on = on
	module.exports.off = off

	function on (element, event, callback, capture) {
	  !element.addEventListener && (event = 'on' + event)
	  ;(element.addEventListener || element.attachEvent).call(element, event, callback, capture)
	  return callback
	}

	function off (element, event, callback, capture) {
	  !element.removeEventListener && (event = 'on' + event)
	  ;(element.removeEventListener || element.detachEvent).call(element, event, callback, capture)
	  return callback
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * handles a keydown event
	 *
	 * @param {Event} e
	 * @returns void
	 */
	module.exports = function (e) {
	  var self = this
	  var characterFromEvent
	  var eventModifiers

	  // normalize e.which for key events
	  // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
	  if (typeof e.which !== 'number') {
	    e.which = e.keyCode
	  }
	  characterFromEvent = __webpack_require__(23)
	  var character = characterFromEvent(e)

	  // no character found then stop
	  if (!character) {
	    return
	  }

	  // need to use === for the character check because the character can be 0
	  if (e.type === 'keyup' && self.ignoreNextKeyup === character) {
	    self.ignoreNextKeyup = false
	    return
	  }

	  eventModifiers = __webpack_require__(26)
	  self.handleKey(character, eventModifiers(e), e)
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * takes the event and returns the key character
	 *
	 * @param {Event} e
	 * @return {string}
	 */
	module.exports = function (e) {
	  var SPECIAL_KEYS_MAP,
	    SPECIAL_CHARACTERS_MAP
	  SPECIAL_KEYS_MAP = __webpack_require__(24)
	  SPECIAL_CHARACTERS_MAP = __webpack_require__(25)

	  // for keypress events we should return the character as is
	  if (e.type === 'keypress') {
	    var character = String.fromCharCode(e.which)

	    // if the shift key is not pressed then it is safe to assume
	    // that we want the character to be lowercase.  this means if
	    // you accidentally have caps lock on then your key bindings
	    // will continue to work
	    //
	    // the only side effect that might not be desired is if you
	    // bind something like 'A' cause you want to trigger an
	    // event when capital A is pressed caps lock will no longer
	    // trigger the event.  shift+a will though.
	    if (!e.shiftKey) {
	      character = character.toLowerCase()
	    }

	    return character
	  }

	  // for non keypress events the special maps are needed
	  if (SPECIAL_KEYS_MAP[e.which]) {
	    return SPECIAL_KEYS_MAP[e.which]
	  }

	  if (SPECIAL_CHARACTERS_MAP[e.which]) {
	    return SPECIAL_CHARACTERS_MAP[e.which]
	  }

	  // if it is not in the special map

	  // with keydown and keyup events the character seems to always
	  // come in as an uppercase character whether you are pressing shift
	  // or not.  we should make sure it is always lowercase for comparisons
	  return String.fromCharCode(e.which).toLowerCase()
	}


/***/ },
/* 24 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * mapping of special keycodes to their corresponding keys
	 *
	 * everything in this dictionary cannot use keypress events
	 * so it has to be here to map to the correct keycodes for
	 * keyup/keydown events
	 *
	 * @type {Object}
	 */
	module.exports = {
	  8: 'backspace',
	  9: 'tab',
	  13: 'enter',
	  16: 'shift',
	  17: 'ctrl',
	  18: 'alt',
	  20: 'capslock',
	  27: 'esc',
	  32: 'space',
	  33: 'pageup',
	  34: 'pagedown',
	  35: 'end',
	  36: 'home',
	  37: 'left',
	  38: 'up',
	  39: 'right',
	  40: 'down',
	  45: 'ins',
	  46: 'del',
	  91: 'meta',
	  93: 'meta',
	  187: 'plus',
	  189: 'minus',
	  224: 'meta'
	}

	/**
	 * loop through the f keys, f1 to f19 and add them to the map
	 * programatically
	 */
	for (var i = 1; i < 20; ++i) {
	  module.exports[111 + i] = 'f' + i
	}

	/**
	 * loop through to map numbers on the numeric keypad
	 */
	for (i = 0; i <= 9; ++i) {
	  module.exports[i + 96] = i
	}


/***/ },
/* 25 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * mapping for special characters so they can support
	 *
	 * this dictionary is only used incase you want to bind a
	 * keyup or keydown event to one of these keys
	 *
	 * @type {Object}
	 */
	module.exports = {
	  106: '*',
	  107: '+',
	  109: '-',
	  110: '.',
	  111: '/',
	  186: ';',
	  187: '=',
	  188: ',',
	  189: '-',
	  190: '.',
	  191: '/',
	  192: '`',
	  219: '[',
	  220: '\\',
	  221: ']',
	  222: "'"
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * takes a key event and figures out what the modifiers are
	 *
	 * @param {Event} e
	 * @returns {Array}
	 */
	module.exports = function (e) {
	  var modifiers = []

	  if (e.shiftKey) {
	    modifiers.push('shift')
	  }

	  if (e.altKey) {
	    modifiers.push('alt')
	  }

	  if (e.ctrlKey) {
	    modifiers.push('ctrl')
	  }

	  if (e.metaKey) {
	    modifiers.push('meta')
	  }

	  return modifiers
	}


/***/ },
/* 27 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * binds a single keyboard combination
	 *
	 * @param {string} combination
	 * @param {Function} callback
	 * @param {string=} action
	 * @param {string=} sequenceName - name of sequence if part of sequence
	 * @param {number=} level - what part of the sequence the command is
	 * @returns void
	 */
	module.exports = function (combination, callback, action, sequenceName, level) {
	  var self = this

	  // store a direct mapped reference for use with Combokeys.trigger
	  self.directMap[combination + ':' + action] = callback

	  // make sure multiple spaces in a row become a single space
	  combination = combination.replace(/\s+/g, ' ')

	  var sequence = combination.split(' ')
	  var info

	  // if this pattern is a sequence of keys then run through this method
	  // to reprocess each pattern one key at a time
	  if (sequence.length > 1) {
	    self.bindSequence(combination, sequence, callback, action)
	    return
	  }

	  info = self.getKeyInfo(combination, action)

	  // make sure to initialize array if this is the first time
	  // a callback is added for this key
	  self.callbacks[info.key] = self.callbacks[info.key] || []

	  // remove an existing match if there is one
	  self.getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level)

	  // add this call back to the array
	  // if it is a sequence put it at the beginning
	  // if not put it at the end
	  //
	  // this is important because the way these are processed expects
	  // the sequence ones to come first
	  self.callbacks[info.key][sequenceName ? 'unshift' : 'push']({
	    callback: callback,
	    modifiers: info.modifiers,
	    action: info.action,
	    seq: sequenceName,
	    level: level,
	    combo: combination
	  })
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * Gets info for a specific key combination
	 *
	 * @param  {string} combination key combination ("command+s" or "a" or "*")
	 * @param  {string=} action
	 * @returns {Object}
	 */
	module.exports = function (combination, action) {
	  var self = this
	  var keysFromString
	  var keys
	  var key
	  var j
	  var modifiers = []
	  var SPECIAL_ALIASES
	  var SHIFT_MAP
	  var isModifier

	  keysFromString = __webpack_require__(29)
	  // take the keys from this pattern and figure out what the actual
	  // pattern is all about
	  keys = keysFromString(combination)

	  SPECIAL_ALIASES = __webpack_require__(30)
	  SHIFT_MAP = __webpack_require__(31)
	  isModifier = __webpack_require__(19)
	  for (j = 0; j < keys.length; ++j) {
	    key = keys[j]

	    // normalize key names
	    if (SPECIAL_ALIASES[key]) {
	      key = SPECIAL_ALIASES[key]
	    }

	    // if this is not a keypress event then we should
	    // be smart about using shift keys
	    // this will only work for US keyboards however
	    if (action && action !== 'keypress' && SHIFT_MAP[key]) {
	      key = SHIFT_MAP[key]
	      modifiers.push('shift')
	    }

	    // if this key is a modifier then add it to the list of modifiers
	    if (isModifier(key)) {
	      modifiers.push(key)
	    }
	  }

	  // depending on what the key combination is
	  // we will try to pick the best event for it
	  action = self.pickBestAction(key, modifiers, action)

	  return {
	    key: key,
	    modifiers: modifiers,
	    action: action
	  }
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * Converts from a string key combination to an array
	 *
	 * @param  {string} combination like "command+shift+l"
	 * @return {Array}
	 */
	module.exports = function (combination) {
	  if (combination === '+') {
	    return ['+']
	  }

	  return combination.split('+')
	}


/***/ },
/* 30 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * this is a list of special strings you can use to map
	 * to modifier keys when you specify your keyboard shortcuts
	 *
	 * @type {Object}
	 */
	module.exports = {
	  'option': 'alt',
	  'command': 'meta',
	  'return': 'enter',
	  'escape': 'esc',
	  'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
	}


/***/ },
/* 31 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * this is a mapping of keys that require shift on a US keypad
	 * back to the non shift equivelents
	 *
	 * this is so you can use keyup events with these keys
	 *
	 * note that this will only work reliably on US keyboards
	 *
	 * @type {Object}
	 */
	module.exports = {
	  '~': '`',
	  '!': '1',
	  '@': '2',
	  '#': '3',
	  '$': '4',
	  '%': '5',
	  '^': '6',
	  '&': '7',
	  '*': '8',
	  '(': '9',
	  ')': '0',
	  '_': '-',
	  '+': '=',
	  ':': ';',
	  '"': "'",
	  '<': ',',
	  '>': '.',
	  '?': '/',
	  '|': '\\'
	}


/***/ },
/* 32 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * picks the best action based on the key combination
	 *
	 * @param {string} key - character for key
	 * @param {Array} modifiers
	 * @param {string=} action passed in
	 */
	module.exports = function (key, modifiers, action) {
	  var self = this

	  // if no action was picked in we should try to pick the one
	  // that we think would work best for this key
	  if (!action) {
	    action = self.getReverseMap()[key] ? 'keydown' : 'keypress'
	  }

	  // modifier keys don't work as expected with keypress,
	  // switch to keydown
	  if (action === 'keypress' && modifiers.length) {
	    action = 'keydown'
	  }

	  return action
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * reverses the map lookup so that we can look for specific keys
	 * to see what can and can't use keypress
	 *
	 * @return {Object}
	 */
	module.exports = function () {
	  var self = this
	  var constructor = self.constructor
	  var SPECIAL_KEYS_MAP

	  if (!constructor.REVERSE_MAP) {
	    constructor.REVERSE_MAP = {}
	    SPECIAL_KEYS_MAP = __webpack_require__(24)
	    for (var key in SPECIAL_KEYS_MAP) {
	      // pull out the numeric keypad from here cause keypress should
	      // be able to detect the keys from the character
	      if (key > 95 && key < 112) {
	        continue
	      }

	      if (SPECIAL_KEYS_MAP.hasOwnProperty(key)) {
	        constructor.REVERSE_MAP[SPECIAL_KEYS_MAP[key]] = key
	      }
	    }
	  }
	  return constructor.REVERSE_MAP
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * finds all callbacks that match based on the keycode, modifiers,
	 * and action
	 *
	 * @param {string} character
	 * @param {Array} modifiers
	 * @param {Event|Object} e
	 * @param {string=} sequenceName - name of the sequence we are looking for
	 * @param {string=} combination
	 * @param {number=} level
	 * @returns {Array}
	 */
	module.exports = function (character, modifiers, e, sequenceName, combination, level) {
	  var self = this
	  var j
	  var callback
	  var matches = []
	  var action = e.type
	  var isModifier
	  var modifiersMatch

	  if (
	      action === 'keypress' &&
	      // Firefox fires keypress for arrows
	      !(e.code && e.code.slice(0, 5) === 'Arrow')
	  ) {
	    // 'any-character' callbacks are only on `keypress`
	    var anyCharCallbacks = self.callbacks['any-character'] || []
	    anyCharCallbacks.forEach(function (callback) {
	      matches.push(callback)
	    })
	  }

	  if (!self.callbacks[character]) { return matches }

	  isModifier = __webpack_require__(19)
	  // if a modifier key is coming up on its own we should allow it
	  if (action === 'keyup' && isModifier(character)) {
	    modifiers = [character]
	  }

	  // loop through all callbacks for the key that was pressed
	  // and see if any of them match
	  for (j = 0; j < self.callbacks[character].length; ++j) {
	    callback = self.callbacks[character][j]

	    // if a sequence name is not specified, but this is a sequence at
	    // the wrong level then move onto the next match
	    if (!sequenceName && callback.seq && self.sequenceLevels[callback.seq] !== callback.level) {
	      continue
	    }

	    // if the action we are looking for doesn't match the action we got
	    // then we should keep going
	    if (action !== callback.action) {
	      continue
	    }

	    // if this is a keypress event and the meta key and control key
	    // are not pressed that means that we need to only look at the
	    // character, otherwise check the modifiers as well
	    //
	    // chrome will not fire a keypress if meta or control is down
	    // safari will fire a keypress if meta or meta+shift is down
	    // firefox will fire a keypress if meta or control is down
	    modifiersMatch = __webpack_require__(35)
	    if ((action === 'keypress' && !e.metaKey && !e.ctrlKey) || modifiersMatch(modifiers, callback.modifiers)) {
	      // when you bind a combination or sequence a second time it
	      // should overwrite the first one.  if a sequenceName or
	      // combination is specified in this call it does just that
	      //
	      // @todo make deleting its own method?
	      var deleteCombo = !sequenceName && callback.combo === combination
	      var deleteSequence = sequenceName && callback.seq === sequenceName && callback.level === level
	      if (deleteCombo || deleteSequence) {
	        self.callbacks[character].splice(j, 1)
	      }

	      matches.push(callback)
	    }
	  }

	  return matches
	}


/***/ },
/* 35 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * checks if two arrays are equal
	 *
	 * @param {Array} modifiers1
	 * @param {Array} modifiers2
	 * @returns {boolean}
	 */
	module.exports = function (modifiers1, modifiers2) {
	  return modifiers1.sort().join(',') === modifiers2.sort().join(',')
	}


/***/ },
/* 36 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * resets all sequence counters except for the ones passed in
	 *
	 * @param {Object} doNotReset
	 * @returns void
	 */
	module.exports = function (doNotReset) {
	  var self = this

	  doNotReset = doNotReset || {}

	  var activeSequences = false
	  var key

	  for (key in self.sequenceLevels) {
	    if (doNotReset[key]) {
	      activeSequences = true
	      continue
	    }
	    self.sequenceLevels[key] = 0
	  }

	  if (!activeSequences) {
	    self.nextExpectedAction = false
	  }
	}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * actually calls the callback function
	 *
	 * if your callback function returns false this will use the jquery
	 * convention - prevent default and stop propogation on the event
	 *
	 * @param {Function} callback
	 * @param {Event} e
	 * @returns void
	 */
	module.exports = function (callback, e, combo, sequence) {
	  var self = this
	  var preventDefault
	  var stopPropagation

	  // if this event should not happen stop here
	  if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
	    return
	  }

	  if (callback(e, combo) === false) {
	    preventDefault = __webpack_require__(38)
	    preventDefault(e)
	    stopPropagation = __webpack_require__(39)
	    stopPropagation(e)
	  }
	}


/***/ },
/* 38 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * prevents default for this event
	 *
	 * @param {Event} e
	 * @returns void
	 */
	module.exports = function (e) {
	  if (e.preventDefault) {
	    e.preventDefault()
	    return
	  }

	  e.returnValue = false
	}


/***/ },
/* 39 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * stops propogation for this event
	 *
	 * @param {Event} e
	 * @returns void
	 */
	module.exports = function (e) {
	  if (e.stopPropagation) {
	    e.stopPropagation()
	    return
	  }

	  e.cancelBubble = true
	}


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-env node, browser */
	'use strict'

	/**
	 * binds a key sequence to an event
	 *
	 * @param {string} combo - combo specified in bind call
	 * @param {Array} keys
	 * @param {Function} callback
	 * @param {string=} action
	 * @returns void
	 */
	module.exports = function (combo, keys, callback, action) {
	  var self = this

	  // start off by adding a sequence level record for this combination
	  // and setting the level to 0
	  self.sequenceLevels[combo] = 0

	  /**
	   * callback to increase the sequence level for this sequence and reset
	   * all other sequences that were active
	   *
	   * @param {string} nextAction
	   * @returns {Function}
	   */
	  function increaseSequence (nextAction) {
	    return function () {
	      self.nextExpectedAction = nextAction
	      ++self.sequenceLevels[combo]
	      self.resetSequenceTimer()
	    }
	  }

	  /**
	   * wraps the specified callback inside of another function in order
	   * to reset all sequence counters as soon as this sequence is done
	   *
	   * @param {Event} e
	   * @returns void
	   */
	  function callbackAndReset (e) {
	    var characterFromEvent
	    self.fireCallback(callback, e, combo)

	    // we should ignore the next key up if the action is key down
	    // or keypress.  this is so if you finish a sequence and
	    // release the key the final key will not trigger a keyup
	    if (action !== 'keyup') {
	      characterFromEvent = __webpack_require__(23)
	      self.ignoreNextKeyup = characterFromEvent(e)
	    }

	    // weird race condition if a sequence ends with the key
	    // another sequence begins with
	    setTimeout(
	      function () {
	        self.resetSequences()
	      },
	      10
	    )
	  }

	  // loop through keys one at a time and bind the appropriate callback
	  // function.  for any key leading up to the final one it should
	  // increase the sequence. after the final, it should reset all sequences
	  //
	  // if an action is specified in the original bind call then that will
	  // be used throughout.  otherwise we will pass the action that the
	  // next key in the sequence should match.  this allows a sequence
	  // to mix and match keypress and keydown events depending on which
	  // ones are better suited to the key provided
	  for (var j = 0; j < keys.length; ++j) {
	    var isFinal = j + 1 === keys.length
	    var wrappedCallback = isFinal ? callbackAndReset : increaseSequence(action || self.getKeyInfo(keys[j + 1]).action)
	    self.bindSingle(keys[j], wrappedCallback, action, combo, j)
	  }
	}


/***/ },
/* 41 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'
	/**
	 * called to set a 1 second timeout on the specified sequence
	 *
	 * this is so after each key press in the sequence you have 1 second
	 * to press the next key before you have to start over
	 *
	 * @returns void
	 */
	module.exports = function () {
	  var self = this

	  clearTimeout(self.resetTimer)
	  self.resetTimer = setTimeout(
	    function () {
	      self.resetSequences()
	    },
	    1000
	  )
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var off = __webpack_require__(21).off
	module.exports = function () {
	  var self = this
	  var element = self.element

	  off(element, 'keypress', self.eventHandler)
	  off(element, 'keydown', self.eventHandler)
	  off(element, 'keyup', self.eventHandler)
	}


/***/ },
/* 43 */
/***/ function(module, exports) {

	/* eslint-env node, browser */
	'use strict'

	module.exports = function () {
	  var self = this

	  self.instances.forEach(function (combokeys) {
	    combokeys.reset()
	  })
	}


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
	cloneableTags[boolTag] = cloneableTags[dateTag] =
	cloneableTags[float32Tag] = cloneableTags[float64Tag] =
	cloneableTags[int8Tag] = cloneableTags[int16Tag] =
	cloneableTags[int32Tag] = cloneableTags[mapTag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[setTag] =
	cloneableTags[stringTag] = cloneableTags[symbolTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[weakMapTag] = false;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding('util');
	  } catch (e) {}
	}());

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  // Don't return `map.set` because it's not chainable in IE 11.
	  map.set(pair[0], pair[1]);
	  return map;
	}

	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  // Don't return `set.add` because it's not chainable in IE 11.
	  set.add(value);
	  return set;
	}

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	/**
	 * A specialized version of `_.forEach` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array ? array.length : 0;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array ? array.length : 0;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getPrototype = overArg(Object.getPrototypeOf, Object),
	    objectCreate = Object.create,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols,
	    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
	    nativeKeys = overArg(Object.keys, Object),
	    nativeMax = Math.max;

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache) {
	    var pairs = cache.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      return this;
	    }
	    cache = this.__data__ = new MapCache(pairs);
	  }
	  cache.set(key, value);
	  return this;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];

	  var length = result.length,
	      skipIndexes = !!length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignMergeValue(object, key, value) {
	  if ((value !== undefined && !eq(object[key], value)) ||
	      (typeof key == 'number' && value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.assign` without support for multiple sources
	 * or `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return object && copyObject(source, keys(source), object);
	}

	/**
	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	 * traversed objects.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {boolean} [isFull] Specify a clone including symbols.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The parent object of `value`.
	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;

	    if (isBuffer(value)) {
	      return cloneBuffer(value, isDeep);
	    }
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      if (!cloneableTags[tag]) {
	        return object ? value : {};
	      }
	      result = initCloneByTag(value, tag, baseClone, isDeep);
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);

	  if (!isArr) {
	    var props = isFull ? getAllKeys(value) : keys(value);
	  }
	  arrayEach(props || value, function(subValue, key) {
	    if (props) {
	      key = subValue;
	      subValue = value[key];
	    }
	    // Recursively populate clone (susceptible to call stack limits).
	    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
	  });
	  return result;
	}

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	function baseCreate(proto) {
	  return isObject(proto) ? objectCreate(proto) : {};
	}

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	/**
	 * The base implementation of `getTag`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  return objectToString.call(value);
	}

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }
	  var isProto = isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMerge(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }
	  if (!(isArray(source) || isTypedArray(source))) {
	    var props = baseKeysIn(source);
	  }
	  arrayEach(props || source, function(srcValue, key) {
	    if (props) {
	      key = srcValue;
	      srcValue = source[key];
	    }
	    if (isObject(srcValue)) {
	      stack || (stack = new Stack);
	      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	    }
	    else {
	      var newValue = customizer
	        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
	        : undefined;

	      if (newValue === undefined) {
	        newValue = srcValue;
	      }
	      assignMergeValue(object, key, newValue);
	    }
	  });
	}

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = object[key],
	      srcValue = source[key],
	      stacked = stack.get(srcValue);

	  if (stacked) {
	    assignMergeValue(object, key, stacked);
	    return;
	  }
	  var newValue = customizer
	    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
	    : undefined;

	  var isCommon = newValue === undefined;

	  if (isCommon) {
	    newValue = srcValue;
	    if (isArray(srcValue) || isTypedArray(srcValue)) {
	      if (isArray(objValue)) {
	        newValue = objValue;
	      }
	      else if (isArrayLikeObject(objValue)) {
	        newValue = copyArray(objValue);
	      }
	      else {
	        isCommon = false;
	        newValue = baseClone(srcValue, true);
	      }
	    }
	    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      if (isArguments(objValue)) {
	        newValue = toPlainObject(objValue);
	      }
	      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
	        isCommon = false;
	        newValue = baseClone(srcValue, true);
	      }
	      else {
	        newValue = objValue;
	      }
	    }
	    else {
	      isCommon = false;
	    }
	  }
	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }
	  assignMergeValue(object, key, newValue);
	}

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}

	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var result = new buffer.constructor(buffer.length);
	  buffer.copy(result);
	  return result;
	}

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}

	/**
	 * Creates a clone of `dataView`.
	 *
	 * @private
	 * @param {Object} dataView The data view to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned data view.
	 */
	function cloneDataView(dataView, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
	}

	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
	  return arrayReduce(array, addMapEntry, new map.constructor);
	}

	/**
	 * Creates a clone of `regexp`.
	 *
	 * @private
	 * @param {Object} regexp The regexp to clone.
	 * @returns {Object} Returns the cloned regexp.
	 */
	function cloneRegExp(regexp) {
	  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
	  result.lastIndex = regexp.lastIndex;
	  return result;
	}

	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
	  return arrayReduce(array, addSetEntry, new set.constructor);
	}

	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
	}

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];

	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : undefined;

	    assignValue(object, key, newValue === undefined ? source[key] : newValue);
	  }
	  return object;
	}

	/**
	 * Copies own symbol properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}

	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return baseRest(function(object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;

	    customizer = (assigner.length > 3 && typeof customizer == 'function')
	      ? (length--, customizer)
	      : undefined;

	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    object = Object(object);
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }
	    return object;
	  });
	}

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	/**
	 * Creates an array of the own enumerable symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge < 14, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);

	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}

	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, cloneFunc, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneArrayBuffer(object);

	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);

	    case dataViewTag:
	      return cloneDataView(object, isDeep);

	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);

	    case mapTag:
	      return cloneMap(object, isDeep, cloneFunc);

	    case numberTag:
	    case stringTag:
	      return new Ctor(object);

	    case regexpTag:
	      return cloneRegExp(object);

	    case setTag:
	      return cloneSet(object, isDeep, cloneFunc);

	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Used by `_.defaultsDeep` to customize its `_.merge` use.
	 *
	 * @private
	 * @param {*} objValue The destination value.
	 * @param {*} srcValue The source value.
	 * @param {string} key The key of the property to merge.
	 * @param {Object} object The parent object of `objValue`.
	 * @param {Object} source The parent object of `srcValue`.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 * @returns {*} Returns the value to assign.
	 */
	function mergeDefaults(objValue, srcValue, key, object, source, stack) {
	  if (isObject(objValue) && isObject(srcValue)) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, objValue);
	    baseMerge(objValue, srcValue, undefined, mergeDefaults, stack);
	    stack['delete'](srcValue);
	  }
	  return objValue;
	}

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn(object) {
	  var result = [];
	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */
	function toPlainObject(value) {
	  return copyObject(value, keysIn(value));
	}

	/**
	 * This method is like `_.defaults` except that it recursively assigns
	 * default properties.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaults
	 * @example
	 *
	 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
	 * // => { 'a': { 'b': 2, 'c': 3 } }
	 */
	var defaultsDeep = baseRest(function(args) {
	  args.push(undefined, mergeDefaults);
	  return apply(mergeWith, undefined, args);
	});

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

	/**
	 * This method is like `_.merge` except that it accepts `customizer` which
	 * is invoked to produce the merged values of the destination and source
	 * properties. If `customizer` returns `undefined`, merging is handled by the
	 * method instead. The `customizer` is invoked with seven arguments:
	 * (objValue, srcValue, key, object, source, stack).
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} sources The source objects.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function customizer(objValue, srcValue) {
	 *   if (_.isArray(objValue)) {
	 *     return objValue.concat(srcValue);
	 *   }
	 * }
	 *
	 * var object = { 'a': [1], 'b': [2] };
	 * var other = { 'a': [3], 'b': [4] };
	 *
	 * _.mergeWith(object, other, customizer);
	 * // => { 'a': [1, 3], 'b': [2, 4] }
	 */
	var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
	  baseMerge(object, source, srcIndex, customizer);
	});

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = defaultsDeep;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(45)(module)))

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;