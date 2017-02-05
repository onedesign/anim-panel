var Draggabilly = require('draggabilly');

module.exports = function(timeline, options) {
  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////
 
  var self = {
    sliderSelector: '.js-anim-panel-slider',
    sliderTrackSelector: '.js-anim-panel-slider-track',
    sliderPlayheadSelector: '.js-anim-panel-slider-playhead',
    sliderRangeSelector: '.js-slider-range',
    showRangeActiveClass: 'is-active',
    sliderRangeStartSelector: '.js-anim-panel-slider-range-handle-start',
    sliderRangeEndSelector: '.js-anim-panel-slider-range-handle-end',
    rangeSpanBeforeSelector: '.js-anim-panel-slider-range-before',
    rangeSpanAfterSelector: '.js-anim-panel-slider-range-after',
    toggleRangeSelector: '.js-range-toggle',
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
    _createDraggables();
    _addEventListeners();
    _setIsShowingRange();
    _setLoop();
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

    document.querySelector(self.sliderTrackSelector).addEventListener('click', _trackClicked.bind(self));
    document.querySelector(self.toggleRangeSelector).addEventListener('click', self.toggleRange);
  };

  var _setIsShowingRange = function() {
    if (localStorage.getItem('isShowingRange')) {
      self.toggleRange();
    }
  };

  var _trackClicked = function(evt) {
    if (evt.target === document.querySelector(self.sliderPlayheadSelector)) return;
    if (evt.target === document.querySelector(self.sliderRangeStartSelector)) return;
    if (evt.target === document.querySelector(self.sliderRangeEndSelector)) return;

    var playheadWidth = document.querySelector(self.sliderPlayheadSelector).offsetWidth;
    var clickPos = evt.offsetX - playheadWidth / 2;
    var progressPercentage = clickPos / _getMaxPlayheadPosition() * 100;
    self.setPercentage(progressPercentage);
    timeline.progress(_getProgressPercentage()).pause();
    _playPauseCallback();
  };

  var _getMaxPlayheadPosition = function() {
    var playheadWidth = document.querySelector(self.sliderPlayheadSelector).offsetWidth;
    var trackWidth = document.querySelector(self.sliderTrackSelector).offsetWidth;
    var max = trackWidth - playheadWidth;
    return max;
  };

  var _getMaxRangePosition = function() {
    var rangeWidth = document.querySelector(self.sliderRangeStartSelector).offsetWidth;
    var trackWidth = document.querySelector(self.sliderTrackSelector).offsetWidth;
    var max = trackWidth - rangeWidth;
    return max;
  };

  var _getProgressPercentage = function() {
    var max = _getMaxPlayheadPosition();
    return self.draggablePlayhead.position.x / max;
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
    var loopIn = localStorage.getItem('loopIn');
    if (loopIn < 0) loopIn = 0;
    self.loopIn = loopIn;
    if (self.isShowingRange) timeline.time(self.loopIn);

    var loopOut = localStorage.getItem('loopOut');
    if (loopOut > timeline.totalDuration()) loopOut = timeline.totalDuration();
    self.loopOut = loopOut;

    _updateRangePositions();
    _updateRangeSpans();
  };

  var _updateRangePositions = function() {
    var startPosition = _getRangeHandlePositionFromTime(self.loopIn);
    var endPosition = _getRangeHandlePositionFromTime(self.loopOut);
    var rangeStartEl = document.querySelector(self.sliderRangeStartSelector);
    var rangeEndEl = document.querySelector(self.sliderRangeEndSelector);

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
    var rangeHandleWidth = document.querySelector(self.sliderRangeEndSelector).offsetWidth;
    var maxWidth = document.querySelector(self.sliderTrackSelector).offsetWidth;
    var beforeDecimal = (self.loopIn) / timeline.totalDuration();
    var afterDecimal = 1 - ((self.loopOut) / timeline.totalDuration());
    var beforeWidth = (beforeDecimal * maxWidth) - rangeHandleWidth;
    var afterWidth = (afterDecimal * maxWidth) - rangeHandleWidth;
    if (beforeWidth < 0) beforeWidth = 0;
    if (afterWidth < 0) afterWidth = 0;
    document.querySelector(self.rangeSpanBeforeSelector).style.width = beforeWidth + (beforeWidth > 0 ? 'px' : '');
    document.querySelector(self.rangeSpanAfterSelector).style.width = afterWidth + (beforeWidth > 0 ? 'px' : '');
  };
 
 
  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////
  
  
  self.setPercentage = function(percentage) {
    var max = _getMaxPlayheadPosition();
    var playheadEl = document.querySelector(self.sliderPlayheadSelector);
    var position = max * (percentage / 100);
    self.draggablePlayhead.position.x = position;
    playheadEl.style.left = position + 'px';
  };

  self.toggleRange = function() {
    self.isShowingRange = !self.isShowingRange;
    localStorage.setItem('isShowingRange', self.isShowingRange);
    if (self.isShowingRange) {
      document.querySelector(self.sliderRangeSelector).classList.add(self.showRangeActiveClass);
      document.querySelector(self.toggleRangeSelector).classList.add(self.showRangeActiveClass);
    } else {
      document.querySelector(self.sliderRangeSelector).classList.remove(self.showRangeActiveClass);
      document.querySelector(self.toggleRangeSelector).classList.remove(self.showRangeActiveClass);
    }
    _updateRangeSpans();
  }

  self.setLoopIn = function(time) {
    if (time < 0) time = 0;
    localStorage.setItem('loopIn', time);
    self.loopIn = time;
    _updateRangeSpans();
    console.log('Loop In Set: ', time);
  };

  self.setLoopOut = function(time) {
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
  
 
 
  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////
 
  _init();
 
  // Return the Object
  return self;
}