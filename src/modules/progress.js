var Draggabilly = require('draggabilly');

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
    _updateRangeStartPosition();
    _updateRangeEndPosition();
  };

  var _updateRangeStartPosition = function() {
    var startPosition = _getRangeHandlePositionFromTime(self.loopIn);
    var rangeStartEl = self.sliderRangeStartEl;
    self.draggableStart.position.x = startPosition;
    rangeStartEl.style.left = startPosition + 'px';
  }

  var _updateRangeEndPosition = function() {
    var endPosition = _getRangeHandlePositionFromTime(self.loopOut);
    var rangeEndEl = self.sliderRangeEndEl;
    self.draggableEnd.position.x = endPosition;
    rangeEndEl.style.left = endPosition + 'px';
  }

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
    if (time >= self.loopOut) {
      self.setLoopOut(time + 0.1);
      _updateRangeEndPosition();
    }
    if (time < 0) time = 0;
    localStorage.setItem('loopIn', time);
    self.loopIn = time;
    _updateRangeSpans();
    console.log('Loop In Set: ', time);
  };

  self.setLoopOut = function(time) {
    if (time <= self.loopIn) {
      self.setLoopIn(time - 0.1);
      _updateRangeStartPosition();
    };
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