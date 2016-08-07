var styles = require('css!./main.css');
var sliderStyles = require('css!./no-ui-slider.css');
var markup = require("html!./index.html");
var noUiSlider = require('noUiSlider');
var localforage = require('localforage')

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
        sliderSelector: '.js-slider',
        timelineTimeDataAttr: 'data-timeline-time',
        playSelector: '.js-play',
        pauseSelector: '.js-pause',
        restartSelector: '.js-restart',
        timescaleSelector: '.js-timescale',
        activeTimescaleClass: 'is-active',
        labelsSelector: '.js-anim-panel-labels',
        timeSelector: '.js-time',
        loopInSelector: '.js-loop-in',
        loopOutSelector: '.js-loop-out',
        loopClearSelector: '.js-loop-clear',
        shouldUpdateSliderFromTimeline: true,
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
        _addSlider();
        _addLabelButtons();
        _setLoop();
        _addEventListeners();
        _play();
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
          style.styleSheet.cssText += sliderStyles;
        } else {
          style.appendChild(document.createTextNode(styles));
          style.appendChild(document.createTextNode(sliderStyles));
        }

        head.appendChild(style);
      };

      var _addSlider = function() {
        self.sliderEl = document.querySelector(self.sliderSelector);

        noUiSlider.create(self.sliderEl, {
          start: [0],
          range: {
            'min': [0],
            'max': [100]
          }
        });

        // Stop updating based on timeline position as we drag the slider
        self.sliderEl.noUiSlider.on('start', () => {
          _startUpdatingTimelineFromSlider();
          self.shouldUpdateSliderFromTimeline = false;
          timeline.pause();
        });

        // Start updating again on drag end
        self.sliderEl.noUiSlider.on('end', () => {
          _stopUpdatingTimelineFromSlider();
          self.shouldUpdateSliderFromTimeline = true;
        });
      };

      var _startUpdatingTimelineFromSlider = function() {
        self.sliderEl.noUiSlider.on('slide', (values, handle) => {
          timeline.progress(values[0] / 100).pause();
        });
      };

      var _stopUpdatingTimelineFromSlider = function() {
        self.sliderEl.noUiSlider.off('slide');
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
          var labelButton = document.createElement('button');
          labelButton.setAttribute('type', 'button');
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
        document.querySelector(self.playSelector).addEventListener('click', _play.bind(self));
        document.querySelector(self.pauseSelector).addEventListener('click', _pause.bind(self));
        document.querySelector(self.restartSelector).addEventListener('click', _restart.bind(self));
        
        // Setting Timescale
        document.querySelectorAll(self.timescaleSelector).forEach(function(timescaleLink) {
          var timescale = timescaleLink.getAttribute('data-timescale');
          timescaleLink.addEventListener('click', _updateTimescale.bind(self, timescaleLink, timescale));
        });

        // Setting Loop
        document.querySelector(self.loopInSelector).addEventListener('click', _setLoopIn.bind(self));
        document.querySelector(self.loopOutSelector).addEventListener('click', _setLoopOut.bind(self));
        document.querySelector(self.loopClearSelector).addEventListener('click', _clearLoop.bind(self));

        // Listen for the playhead to change
        timeline.eventCallback('onUpdate', _onTimelineUpdate.bind(self))
      };

      var _play = function(evt) {
        timeline.play();
        document.querySelector(self.pauseSelector).classList.remove(self.activeTimescaleClass);
      };

      var _pause = function(evt) {
        timeline.pause();
        document.querySelector(self.pauseSelector).classList.add(self.activeTimescaleClass);
      };

      var _restart = function(evt) {
        timeline.timeScale(1);
        timeline.time(self.loopIn);
        document.querySelector(self.pauseSelector).classList.remove(self.activeTimescaleClass);
      };

      var _setLoopIn = function(evt) {
        var currentTime = timeline.totalTime();

        // Prevent setting an in time after the out time
        if (currentTime > self.loopOut) return;

        localforage.setItem('loopIn', currentTime, function(err, val) {});
        self.loopIn = currentTime;
        console.log('Loop In Set: ', currentTime);
      };

      var _setLoopOut = function(evt) {
        var currentTime = timeline.totalTime();

        // Prevent setting an out time before the in time
        if (currentTime < self.loopIn) return;

        localforage.setItem('loopOut', currentTime, function(err, val) {});
        self.loopOut = currentTime;
        console.log('Loop Out Set: ', currentTime);
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

      var _onTimelineUpdate = function() {
        // Update the displayed time
        _updateTime(timeline.totalTime());

        // If we're at the loop out point, jump to the loop in point
        if (timeline.totalTime() >= self.loopOut) {
          timeline.time(self.loopIn);
        }

        // Update slider based on timeline
        if (!self.shouldUpdateSliderFromTimeline) return;
        var progress = timeline.progress() * 100;
        self.sliderEl.noUiSlider.set(progress);
      };

      var _updateTime = function(timelineTime) {
        var timeEl = document.querySelector(self.timeSelector);
        var roundedTime = Math.round(timelineTime * 100) / 100
        timeEl.innerHTML = roundedTime;
      };

      var _updateTimescale = function(selectedTimescale, timescale) {
        var timescaleItems = document.querySelectorAll(self.timescaleSelector);
        timescaleItems.forEach(function(item) {
          item.classList.remove(self.activeTimescaleClass);
        });
        selectedTimescale.classList.add(self.activeTimescaleClass)
        timeline.timeScale(timescale).play();
      };
     
     
      //
      //   Public Methods
      //
      //////////////////////////////////////////////////////////////////////
      
      /* No public methods yet, but if you add one it should use the following signature: */
      
      /*
      self.foo = function() {
        
      };
      */
     
     
      //
      //   Initialize
      //
      //////////////////////////////////////////////////////////////////////
     
      _init();
     
      // Return the Object
      return self;
    }