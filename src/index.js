var styles = require('css!sass!postcss!./styles/main.scss');
var markup = require("html!./index.html");
var localforage = require('localforage');
var Progress = require('./modules/progress');

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
        loopIn: null,
        loopOut: null
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
        _setLoop();
        _addEventListeners();
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
        self.progress = new Progress(timeline);
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
          })
        });
      };

      var _setLoop = function() {
        // Set default values
        _setLoopDefaults();

        // Check for local storage values
        localforage.getItem('loopIn', function(err, val) {
          if (val) {
            self.loopIn = val;
            timeline.time(self.loopIn);
          }
        });
        localforage.getItem('loopOut', function(err, val) {
          if (val) {
            self.loopOut = val;
          }
        });
      };
     
      var _addEventListeners = function() {
        // Playback Controls
        document.querySelector(self.playPauseSelector).addEventListener('click', _togglePlay.bind(self));
        document.querySelector(self.restartSelector).addEventListener('click', _restart.bind(self));

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

      var _togglePlay = function(evt) {
        if (timeline.paused()) {
          timeline.play();
        } else {
          timeline.pause();
        }
      };

      var _restart = function(evt) {
        timeline.timeScale(1);
        timeline.time(self.loopIn);
      };

      var _setLoopIn = function(time) {
        localforage.setItem('loopIn', time, function(err, val) {});
        self.loopIn = time;
        console.log('Loop In Set: ', time);
      };

      var _setLoopOut = function(time) {
        localforage.setItem('loopOut', time, function(err, val) {});
        self.loopOut = time;
        console.log('Loop Out Set: ', time);
      };

      var _clearLoop = function(evt) {
        localforage.setItem('loopIn', null, function(err, val) {});
        localforage.setItem('loopOut', null, function(err, val) {});
        _setLoopDefaults();
      };

      var _setLoopDefaults = function(evt) {
        self.loopIn = 0;
        self.loopOut = timeline.totalDuration();
        console.log('Loop Reset: In ' + self.loopIn + ', Out ' + self.loopOut);
      };

      var _toggleDropdown = function(evt) {
        var container = evt.target.parentNode;
        container.classList.toggle('is-active');
      };

      var _onTimelineUpdate = function() {
        // Update the displayed time
        _updateTime(timeline.totalTime());

        // If we're at the loop out point, jump to the loop in point
        if (timeline.totalTime() >= self.loopOut) {
          timeline.time(self.loopIn);
        }

        // Update slider based on timeline
        if (self.progress.isDragging) return;
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
      };
     
     
      //
      //   Initialize
      //
      //////////////////////////////////////////////////////////////////////
     
      _init();
     
      // Return the Object
      return self;
    }