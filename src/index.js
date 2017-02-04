var styles = require('css!sass!postcss!./styles/main.scss');
var markup = require("html!./index.html");
var localforage = require('localforage');
var Progress = require('./modules/progress');
var Combokeys = require("combokeys");

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
        consoleTime: false
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
        self.combokeys.bind('space', self.togglePlay);

        // Timescale
        for (var idx = 0, length = self.timescales.length; idx < length; idx++) {
          self.combokeys.bind(String(idx + 1), self.setTimescale.bind(self, self.timescales[idx]));
        }

        // Changing Range Start/End
        self.combokeys.bind('b', function() { 
          self.progress.setLoopIn(timeline.time());
          self.progress.updateStyles();
        });
        self.combokeys.bind('n', function() { 
          self.progress.setLoopOut(timeline.time());
          self.progress.updateStyles();
        });

        // Showing/Hiding Range
        self.combokeys.bind('shift+space', self.progress.toggleRange);

        // Jumping in time
        self.combokeys.bind('option+right', self.jumpForward.bind(self, 1));
        self.combokeys.bind('option+left', self.jumpBackward.bind(self, 1));
        self.combokeys.bind('shift+option+right', self.jumpForward.bind(self, 10));
        self.combokeys.bind('shift+option+left', self.jumpBackward.bind(self, 10));
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