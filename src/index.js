var styles = require('css!./main.css');
var sliderStyles = require('css!./no-ui-slider.css');
var markup = require("html!./index.html");
var noUiSlider = require('noUiSlider');

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
        shouldUpdateSliderFromTimeline: true
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
     
      var _addEventListeners = function() {
        document.querySelector(self.playSelector).addEventListener('click', _play.bind(self));
        document.querySelector(self.pauseSelector).addEventListener('click', _pause.bind(self));
        document.querySelector(self.restartSelector).addEventListener('click', _restart.bind(self));
        document.querySelectorAll(self.timescaleSelector).forEach(function(timescaleLink) {
          var timescale = timescaleLink.getAttribute('data-timescale');
          timescaleLink.addEventListener('click', _updateTimescale.bind(self, timescaleLink, timescale));
        });

        // Listen for the playhead to change
        timeline.eventCallback('onUpdate', _onTimelineUpdate.bind(self))
      };

      var _play = function(evt) {
        timeline.play();
      };

      var _pause = function(evt) {
        timeline.pause();
      };

      var _restart = function(evt) {
        timeline.timeScale(1);
        timeline.restart();
      };

      var _onTimelineUpdate = function() {
        // Update the displayed time
        _updateTime(timeline.totalTime());

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