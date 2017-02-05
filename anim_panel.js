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
	var localforage = __webpack_require__(4);
	var Progress = __webpack_require__(5);
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

	      var mergeOpts = function(obj1, obj2) {
	        var obj3 = {};
	        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	        return obj3;
	      }
	     
	      self.settings = mergeOpts({
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
	          jumpToStart: ['return', 'enter']
	        }
	      }, options);
	     
	     
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
	        self.combokeys.bind(['option+up'], self.progress.expandRange);
	        self.combokeys.bind(['option+down'], self.progress.contractRange);

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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;/* WEBPACK VAR INJECTION */(function(global) {/*!
	    localForage -- Offline Storage, Improved
	    Version 1.4.3
	    https://mozilla.github.io/localForage
	    (c) 2013-2016 Mozilla, Apache License 2.0
	*/
	(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	'use strict';
	var immediate = _dereq_(2);

	/* istanbul ignore next */
	function INTERNAL() {}

	var handlers = {};

	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];

	module.exports = exports = Promise;

	function Promise(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}

	Promise.prototype["catch"] = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }

	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};

	function unwrap(promise, func, value) {
	  immediate(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}

	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;

	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};

	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && typeof obj === 'object' && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}

	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }

	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }

	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }

	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}

	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}

	exports.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}

	exports.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}

	exports.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}

	exports.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}

	},{"2":2}],2:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	var Mutation = global.MutationObserver || global.WebKitMutationObserver;

	var scheduleDrain;

	{
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = global.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
	    var channel = new global.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
	    scheduleDrain = function () {

	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = global.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();

	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      global.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	}

	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}

	module.exports = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],3:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	if (typeof global.Promise !== 'function') {
	  global.Promise = _dereq_(1);
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"1":1}],4:[function(_dereq_,module,exports){
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function getIDB() {
	    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
	    try {
	        if (typeof indexedDB !== 'undefined') {
	            return indexedDB;
	        }
	        if (typeof webkitIndexedDB !== 'undefined') {
	            return webkitIndexedDB;
	        }
	        if (typeof mozIndexedDB !== 'undefined') {
	            return mozIndexedDB;
	        }
	        if (typeof OIndexedDB !== 'undefined') {
	            return OIndexedDB;
	        }
	        if (typeof msIndexedDB !== 'undefined') {
	            return msIndexedDB;
	        }
	    } catch (e) {}
	}

	var idb = getIDB();

	function isIndexedDBValid() {
	    try {
	        // Initialize IndexedDB; fall back to vendor-prefixed versions
	        // if needed.
	        if (!idb) {
	            return false;
	        }
	        // We mimic PouchDB here; just UA test for Safari (which, as of
	        // iOS 8/Yosemite, doesn't properly support IndexedDB).
	        // IndexedDB support is broken and different from Blink's.
	        // This is faster than the test case (and it's sync), so we just
	        // do this. *SIGH*
	        // http://bl.ocks.org/nolanlawson/raw/c83e9039edf2278047e9/
	        //
	        // We test for openDatabase because IE Mobile identifies itself
	        // as Safari. Oh the lulz...
	        if (typeof openDatabase !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
	            return false;
	        }

	        return idb && typeof idb.open === 'function' &&
	        // Some Samsung/HTC Android 4.0-4.3 devices
	        // have older IndexedDB specs; if this isn't available
	        // their IndexedDB is too old for us to use.
	        // (Replaces the onupgradeneeded test.)
	        typeof IDBKeyRange !== 'undefined';
	    } catch (e) {
	        return false;
	    }
	}

	function isWebSQLValid() {
	    return typeof openDatabase === 'function';
	}

	function isLocalStorageValid() {
	    try {
	        return typeof localStorage !== 'undefined' && 'setItem' in localStorage && localStorage.setItem;
	    } catch (e) {
	        return false;
	    }
	}

	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	function createBlob(parts, properties) {
	    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
	    parts = parts || [];
	    properties = properties || {};
	    try {
	        return new Blob(parts, properties);
	    } catch (e) {
	        if (e.name !== 'TypeError') {
	            throw e;
	        }
	        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
	        var builder = new Builder();
	        for (var i = 0; i < parts.length; i += 1) {
	            builder.append(parts[i]);
	        }
	        return builder.getBlob(properties.type);
	    }
	}

	// This is CommonJS because lie is an external dependency, so Rollup
	// can just ignore it.
	if (typeof Promise === 'undefined' && typeof _dereq_ !== 'undefined') {
	    _dereq_(3);
	}
	var Promise$1 = Promise;

	function executeCallback(promise, callback) {
	    if (callback) {
	        promise.then(function (result) {
	            callback(null, result);
	        }, function (error) {
	            callback(error);
	        });
	    }
	}

	function executeTwoCallbacks(promise, callback, errorCallback) {
	    if (typeof callback === 'function') {
	        promise.then(callback);
	    }

	    if (typeof errorCallback === 'function') {
	        promise["catch"](errorCallback);
	    }
	}

	// Some code originally from async_storage.js in
	// [Gaia](https://github.com/mozilla-b2g/gaia).

	var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
	var supportsBlobs;
	var dbContexts;
	var toString = Object.prototype.toString;

	// Transform a binary string to an array buffer, because otherwise
	// weird stuff happens when you try to work with the binary string directly.
	// It is known.
	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)
	function _binStringToArrayBuffer(bin) {
	    var length = bin.length;
	    var buf = new ArrayBuffer(length);
	    var arr = new Uint8Array(buf);
	    for (var i = 0; i < length; i++) {
	        arr[i] = bin.charCodeAt(i);
	    }
	    return buf;
	}

	//
	// Blobs are not supported in all versions of IndexedDB, notably
	// Chrome <37 and Android <5. In those versions, storing a blob will throw.
	//
	// Various other blob bugs exist in Chrome v37-42 (inclusive).
	// Detecting them is expensive and confusing to users, and Chrome 37-42
	// is at very low usage worldwide, so we do a hacky userAgent check instead.
	//
	// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
	// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
	// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
	//
	// Code borrowed from PouchDB. See:
	// https://github.com/pouchdb/pouchdb/blob/9c25a23/src/adapters/idb/blobSupport.js
	//
	function _checkBlobSupportWithoutCaching(txn) {
	    return new Promise$1(function (resolve) {
	        var blob = createBlob(['']);
	        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

	        txn.onabort = function (e) {
	            // If the transaction aborts now its due to not being able to
	            // write to the database, likely due to the disk being full
	            e.preventDefault();
	            e.stopPropagation();
	            resolve(false);
	        };

	        txn.oncomplete = function () {
	            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
	            var matchedEdge = navigator.userAgent.match(/Edge\//);
	            // MS Edge pretends to be Chrome 42:
	            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
	            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
	        };
	    })["catch"](function () {
	        return false; // error, so assume unsupported
	    });
	}

	function _checkBlobSupport(idb) {
	    if (typeof supportsBlobs === 'boolean') {
	        return Promise$1.resolve(supportsBlobs);
	    }
	    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
	        supportsBlobs = value;
	        return supportsBlobs;
	    });
	}

	function _deferReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Create a deferred object representing the current database operation.
	    var deferredOperation = {};

	    deferredOperation.promise = new Promise$1(function (resolve) {
	        deferredOperation.resolve = resolve;
	    });

	    // Enqueue the deferred operation.
	    dbContext.deferredOperations.push(deferredOperation);

	    // Chain its promise to the database readiness.
	    if (!dbContext.dbReady) {
	        dbContext.dbReady = deferredOperation.promise;
	    } else {
	        dbContext.dbReady = dbContext.dbReady.then(function () {
	            return deferredOperation.promise;
	        });
	    }
	}

	function _advanceReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Dequeue a deferred operation.
	    var deferredOperation = dbContext.deferredOperations.pop();

	    // Resolve its promise (which is part of the database readiness
	    // chain of promises).
	    if (deferredOperation) {
	        deferredOperation.resolve();
	    }
	}

	function _getConnection(dbInfo, upgradeNeeded) {
	    return new Promise$1(function (resolve, reject) {

	        if (dbInfo.db) {
	            if (upgradeNeeded) {
	                _deferReadiness(dbInfo);
	                dbInfo.db.close();
	            } else {
	                return resolve(dbInfo.db);
	            }
	        }

	        var dbArgs = [dbInfo.name];

	        if (upgradeNeeded) {
	            dbArgs.push(dbInfo.version);
	        }

	        var openreq = idb.open.apply(idb, dbArgs);

	        if (upgradeNeeded) {
	            openreq.onupgradeneeded = function (e) {
	                var db = openreq.result;
	                try {
	                    db.createObjectStore(dbInfo.storeName);
	                    if (e.oldVersion <= 1) {
	                        // Added when support for blob shims was added
	                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
	                    }
	                } catch (ex) {
	                    if (ex.name === 'ConstraintError') {
	                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
	                    } else {
	                        throw ex;
	                    }
	                }
	            };
	        }

	        openreq.onerror = function () {
	            reject(openreq.error);
	        };

	        openreq.onsuccess = function () {
	            resolve(openreq.result);
	            _advanceReadiness(dbInfo);
	        };
	    });
	}

	function _getOriginalConnection(dbInfo) {
	    return _getConnection(dbInfo, false);
	}

	function _getUpgradedConnection(dbInfo) {
	    return _getConnection(dbInfo, true);
	}

	function _isUpgradeNeeded(dbInfo, defaultVersion) {
	    if (!dbInfo.db) {
	        return true;
	    }

	    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
	    var isDowngrade = dbInfo.version < dbInfo.db.version;
	    var isUpgrade = dbInfo.version > dbInfo.db.version;

	    if (isDowngrade) {
	        // If the version is not the default one
	        // then warn for impossible downgrade.
	        if (dbInfo.version !== defaultVersion) {
	            console.warn('The database "' + dbInfo.name + '"' + ' can\'t be downgraded from version ' + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
	        }
	        // Align the versions to prevent errors.
	        dbInfo.version = dbInfo.db.version;
	    }

	    if (isUpgrade || isNewStore) {
	        // If the store is new then increment the version (if needed).
	        // This will trigger an "upgradeneeded" event which is required
	        // for creating a store.
	        if (isNewStore) {
	            var incVersion = dbInfo.db.version + 1;
	            if (incVersion > dbInfo.version) {
	                dbInfo.version = incVersion;
	            }
	        }

	        return true;
	    }

	    return false;
	}

	// encode a blob for indexeddb engines that don't support blobs
	function _encodeBlob(blob) {
	    return new Promise$1(function (resolve, reject) {
	        var reader = new FileReader();
	        reader.onerror = reject;
	        reader.onloadend = function (e) {
	            var base64 = btoa(e.target.result || '');
	            resolve({
	                __local_forage_encoded_blob: true,
	                data: base64,
	                type: blob.type
	            });
	        };
	        reader.readAsBinaryString(blob);
	    });
	}

	// decode an encoded blob
	function _decodeBlob(encodedBlob) {
	    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
	    return createBlob([arrayBuff], { type: encodedBlob.type });
	}

	// is this one of our fancy encoded blobs?
	function _isEncodedBlob(value) {
	    return value && value.__local_forage_encoded_blob;
	}

	// Specialize the default `ready()` function by making it dependent
	// on the current database operations. Thus, the driver will be actually
	// ready when it's been initialized (default) *and* there are no pending
	// operations on the database (initiated by some other instances).
	function _fullyReady(callback) {
	    var self = this;

	    var promise = self._initReady().then(function () {
	        var dbContext = dbContexts[self._dbInfo.name];

	        if (dbContext && dbContext.dbReady) {
	            return dbContext.dbReady;
	        }
	    });

	    executeTwoCallbacks(promise, callback, callback);
	    return promise;
	}

	// Open the IndexedDB database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    // Initialize a singleton container for all running localForages.
	    if (!dbContexts) {
	        dbContexts = {};
	    }

	    // Get the current context of the database;
	    var dbContext = dbContexts[dbInfo.name];

	    // ...or create a new context.
	    if (!dbContext) {
	        dbContext = {
	            // Running localForages sharing a database.
	            forages: [],
	            // Shared database.
	            db: null,
	            // Database readiness (promise).
	            dbReady: null,
	            // Deferred operations on the database.
	            deferredOperations: []
	        };
	        // Register the new context in the global container.
	        dbContexts[dbInfo.name] = dbContext;
	    }

	    // Register itself as a running localForage in the current context.
	    dbContext.forages.push(self);

	    // Replace the default `ready()` function with the specialized one.
	    if (!self._initReady) {
	        self._initReady = self.ready;
	        self.ready = _fullyReady;
	    }

	    // Create an array of initialization states of the related localForages.
	    var initPromises = [];

	    function ignoreErrors() {
	        // Don't handle errors here,
	        // just makes sure related localForages aren't pending.
	        return Promise$1.resolve();
	    }

	    for (var j = 0; j < dbContext.forages.length; j++) {
	        var forage = dbContext.forages[j];
	        if (forage !== self) {
	            // Don't wait for itself...
	            initPromises.push(forage._initReady()["catch"](ignoreErrors));
	        }
	    }

	    // Take a snapshot of the related localForages.
	    var forages = dbContext.forages.slice(0);

	    // Initialize the connection process only when
	    // all the related localForages aren't pending.
	    return Promise$1.all(initPromises).then(function () {
	        dbInfo.db = dbContext.db;
	        // Get the connection or open a new one without upgrade.
	        return _getOriginalConnection(dbInfo);
	    }).then(function (db) {
	        dbInfo.db = db;
	        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
	            // Reopen the database for upgrading.
	            return _getUpgradedConnection(dbInfo);
	        }
	        return db;
	    }).then(function (db) {
	        dbInfo.db = dbContext.db = db;
	        self._dbInfo = dbInfo;
	        // Share the final connection amongst related localForages.
	        for (var k = 0; k < forages.length; k++) {
	            var forage = forages[k];
	            if (forage !== self) {
	                // Self is already up-to-date.
	                forage._dbInfo.db = dbInfo.db;
	                forage._dbInfo.version = dbInfo.version;
	            }
	        }
	    });
	}

	function getItem(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	            var req = store.get(key);

	            req.onsuccess = function () {
	                var value = req.result;
	                if (value === undefined) {
	                    value = null;
	                }
	                if (_isEncodedBlob(value)) {
	                    value = _decodeBlob(value);
	                }
	                resolve(value);
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items stored in database.
	function iterate(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var req = store.openCursor();
	            var iterationNumber = 1;

	            req.onsuccess = function () {
	                var cursor = req.result;

	                if (cursor) {
	                    var value = cursor.value;
	                    if (_isEncodedBlob(value)) {
	                        value = _decodeBlob(value);
	                    }
	                    var result = iterator(value, cursor.key, iterationNumber++);

	                    if (result !== void 0) {
	                        resolve(result);
	                    } else {
	                        cursor["continue"]();
	                    }
	                } else {
	                    resolve();
	                }
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);

	    return promise;
	}

	function setItem(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        var dbInfo;
	        self.ready().then(function () {
	            dbInfo = self._dbInfo;
	            if (toString.call(value) === '[object Blob]') {
	                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
	                    if (blobSupport) {
	                        return value;
	                    }
	                    return _encodeBlob(value);
	                });
	            }
	            return value;
	        }).then(function (value) {
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);

	            // The reason we don't _save_ null is because IE 10 does
	            // not support saving the `null` type in IndexedDB. How
	            // ironic, given the bug below!
	            // See: https://github.com/mozilla/localForage/issues/161
	            if (value === null) {
	                value = undefined;
	            }

	            transaction.oncomplete = function () {
	                // Cast to undefined so the value passed to
	                // callback/promise is the same as what one would get out
	                // of `getItem()` later. This leads to some weirdness
	                // (setItem('foo', undefined) will return `null`), but
	                // it's not my fault localStorage is our baseline and that
	                // it's weird.
	                if (value === undefined) {
	                    value = null;
	                }

	                resolve(value);
	            };
	            transaction.onabort = transaction.onerror = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };

	            var req = store.put(value, key);
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function removeItem(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);

	            // We use a Grunt task to make this safe for IE and some
	            // versions of Android (including those used by Cordova).
	            // Normally IE won't like `.delete()` and will insist on
	            // using `['delete']()`, but we have a build step that
	            // fixes this for us now.
	            var req = store["delete"](key);
	            transaction.oncomplete = function () {
	                resolve();
	            };

	            transaction.onerror = function () {
	                reject(req.error);
	            };

	            // The request will be also be aborted if we've exceeded our storage
	            // space.
	            transaction.onabort = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function clear(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);
	            var req = store.clear();

	            transaction.oncomplete = function () {
	                resolve();
	            };

	            transaction.onabort = transaction.onerror = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function length(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	            var req = store.count();

	            req.onsuccess = function () {
	                resolve(req.result);
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function key(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        if (n < 0) {
	            resolve(null);

	            return;
	        }

	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var advanced = false;
	            var req = store.openCursor();
	            req.onsuccess = function () {
	                var cursor = req.result;
	                if (!cursor) {
	                    // this means there weren't enough keys
	                    resolve(null);

	                    return;
	                }

	                if (n === 0) {
	                    // We have the first key, return it if that's what they
	                    // wanted.
	                    resolve(cursor.key);
	                } else {
	                    if (!advanced) {
	                        // Otherwise, ask the cursor to skip ahead n
	                        // records.
	                        advanced = true;
	                        cursor.advance(n);
	                    } else {
	                        // When we get here, we've got the nth key.
	                        resolve(cursor.key);
	                    }
	                }
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var req = store.openCursor();
	            var keys = [];

	            req.onsuccess = function () {
	                var cursor = req.result;

	                if (!cursor) {
	                    resolve(keys);
	                    return;
	                }

	                keys.push(cursor.key);
	                cursor["continue"]();
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var asyncStorage = {
	    _driver: 'asyncStorage',
	    _initStorage: _initStorage,
	    iterate: iterate,
	    getItem: getItem,
	    setItem: setItem,
	    removeItem: removeItem,
	    clear: clear,
	    length: length,
	    key: key,
	    keys: keys
	};

	// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
	// it to Base64, so this is how we store it to prevent very strange errors with less
	// verbose ways of binary <-> string data storage.
	var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	var BLOB_TYPE_PREFIX = '~~local_forage_type~';
	var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

	var SERIALIZED_MARKER = '__lfsc__:';
	var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

	// OMG the serializations!
	var TYPE_ARRAYBUFFER = 'arbf';
	var TYPE_BLOB = 'blob';
	var TYPE_INT8ARRAY = 'si08';
	var TYPE_UINT8ARRAY = 'ui08';
	var TYPE_UINT8CLAMPEDARRAY = 'uic8';
	var TYPE_INT16ARRAY = 'si16';
	var TYPE_INT32ARRAY = 'si32';
	var TYPE_UINT16ARRAY = 'ur16';
	var TYPE_UINT32ARRAY = 'ui32';
	var TYPE_FLOAT32ARRAY = 'fl32';
	var TYPE_FLOAT64ARRAY = 'fl64';
	var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

	var toString$1 = Object.prototype.toString;

	function stringToBuffer(serializedString) {
	    // Fill the string into a ArrayBuffer.
	    var bufferLength = serializedString.length * 0.75;
	    var len = serializedString.length;
	    var i;
	    var p = 0;
	    var encoded1, encoded2, encoded3, encoded4;

	    if (serializedString[serializedString.length - 1] === '=') {
	        bufferLength--;
	        if (serializedString[serializedString.length - 2] === '=') {
	            bufferLength--;
	        }
	    }

	    var buffer = new ArrayBuffer(bufferLength);
	    var bytes = new Uint8Array(buffer);

	    for (i = 0; i < len; i += 4) {
	        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
	        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
	        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
	        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

	        /*jslint bitwise: true */
	        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	    }
	    return buffer;
	}

	// Converts a buffer to a string to store, serialized, in the backend
	// storage library.
	function bufferToString(buffer) {
	    // base64-arraybuffer
	    var bytes = new Uint8Array(buffer);
	    var base64String = '';
	    var i;

	    for (i = 0; i < bytes.length; i += 3) {
	        /*jslint bitwise: true */
	        base64String += BASE_CHARS[bytes[i] >> 2];
	        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	        base64String += BASE_CHARS[bytes[i + 2] & 63];
	    }

	    if (bytes.length % 3 === 2) {
	        base64String = base64String.substring(0, base64String.length - 1) + '=';
	    } else if (bytes.length % 3 === 1) {
	        base64String = base64String.substring(0, base64String.length - 2) + '==';
	    }

	    return base64String;
	}

	// Serialize a value, afterwards executing a callback (which usually
	// instructs the `setItem()` callback/promise to be executed). This is how
	// we store binary data with localStorage.
	function serialize(value, callback) {
	    var valueType = '';
	    if (value) {
	        valueType = toString$1.call(value);
	    }

	    // Cannot use `value instanceof ArrayBuffer` or such here, as these
	    // checks fail when running the tests using casper.js...
	    //
	    // TODO: See why those tests fail and use a better solution.
	    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
	        // Convert binary arrays to a string and prefix the string with
	        // a special marker.
	        var buffer;
	        var marker = SERIALIZED_MARKER;

	        if (value instanceof ArrayBuffer) {
	            buffer = value;
	            marker += TYPE_ARRAYBUFFER;
	        } else {
	            buffer = value.buffer;

	            if (valueType === '[object Int8Array]') {
	                marker += TYPE_INT8ARRAY;
	            } else if (valueType === '[object Uint8Array]') {
	                marker += TYPE_UINT8ARRAY;
	            } else if (valueType === '[object Uint8ClampedArray]') {
	                marker += TYPE_UINT8CLAMPEDARRAY;
	            } else if (valueType === '[object Int16Array]') {
	                marker += TYPE_INT16ARRAY;
	            } else if (valueType === '[object Uint16Array]') {
	                marker += TYPE_UINT16ARRAY;
	            } else if (valueType === '[object Int32Array]') {
	                marker += TYPE_INT32ARRAY;
	            } else if (valueType === '[object Uint32Array]') {
	                marker += TYPE_UINT32ARRAY;
	            } else if (valueType === '[object Float32Array]') {
	                marker += TYPE_FLOAT32ARRAY;
	            } else if (valueType === '[object Float64Array]') {
	                marker += TYPE_FLOAT64ARRAY;
	            } else {
	                callback(new Error('Failed to get type for BinaryArray'));
	            }
	        }

	        callback(marker + bufferToString(buffer));
	    } else if (valueType === '[object Blob]') {
	        // Conver the blob to a binaryArray and then to a string.
	        var fileReader = new FileReader();

	        fileReader.onload = function () {
	            // Backwards-compatible prefix for the blob type.
	            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

	            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
	        };

	        fileReader.readAsArrayBuffer(value);
	    } else {
	        try {
	            callback(JSON.stringify(value));
	        } catch (e) {
	            console.error("Couldn't convert value into a JSON string: ", value);

	            callback(null, e);
	        }
	    }
	}

	// Deserialize data we've inserted into a value column/field. We place
	// special markers into our strings to mark them as encoded; this isn't
	// as nice as a meta field, but it's the only sane thing we can do whilst
	// keeping localStorage support intact.
	//
	// Oftentimes this will just deserialize JSON content, but if we have a
	// special marker (SERIALIZED_MARKER, defined above), we will extract
	// some kind of arraybuffer/binary data/typed array out of the string.
	function deserialize(value) {
	    // If we haven't marked this string as being specially serialized (i.e.
	    // something other than serialized JSON), we can just return it and be
	    // done with it.
	    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
	        return JSON.parse(value);
	    }

	    // The following code deals with deserializing some kind of Blob or
	    // TypedArray. First we separate out the type of data we're dealing
	    // with from the data itself.
	    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
	    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

	    var blobType;
	    // Backwards-compatible blob type serialization strategy.
	    // DBs created with older versions of localForage will simply not have the blob type.
	    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
	        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
	        blobType = matcher[1];
	        serializedString = serializedString.substring(matcher[0].length);
	    }
	    var buffer = stringToBuffer(serializedString);

	    // Return the right type based on the code/type set during
	    // serialization.
	    switch (type) {
	        case TYPE_ARRAYBUFFER:
	            return buffer;
	        case TYPE_BLOB:
	            return createBlob([buffer], { type: blobType });
	        case TYPE_INT8ARRAY:
	            return new Int8Array(buffer);
	        case TYPE_UINT8ARRAY:
	            return new Uint8Array(buffer);
	        case TYPE_UINT8CLAMPEDARRAY:
	            return new Uint8ClampedArray(buffer);
	        case TYPE_INT16ARRAY:
	            return new Int16Array(buffer);
	        case TYPE_UINT16ARRAY:
	            return new Uint16Array(buffer);
	        case TYPE_INT32ARRAY:
	            return new Int32Array(buffer);
	        case TYPE_UINT32ARRAY:
	            return new Uint32Array(buffer);
	        case TYPE_FLOAT32ARRAY:
	            return new Float32Array(buffer);
	        case TYPE_FLOAT64ARRAY:
	            return new Float64Array(buffer);
	        default:
	            throw new Error('Unkown type: ' + type);
	    }
	}

	var localforageSerializer = {
	    serialize: serialize,
	    deserialize: deserialize,
	    stringToBuffer: stringToBuffer,
	    bufferToString: bufferToString
	};

	/*
	 * Includes code from:
	 *
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	// Open the WebSQL database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage$1(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
	        }
	    }

	    var dbInfoPromise = new Promise$1(function (resolve, reject) {
	        // Open the database; the openDatabase API will automatically
	        // create it for us if it doesn't exist.
	        try {
	            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
	        } catch (e) {
	            return reject(e);
	        }

	        // Create our key/value table if it doesn't exist.
	        dbInfo.db.transaction(function (t) {
	            t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' (id INTEGER PRIMARY KEY, key unique, value)', [], function () {
	                self._dbInfo = dbInfo;
	                resolve();
	            }, function (t, error) {
	                reject(error);
	            });
	        });
	    });

	    dbInfo.serializer = localforageSerializer;
	    return dbInfoPromise;
	}

	function getItem$1(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).value : null;

	                    // Check to see if this is serialized content we need to
	                    // unpack.
	                    if (result) {
	                        result = dbInfo.serializer.deserialize(result);
	                    }

	                    resolve(result);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function iterate$1(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;

	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var rows = results.rows;
	                    var length = rows.length;

	                    for (var i = 0; i < length; i++) {
	                        var item = rows.item(i);
	                        var result = item.value;

	                        // Check to see if this is serialized content
	                        // we need to unpack.
	                        if (result) {
	                            result = dbInfo.serializer.deserialize(result);
	                        }

	                        result = iterator(result, item.key, i + 1);

	                        // void(0) prevents problems with redefinition
	                        // of `undefined`.
	                        if (result !== void 0) {
	                            resolve(result);
	                            return;
	                        }
	                    }

	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function setItem$1(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            // The localStorage API doesn't return undefined values in an
	            // "expected" way, so undefined is always cast to null in all
	            // drivers. See: https://github.com/mozilla/localForage/pull/42
	            if (value === undefined) {
	                value = null;
	            }

	            // Save the original value to pass to the callback.
	            var originalValue = value;

	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    dbInfo.db.transaction(function (t) {
	                        t.executeSql('INSERT OR REPLACE INTO ' + dbInfo.storeName + ' (key, value) VALUES (?, ?)', [key, value], function () {
	                            resolve(originalValue);
	                        }, function (t, error) {
	                            reject(error);
	                        });
	                    }, function (sqlError) {
	                        // The transaction failed; check
	                        // to see if it's a quota error.
	                        if (sqlError.code === sqlError.QUOTA_ERR) {
	                            // We reject the callback outright for now, but
	                            // it's worth trying to re-run the transaction.
	                            // Even if the user accepts the prompt to use
	                            // more storage on Safari, this error will
	                            // be called.
	                            //
	                            // TODO: Try to re-run the transaction.
	                            reject(sqlError);
	                        }
	                    });
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function removeItem$1(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
	                    resolve();
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Deletes every item in the table.
	// TODO: Find out if this resets the AUTO_INCREMENT number.
	function clear$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('DELETE FROM ' + dbInfo.storeName, [], function () {
	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Does a simple `COUNT(key)` to get the number of items stored in
	// localForage.
	function length$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                // Ahhh, SQL makes this one soooooo easy.
	                t.executeSql('SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var result = results.rows.item(0).c;

	                    resolve(result);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Return the key located at key index X; essentially gets the key from a
	// `WHERE id = ?`. This is the most efficient way I can think to implement
	// this rarely-used (in my experience) part of the API, but it can seem
	// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
	// the ID of each key will change every time it's updated. Perhaps a stored
	// procedure for the `setItem()` SQL would solve this problem?
	// TODO: Don't change ID on `setItem()`.
	function key$1(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).key : null;
	                    resolve(result);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var keys = [];

	                    for (var i = 0; i < results.rows.length; i++) {
	                        keys.push(results.rows.item(i).key);
	                    }

	                    resolve(keys);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var webSQLStorage = {
	    _driver: 'webSQLStorage',
	    _initStorage: _initStorage$1,
	    iterate: iterate$1,
	    getItem: getItem$1,
	    setItem: setItem$1,
	    removeItem: removeItem$1,
	    clear: clear$1,
	    length: length$1,
	    key: key$1,
	    keys: keys$1
	};

	// Config the localStorage backend, using options set in the config.
	function _initStorage$2(options) {
	    var self = this;
	    var dbInfo = {};
	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    dbInfo.keyPrefix = dbInfo.name + '/';

	    if (dbInfo.storeName !== self._defaultConfig.storeName) {
	        dbInfo.keyPrefix += dbInfo.storeName + '/';
	    }

	    self._dbInfo = dbInfo;
	    dbInfo.serializer = localforageSerializer;

	    return Promise$1.resolve();
	}

	// Remove all keys from the datastore, effectively destroying all data in
	// the app's key/value store!
	function clear$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var keyPrefix = self._dbInfo.keyPrefix;

	        for (var i = localStorage.length - 1; i >= 0; i--) {
	            var key = localStorage.key(i);

	            if (key.indexOf(keyPrefix) === 0) {
	                localStorage.removeItem(key);
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Retrieve an item from the store. Unlike the original async_storage
	// library in Gaia, we don't modify return values at all. If a key's value
	// is `undefined`, we pass that value to the callback function.
	function getItem$2(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result = localStorage.getItem(dbInfo.keyPrefix + key);

	        // If a result was found, parse it from the serialized
	        // string into a JS object. If result isn't truthy, the key
	        // is likely undefined and we'll pass it straight to the
	        // callback.
	        if (result) {
	            result = dbInfo.serializer.deserialize(result);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items in the store.
	function iterate$2(iterator, callback) {
	    var self = this;

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var keyPrefix = dbInfo.keyPrefix;
	        var keyPrefixLength = keyPrefix.length;
	        var length = localStorage.length;

	        // We use a dedicated iterator instead of the `i` variable below
	        // so other keys we fetch in localStorage aren't counted in
	        // the `iterationNumber` argument passed to the `iterate()`
	        // callback.
	        //
	        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
	        var iterationNumber = 1;

	        for (var i = 0; i < length; i++) {
	            var key = localStorage.key(i);
	            if (key.indexOf(keyPrefix) !== 0) {
	                continue;
	            }
	            var value = localStorage.getItem(key);

	            // If a result was found, parse it from the serialized
	            // string into a JS object. If result isn't truthy, the
	            // key is likely undefined and we'll pass it straight
	            // to the iterator.
	            if (value) {
	                value = dbInfo.serializer.deserialize(value);
	            }

	            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

	            if (value !== void 0) {
	                return value;
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Same as localStorage's key() method, except takes a callback.
	function key$2(n, callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result;
	        try {
	            result = localStorage.key(n);
	        } catch (error) {
	            result = null;
	        }

	        // Remove the prefix from the key, if a key is found.
	        if (result) {
	            result = result.substring(dbInfo.keyPrefix.length);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var length = localStorage.length;
	        var keys = [];

	        for (var i = 0; i < length; i++) {
	            if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
	                keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
	            }
	        }

	        return keys;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Supply the number of keys in the datastore to the callback function.
	function length$2(callback) {
	    var self = this;
	    var promise = self.keys().then(function (keys) {
	        return keys.length;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Remove an item from the store, nice and simple.
	function removeItem$2(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        localStorage.removeItem(dbInfo.keyPrefix + key);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Set a key's value and run an optional callback once the value is set.
	// Unlike Gaia's implementation, the callback function is passed the value,
	// in case you want to operate on that value only after you're sure it
	// saved, or something like that.
	function setItem$2(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        // Convert undefined values to null.
	        // https://github.com/mozilla/localForage/pull/42
	        if (value === undefined) {
	            value = null;
	        }

	        // Save the original value to pass to the callback.
	        var originalValue = value;

	        return new Promise$1(function (resolve, reject) {
	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    try {
	                        localStorage.setItem(dbInfo.keyPrefix + key, value);
	                        resolve(originalValue);
	                    } catch (e) {
	                        // localStorage capacity exceeded.
	                        // TODO: Make this a specific error/event.
	                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
	                            reject(e);
	                        }
	                        reject(e);
	                    }
	                }
	            });
	        });
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var localStorageWrapper = {
	    _driver: 'localStorageWrapper',
	    _initStorage: _initStorage$2,
	    // Default API, from Gaia/localStorage.
	    iterate: iterate$2,
	    getItem: getItem$2,
	    setItem: setItem$2,
	    removeItem: removeItem$2,
	    clear: clear$2,
	    length: length$2,
	    key: key$2,
	    keys: keys$2
	};

	// Custom drivers are stored here when `defineDriver()` is called.
	// They are shared across all instances of localForage.
	var CustomDrivers = {};

	var DriverType = {
	    INDEXEDDB: 'asyncStorage',
	    LOCALSTORAGE: 'localStorageWrapper',
	    WEBSQL: 'webSQLStorage'
	};

	var DefaultDriverOrder = [DriverType.INDEXEDDB, DriverType.WEBSQL, DriverType.LOCALSTORAGE];

	var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'];

	var DefaultConfig = {
	    description: '',
	    driver: DefaultDriverOrder.slice(),
	    name: 'localforage',
	    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
	    // we can use without a prompt.
	    size: 4980736,
	    storeName: 'keyvaluepairs',
	    version: 1.0
	};

	var driverSupport = {};
	// Check to see if IndexedDB is available and if it is the latest
	// implementation; it's our preferred backend library. We use "_spec_test"
	// as the name of the database because it's not the one we'll operate on,
	// but it's useful to make sure its using the right spec.
	// See: https://github.com/mozilla/localForage/issues/128
	driverSupport[DriverType.INDEXEDDB] = isIndexedDBValid();

	driverSupport[DriverType.WEBSQL] = isWebSQLValid();

	driverSupport[DriverType.LOCALSTORAGE] = isLocalStorageValid();

	var isArray = Array.isArray || function (arg) {
	    return Object.prototype.toString.call(arg) === '[object Array]';
	};

	function callWhenReady(localForageInstance, libraryMethod) {
	    localForageInstance[libraryMethod] = function () {
	        var _args = arguments;
	        return localForageInstance.ready().then(function () {
	            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
	        });
	    };
	}

	function extend() {
	    for (var i = 1; i < arguments.length; i++) {
	        var arg = arguments[i];

	        if (arg) {
	            for (var key in arg) {
	                if (arg.hasOwnProperty(key)) {
	                    if (isArray(arg[key])) {
	                        arguments[0][key] = arg[key].slice();
	                    } else {
	                        arguments[0][key] = arg[key];
	                    }
	                }
	            }
	        }
	    }

	    return arguments[0];
	}

	function isLibraryDriver(driverName) {
	    for (var driver in DriverType) {
	        if (DriverType.hasOwnProperty(driver) && DriverType[driver] === driverName) {
	            return true;
	        }
	    }

	    return false;
	}

	var LocalForage = function () {
	    function LocalForage(options) {
	        _classCallCheck(this, LocalForage);

	        this.INDEXEDDB = DriverType.INDEXEDDB;
	        this.LOCALSTORAGE = DriverType.LOCALSTORAGE;
	        this.WEBSQL = DriverType.WEBSQL;

	        this._defaultConfig = extend({}, DefaultConfig);
	        this._config = extend({}, this._defaultConfig, options);
	        this._driverSet = null;
	        this._initDriver = null;
	        this._ready = false;
	        this._dbInfo = null;

	        this._wrapLibraryMethodsWithReady();
	        this.setDriver(this._config.driver);
	    }

	    // Set any config values for localForage; can be called anytime before
	    // the first API call (e.g. `getItem`, `setItem`).
	    // We loop through options so we don't overwrite existing config
	    // values.


	    LocalForage.prototype.config = function config(options) {
	        // If the options argument is an object, we use it to set values.
	        // Otherwise, we return either a specified config value or all
	        // config values.
	        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
	            // If localforage is ready and fully initialized, we can't set
	            // any new configuration values. Instead, we return an error.
	            if (this._ready) {
	                return new Error("Can't call config() after localforage " + 'has been used.');
	            }

	            for (var i in options) {
	                if (i === 'storeName') {
	                    options[i] = options[i].replace(/\W/g, '_');
	                }

	                this._config[i] = options[i];
	            }

	            // after all config options are set and
	            // the driver option is used, try setting it
	            if ('driver' in options && options.driver) {
	                this.setDriver(this._config.driver);
	            }

	            return true;
	        } else if (typeof options === 'string') {
	            return this._config[options];
	        } else {
	            return this._config;
	        }
	    };

	    // Used to define a custom driver, shared across all instances of
	    // localForage.


	    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
	        var promise = new Promise$1(function (resolve, reject) {
	            try {
	                var driverName = driverObject._driver;
	                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');
	                var namingError = new Error('Custom driver name already in use: ' + driverObject._driver);

	                // A driver name should be defined and not overlap with the
	                // library-defined, default drivers.
	                if (!driverObject._driver) {
	                    reject(complianceError);
	                    return;
	                }
	                if (isLibraryDriver(driverObject._driver)) {
	                    reject(namingError);
	                    return;
	                }

	                var customDriverMethods = LibraryMethods.concat('_initStorage');
	                for (var i = 0; i < customDriverMethods.length; i++) {
	                    var customDriverMethod = customDriverMethods[i];
	                    if (!customDriverMethod || !driverObject[customDriverMethod] || typeof driverObject[customDriverMethod] !== 'function') {
	                        reject(complianceError);
	                        return;
	                    }
	                }

	                var supportPromise = Promise$1.resolve(true);
	                if ('_support' in driverObject) {
	                    if (driverObject._support && typeof driverObject._support === 'function') {
	                        supportPromise = driverObject._support();
	                    } else {
	                        supportPromise = Promise$1.resolve(!!driverObject._support);
	                    }
	                }

	                supportPromise.then(function (supportResult) {
	                    driverSupport[driverName] = supportResult;
	                    CustomDrivers[driverName] = driverObject;
	                    resolve();
	                }, reject);
	            } catch (e) {
	                reject(e);
	            }
	        });

	        executeTwoCallbacks(promise, callback, errorCallback);
	        return promise;
	    };

	    LocalForage.prototype.driver = function driver() {
	        return this._driver || null;
	    };

	    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
	        var self = this;
	        var getDriverPromise = Promise$1.resolve().then(function () {
	            if (isLibraryDriver(driverName)) {
	                switch (driverName) {
	                    case self.INDEXEDDB:
	                        return asyncStorage;
	                    case self.LOCALSTORAGE:
	                        return localStorageWrapper;
	                    case self.WEBSQL:
	                        return webSQLStorage;
	                }
	            } else if (CustomDrivers[driverName]) {
	                return CustomDrivers[driverName];
	            } else {
	                throw new Error('Driver not found.');
	            }
	        });
	        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
	        return getDriverPromise;
	    };

	    LocalForage.prototype.getSerializer = function getSerializer(callback) {
	        var serializerPromise = Promise$1.resolve(localforageSerializer);
	        executeTwoCallbacks(serializerPromise, callback);
	        return serializerPromise;
	    };

	    LocalForage.prototype.ready = function ready(callback) {
	        var self = this;

	        var promise = self._driverSet.then(function () {
	            if (self._ready === null) {
	                self._ready = self._initDriver();
	            }

	            return self._ready;
	        });

	        executeTwoCallbacks(promise, callback, callback);
	        return promise;
	    };

	    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
	        var self = this;

	        if (!isArray(drivers)) {
	            drivers = [drivers];
	        }

	        var supportedDrivers = this._getSupportedDrivers(drivers);

	        function setDriverToConfig() {
	            self._config.driver = self.driver();
	        }

	        function initDriver(supportedDrivers) {
	            return function () {
	                var currentDriverIndex = 0;

	                function driverPromiseLoop() {
	                    while (currentDriverIndex < supportedDrivers.length) {
	                        var driverName = supportedDrivers[currentDriverIndex];
	                        currentDriverIndex++;

	                        self._dbInfo = null;
	                        self._ready = null;

	                        return self.getDriver(driverName).then(function (driver) {
	                            self._extend(driver);
	                            setDriverToConfig();

	                            self._ready = self._initStorage(self._config);
	                            return self._ready;
	                        })["catch"](driverPromiseLoop);
	                    }

	                    setDriverToConfig();
	                    var error = new Error('No available storage method found.');
	                    self._driverSet = Promise$1.reject(error);
	                    return self._driverSet;
	                }

	                return driverPromiseLoop();
	            };
	        }

	        // There might be a driver initialization in progress
	        // so wait for it to finish in order to avoid a possible
	        // race condition to set _dbInfo
	        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
	            return Promise$1.resolve();
	        }) : Promise$1.resolve();

	        this._driverSet = oldDriverSetDone.then(function () {
	            var driverName = supportedDrivers[0];
	            self._dbInfo = null;
	            self._ready = null;

	            return self.getDriver(driverName).then(function (driver) {
	                self._driver = driver._driver;
	                setDriverToConfig();
	                self._wrapLibraryMethodsWithReady();
	                self._initDriver = initDriver(supportedDrivers);
	            });
	        })["catch"](function () {
	            setDriverToConfig();
	            var error = new Error('No available storage method found.');
	            self._driverSet = Promise$1.reject(error);
	            return self._driverSet;
	        });

	        executeTwoCallbacks(this._driverSet, callback, errorCallback);
	        return this._driverSet;
	    };

	    LocalForage.prototype.supports = function supports(driverName) {
	        return !!driverSupport[driverName];
	    };

	    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
	        extend(this, libraryMethodsAndProperties);
	    };

	    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
	        var supportedDrivers = [];
	        for (var i = 0, len = drivers.length; i < len; i++) {
	            var driverName = drivers[i];
	            if (this.supports(driverName)) {
	                supportedDrivers.push(driverName);
	            }
	        }
	        return supportedDrivers;
	    };

	    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
	        // Add a stub for each driver API method that delays the call to the
	        // corresponding driver method until localForage is ready. These stubs
	        // will be replaced by the driver methods as soon as the driver is
	        // loaded, so there is no performance impact.
	        for (var i = 0; i < LibraryMethods.length; i++) {
	            callWhenReady(this, LibraryMethods[i]);
	        }
	    };

	    LocalForage.prototype.createInstance = function createInstance(options) {
	        return new LocalForage(options);
	    };

	    return LocalForage;
	}();

	// The actual localForage object that we expose as a module or via a
	// global. It's extended by pulling in one of our other libraries.


	var localforage_js = new LocalForage();

	module.exports = localforage_js;

	},{"3":3}]},{},[4])(4)
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
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
	  
	  self.expandRange = function() {
	    self.setLoopIn(self.loopIn - 0.1);
	    self.setLoopOut(self.loopOut + 0.1);
	    self.updateStyles();
	  }
	  
	  self.contractRange = function() {
	    self.setLoopIn(self.loopIn + 0.1);
	    self.setLoopOut(self.loopOut - 0.1);
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


/***/ }
/******/ ])
});
;