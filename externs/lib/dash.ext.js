/**
 * Simple extern file for dash.js, used in ForgeJS player.
 * Only include used methods from dash.js.
 */

/**
 * @const
 */
var dashjs = {};

/**
 * @constructor
 * @return {!MediaPlayer}
 */
function MediaPlayer() {};

/**
 * @param {HTMLMediaElement=} video
 * @param {HTMLSourceElement=} source
 * @param {Object=} context
 * @return {MediaPlayer|null}
 */
MediaPlayer.prototype.create = function(video, source, context) {};

/**
 * @param {HTMLMediaElement=} view - Optional arg to set the video element.
 * @param {string=} source - Optional arg to set the media source.
 * @param {boolean=} AutoPlay - Optional arg to set auto play.
 */
MediaPlayer.prototype.initialize = function(view, source, AutoPlay) {};

/**
 * @param {boolean} value
 */
MediaPlayer.prototype.setAutoPlay = function(value) {};

/**
 * @param {Object} element
 */
MediaPlayer.prototype.attachView = function(element) {};

/**
 * @param {(string|Object)} urlOrManifest
 */
MediaPlayer.prototype.attachSource = function(urlOrManifest) {};

/**
 * @return {boolean}
 */
MediaPlayer.prototype.isReady = function() {};

MediaPlayer.prototype.play = function() {};

MediaPlayer.prototype.pause = function() {};

MediaPlayer.prototype.reset = function() {};

/**
 * @param {boolean} value
 */
MediaPlayer.prototype.setMute = function(value) {};

/**
 * @param {number} value
 */
MediaPlayer.prototype.setVolume = function(value) {};

/**
 * @param {number} value
 */
MediaPlayer.prototype.seek = function(value) {};

/**
 * @param {string=} streamId
 */
MediaPlayer.prototype.time = function(streamId) {};

/**
 * @return {number}
 */
MediaPlayer.prototype.duration = function() {};

/**
 * @param {string} type - {@link MediaPlayerEvents}
 * @param {Function} listener - callback method when the event fires.
 * @param {Object=} scope - context of the listener so it can be removed properly.
 */
MediaPlayer.prototype.on = function(type, listener, scope) {};

/**
 * @param {string} type - {@link MediaPlayerEvents}
 * @param {Function} listener - callback method when the event fires.
 * @param {Object=} scope - context of the listener so it can be removed properly.
 */
MediaPlayer.prototype.off = function(type, listener, scope) {};

/**
 * @return {Debug}
 */
MediaPlayer.prototype.getDebug = function() {};

/**
 * @return {DashMetrics}
 */
MediaPlayer.prototype.getDashMetrics = function() {};

/**
 * @param {string} type
 * @return {Object}
 */
MediaPlayer.prototype.getMetricsFor = function(type) {};

/**
 * @param {string} type
 * @return {number}
 */
MediaPlayer.prototype.getQualityFor = function(type) {};

/**
 * @param {string} type
 * @param {number} value
 */
MediaPlayer.prototype.setQualityFor = function(type, value) {};

/**
 * @param {string} type
 * @return {Array}
 */
MediaPlayer.prototype.getBitrateInfoListFor = function(type) {};

/**
 * @param {string} type - 'audio' | 'video'
 * @param {boolean} value
 * @default {boolean} true
 */
MediaPlayer.prototype.setAutoSwitchQualityFor = function(type, value) {};

/**
 * @param {boolean} value
 * @default false
 */
MediaPlayer.prototype.enableBufferOccupancyABR = function(value) {};

/**
 * @constructor
 * @return {!MediaPlayerEvents}
 */
function MediaPlayerEvents() {};

