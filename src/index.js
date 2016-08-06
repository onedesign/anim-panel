var styles = require('css!./main.css');
var markup = require("html!./index.html");
var noUiSlider = require('noUiSlider');

module.exports = function(timeline, options) {
      /*
      PARAMS:
      timeline            The TimelineLite/TimelineMax object 
                          to be controlled
                          [TimelineLite/TimelineMax] (required)
      consoleTime         Determines whether the current timeline time
                          is output in the console each tick
                          [Boolean false] (optional)
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
        labelsSelector: '.js-anim-panel-labels'
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
        } else {
          style.appendChild(document.createTextNode(styles));
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
          _startUpdatingSlider();
          timeline.pause();
        });

        // Start updating again on drag end
        self.sliderEl.noUiSlider.on('end', () => {
          _stopUpdatingSlider();
        });
      };

      var _startUpdatingSlider = function() {
        self.sliderEl.noUiSlider.on('slide', (values, handle) => {
          timeline.progress(values[0] / 100).pause();
        });
      };

      var _stopUpdatingSlider = function() {
        self.sliderEl.noUiSlider.off('slide');
      };

      var _addLabelButtons = function() {
        var labels = timeline.getLabelsArray();
        var labelContainer = document.querySelector(self.labelsSelector);

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
        timeline.eventCallback('onUpdate', _updateSlider.bind(self))
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

      var _updateSlider = function() {
        var progress = timeline.progress() * 100;
        self.sliderEl.noUiSlider.set(progress);

        // Output console time
        if (self.settings.consoleTime) {
          console.clear();
          console.log('Total Time', timeline.totalTime());
        }
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