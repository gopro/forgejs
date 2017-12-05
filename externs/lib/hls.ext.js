/**
 * Simple extern file for hls.js, used in ForgeJS player.
 * Only include used methods from hls.js.
 */

/**
 * @constructor
 * @param {Hls.Config} config
 * @return {!Hls}
 */
function Hls(config) {};

/**
 * @return {boolean}
 */
Hls.isSupported = function() {};

/**
 * @type {string}
 */
Hls.version;

/**
 * @type {Array}
 */
Hls.DefaultConfig;

/**
 * @return {undefined}
 */
Hls.prototype.destroy = function() {};

/**
 * @param {HTMLVideoElement} media
 * @return {undefined}
 */
Hls.prototype.attachMedia = function(media) {};

/**
 * @return {undefined}
 */
Hls.prototype.detachMedia = function() {};

/**
 * @param {string} url
 * @return {undefined}
 */
Hls.prototype.loadSource = function(url) {};

/**
 * @param {number=} startPosition
 * @return {undefined}
 */
Hls.prototype.startLoad = function(startPosition) {};

/**
 * @return {undefined}
 */
Hls.prototype.stopLoad = function() {};

/**
 * @return {undefined}
 */
Hls.prototype.swapAudioCodec = function() {};

/**
 * @return {undefined}
 */
Hls.prototype.recoverMediaError = function() {};

/**
 * @type {Array<Hls.Level>}
 */
Hls.prototype.levels;

/**
 * @type {number}
 */
Hls.prototype.currentLevel;

/**
 * @type {number}
 */
Hls.prototype.nextLevel;

/**
 * @type {number}
 */
Hls.prototype.loadLevel;

/**
 * @type {number}
 */
Hls.prototype.nextLoadLevel;

/**
 * @type {number}
 */
Hls.prototype.firstLevel;

/**
 * @type {number}
 */
Hls.prototype.startLevel;

/**
 * @type {number}
 */
Hls.prototype.autoLevelCapping;

/**
 * @type {boolean}
 */
Hls.prototype.autoLevelEnabled;

/**
 * @type {number}
 */
Hls.prototype.manualLevel;

/**
 * @type {number}
 */
Hls.prototype.minAutoLevel;

/**
 * @type {number}
 */
Hls.prototype.maxAutoLevel;

/**
 * @type {number}
 */
Hls.prototype.nextAutoLevel;

/**
 * @type {Array}
 */
Hls.prototype.audioTracks;

/**
 * @type {number}
 */
Hls.prototype.audioTrack;

/**
 * @type {number}
 */
Hls.prototype.liveSyncPosition;

/**
 * @type {Array}
 */
Hls.prototype.subtitleTracks;

/**
 * @type {number}
 */
Hls.prototype.subtitleTrack;

/**
 * @typedef {{
 *   url: string,
 *   responseType: string,
 *   type: string,
 *   rangeStart: (number|undefined),
 *   rangeEnd: (number|undefined),
 *   progressData: (boolean|undefined)
 * }}
 */
Hls.Context;

/**
 * @typedef {{
 *   autoStartLoad: (boolean|undefined),
 *   startPosition: (number|undefined),
 *   debug: (boolean|undefined),
 *   startLevel: (number|undefined),
 *   enableWebVTT: (boolean|undefined),
 *   enableCEA708Captions: (boolean|undefined),
 *   stretchShortVideoTrack: (boolean|undefined),
 *   maxAudioFramesDrift : (number|undefined),
 *   forceKeyFrameOnDiscontinuity: (boolean|undefined)
 * }}
 */
Hls.Config;

/**
 * @typedef {{
 *   context: Hls.Context,
 *   config: Hls.Config,
 *   callbacks: {onSuccess: function(), onProgress: function(), onError: function(), onTimeout: function()},
 *   load: function(Object, Object, Object),
 *   abort: function(),
 *   destroy: function()
 * }}
 */
Hls.Loader;

/**
 * @typedef {{
 *   type: string,
 *   level: number,
 *   loader: Hls.Loader,
 *   autoLevel: boolean,
 *   duration: number,
 *   sn: (number|string),
 *   bitrateTest: boolean,
 *   loadCounter: number,
 *   cc: number,
 *   loadIdx: number,
 *   decryptdata: ({uri: string, key: Object}|undefined),
 *   start: number,
 *   dropped: number,
 *   startPTS: number,
 *   endPTS: number,
 *   startDTS: number,
 *   endDTS: number,
 *   deltaPTS: number,
 *   backtracked: boolean,
 *   trackId: number,
 *   byteLength: number,
 *   loaded: number,
 *   byteRangeStartOffset: number,
 *   byteRangeEndOffset: number,
 *   lastByteRangeEndOffset: number,
 *   rawByteRange: Array,
 *   rawProgramDateTime: Array,
 *   title: string,
 *   tagList: Array,
 *   levelkey: LevelKey,
 *   baseurl: string,
 *   relurl: string,
 *   url: string
 * }}
 */