MediaPlayerEvents.prototype.CAN_PLAY;
MediaPlayerEvents.prototype.ERROR;
MediaPlayerEvents.prototype.PLAYBACK_ENDED;
MediaPlayerEvents.prototype.PLAYBACK_ERROR;
MediaPlayerEvents.prototype.PLAYBACK_METADATA_LOADED;
MediaPlayerEvents.prototype.PLAYBACK_PAUSED;
MediaPlayerEvents.prototype.PLAYBACK_PROGRESS;
MediaPlayerEvents.prototype.PLAYBACK_SEEKED;
MediaPlayerEvents.prototype.PLAYBACK_STARTED;
MediaPlayerEvents.prototype.PLAYBACK_TIME_UPDATED;
MediaPlayerEvents.prototype.QUALITY_CHANGE_RENDERED;
MediaPlayerEvents.prototype.QUALITY_CHANGE_REQUESTED;
MediaPlayerEvents.prototype.STREAM_INITIALIZED;
MediaPlayerEvents.prototype.PERIOD_SWITCH_COMPLETED;
MediaPlayerEvents.prototype.METRIC_CHANGED;

/**
 * @constructor
 * @return {!DashMetrics}
 */
function DashMetrics() {};

DashMetrics.prototype.getBandwidthForRepresentation = function(representationId, periodId) {};

/**
 * @param {string} representationId
 * @param {number} periodIdx
 * @return {number}
 */
DashMetrics.prototype.getIndexForRepresentation = function(representationId, periodIdx) {};

/**
 * @param {string} bufferType - String 'audio' or 'video',
 * @param {number} periodIdx - Make sure this is the period index not id
 * @return {number}
 */
DashMetrics.prototype.getMaxIndexForBufferType = function(bufferType, periodIdx) {};

/**
 * @param {Object} metrics
 * @return {*}
 */
DashMetrics.prototype.getCurrentRepresentationSwitch = function(metrics) {};

/**
 * @param {Object} metrics
 * @return {number}
 */
DashMetrics.prototype.getCurrentBufferLevel = function(metrics) {};

/**
 * @param {Object} metrics
 * @return {null|*}
 */
DashMetrics.prototype.getRequestsQueue = function(metrics) {};

/**
 * @param {Object} metrics
 * @return {*}
 */
DashMetrics.prototype.getHttpRequests = function(metrics) {};

/**
 * @param {Object} metrics
 * @return
 */
DashMetrics.prototype.getCurrentDroppedFrames = function(metrics) {};

/**
 * @constructor
 * @return {!Debug}
 */
function Debug() {};

/**
 * @param {boolean} value Set to false if you want to turn off logging to the browser's console.
 * @default true
 */
Debug.prototype.setLogToBrowserConsole = function(value) {};

/**
 * @constructor
 * @return {!MetricsList}
 */
function MetricsList() {};

/**
 * @constructor
 * @return {!StreamInfo}
 */
function StreamInfo() {};

StreamInfo.prototype.id;
StreamInfo.prototype.index;
StreamInfo.prototype.start;
StreamInfo.prototype.duration;
StreamInfo.prototype.manifestinfo;
StreamInfo.prototype.isLast;
StreamInfo.prototype.isFirst;

/**
 * @constructor
 * @return {!BitrateInfo}
 */
function BitrateInfo() {};

BitrateInfo.prototype.qualityIndex;
BitrateInfo.prototype.bitrate;
BitrateInfo.prototype.width;
BitrateInfo.prototype.height;

/**
 * @constructor
 * @return {!DroppedFrames}
 */
function DroppedFrames() {};

DroppedFrames.prototype.droppedFrames;

/**
 * @constructor
 * @return {!MetricChangedEvents}
 */
function MetricChangedEvents() {};

MetricChangedEvents.prototype.mediaType;

/**
 * @constructor
 * @return {!SwitchEvents}
 */
function SwitchEvents() {};

SwitchEvents.prototype.fromStreamInfo;
SwitchEvents.prototype.toStreamInfo;

/**
 * @constructor
 * @return {!QualityEvents}
 */
function QualityEvents() {};

QualityEvents.prototype.mediaType;
QualityEvents.prototype.oldQuality;
QualityEvents.prototype.newQuality;

/**
 * @constructor
 * @return {!RepresentationSwitch}
 */
function RepresentationSwitch() {};

RepresentationSwitch.prototype.mt;
RepresentationSwitch.prototype.t;
RepresentationSwitch.prototype.to;

/**
 * @const
 */
dashjs.MediaPlayer = MediaPlayer;

/**
 * @const
 */
dashjs.MediaPlayer.events = MediaPlayerEvents;