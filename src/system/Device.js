/**
 * Manage Devices inside FORGE.<br>
 * Device is singleton, so if you have multiple instances in the same page you MUST avoid UID conflict.
 * @constructor
 * @extends {FORGE.BaseObject}
 */
FORGE.Device = (function(c)
 {
    var Tmp = c();
    Tmp.prototype = Object.create(FORGE.BaseObject.prototype);
    Tmp.prototype.constructor = Tmp;

    /**
     * Check which OS is running.
     * @method FORGE.Device#_checkOS
     * @suppress {checkRegExp}
     * @private
     */
    Tmp.prototype._checkOS = function()
    {
        if (/Playstation Vita/.test(this._ua))
        {
            this._os = "playstationvita";
            this._vita = true;
        }
        else if (/Xbox/.test(this._ua))
        {
            this._os = "xbox";
            this._xbox = true;
        }
        else if (/Kindle/.test(this._ua) || /\bKF[A-Z][A-Z]+/.test(this._ua) || /Silk.*Mobile Safari/.test(this._ua))
        {
            this._os = "kindle";
            this._kindle = true;
        }
        else if ((/Windows Phone/i).test(this._ua) || (/IEMobile/i).test(this._ua))
        {
            this._os = "windowsphone";
            this._windowsPhone = true;
            if (/Windows Phone (\d+)/.test(this._ua))
            {
                this._osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/Android/.test(this._ua))
        {
            this._os = "android";
            this._android = true;
            if (/Android ([\.\_\d]+)/.test(this._ua))
            {
                this._osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/CrOS/.test(this._ua))
        {
            this._os = "chromeos";
            this._chromeOS = true;
        }
        else if (/iP[ao]d|iPhone/i.test(this._ua))
        {
            this._os = "ios";
            this._iOS = true;
            if (/OS (\d+)/.test(navigator.appVersion))
            {
                this._osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/(Linux|X11)/.test(this._ua))
        {
            this._os = "linux";
            this._linux = true;
        }
        else if (/Mac OS X/.test(this._ua))
        {
            this._os = "macosx";
            this._macOS = true;
            if (/Mac OS X (10[\.\_\d]+)/.test(this._ua))
            {
                this._osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/Windows/.test(this._ua) || (/WPDesktop/i).test(this._ua))
        {
            if ((/WPDesktop/i).test(this._ua))
            {
                this._os = "windowsphone";
                this._windowsPhone = true;
            }
            else
            {
                this._os = "windows";
                this._windows = true;
            }
            if (/(Windows 10.0|Windows NT 10.0)/.test(this._ua))
            {
                this._osVersion = 10;
            }
            else if (/(Windows 8.1|Windows NT 6.3)/.test(this._ua) || /(Windows 8|Windows NT 6.2)/.test(this._ua))
            {
                this._osVersion = 8;
            }
            else if (/(Windows 7|Windows NT 6.1)/.test(this._ua))
            {
                this._osVersion = 7;
            }
        }
    };

    /**
     * Check which browser is running.
     * @method FORGE.Device#_checkBrowsers
     * @suppress {checkRegExp}
     * @private
     */
    Tmp.prototype._checkBrowsers = function()
    {
        this._ie = /** @type {boolean} */ (/*@cc_on!@*/ false || typeof document["documentMode"] !== "undefined");
        this._edge = this._ie === false && Boolean(window["StyleMedia"]) === true;
        this._firefox = typeof window["InstallTrigger"] !== "undefined";
        this._opera = Boolean(window["opr"]) === true || this._ua.indexOf(" OPR/") >= 0 || this._ua.indexOf("Opera") >= 0;
        this._safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this._chrome = this._ie === false && this._edge === false && this._opera === false && (Boolean(window["chrome"]) === true || this._ua.indexOf("CriOS") >= 0);

        if (this._edge)
        {
            this._browser = "edge";
            if (/Edge\/(\d+)/.test(this._ua))
            {
                this._browserVersion = this._edgeVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this._chrome)
        {
            this._browser = "chrome";
            if (/CriOS\/(\d+)/.test(this._ua))
            {
                this._browserVersion = this._chromeVersion = parseInt(RegExp.$1, 10);
            }
            else if (/Chrome\/(\d+)/.test(this._ua))
            {
                this._browserVersion = this._chromeVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this._firefox)
        {
            this._browser = "firefox";
            if (/Firefox\D+(\d+)/.test(this._ua))
            {
                this._browserVersion = this._firefoxVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this._kindle)
        {
            // Silk gets its own if clause because its ua also contains 'Safari'
            if (/Silk/.test(this._ua))
            {
                this._browser = "silk";
                this._silk = true;
            }
        }
        else if (this._ie)
        {
            this._browser = "internetexplorer";
            if (/MSIE (\d+\.\d+);/.test(this._ua))
            {
                this._browserVersion = this._ieVersion = parseInt(RegExp.$1, 10);
            }
            else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(this._ua))
            {
                this._browserVersion = this._ieVersion = parseInt(RegExp.$3, 10);
            }
        }
        else if (this._opera)
        {
            this._browser = "opera";
            if (/OPR\/(\d+)/.test(this._ua))
            {
                this._browserVersion = this._operaVersion = parseInt(RegExp.$1, 10);
            }
            else if (this._ua.indexOf("Opera/") >= 0)
            {
                if (/Version\/(\d+)/.test(this._ua))
                {
                    this._browserVersion = this._operaVersion = parseInt(RegExp.$1, 10);
                }
            }
            else if (/Opera (\d+)/.test(this._ua))
            {
                this._browserVersion = this._operaVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this._safari)
        {
            this._browser = "safari";
            if ((/version\/(\d+(\.\d+)?)/i).test(this._ua))
            {
                this._browserVersion = this._safariVersion = parseInt(RegExp.$1, 10);
            }
        }
        else
        {
            var matches = this._ua.match(/Android.*AppleWebKit\/([\d.]+)/);
            if (matches && matches[1] < 537)
            {
                this._browser = "androidstock";
                this._isAndroidStockBrowser = true;
                this._browserVersion = this._androidStockBrowserVersion = parseFloat(this._ua.slice(this._ua.indexOf("Android") + 8));
            }
        }
        //  WebApp mode
        if (navigator.standalone)
        {
            this._webApp = true;
        }

        this._quirksMode = (document.compatMode === "CSS1Compat") ? false : true;
    };

    /**
     * Check the device informations.
     * @method FORGE.Device#_checkDevice
     * @private
     */
    Tmp.prototype._checkDevice = function()
    {
        this._pixelRatio = window.devicePixelRatio || 1;

        this._iPhone = this._iOS === true && this._ua.toLowerCase().indexOf("iphone") !== -1;
        this._iPod = this._iOS === true && this._ua.toLowerCase().indexOf("ipod") !== -1;
        this._iPad = this._iOS === true && this._ua.toLowerCase().indexOf("ipad") !== -1;
        this._retina = this._pixelRatio >= 2 && this._iOS === true;

        if ((this._windows && !this._windowsPhone) || this._macOS || (this._linux && !this._silk) || this._chromeOS)
        {
            this._desktop = true;
        }
        else if (/Mobi/i.test(this._ua) && this._iPad === false)
        {
            this._mobile = true;
        }
        else
        {
            this._tablet = true;
        }

        //smart TV, Playstation, Table Windows
        if (/TV/i.test(this._ua) || this._vita === true || this._xbox === true || (this._desktop && /Windows NT/i.test(this._ua) && /Touch/i.test(this._ua)))
        {
            this._other = true;
            this._mobile = false;
            this._tablet = false;
            this._desktop = false;
        }
    };

    /**
     * Check video support.
     * @method FORGE.Device#_checkVideo
     * @private
     */
    Tmp.prototype._checkVideo = function()
    {
        var videoElement = document.createElement("video");

        try
        {
            if (typeof videoElement.canPlayType === "function")
            {
                if (videoElement.canPlayType("video/ogg; codecs=\"theora\"").replace(/^no$/, ""))
                {
                    this._oggVideo = true;
                }

                if (videoElement.canPlayType("video/mp4; codecs=\"avc1.42E01E\"").replace(/^no$/, ""))
                {
                    // without QuickTime, this value will be "undefined"
                    this._h264Video = true;
                    this._mp4Video = true;
                }

                if (videoElement.canPlayType("video/webm; codecs=\"vp8, vorbis\"").replace(/^no$/, ""))
                {
                    this._webmVideo = true;
                }

                if (videoElement.canPlayType("video/webm; codecs=\"vp9\"").replace(/^no$/, ""))
                {
                    this._vp9Video = true;
                }

                if (videoElement.canPlayType("application/x-mpegURL; codecs=\"avc1.42E01E\"").replace(/^no$/, ""))
                {
                    this._hlsVideo = true;
                }
            }
        }
        catch (e)
        {}
    };

    /**
     * Check audio support.
     * @method FORGE.Device#_checkAudio
     * @private
     */
    Tmp.prototype._checkAudio = function()
    {
        this._audioTag = (typeof window.Audio !== "undefined");
        this._webAudio = (typeof window.AudioContext !== "undefined" || typeof window.webkitAudioContext !== "undefined");

        var audioElement = document.createElement("audio");

        try
        {
            if (typeof audioElement.canPlayType === "function")
            {
                if (audioElement.canPlayType("audio/ogg; codecs=\"vorbis\"").replace(/^no$/, ""))
                {
                    this._ogg = true;
                }

                if (audioElement.canPlayType("audio/mpeg;").replace(/^no$/, ""))
                {
                    this._mp3 = true;
                }

                if (audioElement.canPlayType("audio/ogg; codecs=\"opus\"").replace(/^no$/, "") || audioElement.canPlayType("audio/opus;").replace(/^no$/, ""))
                {
                    this._opus = true;
                }

                if (audioElement.canPlayType("audio/wav; codecs=\"1\"").replace(/^no$/, ""))
                {
                    this._wav = true;
                }

                if (audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this._aac = true;
                }

                if (audioElement.canPlayType("audio/x-m4a;") || audioElement.canPlayType("audio/m4a;") || audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this._m4a = true;
                }

                if (audioElement.canPlayType("audio/x-mp4;") || audioElement.canPlayType("audio/mp4;") || audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this._mp4 = true;
                }

                if (audioElement.canPlayType("audio/webm; codecs=\"vorbis\"").replace(/^no$/, ""))
                {
                    this._webm = true;
                    this._weba = true;
                }

            }
        }
        catch (e)
        {}
    };

    /**
     * Check the device features.
     * @method FORGE.Device#_checkDeviceFeatures
     * @private
     */
    Tmp.prototype._checkDeviceFeatures = function()
    {
        this._vibrate = (typeof navigator.vibrate !== "undefined" || typeof navigator.webkitVibrate !== "undefined" || typeof navigator.mozVibrate !== "undefined" || typeof navigator.msVibrate !== "undefined");

        this._battery = (typeof navigator.getBattery === "function");
    };

    /**
     * Check HTML5 features.
     * @method FORGE.Device#_checkFeatures
     * @private
     */
    Tmp.prototype._checkFeatures = function()
    {
        this._canvas = (typeof window.CanvasRenderingContext2D !== "undefined");
        if (this._canvas === true)
        {
            this._canvasText = (typeof document.createElement("canvas").getContext("2d").fillText === "function");
            var canvasCtx = document.createElement("canvas").getContext("2d");
            canvasCtx.rect(0, 0, 10, 10);
            canvasCtx.rect(2, 2, 6, 6);
            this._canvasWinding = (canvasCtx.isPointInPath(5, 5, "evenodd") === false);
        }

        try
        {
            this._localStorage = (typeof window.localStorage === "object" && typeof window.localStorage.getItem === "function");
        }
        catch (error)
        {
            this._localStorage = false;
        }

        this._mediaSource = (typeof window.MediaSource === "function");

        this._encryptedMedia = (typeof window.HTMLMediaElement === "function" && typeof window.MediaKeys === "function" && typeof window.MediaKeySystemAccess === "function" && typeof navigator.requestMediaKeySystemAccess === "function");

        this._applicationCache = (typeof window.applicationCache === "object");

        this._addEventListener = (typeof window.addEventListener === "function");

        this.__raf = (typeof window.requestAnimationFrame === "function" || typeof window.webkitRequestAnimationFrame === "function" || typeof window.mozRequestAnimationFrame === "function");

        try
        {
            var canvas = document.createElement("canvas");
            /* Force screencanvas to false */
            canvas.screencanvas = false;
            this._webGL = (typeof canvas.getContext === "function" && typeof window.WebGLRenderingContext !== "undefined" && Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
        }
        catch (e)
        {
            this._webGL = false;
        }

        if (typeof navigator.getVRDisplays === "function")
        {
            this._webVR = true;
        }
        else
        {
            this._webVR = false;
        }

        this._JSON = (typeof window.JSON === "object" && typeof window.JSON.parse === "function" && typeof window.JSON.stringify === "function");

        this._geolocation = (typeof navigator.geolocation === "object");

        this._history = (typeof window.history === "object" && typeof window.history.pushState === "function");

        this._svg = (typeof document.createElementNS === "function" && typeof document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect === "function");

        this._contextMenu = (typeof document.documentElement.contextMenu !== "undefined" && typeof window.HTMLMenuItemElement === "function");
    };

    /**
     * Check the URL environment.
     * @method FORGE.Device#_checkEnvironment
     * @private
     */
    Tmp.prototype._checkEnvironment = function()
    {
        this._isSecure = /^https/i.test(window.location.protocol);

        try
        {
            this._isIframe = (window.self !== window.top);
        }
        catch (e)
        {
            this._isIframe = true;
        }
    };

    /**
     * Check the various inputs.
     * @method FORGE.Device#_checkInput
     * @private
     */
    Tmp.prototype._checkInput = function()
    {
        this._touch = (typeof window.ontouchstart !== "undefined" || typeof window.DocumentTouch !== "undefined" && document instanceof window.DocumentTouch || (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0) || (typeof navigator.msMaxTouchPoints === "number" && navigator.msMaxTouchPoints > 0));

        // Test for Safari iOS touch force feature
        if (typeof window.onmouseforcewillbegin !== "undefined" || typeof window.onwebkitmouseforcewillbegin !== "undefined")
        {
            // Test if the browser provides thresholds defining a "force touch" from a normal touch/click event
            this._touchForce = Boolean(MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN && MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN);
        }

        this._gamepad = (typeof navigator.getGamepads === "function" || typeof navigator.webkitGetGamepads === "function");
    };

    /**
     * Check the support of the full screen API.
     * @method FORGE.Device#_checkFullscreenSupport
     * @private
     */
    Tmp.prototype._checkFullscreenSupport = function()
    {
        var requestFullscreen =
            [
                "requestFullscreen",
                "requestFullScreen",
                "webkitRequestFullscreen",
                "webkitRequestFullScreen",
                "mozRequestFullScreen",
                "mozRequestFullscreen",
                "msRequestFullscreen",
                "msRequestFullScreen"
            ];
        var exitFullscreen =
            [
                "cancelFullscreen",
                "cancelFullScreen",
                "exitFullscreen",
                "exitFullScreen",
                "webkitCancelFullscreen",
                "webkitCancelFullScreen",
                "webkitExitFullscreen",
                "webkitExitFullScreen",
                "mozCancelFullscreen",
                "mozCancelFullScreen",
                "mozExitFullscreen",
                "mozExitFullScreen",
                "msCancelFullscreen",
                "msCancelFullScreen",
                "msExitFullscreen",
                "msExitFullScreen"
            ];

        var element = document.createElement("div");

        for (var i = 0, ii = requestFullscreen.length; i < ii; i++)
        {
            if (element[requestFullscreen[i]])
            {
                this._requestFullscreen = requestFullscreen[i];
                break;
            }
        }
        for (var j = 0, jj = exitFullscreen.length; j < jj; j++)
        {
            if (document[exitFullscreen[j]])
            {
                this._exitFullscreen = exitFullscreen[j];
                break;
            }
        }

        // Keyboard Input on full screen mode?
        if (typeof window.Element === "function" && Element.ALLOW_KEYBOARD_INPUT)
        {
            this._fullscreenKeyboard = true;
        }

        var fullscreenElement =
            [
                "fullscreenElement",
                "mozFullScreenElement",
                "webkitFullscreenElement",
                "msFullscreenElement"
            ];

        for (var k = 0, kk = fullscreenElement.length; k < kk; k++)
        {
            if (typeof document[fullscreenElement[k]] !== "undefined")
            {
                this._fullscreenElement = fullscreenElement[k];
                break;
            }
        }

        var fullscreenEnabled =
            [
                "fullscreenEnabled",
                "mozFullScreenEnabled",
                "webkitFullscreenEnabled",
                "msFullscreenEnabled"
            ];

        for (var l = 0, ll = fullscreenEnabled.length; l < ll; l++)
        {
            if (typeof document[fullscreenEnabled[l]] !== "undefined")
            {
                this._fullscreenEnabled = fullscreenEnabled[l];
                break;
            }
        }
    };

    /**
     * Check browser APIs.
     * @method FORGE.Device#_checkBrowserApi
     * @private
     */
    Tmp.prototype._checkBrowserApi = function()
    {
        //Page Visibility API
        this._visibilityState = "visibilityState" in document ? "visibilityState" :
            "webkitVisibilityState" in document ? "webkitVisibilityState" :
            "mozVisibilityState" in document ? "mozVisibilityState" :
            null;

        this._visibilityChange = this._visibilityState.slice(0, -5) + "change";

        //Screen orientation API
        var orientation =
            [
                "orientation",
                "mozOrientation",
                "msOrientation"
            ];
        for (var i = 0, ii = orientation.length; i < ii; i++)
        {
            if (typeof screen[orientation[i]] === "string")
            {
                this._orientation = orientation[i];
                break;
            }
        }

        this._screenOrientation = (typeof screen.orientation === "object" && typeof screen.orientation.type === "string" && typeof screen.orientation.lock === "function");

        var lockOrientation =
            [
                "lockOrientation",
                "mozLockOrientation",
                "msLockOrientation"
            ];
        var unlockOrientation =
            [
                "unlockOrientation",
                "mozUnlockOrientation",
                "msUnlockOrientation"
            ];
        for (var j = 0, jj = lockOrientation.length; j < jj; j++)
        {
            if (typeof screen[lockOrientation[j]] === "function")
            {
                this._lockOrientation = lockOrientation[j];
                this._unlockOrientation = unlockOrientation[j];
                break;
            }
        }

        //File API
        this._file = (typeof window.File !== "undefined" && typeof window.FileReader !== "undefined" && typeof window.FileList !== "undefined" && typeof window.Blob !== "undefined");
        this._fileSystem = (typeof window.requestFileSystem !== "undefined" || typeof window.webkitRequestFileSystem !== "undefined");

        //Pointer Lock API
        this._pointerLock = (typeof document.pointerLockElement !== "undefined" || typeof document.mozPointerLockElement !== "undefined" || typeof document.webkitPointerLockElement !== "undefined");
    };

    /**
     * Check CSS rules.
     * @method FORGE.Device#_checkCss
     * @private
     */
    Tmp.prototype._checkCss = function()
    {
        // pointer events
        var cssStyle = document.createElement("a").style;
        cssStyle.cssText = "pointer-events:auto";
        this._cssPointerEvents = (cssStyle.pointerEvents === "auto");

        // rgba
        cssStyle.cssText = "background-color:rgba(150,255,150,.5)";
        this._cssRgba = (("" + cssStyle.backgroundColor).indexOf("rgba") > -1);

        this._cssAnimation = (typeof cssStyle.animationName !== "undefined" || typeof cssStyle.webkitAnimationName !== "undefined" || typeof cssStyle.mozAnimationName !== "undefined" || typeof cssStyle.msAnimationName !== "undefined");

        // css transform and css3D check
        var el = document.createElement("p");
        var has3d;
        var transforms = {
            "webkitTransform": "-webkit-transform",
            "OTransform": "-o-transform",
            "msTransform": "-ms-transform",
            "MozTransform": "-moz-transform",
            "transform": "transform"
        };

        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);
        for (var t in transforms)
        {
            if (typeof el.style[t] !== "undefined")
            {
                el.style[t] = "translate3d(1px,1px,1px)";
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }
        document.body.removeChild(el);
        this._css3D = (typeof has3d !== "undefined" && has3d.length > 0 && has3d !== "none");
    };

    /**
     * Internal handler for Device Motion.
     * @method FORGE.Device#_deviceMotionHandler
     * @param {Event} event DeviceMotionEvent
     * @private
     */
    Tmp.prototype._deviceMotionHandler = function(event)
    {

        if (event.rotationRate !== null && typeof event.rotationRate.alpha !== "undefined" && typeof event.rotationRate.beta !== "undefined" && typeof event.rotationRate.gamma !== "undefined")
        {
            this._deviceMotionRotationRate = true;
        }
        if (typeof event.acceleration !== "undefined" && typeof event.acceleration.x !== "undefined" && typeof event.acceleration.y !== "undefined" && typeof event.acceleration.z !== "undefined")
        {
            this._deviceMotionAcceleration = true;
        }

        this._removeDeviceMotionHandler();

        if (typeof this._deviceOrientationBind !== "function")
        {
            this._checkComplete();
        }
    };

    /**
     * Internal handler for Device Orientation.
     * @method FORGE.Device#_deviceOrientationHandler
     * @param {Event} event DeviceOrientationEvent
     * @private
     */
    Tmp.prototype._deviceOrientationHandler = function(event)
    {
        if (typeof event.alpha !== "undefined" && event.alpha !== null
            && typeof event.beta !== "undefined" && event.beta !== null
            && typeof event.gamma !== "undefined" && event.gamma !== null)
        {
            this._deviceOrientationMagnetometer = true;
        }

        this._removeDeviceOrientationHandler();

        if (typeof this._deviceMotionBind !== "function")
        {
            this._checkComplete();
        }
    };

    /**
     * Remove the device motion handler.
     * @method FORGE.Device#_removeDeviceMotionHandler
     * @private
     */
    Tmp.prototype._removeDeviceMotionHandler = function()
    {
        window.removeEventListener("devicemotion", this._deviceMotionBind, false);
        this._deviceMotionBind = null;
    };

    /**
     * Remove the device orientation handler.
     * @method FORGE.Device#_removeDeviceOrientationHandler
     * @private
     */
    Tmp.prototype._removeDeviceOrientationHandler = function()
    {
        window.removeEventListener("deviceorientation", this._deviceOrientationBind, false);
        this._deviceOrientationBind = null;
    };

    /**
     * Check the gyroscope support.
     * @method FORGE.Device#_checkGyroscope
     * @private
     */
    Tmp.prototype._checkGyroscope = function()
    {
        this._deviceMotion = (typeof window.DeviceMotionEvent !== "undefined");
        this._deviceOrientation = (typeof window.DeviceOrientationEvent !== "undefined");

        window.addEventListener("deviceorientation", this._deviceOrientationBind, false);
        window.addEventListener("devicemotion", this._deviceMotionBind, false);
    };

    /**
     * Check the screen properties
     * @method FORGE.Device#_checkScreen
     * @private
     */
    Tmp.prototype._checkScreen = function()
    {
        var div = document.createElement("div");
        div.style.width = "1in";
        div.style.height = "1in";
        document.body.appendChild(div);

        this._dpi = div.offsetWidth;

        document.body.removeChild(div);
        div = null;

        if (this._mobile)
        {
            this._screenWidth = Math.floor(Math.min(window.screen.width, window.screen.height) * this._pixelRatio);
            this._screenHeight = Math.floor(Math.max(window.screen.width, window.screen.height) * this._pixelRatio);
        }
        else
        {
            this._screenWidth = Math.floor(Math.max(window.screen.width, window.screen.height) * this._pixelRatio);
            this._screenHeight = Math.floor(Math.min(window.screen.width, window.screen.height) * this._pixelRatio);
        }
    };

    /**
     * Run the checks.
     * @method FORGE.Device#_check
     * @private
     */
    Tmp.prototype._check = function()
    {
        this._ua = navigator["userAgent"];

        this._language = ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || "");

        this._checkOS();
        this._checkBrowsers();
        this._checkDevice();
        this._checkAudio();
        this._checkVideo();
        this._checkDeviceFeatures();
        this._checkFeatures();
        this._checkEnvironment();
        this._checkBrowserApi();
        this._checkFullscreenSupport();
        this._checkInput();
        this._checkCss();

        // bind device motion and device orientation events
        this._deviceMotionBind = this._deviceMotionHandler.bind(this);
        this._deviceOrientationBind = this._deviceOrientationHandler.bind(this);
        this._checkGyroscope();
        this._checkScreen();

        // _checkComplete is initially called by either _deviceMotionHandler or
        // _deviceOrientationHandler, but if both _deviceMotion and _deviceOrientation are set to
        // false, we need to force the call of _checkComplete
        if (this._deviceMotion === false && this._deviceOrientation === false)
        {
            this._checkComplete();
        }
    };

    /**
     * Finalize and set as singleton the Device object.
     * @method FORGE.Device#_checkComplete
     * @private
     */
    Tmp.prototype._checkComplete = function()
    {
        if (typeof this._deviceMotionBind === "function")
        {
            this._removeDeviceMotionHandler();
        }
        if (typeof this._deviceOrientationBind === "function")
        {
            this._removeDeviceOrientationHandler();
        }

        this._gyroscope = (this._deviceMotionRotationRate === true
                            && this._deviceMotionAcceleration === true
                            && this._deviceOrientationMagnetometer === true);

        this._ready = true;

        this._onReady.dispatch();

        Object.freeze(FORGE.Device);
    };

    /**
     * Check if the device can play audio.
     * @method FORGE.Device#canPlayAudio
     * @param {string} type - One of 'mp3, 'ogg', 'm4a', 'wav', 'webm'.
     * @return {boolean}
     */
    Tmp.prototype.canPlayAudio = function(type)
    {
        if (type === "mp3" && this._mp3 === true)
        {
            return true;
        }
        else if (type === "ogg" && (this._ogg === true || this._opus === true))
        {
            return true;
        }
        else if (type === "m4a" && this._m4a === true)
        {
            return true;
        }
        else if (type === "mp4" && this._mp4 === true)
        {
            return true;
        }
        else if (type === "opus" && this._opus === true)
        {
            return true;
        }
        else if (type === "wav" && this._wav === true)
        {
            return true;
        }
        else if (type === "aac" && this._aac === true)
        {
            return true;
        }
        else if (type === "webm" && this._webm === true)
        {
            return true;
        }
        else if (type === "weba" && this._weba === true)
        {
            return true;
        }

        return false;
    };

    /**
     * Check If the device can play video files.
     * @method FORGE.Device#canPlayVideo
     * @param {string} type - One of 'mp4, 'ogg', 'webm' or 'mpeg'.
     * @return {boolean}
     */
    Tmp.prototype.canPlayVideo = function(type)
    {
        if (type === "webm" && (this._webmVideo === true || this._vp9Video === true))
        {
            return true;
        }
        else if (type === "mp4" && (this._mp4Video === true || this._h264Video === true))
        {
            return true;
        }
        else if ((type === "ogg" || type === "ogv") && this._oggVideo === true)
        {
            return true;
        }
        else if (type === "mpeg" && this._hlsVideo === true)
        {
            return true;
        }

        return false;
    };

    /**
     * Check If the battery is low.<br>
     * Note "low" is defined as less than 20%.
     * @method FORGE.Device#isLowBattery
     * @return {Promise<boolean>}
     */
    Tmp.prototype.isLowBattery = function()
    {
        var minLevel = 0.20;

        return navigator.getBattery()
            .then(function(battery)
            {
                return this._battery && !battery.charging && battery.level <= minLevel;
            }.bind(this), function()
            {
                return false;
            });
    };

    /**
     * Check device requirement for an object from configuration/manifest.
     * @method FORGE.Device#check
     * @param  {Object} config - The device requirement configuration of the configuration/manifest.
     * @return {boolean} Returns true if the object is compatible with the device environment, false if not.
     */
    Tmp.prototype.check = function(config)
    {
        //If configuration is undefined, the object has no device limitations
        if(typeof config === "undefined")
        {
            return true;
        }

        for(var i in config)
        {
            if (typeof i === "string")
            {
                i.toLowerCase();
            }

            if(typeof this[i] === "undefined")
            {
                console.warn("Unable to check plugin device compatibility for: "+i);
            }
            else if(this[i] !== config[i])
            {
                return false;
            }
        }

        return true;
    };

    /**
     * Is device detection done?
     * @name FORGE.Device#ready
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "ready",
    {
        get: function()
        {
            return this._ready;
        }
    });

    /**
     * The user agent string.
     * @name FORGE.Device#ua
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "ua",
    {
        get: function()
        {
            return this._ua;
        }
    });

    /**
     * The browser language.
     * @name FORGE.Device#language
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "language",
    {
        get: function()
        {
            return this._language;
        }
    });

    //OS

    /**
     * The OS name
     * @name FORGE.Device#os
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "os",
    {
        get: function()
        {
            return this._os;
        }
    });

    /**
     * The OS major version number.
     * @name FORGE.Device#osVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "osVersion",
    {
        get: function()
        {
            return this._osVersion;
        }
    });

    /**
     * Is running on PS Vita?
     * @name FORGE.Device#vita
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "vita",
    {
        get: function()
        {
            return this._vita;
        }
    });

    /**
     * Is running on XBox?
     * @name FORGE.Device#xbox
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "xbox",
    {
        get: function()
        {
            return this._xbox;
        }
    });

    /**
     * Is running on Kindle?
     * @name FORGE.Device#kindle
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "kindle",
    {
        get: function()
        {
            return this._kindle;
        }
    });

    /**
     * Is running on android?
     * @name FORGE.Device#android
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "android",
    {
        get: function()
        {
            return this._android;
        }
    });

    /**
     * Is running on chromeOS?
     * @name FORGE.Device#chromeOS
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "chromeOS",
    {
        get: function()
        {
            return this._chromeOS;
        }
    });

    /**
     * Is running on iOS?
     * @name FORGE.Device#iOS
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "iOS",
    {
        get: function()
        {
            return this._iOS;
        }
    });

    /**
     * Is running on Linux?
     * @name FORGE.Device#linux
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "linux",
    {
        get: function()
        {
            return this._linux;
        }
    });

    /**
     * Is running on MacOS?
     * @name FORGE.Device#macOS
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "macOS",
    {
        get: function()
        {
            return this._macOS;
        }
    });

    /**
     * Is running on Windows?
     * @name FORGE.Device#windows
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "windows",
    {
        get: function()
        {
            return this._windows;
        }
    });

    /**
     * Is running on Windows Phone?
     * @name FORGE.Device#windowsPhone
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "windowsPhone",
    {
        get: function()
        {
            return this._windowsPhone;
        }
    });

    // Browsers

    /**
     * Is running in Firefox?
     * @name FORGE.Device#firefox
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "firefox",
    {
        get: function()
        {
            return this._firefox;
        }
    });

    /**
     * Firefox major version number.
     * @name FORGE.Device#firefoxVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "firefoxVersion",
    {
        get: function()
        {
            return this._firefoxVersion;
        }
    });

    /**
     * Is running in Chrome?
     * @name FORGE.Device#chrome
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "chrome",
    {
        get: function()
        {
            return this._chrome;
        }
    });

    /**
     * Chrome major version number.
     * @name FORGE.Device#chromeVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "chromeVersion",
    {
        get: function()
        {
            return this._chromeVersion;
        }
    });

    /**
     * Is running in Internet Explorer?
     * @name FORGE.Device#ie
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "ie",
    {
        get: function()
        {
            return this._ie;
        }
    });

    /**
     * Internet Explorer major version number.
     * @name FORGE.Device#ieVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "ieVersion",
    {
        get: function()
        {
            return this._ieVersion;
        }
    });

    /**
     * Is running in Opera?
     * @name FORGE.Device#opera
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "opera",
    {
        get: function()
        {
            return this._opera;
        }
    });

    /**
     * Opera major version number.
     * @name FORGE.Device#operaVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "operaVersion",
    {
        get: function()
        {
            return this._operaVersion;
        }
    });

    /**
     * Is running in Edge?
     * @name FORGE.Device#edge
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "edge",
    {
        get: function()
        {
            return this._edge;
        }
    });

    /**
     * Edge major version number.
     * @name FORGE.Device#edgeVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "edgeVersion",
    {
        get: function()
        {
            return this._edgeVersion;
        }
    });

    /**
     * Is running in Safari?
     * @name FORGE.Device#safari
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "safari",
    {
        get: function()
        {
            return this._safari;
        }
    });

    /**
     * Safari (or Mobile Safari) major version number.
     * @name FORGE.Device#safariVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "safariVersion",
    {
        get: function()
        {
            return this._safariVersion;
        }
    });

    /**
     * Is running in Silk (Kindle)?
     * @name FORGE.Device#silk
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "silk",
    {
        get: function()
        {
            return this._silk;
        }
    });

    /**
     * The nick name of the browser.
     * @name FORGE.Device#browser
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "browser",
    {
        get: function()
        {
            return this._browser;
        }
    });

    /**
     * The browser major version.
     * @name FORGE.Device#browserVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "browserVersion",
    {
        get: function()
        {
            return this._browserVersion;
        }
    });

    /**
     * Is running in a standalone app?
     * @name FORGE.Device#webApp
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webApp",
    {
        get: function()
        {
            return this._webApp;
        }
    });

    /**
     * Detect if it's an Android Stock browser.
     * @name FORGE.Device#isAndroidStockBrowser
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "isAndroidStockBrowser",
    {
        get: function()
        {
            return this._isAndroidStockBrowser;
        }
    });

    /**
     * The Android version linked to the stock browser.
     * @name FORGE.Device#androidStockBrowserVersion
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "androidStockBrowserVersion",
    {
        get: function()
        {
            return this._androidStockBrowserVersion;
        }
    });

    /**
     * Is the browser running in strict mode or quirks mode?
     * @name FORGE.Device#quirksMode
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "quirksMode",
    {
        get: function()
        {
            return this._quirksMode;
        }
    });

    // Capabilities

    /**
     * Does the browser support full screen API?
     * @name FORGE.Device#fullscreenEnabled
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "fullscreenEnabled",
    {
        get: function()
        {
            return this._fullscreenEnabled;
        }
    });

    /**
     * Request full screen method name.
     * @name FORGE.Device#requestFullscreen
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "requestFullscreen",
    {
        get: function()
        {
            return this._requestFullscreen;
        }
    });

    /**
     * Exit full screen method name.
     * @name FORGE.Device#exitFullscreen
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "exitFullscreen",
    {
        get: function()
        {
            return this._exitFullscreen;
        }
    });

    /**
     * fullscreenElement accessor name.
     * @name  FORGE.Device#fullscreenElement
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "fullscreenElement",
    {
        get: function()
        {
            return this._fullscreenElement;
        }
    });

    /**
     * Does the browser support keyboard during full screen mode?
     * @name FORGE.Device#fullscreenKeyboard
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "fullscreenKeyboard",
    {
        get: function()
        {
            return this._fullscreenKeyboard;
        }
    });

    // Device

    /**
     * Is running on iPhone?
     * @name FORGE.Device#iPhone
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "iPhone",
    {
        get: function()
        {
            return this._iPhone;
        }
    });

    /**
     * Is running on Apple Retina display?
     * @name FORGE.Device#retina
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "retina",
    {
        get: function()
        {
            return this._retina;
        }
    });

    /**
     * Is running on iPod?
     * @name FORGE.Device#iPod
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "iPod",
    {
        get: function()
        {
            return this._iPod;
        }
    });

    /**
     * Is running on iPad?
     * @name FORGE.Device#iPad
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "iPad",
    {
        get: function()
        {
            return this._iPad;
        }
    });

    /**
     * Pixel ratio of the device.
     * @name FORGE.Device#pixelRatio
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "pixelRatio",
    {
        get: function()
        {
            return this._pixelRatio;
        }
    });

    /**
     * Does the device support the Vibration API?
     * @name FORGE.Device#vibrate
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "vibrate",
    {
        get: function()
        {
            return this._vibrate;
        }
    });

    /**
     * Is the Battery API available?
     * @name FORGE.Device#battery
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "battery",
    {
        get: function()
        {
            return this._battery;
        }
    });

    /**
     * Is running on a desktop?
     * @name FORGE.Device#desktop
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "desktop",
    {
        get: function()
        {
            return this._desktop;
        }
    });

    /**
     * Is running on a tablet?
     * @name FORGE.Device#tablet
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "tablet",
    {
        get: function()
        {
            return this._tablet;
        }
    });

    /**
     * Is running on a mobile?
     * @name FORGE.Device#mobile
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "mobile",
    {
        get: function()
        {
            return this._mobile;
        }
    });

    /**
     * Is running on a other device as smartTv...?
     * @name FORGE.Device#other
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "other",
    {
        get: function()
        {
            return this._other;
        }
    });

    // Inputs

    /**
     * Is Touch API available?
     * @name FORGE.Device#touch
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "touch",
    {
        get: function()
        {
            return this._touch;
        }
    });

    /**
     * Is Gamepad API available?
     * @name FORGE.Device#gamepad
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "gamepad",
    {
        get: function()
        {
            return this._gamepad;
        }
    });

    /**
     * Are Force Touch Events supported?
     * Force Touch events are available in OS X 10.11 and later on devices equipped with Force Touch trackpads.
     * @name FORGE.Device#touchForce
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "touchForce",
    {
        get: function()
        {
            return this._touchForce;
        }
    });

    // Audio

    /**
     * Are Audio tags available?
     * @name FORGE.Device#audioTag
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "audioTag",
    {
        get: function()
        {
            return this._audioTag;
        }
    });

    /**
     * Is the WebAudio API available?
     * @name FORGE.Device#webAudio
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webAudio",
    {
        get: function()
        {
            return this._webAudio;
        }
    });

    /**
     * Can play ogg files?
     * @name FORGE.Device#ogg
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "ogg",
    {
        get: function()
        {
            return this._ogg;
        }
    });

    /**
     * Can play mp3 files?
     * @name FORGE.Device#mp3
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "mp3",
    {
        get: function()
        {
            return this._mp3;
        }
    });

    /**
     * Can play opus files?
     * @name FORGE.Device#opus
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "opus",
    {
        get: function()
        {
            return this._opus;
        }
    });

    /**
     * Can play wav files?
     * @name FORGE.Device#wav
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "wav",
    {
        get: function()
        {
            return this._wav;
        }
    });

    /**
     * Can play m4a files?
     * @name FORGE.Device#m4a
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "m4a",
    {
        get: function()
        {
            return this._m4a;
        }
    });

    /**
     * Can play mp4 files?
     * @name FORGE.Device#mp4
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "mp4",
    {
        get: function()
        {
            return this._mp4;
        }
    });

    /**
     * Can play aac files?
     * @name FORGE.Device#aac
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "aac",
    {
        get: function()
        {
            return this._aac;
        }
    });

    /**
     * Can play webm files?
     * @name FORGE.Device#webm
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webm",
    {
        get: function()
        {
            return this._webm;
        }
    });

    /**
     * Can play weba files?
     * @name FORGE.Device#weba
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "weba",
    {
        get: function()
        {
            return this._weba;
        }
    });

    // Video

    /**
     * Can play ogg video files?
     * @name FORGE.Device#oggVideo
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "oggVideo",
    {
        get: function()
        {
            return this._oggVideo;
        }
    });

    /**
     * Can play h264 video files?
     * @name FORGE.Device#h264Video
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "h264Video",
    {
        get: function()
        {
            return this._h264Video;
        }
    });

    /**
     * Can play mp4 video files?
     * @name FORGE.Device#mp4Video
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "mp4Video",
    {
        get: function()
        {
            return this._mp4Video;
        }
    });

    /**
     * Can play webm video files?
     * @name FORGE.Device#webmVideo
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webmVideo",
    {
        get: function()
        {
            return this._webmVideo;
        }
    });

    /**
     * Can play vp9 video files?
     * @name FORGE.Device#vp9Video
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "vp9Video",
    {
        get: function()
        {
            return this._vp9Video;
        }
    });

    /**
     * Can play hls video files?
     * @name FORGE.Device#hlsVideo
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "hlsVideo",
    {
        get: function()
        {
            return this._hlsVideo;
        }
    });

    // Features

    /**
     * Is canvas available?
     * @name FORGE.Device#canvas
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "canvas",
    {
        get: function()
        {
            return this._canvas;
        }
    });

    /**
     * Are winding rules for '<canvas>' (go clockwise or counterclockwise) available?
     * @name FORGE.Device#canvasWinding
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "canvasWinding",
    {
        get: function()
        {
            return this._canvasWinding;
        }
    });

    /**
     * Is text API for canvas available?
     * @name FORGE.Device#canvasText
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "canvasText",
    {
        get: function()
        {
            return this._canvasText;
        }
    });

    /**
     * Is native support of addEventListener available?
     * @name FORGE.Device#addEventListener
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "addEventListener",
    {
        get: function()
        {
            return this._addEventListener;
        }
    });

    /**
     * Is requestAnimationFrame API supported?
     * @name FORGE.Device#raf
     * @type {boolean}
     * @private
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "raf",
    {
        get: function()
        {
            return this._raf;
        }
    });

    /**
     * Is webGL available?
     * @name FORGE.Device#webGL
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webGL",
    {
        get: function()
        {
            return this._webGL;
        }
    });

    /**
     * Is WebVR available?
     * @name FORGE.Device#webVR
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "webVR",
    {
        get: function()
        {
            return this._webVR;
        }
    });

    /**
     * Is file available?
     * @name FORGE.Device#file
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "file",
    {
        get: function()
        {
            return this._file;
        }
    });

    /**
     * Is fileSystem available?
     * @name FORGE.Device#fileSystem
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "fileSystem",
    {
        get: function()
        {
            return this._fileSystem;
        }
    });

    /**
     * Is localStorage available?
     * @name FORGE.Device#localStorage
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "localStorage",
    {
        get: function()
        {
            return this._localStorage;
        }
    });

    /**
     * Is Application Cache supported to enable web-based applications run offline?
     * @name FORGE.Device#applicationCache
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "applicationCache",
    {
        get: function()
        {
            return this._applicationCache;
        }
    });

    /**
     * Is Geolocation API available?
     * @name FORGE.Device#geolocation
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "geolocation",
    {
        get: function()
        {
            return this._geolocation;
        }
    });

    /**
     * Is pointerLock available?
     * @name FORGE.Device#pointerLock
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "pointerLock",
    {
        get: function()
        {
            return this._pointerLock;
        }
    });

    /**
     * Is context menu available?
     * @name FORGE.Device#contextMenu
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "contextMenu",
    {
        get: function()
        {
            return this._contextMenu;
        }
    });

    /**
     * Is Media Source Extensions API available?
     * @name  FORGE.Device#mediaSource
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "mediaSource",
    {
        get: function()
        {
            return this._mediaSource;
        }
    });

    /**
     * Is Encrypted Media Extensions API available?
     * @name  FORGE.Device#encryptedMedia
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "encryptedMedia",
    {
        get: function()
        {
            return this._encryptedMedia;
        }
    });

    /**
     * Is JSON native support available?
     * @name FORGE.Device#JSON
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "JSON",
    {
        get: function()
        {
            return this._JSON;
        }
    });

    /**
     * Is History API available?
     * @name FORGE.Device#history
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "history",
    {
        get: function()
        {
            return this._history;
        }
    });

    /**
     * Is SVG in '<embed>' or '<object>' supported?
     * @name FORGE.Device#svg
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "svg",
    {
        get: function()
        {
            return this._svg;
        }
    });

    /**
     * Is the current page in secure mode?
     * @name FORGE.Device#isSecure
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "isSecure",
    {
        get: function()
        {
            return this._isSecure;
        }
    });

    /**
     * Is the current page is into an Iframe ?
     * @name FORGE.Device#isIframe
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "isIframe",
    {
        get: function()
        {
            return this._isIframe;
        }
    });

    /**
     * Hidden state name for the PageVisibility API.
     * @name FORGE.Device#visibilityState
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "visibilityState",
    {
        get: function()
        {
            return this._visibilityState;
        }
    });

    /**
     * Visibility change event name for the PageVisibility API.
     * @name FORGE.Device#visibilityChange
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "visibilityChange",
    {
        get: function()
        {
            return this._visibilityChange;
        }
    });

    // CSS

    /**
     * Is css3D available?
     * @name FORGE.Device#css3D
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "css3D",
    {
        get: function()
        {
            return this._css3D;
        }
    });

    /**
     * Is rgba (alpha) available?
     * @name FORGE.Device#cssRgba
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "cssRgba",
    {
        get: function()
        {
            return this._cssRgba;
        }
    });

    /**
     * Is pointer-events available?
     * @name FORGE.Device#cssPointerEvents
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "cssPointerEvents",
    {
        get: function()
        {
            return this._cssPointerEvents;
        }
    });

    /**
     * Are css animations (keyframes) supported?
     * @name FORGE.Device#cssAnimation
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "cssAnimation",
    {
        get: function()
        {
            return this._cssAnimation;
        }
    });

    // Gyroscope

    /**
     * Device has a real gyroscope?
     * @name FORGE.Device#gyroscope
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "gyroscope",
    {
        get: function()
        {
            return this._gyroscope;
        }
    });

    /**
     * Is Device Motion Event supported? (Accelerometer)
     * @name FORGE.Device#deviceMotion
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "deviceMotion",
    {
        get: function()
        {
            return this._deviceMotion;
        }
    });

    /**
     * Is Device Orientation Event supported? (Magnetometer)
     * @name FORGE.Device#deviceOrientation
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "deviceOrientation",
    {
        get: function()
        {
            return this._deviceOrientation;
        }
    });

    /**
     * Is Device Motion acceleration supported?
     * @name FORGE.Device#deviceMotionAcceleration
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "deviceMotionAcceleration",
    {
        get: function()
        {
            return this._deviceMotionAcceleration;
        }
    });

    /**
     * Is Device Motion rotation supported?
     * @name FORGE.Device#deviceMotionRotationRate
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "deviceMotionRotationRate",
    {
        get: function()
        {
            return this._deviceMotionRotationRate;
        }
    });

    /**
     * Is Device Orientation motion supported?
     * @name FORGE.Device#deviceOrientationMagnetometer
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "deviceOrientationMagnetometer",
    {
        get: function()
        {
            return this._deviceOrientationMagnetometer;
        }
    });

    /**
     * Pixel density of the screen.
     * @name  FORGE.Device#dpi
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "dpi",
    {
        get: function()
        {
            return this._dpi;
        }
    });

    /**
     * Device screen width in pixels.
     * @name  FORGE.Device#screenWidth
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "screenWidth",
    {
        get: function()
        {
            return this._screenWidth;
        }
    });

    /**
     * Device screen height in pixels.
     * @name  FORGE.Device#screenHeight
     * @type {number}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "screenHeight",
    {
        get: function()
        {
            return this._screenHeight;
        }
    });

    /**
     * Is screen orienation API available?
     * @name  FORGE.Device#screenOrientation
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "screenOrientation",
    {
        get: function()
        {
            return this._screenOrientation;
        }
    });

    /**
     * Screen orientation object name.
     * @name FORGE.Device#orientation
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "orientation",
    {
        get: function()
        {
            return this._orientation;
        }
    });

    /**
     * Lock screen orientation method name.
     * @name FORGE.Device#lockOrientation
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "lockOrientation",
    {
        get: function()
        {
            return this._lockOrientation;
        }
    });

    /**
     * Unlock screen orientation method name.
     * @name FORGE.Device#unlockOrientation
     * @type {string}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "unlockOrientation",
    {
        get: function()
        {
            return this._unlockOrientation;
        }
    });

    /**
     * Get the onReady EventDispatcher.
     * @name FORGE.Device#onReady
     * @type {FORGE.EventDispatcher}
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "onReady",
    {
        get: function()
        {
            return this._onReady;
        }
    });

    return new Tmp();

})(function()
{
    return function()
    {
        /**
         * Is device detection done?
         * @name FORGE.Device#_ready
         * @type {boolean}
         * @private
         */
        this._ready = false;

        /**
         * The user agent string.
         * @name FORGE.Device#_ua
         * @type {string}
         * @private
         */
        this._ua = "";

        /**
         * The browser language.
         * @name FORGE.Device#_language
         * @type {string}
         * @private
         */
        this._language = "";

        //OS

        /**
         * The OS name
         * @name FORGE.Device#_os
         * @type {string}
         * @private
         */
        this._os = "";

        /**
         * The OS major version number.
         * @name FORGE.Device#_osVersion
         * @type {number}
         * @private
         */
        this._osVersion = 0;

        /**
         * Is running on PS Vita?
         * @name FORGE.Device#_vita
         * @type {boolean}
         * @private
         */
        this._vita = false;

        /**
         * Is running on XBox?
         * @name FORGE.Device#_xbox
         * @type {boolean}
         * @private
         */
        this._xbox = false;

        /**
         * Is running on Kindle?
         * @name FORGE.Device#_kindle
         * @type {boolean}
         * @private
         */
        this._kindle = false;

        /**
         * Is running on android?
         * @name FORGE.Device#_android
         * @type {boolean}
         * @private
         */
        this._android = false;

        /**
         * Is running on chromeOS?
         * @name FORGE.Device#_chromeOS
         * @type {boolean}
         * @private
         */
        this._chromeOS = false;

        /**
         * Is running on iOS?
         * @name FORGE.Device#_iOS
         * @type {boolean}
         * @private
         */
        this._iOS = false;

        /**
         * Is running on Linux?
         * @name FORGE.Device#_linux
         * @type {boolean}
         * @private
         */
        this._linux = false;

        /**
         * Is running on MacOS?
         * @name FORGE.Device#_macOS
         * @type {boolean}
         * @private
         */
        this._macOS = false;

        /**
         * Is running on Windows?
         * @name FORGE.Device#_windows
         * @type {boolean}
         * @private
         */
        this._windows = false;

        /**
         * Is running on Windows Phone?
         * @name FORGE.Device#_windowsPhone
         * @type {boolean}
         * @private
         */
        this._windowsPhone = false;

        // Browsers

        /**
         * Is running in Firefox?
         * @name FORGE.Device#_firefox
         * @type {boolean}
         * @private
         */
        this._firefox = false;

        /**
         * Firefox major version number.
         * @name FORGE.Device#_firefoxVersion
         * @type {number}
         * @private
         */
        this._firefoxVersion = 0;

        /**
         * Is running in Chrome?
         * @name FORGE.Device#_chrome
         * @type {boolean}
         * @private
         */
        this._chrome = false;

        /**
         * Chrome major version number.
         * @name FORGE.Device#_chromeVersion
         * @type {number}
         * @private
         */
        this._chromeVersion = 0;

        /**
         * Is running in Internet Explorer?
         * @name FORGE.Device#_ie
         * @type {boolean}
         * @private
         */
        this._ie = false;

        /**
         * Internet Explorer major version number.
         * @name FORGE.Device#_ieVersion
         * @type {number}
         * @private
         */
        this._ieVersion = 0;

        /**
         * Is running in Opera?
         * @name FORGE.Device#_opera
         * @type {boolean}
         * @private
         */
        this._opera = false;

        /**
         * Opera major version number.
         * @name FORGE.Device#_operaVersion
         * @type {number}
         * @private
         */
        this._operaVersion = 0;

        /**
         * Is running in Edge?
         * @name FORGE.Device#_edge
         * @type {boolean}
         * @private
         */
        this._edge = false;

        /**
         * Edge major version number.
         * @name FORGE.Device#_edgeVersion
         * @type {number}
         * @private
         */
        this._edgeVersion = 0;

        /**
         * Is running in Safari?
         * @name FORGE.Device#_safari
         * @type {boolean}
         * @private
         */
        this._safari = false;

        /**
         * Safari (or Mobile Safari) major version number.
         * @name FORGE.Device#_safariVersion
         * @type {number}
         * @private
         */
        this._safariVersion = 0;

        /**
         * Is running in Silk (Kindle)?
         * @name FORGE.Device#_silk
         * @type {boolean}
         * @private
         */
        this._silk = false;

        /**
         * The nick name of the browser.
         * @name FORGE.Device#_browser
         * @type {string}
         * @private
         */
        this._browser = "";

        /**
         * The browser major version.
         * @name FORGE.Device#_browserVersion
         * @type {number}
         * @private
         */
        this._browserVersion = 0;

        /**
         * Is running in a standalone app?
         * @name FORGE.Device#_webApp
         * @type {boolean}
         * @private
         */
        this._webApp = false;

        /**
         * Detect if it's an Android Stock browser.
         * @name FORGE.Device#_isAndroidStockBrowser
         * @type {boolean}
         * @private
         */
        this._isAndroidStockBrowser = false;

        /**
         * The Android version linked to the stock browser.
         * @name FORGE.Device#_androidStockBrowserVersion
         * @type {number}
         * @private
         */
        this._androidStockBrowserVersion = 0;

        /**
         * Is the browser running in strict mode or quirks mode?
         * @name FORGE.Device#_quirksMode
         * @type {boolean}
         * @private
         */
        this._quirksMode = false;

        // Capabilities

        /**
         * Does the browser support full screen API?
         * @name FORGE.Device#_fullscreenEnabled
         * @type {string}
         * @private
         */
        this._fullscreenEnabled = "";

        /**
         * Request full screen method name.
         * @name FORGE.Device#_requestFullscreen
         * @type {string}
         * @private
         */
        this._requestFullscreen = "";

        /**
         * Exit full screen method name.
         * @name FORGE.Device#_exitFullscreen
         * @type {string}
         * @private
         */
        this._exitFullscreen = "";

        /**
         * fullscreenElement accessor name.
         * @name  FORGE.Device#_fullscreenElement
         * @type {string}
         * @private
         */
        this._fullscreenElement = "";

        /**
         * Does the browser support keyboard during full screen mode?
         * @name FORGE.Device#_fullscreenKeyboard
         * @type {boolean}
         * @private
         */
        this._fullscreenKeyboard = false;

        // Device

        /**
         * Is running on iPhone?
         * @name FORGE.Device#_iPhone
         * @type {boolean}
         * @private
         */
        this._iPhone = false;

        /**
         * Is running on Apple Retina display?
         * @name FORGE.Device#_retina
         * @type {boolean}
         * @private
         */
        this._retina = false;

        /**
         * Is running on iPod?
         * @name FORGE.Device#_iPod
         * @type {boolean}
         * @private
         */
        this._iPod = false;

        /**
         * Is running on iPad?
         * @name FORGE.Device#_iPad
         * @type {boolean}
         * @private
         */
        this._iPad = false;

        /**
         * Pixel ratio of the device.
         * @name FORGE.Device#_pixelRatio
         * @type {number}
         * @private
         */
        this._pixelRatio = 1;

        /**
         * Does the device support the Vibration API?
         * @name FORGE.Device#_vibrate
         * @type {boolean}
         * @private
         */
        this._vibrate = false;

        /**
         * Is the Battery API available?
         * @name FORGE.Device#_battery
         * @type {boolean}
         * @private
         */
        this._battery = false;

        /**
         * Is running on a desktop?
         * @name FORGE.Device#_desktop
         * @type {boolean}
         * @private
         */
        this._desktop = false;

        /**
         * Is running on a tablet?
         * @name FORGE.Device#_tablet
         * @type {boolean}
         * @private
         */
        this._tablet = false;

        /**
         * Is running on a mobile?
         * @name FORGE.Device#_mobile
         * @type {boolean}
         * @private
         */
        this._mobile = false;

        /**
         * Is running on a other device as smartTv...?
         * @name FORGE.Device#_other
         * @type {boolean}
         * @private
         */
        this._other = false;

        // Inputs

        /**
         * Is Touch API available?
         * @name FORGE.Device#_touch
         * @type {boolean}
         * @private
         */
        this._touch = false;

        /**
         * Is Gamepad API available?
         * @name FORGE.Device#_gamepad
         * @type {boolean}
         * @private
         */
        this._gamepad = false;

        /**
         * Are Force Touch Events supported?
         * Force Touch events are available in OS X 10.11 and later on devices equipped with Force Touch trackpads.
         * @name FORGE.Device#_touchForce
         * @type {boolean}
         * @private
         */
        this._touchForce = false;

        // Audio

        /**
         * Are Audio tags available?
         * @name FORGE.Device#_audioTag
         * @type {boolean}
         * @private
         */
        this._audioTag = false;

        /**
         * Is the WebAudio API available?
         * @name FORGE.Device#_webAudio
         * @type {boolean}
         * @private
         */
        this._webAudio = false;

        /**
         * Can play ogg files?
         * @name FORGE.Device#_ogg
         * @type {boolean}
         * @private
         */
        this._ogg = false;

        /**
         * Can play mp3 files?
         * @name FORGE.Device#_mp3
         * @type {boolean}
         * @private
         */
        this._mp3 = false;

        /**
         * Can play opus files?
         * @name FORGE.Device#_opus
         * @type {boolean}
         * @private
         */
        this._opus = false;

        /**
         * Can play wav files?
         * @name FORGE.Device#_wav
         * @type {boolean}
         * @private
         */
        this._wav = false;

        /**
         * Can play m4a files?
         * @name FORGE.Device#_m4a
         * @type {boolean}
         * @private
         */
        this._m4a = false;

        /**
         * Can play mp4 files?
         * @name FORGE.Device#_mp4
         * @type {boolean}
         * @private
         */
        this._mp4 = false;

        /**
         * Can play aac files?
         * @name FORGE.Device#_aac
         * @type {boolean}
         * @private
         */
        this._aac = false;

        /**
         * Can play webm files?
         * @name FORGE.Device#_webm
         * @type {boolean}
         * @private
         */
        this._webm = false;

        /**
         * Can play weba files?
         * @name FORGE.Device#_weba
         * @type {boolean}
         * @private
         */
        this._weba = false;

        // Video

        /**
         * Can play ogg video files?
         * @name FORGE.Device#_oggVideo
         * @type {boolean}
         * @private
         */
        this._oggVideo = false;

        /**
         * Can play h264 video files?
         * @name FORGE.Device#_h264Video
         * @type {boolean}
         * @private
         */
        this._h264Video = false;

        /**
         * Can play mp4 video files?
         * @name FORGE.Device#_mp4Video
         * @type {boolean}
         * @private
         */
        this._mp4Video = false;

        /**
         * Can play webm video files?
         * @name FORGE.Device#_webmVideo
         * @type {boolean}
         * @private
         */
        this._webmVideo = false;

        /**
         * Can play vp9 video files?
         * @name FORGE.Device#_vp9Video
         * @type {boolean}
         * @private
         */
        this._vp9Video = false;

        /**
         * Can play hls video files?
         * @name FORGE.Device#_hlsVideo
         * @type {boolean}
         * @private
         */
        this._hlsVideo = false;

        // Features

        /**
         * Is canvas available?
         * @name FORGE.Device#_canvas
         * @type {boolean}
         * @private
         */
        this._canvas = false;

        /**
         * Are winding rules for '<canvas>' (go clockwise or counterclockwise) available?
         * @name FORGE.Device#_canvasWinding
         * @type {boolean}
         * @private
         */
        this._canvasWinding = false;

        /**
         * Is text API for canvas available?
         * @name FORGE.Device#_canvasText
         * @type {boolean}
         * @private
         */
        this._canvasText = false;

        /**
         * Is native support of addEventListener available?
         * @name FORGE.Device#_addEventListener
         * @type {boolean}
         * @private
         */
        this._addEventListener = false;

        /**
         * Is requestAnimationFrame API supported?
         * @name FORGE.Device#_raf
         * @type {boolean}
         * @private
         */
        this._raf = false;

        /**
         * Is webGL available?
         * @name FORGE.Device#_webGL
         * @type {boolean}
         * @private
         */
        this._webGL = false;

        /**
         * Is WebVR available?
         * @name FORGE.Device#_webVR
         * @type {boolean}
         * @private
         */
        this._webVR = false;

        /**
         * Is file available?
         * @name FORGE.Device#_file
         * @type {boolean}
         * @private
         */
        this._file = false;

        /**
         * Is fileSystem available?
         * @name FORGE.Device#_fileSystem
         * @type {boolean}
         * @private
         */
        this._fileSystem = false;

        /**
         * Is localStorage available?
         * @name FORGE.Device#_localStorage
         * @type {boolean}
         * @private
         */
        this._localStorage = false;

        /**
         * Is Application Cache supported to enable web-based applications run offline?
         * @name FORGE.Device#_applicationCache
         * @type {boolean}
         * @private
         */
        this._applicationCache = false;

        /**
         * Is Geolocation API available?
         * @name FORGE.Device#_geolocation
         * @type {boolean}
         * @private
         */
        this._geolocation = false;

        /**
         * Is pointerLock available?
         * @name FORGE.Device#_pointerLock
         * @type {boolean}
         * @private
         */
        this._pointerLock = false;

        /**
         * Is context menu available?
         * @name FORGE.Device#_contextMenu
         * @type {boolean}
         * @private
         */
        this._contextMenu = false;

        /**
         * Is Media Source Extensions API available?
         * @name  FORGE.Device#_mediaSource
         * @type {boolean}
         * @private
         */
        this._mediaSource = false;

        /**
         * Is Encrypted Media Extensions API available?
         * @name  FORGE.Device#_encryptedMedia
         * @type {boolean}
         * @private
         */
        this._encryptedMedia = false;

        /**
         * Is JSON native support available?
         * @name FORGE.Device#_JSON
         * @type {boolean}
         * @private
         */
        this._JSON = false;

        /**
         * Is History API available?
         * @name FORGE.Device#_history
         * @type {boolean}
         * @private
         */
        this._history = false;

        /**
         * Is SVG in '<embed>' or '<object>' supported?
         * @name FORGE.Device#_svg
         * @type {boolean}
         * @private
         */
        this._svg = false;

        /**
         * Is the current page in secure mode?
         * @name FORGE.Device#_isSecure
         * @type {boolean}
         * @private
         */
        this._isSecure = false;

        /**
         * Is the current page is into an Iframe ?
         * @name FORGE.Device#_isIframe
         * @type {boolean}
         * @private
         */
        this._isIframe = false;

        /**
         * Hidden state name for the PageVisibility API.
         * @name FORGE.Device#_visibilityState
         * @type {string}
         * @private
         */
        this._visibilityState = "";

        /**
         * Visibility change event name for the PageVisibility API.
         * @name FORGE.Device#_visibilityChange
         * @type {string}
         * @private
         */
        this._visibilityChange = "";

        // CSS

        /**
         * Is css3D available?
         * @name FORGE.Device#_css3D
         * @type {boolean}
         * @private
         */
        this._css3D = false;

        /**
         * Is rgba (alpha) available?
         * @name FORGE.Device#_cssRgba
         * @type {boolean}
         * @private
         */
        this._cssRgba = false;

        /**
         * Is pointer-events available?
         * @name FORGE.Device#_cssPointerEvents
         * @type {boolean}
         * @private
         */
        this._cssPointerEvents = false;

        /**
         * Are css animations (keyframes) supported?
         * @name FORGE.Device#_cssAnimation
         * @type {boolean}
         * @private
         */
        this._cssAnimation = false;

        // Gyroscope

        /**
         * Device has a real gyroscope?
         * @name FORGE.Device#_gyroscope
         * @type {boolean}
         * @private
         */
        this._gyroscope = false;

        /**
         * Is Device Motion Event supported? (Accelerometer)
         * @name FORGE.Device#_deviceMotion
         * @type {boolean}
         * @private
         */
        this._deviceMotion = false;

        /**
         * Is Device Orientation Event supported? (Magnetometer)
         * @name FORGE.Device#_deviceOrientation
         * @type {boolean}
         * @private
         */
        this._deviceOrientation = false;

        /**
         * Is Device Motion acceleration supported?
         * @name FORGE.Device#_deviceMotionAcceleration
         * @type {boolean}
         * @private
         */
        this._deviceMotionAcceleration = false;

        /**
         * Is Device Motion rotation supported?
         * @name FORGE.Device#_deviceMotionRotationRate
         * @type {boolean}
         * @private
         */
        this._deviceMotionRotationRate = false;

        /**
         * Is Device Orientation motion supported?
         * @name FORGE.Device#_deviceOrientationMagnetometer
         * @type {boolean}
         * @private
         */
        this._deviceOrientationMagnetometer = false;

        /**
         * This is a copy of device motion handler with this as this reference (bind).
         * @name  FORGE.Device#_deviceMotionBind
         * @type {Function}
         * @default  null
         * @private
         */
        this._deviceMotionBind = null;

        /**
         * This is a copy of device orientation handler with this as this reference (bind).
         * @name  FORGE.Device#_deviceOrientationBind
         * @type {Function}
         * @default  null
         * @private
         */
        this._deviceOrientationBind = null;

        /**
         * Pixel density of the screen.
         * @name  FORGE.Device#_dpi
         * @type {number}
         * @private
         */
        this._dpi = 0;

        /**
         * Device screen width in pixels.
         * @name  FORGE.Device#_screenWidth
         * @type {number}
         * @private
         */
        this._screenWidth = 0;

        /**
         * Device screen height in pixels.
         * @name  FORGE.Device#_screenHeight
         * @type {number}
         * @private
         */
        this._screenHeight = 0;

        /**
         * Is screen orienation API available?
         * @name  FORGE.Device#_screenOrientation
         * @type {boolean}
         * @private
         */
        this._screenOrientation = false;

        /**
         * Screen orientation object name.
         * @name FORGE.Device#_orientation
         * @type {string}
         * @private
         */
        this._orientation = "";

        /**
         * Lock screen orientation method name.
         * @name FORGE.Device#_lockOrientation
         * @type {string}
         * @private
         */
        this._lockOrientation = "";

        /**
         * Unlock screen orientation method name.
         * @name FORGE.Device#_unlockOrientation
         * @type {string}
         * @private
         */
        this._unlockOrientation = "";

        /**
         * Event dispatcher for the ready event
         * @name FORGE.Device#_onReady
         * @type {FORGE.EventDispatcher}
         * @private
         */
        this._onReady = new FORGE.EventDispatcher(this, true);

        FORGE.BaseObject.call(this, "Device");

        this._check();
    };
});