Hls.Fragment;

/**
 * @typedef {{
 *   url: Array<string>,
 *   bitrate: (number|undefined),
 *   name: (string|undefined),
 *   codecs: (string|undefined),
 *   width: (number|undefined),
 *   height: (number|undefined)
 * }}
 */
Hls.Level;

/**
 * @typedef {{
 *   version: number,
 *   type: (string|undefined),
 *   startSN: number,
 *   endSN: number,
 *   totalduration: number,
 *   targetduration: number,
 *   fragments: Array<Hls.Fragment>,
 *   live: boolean
 * }}
 */
Hls.LevelDetails;

/**
 * @typedef {{
 *   trequest: number,
 *   tfirst: number,
 *   tload: number,
 *   loaded: number,
 *   bw: (number|undefined),
 *   total: (number|undefined)
 * }}
 */
Hls.Stats;

/**
 * @typedef {{
 *   code: number,
 *   text: string
 * }}
 */
Hls.Response;

/**
 * @typedef {{
 *   type: (string|undefined),
 *   details: (string|undefined),
 *   fatal: (boolean|undefined),
 *   url: (string|undefined),
 *   reason: (string|undefined),
 *   err: (Error|undefined),
 *   mimeType: (string|undefined),
 *   parent: (string|undefined),
 *   content: (string|undefined),
 *   hole: (number|undefined),
 *   id: (string|number|undefined),
 *   startOffset: (number|undefined),
 *   endOffset: (number|undefined),
 *   audioTracks: (Array|undefined),
 *   subtitleTracks: (Array|undefined),
 *   subtitles: (Array|undefined),
 *   media: (Element|undefined),
 *   pending: (number|undefined),
 *   currentDropped: (number|undefined),
 *   currentDecoded: (number|undefined),
 *   totalDroppedFrames: (number|undefined),
 *   level: (number|undefined),
 *   droppedLevel: (number|undefined),
 *   levels: (Array<Hls.Level>|undefined),
 *   firstLevel: (number|undefined),
 *   audio: (boolean|undefined),
 *   video: (boolean|undefined),
 *   altAudio: (boolean|undefined),
 *   data: (?|undefined),
 *   drift: (?|undefined),
 *   start: (number|undefined),
 *   end: (number|undefined),
 *   buffer: (number|undefined),
 *   previousState: (?|undefined),
 *   nextState: (?|undefined),
 *   success: (boolean|undefined),
 *   payload: (?|undefined),
 *   initPTS: (number|undefined),
 *   bytes: (number|undefined),
 *   response: (Hls.Response|undefined),
 *   loader: (Hls.Loader|undefined),
 *   frag: (Hls.Fragment|undefined),
 *   context: (Hls.Context|undefined),
 *   stats: (Hls.Stats|undefined)
 * }}
 */
Hls.EventCallback;

/**
 * @param {string} event
 * @param {?function(Object=, Hls.EventCallback=): void} callback
 * @return {undefined}
 */
Hls.prototype.on = function(event, callback) {};

/**
 * @param {string} event
 * @param {?function(Object=, Hls.EventCallback=): void} callback
 * @return {undefined}
 */
Hls.prototype.off = function(event, callback) {};


/**
 * @constructor
 */
Hls.Events = function () {};

/** @const {string} */
Hls.Events.MEDIA_ATTACHING;

/** @const {string} */
Hls.Events.MEDIA_ATTACHED;

/** @const {string} */
Hls.Events.MEDIA_DETACHING;

/** @const {string} */
Hls.Events.MEDIA_DETACHED;

/** @const {string} */
Hls.Events.BUFFER_RESET;

/** @const {string} */
Hls.Events.BUFFER_CODECS;

/** @const {string} */
Hls.Events.BUFFER_CREATED;

/** @const {string} */
Hls.Events.BUFFER_APPENDING;

/** @const {string} */
Hls.Events.BUFFER_APPENDED;

/** @const {string} */
Hls.Events.BUFFER_EOS;

/** @const {string} */
Hls.Events.BUFFER_FLUSHING;

/** @const {string} */
Hls.Events.BUFFER_FLUSHED;

/** @const {string} */
Hls.Events.MANIFEST_LOADING;

/** @const {string} */
Hls.Events.MANIFEST_LOADED;

/** @const {string} */
Hls.Events.MANIFEST_PARSED;

/** @const {string} */
Hls.Events.LEVEL_SWITCH;

/** @const {string} */
Hls.Events.LEVEL_SWITCHING;

/** @const {string} */
Hls.Events.LEVEL_SWITCHED;

/** @const {string} */
Hls.Events.LEVEL_LOADING;

/** @const {string} */
Hls.Events.LEVEL_LOADED;

/** @const {string} */
Hls.Events.LEVEL_UPDATED;

/** @const {string} */
Hls.Events.LEVEL_PTS_UPDATED;

/** @const {string} */
Hls.Events.AUDIO_TRACKS_UPDATED;

