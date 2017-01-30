var Draggabilly = require('draggabilly');
var localforage = require('localforage');

module.exports = function(timeline, options) {
  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////
 
  var self = {
    sliderSelector: '.js-anim-panel-slider',
    sliderTrackSelector: '.js-anim-panel-slider-track',
    sliderPlayheadSelector: '.js-anim-panel-slider-playhead',
    sliderRangeStartSelector: '.js-anim-panel-slider-range-handle-start',
    sliderRangeEndSelector: '.js-anim-panel-slider-range-handle-end',
    draggablePlayhead: null,
    isDragging: false,
    loopIn: null,
    loopOut: null
  };
 
 
  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////
 
  var _init = function() {
    _createDraggables();
    _addEventListeners();
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
    self.draggablePlayhead.on('pointerDown', function(evt, poitner) {
      timeline.pause(); 
      _playPauseCallback();
      self.isDragging = true;
    });

    self.draggablePlayhead.on('pointerUp', function(evt, poitner) {
      self.isDragging = false;
    });

    self.draggablePlayhead.on('dragMove', function(evt, pointer, moveVector) {
      timeline.progress(_getProgressPercentage()).pause();
    });

    self.draggableStart.on('dragMove', function(evt, pointer, moveVector) {
      _setLoopIn(_getTimeFromDraggablePosition(self.draggableStart));
      timeline.pause();
      _playPauseCallback();
      timeline.seek(self.loopIn);
    });

    self.draggableEnd.on('dragMove', function(evt, pointer, moveVector) {
      _setLoopOut(_getTimeFromDraggablePosition(self.draggableEnd));
      timeline.pause();
      _playPauseCallback();
      timeline.seek(self.loopOut);
    });

    document.querySelector(self.sliderTrackSelector).addEventListener('click', _trackClicked.bind(self));
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
    localforage.getItem('loopIn', function(err, val) {
      if (val) {
        self.loopIn = val;
        timeline.time(self.loopIn);
        _setRangePositions();
      }
    });
    localforage.getItem('loopOut', function(err, val) {
      if (val) {
        self.loopOut = val;
        _setRangePositions();
      }
    });
  };

  var _setRangePositions = function() {
    var startPosition = _getRangeHandlePositionFromTime(self.loopIn);
    var endPosition = _getRangeHandlePositionFromTime(self.loopOut);
    var rangeStartEl = document.querySelector(self.sliderRangeStartSelector);
    var rangeEndEl = document.querySelector(self.sliderRangeEndSelector);

    self.draggableStart.position.x = startPosition;
    rangeStartEl.style.left = startPosition + 'px';

    self.draggableEnd.position.x = endPosition;
    rangeEndEl.style.left = endPosition + 'px';
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

  var _getRangeHandlePositionFromTime = function(time) {
    var timePercentage = time / timeline.totalDuration();
    var position = timePercentage * _getMaxRangePosition();
    return position;
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
  
 
 
  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////
 
  _init();
 
  // Return the Object
  return self;
}