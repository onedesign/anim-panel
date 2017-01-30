var Draggabilly = require('draggabilly');

module.exports = function(timeline) {
  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////
 
  var self = {
    sliderSelector: '.js-anim-panel-slider',
    sliderTrackSelector: '.js-anim-panel-slider-track',
    sliderPlayheadSelector: '.js-anim-panel-slider-playhead',
    draggable: null,
    isDragging: false
  };
 
 
  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////
 
  var _init = function() {
    _createDraggable();
    _addEventListeners();
  };

  var _createDraggable = function() {
    self.draggable = new Draggabilly(self.sliderPlayheadSelector, {
      containment: self.sliderTrackSelector,
      axis: 'x'
    });
  };
 
  var _addEventListeners = function() {
    self.draggable.on('pointerDown', function(evt, poitner) {
      timeline.pause();
      self.isDragging = true;
    });
    
    self.draggable.on('pointerUp', function(evt, poitner) {
      self.isDragging = false;
    });

    self.draggable.on('dragMove', function(evt, pointer, moveVector) {
      timeline.progress(_getProgressPercentage()).pause();
    });
  };

  var _getMaxPosition = function() {
    var playheadWidth = document.querySelector(self.sliderPlayheadSelector).offsetWidth;
    var trackWidth = document.querySelector(self.sliderTrackSelector).offsetWidth;
    var max = trackWidth - playheadWidth;
    return max;
  };

  var _getProgressPercentage = function() {
    var max = _getMaxPosition();
    return self.draggable.position.x / max;
  };
 
 
  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////
  
  
  self.setPercentage = function(percentage) {
    // TODO: this currently results in strange draggable behavior.
    var max = _getMaxPosition();
    var playheadEl = document.querySelector(self.sliderPlayheadSelector);
    var position = max * (percentage / 100);
    self.draggable.position.x = position;
    playheadEl.style.left = position + 'px';
  };
  
 
 
  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////
 
  _init();
 
  // Return the Object
  return self;
}