/** @const {string} */
Hls.Events.AUDIO_TRACK_SWITCH;

/** @const {string} */
Hls.Events.AUDIO_TRACK_SWITCHING;

/** @const {string} */
Hls.Events.AUDIO_TRACK_SWITCHED;

/** @const {string} */
Hls.Events.AUDIO_TRACK_LOADING;

/** @const {string} */
Hls.Events.AUDIO_TRACK_LOADED;

/** @const {string} */
Hls.Events.SUBTITLE_TRACKS_UPDATED;

/** @const {string} */
Hls.Events.SUBTITLE_TRACK_SWITCH;

/** @const {string} */
Hls.Events.SUBTITLE_TRACK_LOADING;

/** @const {string} */
Hls.Events.SUBTITLE_TRACK_LOADED;

/** @const {string} */
Hls.Events.SUBTITLE_FRAG_PROCESSED;

/** @const {string} */
Hls.Events.INIT_PTS_FOUND;

/** @const {string} */
Hls.Events.FRAG_LOADING;

/** @const {string} */
Hls.Events.FRAG_LOAD_PROGRESS;

/** @const {string} */
Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED;

/** @const {string} */
Hls.Events.FRAG_LOADED;

/** @const {string} */
Hls.Events.FRAG_DECRYPTED;

/** @const {string} */
Hls.Events.FRAG_PARSING_INIT_SEGMENT;

/** @const {string} */
Hls.Events.FRAG_PARSING_USERDATA;

/** @const {string} */
Hls.Events.FRAG_PARSING_METADATA;

/** @const {string} */
Hls.Events.FRAG_PARSING_DATA;

/** @const {string} */
Hls.Events.FRAG_PARSED;

/** @const {string} */
Hls.Events.FRAG_BUFFERED;

/** @const {string} */
Hls.Events.FRAG_CHANGED;

/** @const {string} */
Hls.Events.FPS_DROP;

/** @const {string} */
Hls.Events.FPS_DROP_LEVEL_CAPPING;

/** @const {string} */
Hls.Events.ERROR;

/** @const {string} */
Hls.Events.DESTROYING;

/** @const {string} */
Hls.Events.KEY_LOADING;

/** @const {string} */
Hls.Events.KEY_LOADED;

/** @const {string} */
Hls.Events.STREAM_STATE_TRANSITION;


/**
 * @constructor
 */
Hls.ErrorTypes = function () {};

/** @const {string} */
Hls.ErrorTypes.NETWORK_ERROR;

/** @const {string} */
Hls.ErrorTypes.MEDIA_ERROR;

/** @const {string} */
Hls.ErrorTypes.MUX_ERROR;

/** @const {string} */
Hls.ErrorTypes.OTHER_ERROR;


/**
 * @constructor
 */
Hls.ErrorDetails = function () {};

/** @const {string} */
Hls.ErrorDetails.MANIFEST_LOAD_ERROR;

/** @const {string} */
Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT;

/** @const {string} */
Hls.ErrorDetails.MANIFEST_PARSING_ERROR;

/** @const {string} */
Hls.ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR;

/** @const {string} */
Hls.ErrorDetails.LEVEL_LOAD_ERROR;

/** @const {string} */
Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT;

/** @const {string} */
Hls.ErrorDetails.LEVEL_SWITCH_ERROR;

/** @const {string} */
Hls.ErrorDetails.AUDIO_TRACK_LOAD_ERROR;

/** @const {string} */
Hls.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT;

/** @const {string} */
Hls.ErrorDetails.FRAG_LOAD_ERROR;

/** @const {string} */
Hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR;

/** @const {string} */
Hls.ErrorDetails.FRAG_LOAD_TIMEOUT;

/** @const {string} */
Hls.ErrorDetails.FRAG_DECRYPT_ERROR;

/** @const {string} */
Hls.ErrorDetails.FRAG_PARSING_ERROR;

/** @const {string} */
Hls.ErrorDetails.REMUX_ALLOC_ERROR;

/** @const {string} */
Hls.ErrorDetails.KEY_LOAD_ERROR;

/** @const {string} */
Hls.ErrorDetails.KEY_LOAD_TIMEOUT;

/** @const {string} */
Hls.ErrorDetails.BUFFER_ADD_CODEC_ERROR;

/** @const {string} */
Hls.ErrorDetails.BUFFER_APPEND_ERROR;

/** @const {string} */
Hls.ErrorDetails.BUFFER_APPENDING_ERROR;

/** @const {string} */
Hls.ErrorDetails.BUFFER_STALLED_ERROR;

/** @const {string} */
Hls.ErrorDetails.BUFFER_FULL_ERROR;

/** @const {string} */
Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE;

/** @const {string} */
Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL;

/** @const {string} */
Hls.ErrorDetails.INTERNAL_EXCEPTION;

/** @const {string} */
Hls.ErrorDetails.WEBVTT_EXCEPTION;

/**
 * @constructor
 * @return {!LevelKey}
 */
function LevelKey() {};

