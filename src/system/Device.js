/**
 * @namespace FORGE.Device
 */
FORGE.Device = (function(c)
 {
    var Tmp = c();
    Tmp.prototype = Object.create(null);
    Tmp.prototype.constructor = Tmp;

    /**
     * Check which OS is running.
     * @method FORGE.Device#_checkOS
     * @suppress {checkRegExp}
     * @private
     */
    Tmp.prototype._checkOS = function()
    {
        if (/Playstation Vita/.test(this.ua))
        {
            this.os = "Playstation Vita";
            this.vita = true;
        }
        else if (/Xbox/.test(this.ua))
        {
            this.os = "Xbox";
            this.xbox = true;
        }
        else if (/Kindle/.test(this.ua) || /\bKF[A-Z][A-Z]+/.test(this.ua) || /Silk.*Mobile Safari/.test(this.ua))
        {
            this.os = "Kindle";
            this.kindle = true;
        }
        else if ((/Windows Phone/i).test(this.ua) || (/IEMobile/i).test(this.ua))
        {
            this.os = "Windows Phone";
            this.windowsPhone = true;
            if (/Windows Phone (\d+)/.test(this.ua))
            {
                this.osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/Android/.test(this.ua))
        {
            this.os = "Android";
            this.android = true;
            if (/Android ([\.\_\d]+)/.test(this.ua))
            {
                this.osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/CrOS/.test(this.ua))
        {
            this.os = "Chrome OS";
            this.chromeOS = true;
        }
        else if (/iP[ao]d|iPhone/i.test(this.ua))
        {
            this.os = "iOS";
            this.iOS = true;
            if (/OS (\d+)/.test(navigator.appVersion))
            {
                this.osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/(Linux|X11)/.test(this.ua))
        {
            this.os = "Linux";
            this.linux = true;
        }
        else if (/Mac OS X/.test(this.ua))
        {
            this.os = "Mac OS X";
            this.macOS = true;
            if (/Mac OS X (10[\.\_\d]+)/.test(this.ua))
            {
                this.osVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/Windows/.test(this.ua) || (/WPDesktop/i).test(this.ua))
        {
            if ((/WPDesktop/i).test(this.ua))
            {
                this.os = "Windows Phone";
                this.windowsPhone = true;
            }
            else
            {
                this.os = "Windows";
                this.windows = true;
            }
            if (/(Windows 10.0|Windows NT 10.0)/.test(this.ua))
            {
                this.osVersion = 10;
            }
            else if (/(Windows 8.1|Windows NT 6.3)/.test(this.ua) || /(Windows 8|Windows NT 6.2)/.test(this.ua))
            {
                this.osVersion = 8;
            }
            else if (/(Windows 7|Windows NT 6.1)/.test(this.ua))
            {
                this.osVersion = 7;
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
        this.ie = /*@cc_on!@*/ false || typeof document["documentMode"] !== "undefined";
        this.edge = this.ie === false && Boolean(window["StyleMedia"]) === true;
        this.firefox = typeof window["InstallTrigger"] !== "undefined";
        this.opera = Boolean(window["opr"]) === true || this.ua.indexOf(" OPR/") >= 0 || this.ua.indexOf("Opera") >= 0;
        this.safari = Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0;
        this.chrome = this.ie === false && this.edge === false && this.opera === false && (Boolean(window["chrome"]) === true || this.ua.indexOf("CriOS") >= 0);

        if (this.edge)
        {
            this.browser = "Edge";
            if (/Edge\/(\d+)/.test(this.ua))
            {
                this.browserVersion = this.edgeVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this.chrome)
        {
            this.browser = "Chrome";
            if (/CriOS\/(\d+)/.test(this.ua))
            {
                this.browserVersion = this.chromeVersion = parseInt(RegExp.$1, 10);
            }
            else if (/Chrome\/(\d+)/.test(this.ua))
            {
                this.browserVersion = this.chromeVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this.firefox)
        {
            this.browser = "Firefox";
            if (/Firefox\D+(\d+)/.test(this.ua))
            {
                this.browserVersion = this.firefoxVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this.kindle)
        {
            // Silk gets its own if clause because its ua also contains 'Safari'
            if (/Silk/.test(this.ua))
            {
                this.browser = "Silk";
                this.silk = true;
            }
        }
        else if (this.ie)
        {
            this.browser = "Internet Explorer";
            if (/MSIE (\d+\.\d+);/.test(this.ua))
            {
                this.browserVersion = this.ieVersion = parseInt(RegExp.$1, 10);
            }
            else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(this.ua))
            {
                this.browserVersion = this.ieVersion = parseInt(RegExp.$3, 10);
            }
        }
        else if (this.opera)
        {
            this.browser = "Opera";
            if (/OPR\/(\d+)/.test(this.ua))
            {
                this.browserVersion = this.operaVersion = parseInt(RegExp.$1, 10);
            }
            else if (this.ua.indexOf("Opera/") >= 0)
            {
                if (/Version\/(\d+)/.test(this.ua))
                {
                    this.browserVersion = this.operaVersion = parseInt(RegExp.$1, 10);
                }
            }
            else if (/Opera (\d+)/.test(this.ua))
            {
                this.browserVersion = this.operaVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (this.safari)
        {
            this.browser = "Safari";
            if ((/version\/(\d+(\.\d+)?)/i).test(this.ua))
            {
                this.browserVersion = this.safariVersion = parseInt(RegExp.$1, 10);
            }
        }
        else
        {
            var matches = this.ua.match(/Android.*AppleWebKit\/([\d.]+)/);
            if (matches && matches[1] < 537)
            {
                this.browser = "Android Stock";
                this.isAndroidStockBrowser = true;
                this.browserVersion = this.androidStockBrowserVersion = parseFloat(this.ua.slice(this.ua.indexOf("Android") + 8));
            }
        }
        //  WebApp mode
        if (navigator.standalone)
        {
            this.webApp = true;
        }

        this.quirksMode = (document.compatMode === "CSS1Compat") ? false : true;
    };

    /**
     * Check the device informations.
     * @method FORGE.Device#_checkDevice
     * @private
     */
    Tmp.prototype._checkDevice = function()
    {
        this.pixelRatio = window.devicePixelRatio || 1;

        this.iPhone = this.iOS === true && this.ua.toLowerCase().indexOf("iphone") !== -1;
        this.iPod = this.iOS === true && this.ua.toLowerCase().indexOf("ipod") !== -1;
        this.iPad = this.iOS === true && this.ua.toLowerCase().indexOf("ipad") !== -1;
        this.retina = this.pixelRatio >= 2 && this.iOS === true;

        if ((this.windows && !this.windowsPhone) || this.macOS || (this.linux && !this.silk) || this.chromeOS)
        {
            this.desktop = true;
        }
        else if (/Mobi/i.test(this.ua) && this.iPad === false)
        {
            this.mobile = true;
        }
        else
        {
            this.tablet = true;
        }

        //smart TV, Playstation, Table Windows
        if (/TV/i.test(this.ua) || this.vita === true || this.xbox === true || (this.desktop && /Windows NT/i.test(this.ua) && /Touch/i.test(this.ua)))
        {
            this.other = true;
            this.mobile = false;
            this.tablet = false;
            this.desktop = false;
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
                    this.oggVideo = true;
                }

                if (videoElement.canPlayType("video/mp4; codecs=\"avc1.42E01E\"").replace(/^no$/, ""))
                {
                    // without QuickTime, this value will be "undefined"
                    this.h264Video = true;
                    this.mp4Video = true;
                }

                if (videoElement.canPlayType("video/webm; codecs=\"vp8, vorbis\"").replace(/^no$/, ""))
                {
                    this.webmVideo = true;
                }

                if (videoElement.canPlayType("video/webm; codecs=\"vp9\"").replace(/^no$/, ""))
                {
                    this.vp9Video = true;
                }

                if (videoElement.canPlayType("application/x-mpegURL; codecs=\"avc1.42E01E\"").replace(/^no$/, ""))
                {
                    this.hlsVideo = true;
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
        this.audioTag = (typeof window.Audio !== "undefined");
        this.webAudio = (typeof window.AudioContext !== "undefined" || typeof window.webkitAudioContext !== "undefined");

        var audioElement = document.createElement("audio");

        try
        {
            if (typeof audioElement.canPlayType === "function")
            {
                if (audioElement.canPlayType("audio/ogg; codecs=\"vorbis\"").replace(/^no$/, ""))
                {
                    this.ogg = true;
                }

                if (audioElement.canPlayType("audio/mpeg;").replace(/^no$/, ""))
                {
                    this.mp3 = true;
                }

                if (audioElement.canPlayType("audio/ogg; codecs=\"opus\"").replace(/^no$/, "") || audioElement.canPlayType("audio/opus;").replace(/^no$/, ""))
                {
                    this.opus = true;
                }

                if (audioElement.canPlayType("audio/wav; codecs=\"1\"").replace(/^no$/, ""))
                {
                    this.wav = true;
                }

                if (audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this.aac = true;
                }

                if (audioElement.canPlayType("audio/x-m4a;") || audioElement.canPlayType("audio/m4a;") || audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this.m4a = true;
                }

                if (audioElement.canPlayType("audio/x-mp4;") || audioElement.canPlayType("audio/mp4;") || audioElement.canPlayType("audio/aac;").replace(/^no$/, ""))
                {
                    this.mp4 = true;
                }

                if (audioElement.canPlayType("audio/webm; codecs=\"vorbis\"").replace(/^no$/, ""))
                {
                    this.webm = true;
                    this.weba = true;
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
        this.vibrate = (typeof navigator.vibrate !== "undefined" || typeof navigator.webkitVibrate !== "undefined" || typeof navigator.mozVibrate !== "undefined" || typeof navigator.msVibrate !== "undefined");

        this.battery = (typeof navigator.getBattery === "function");
    };

    /**
     * Check HTML5 features.
     * @method FORGE.Device#_checkFeatures
     * @private
     */
    Tmp.prototype._checkFeatures = function()
    {
        this.canvas = (typeof window.CanvasRenderingContext2D !== "undefined");
        if (this.canvas === true)
        {
            this.canvasText = (typeof document.createElement("canvas").getContext("2d").fillText === "function");
            var canvasCtx = document.createElement("canvas").getContext("2d");
            canvasCtx.rect(0, 0, 10, 10);
            canvasCtx.rect(2, 2, 6, 6);
            this.canvasWinding = (canvasCtx.isPointInPath(5, 5, "evenodd") === false);
        }

        try
        {
            this.localStorage = (typeof window.localStorage === "object" && typeof window.localStorage.getItem === "function");
        }
        catch (error)
        {
            this.localStorage = false;
        }

        this.mediaSource = (typeof window.MediaSource === "function");

        this.encryptedMedia = (typeof window.HTMLMediaElement === "function" && typeof window.MediaKeys === "function" && typeof window.MediaKeySystemAccess === "function" && typeof navigator.requestMediaKeySystemAccess === "function");

        this.applicationCache = (typeof window.applicationCache === "object");

        this.addEventListener = (typeof window.addEventListener === "function");

        this.raf = (typeof window.requestAnimationFrame === "function" || typeof window.webkitRequestAnimationFrame === "function" || typeof window.mozRequestAnimationFrame === "function");

        try
        {
            var canvas = document.createElement("canvas");
            /* Force screencanvas to false */
            canvas.screencanvas = false;
            this.webGL = (typeof canvas.getContext === "function" && typeof window.WebGLRenderingContext !== "undefined" && Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
        }
        catch (e)
        {
            this.webGL = false;
        }

        if (typeof navigator.getVRDisplays === "function")
        {
            this.webVR = true;
        }
        else
        {
            this.webVR = false;
        }

        this.JSON = (typeof window.JSON === "object" && typeof window.JSON.parse === "function" && typeof window.JSON.stringify === "function");

        this.geolocation = (typeof navigator.geolocation === "object");

        this.history = (typeof window.history === "object" && typeof window.history.pushState === "function");

        this.svg = (typeof document.createElementNS === "function" && typeof document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect === "function");

        this.contextMenu = (typeof document.documentElement.contextMenu !== "undefined" && typeof window.HTMLMenuItemElement === "function");
    };

    /**
     * Check the URL environment.
     * @method FORGE.Device#_checkEnvironment
     * @private
     */
    Tmp.prototype._checkEnvironment = function()
    {
        this.isSecure = /^https/i.test(window.location.protocol);

        try
        {
            this.isIframe = (window.self !== window.top);
        }
        catch (e)
        {
            this.isIframe = true;
        }
    };

    /**
     * Check the various inputs.
     * @method FORGE.Device#_checkInput
     * @private
     */
    Tmp.prototype._checkInput = function()
    {
        this.touch = (typeof window.ontouchstart !== "undefined" || typeof window.DocumentTouch !== "undefined" && document instanceof window.DocumentTouch || (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0) || (typeof navigator.msMaxTouchPoints === "number" && navigator.msMaxTouchPoints > 0));

        // Test for Safari iOS touch force feature
        if (typeof window.onmouseforcewillbegin !== "undefined" || typeof window.onwebkitmouseforcewillbegin !== "undefined")
        {
            // Test if the browser provides thresholds defining a "force touch" from a normal touch/click event
            this.touchForce = Boolean(MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN && MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN);
        }

        this.gamepad = (typeof navigator.getGamepads === "function" || typeof navigator.webkitGetGamepads === "function");
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
                this.requestFullscreen = requestFullscreen[i];
                break;
            }
        }
        for (var j = 0, jj = exitFullscreen.length; j < jj; j++)
        {
            if (document[exitFullscreen[j]])
            {
                this.exitFullscreen = exitFullscreen[j];
                break;
            }
        }

        // Keyboard Input on full screen mode?
        if (typeof window.Element === "function" && Element.ALLOW_KEYBOARD_INPUT)
        {
            this.fullscreenKeyboard = true;
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
                this.fullscreenElement = fullscreenElement[k];
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
                this.fullscreenEnabled = fullscreenEnabled[l];
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
        var visibilityChange =
            [
                "visibilitychange",
                "mozvisibilitychange",
                "webkitvisibilitychange",
                "msvisibilitychange"
            ];
        var visibilityState =
            [
                "hidden",
                "mozHidden",
                "webkitHidden",
                "msHidden"
            ];
        for (var m = 0, mm = visibilityState.length; m < mm; m++)
        {
            if (typeof document[visibilityState[m]] !== "undefined")
            {
                this.visibilityState = visibilityState[m];
                this.visibilityChange = visibilityChange[m];
                break;
            }
        }

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
                this.orientation = orientation[i];
                break;
            }
        }

        this.screenOrientation = (typeof screen.orientation === "object" && typeof screen.orientation.type === "string" && typeof screen.orientation.lock === "function");

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
                this.lockOrientation = lockOrientation[j];
                this.unlockOrientation = unlockOrientation[j];
                break;
            }
        }

        //File API
        this.file = (typeof window.File !== "undefined" && typeof window.FileReader !== "undefined" && typeof window.FileList !== "undefined" && typeof window.Blob !== "undefined");
        this.fileSystem = (typeof window.requestFileSystem !== "undefined" || typeof window.webkitRequestFileSystem !== "undefined");

        //Pointer Lock API
        this.pointerLock = (typeof document.pointerLockElement !== "undefined" || typeof document.mozPointerLockElement !== "undefined" || typeof document.webkitPointerLockElement !== "undefined");
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
        this.cssPointerEvents = (cssStyle.pointerEvents === "auto");

        // rgba
        cssStyle.cssText = "background-color:rgba(150,255,150,.5)";
        this.cssRgba = (("" + cssStyle.backgroundColor).indexOf("rgba") > -1);

        this.cssAnimation = (typeof cssStyle.animationName !== "undefined" || typeof cssStyle.webkitAnimationName !== "undefined" || typeof cssStyle.mozAnimationName !== "undefined" || typeof cssStyle.msAnimationName !== "undefined");

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
        this.css3D = (typeof has3d !== "undefined" && has3d.length > 0 && has3d !== "none");
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
            this.deviceMotionRotationRate = true;
        }
        if (typeof event.acceleration !== "undefined" && typeof event.acceleration.x !== "undefined" && typeof event.acceleration.y !== "undefined" && typeof event.acceleration.z !== "undefined")
        {
            this.deviceMotionAcceleration = true;
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
        if (typeof event.alpha !== "undefined" && typeof event.beta !== "undefined" && typeof event.gamma !== "undefined")
        {
            this.deviceOrientationMagnetometer = true;
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
        this.deviceMotion = (typeof window.DeviceMotionEvent !== "undefined");
        this.deviceOrientation = (typeof window.DeviceOrientationEvent !== "undefined");

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

        this.dpi = div.offsetWidth;

        document.body.removeChild(div);
        div = null;

        if (this.mobile)
        {
            this.screenWidth = Math.floor(Math.min(window.screen.width, window.screen.height) * this.pixelRatio);
            this.screenHeight = Math.floor(Math.max(window.screen.width, window.screen.height) * this.pixelRatio);
        }
        else
        {
            this.screenWidth = Math.floor(Math.max(window.screen.width, window.screen.height) * this.pixelRatio);
            this.screenHeight = Math.floor(Math.min(window.screen.width, window.screen.height) * this.pixelRatio);
        }
    };

    /**
     * Run the checks.
     * @method FORGE.Device#_check
     * @private
     */
    Tmp.prototype._check = function()
    {
        this.ua = navigator["userAgent"];

        this.language = ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || "");

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

        //lock Device object
        if (this.deviceMotion === false && this.deviceOrientation === false)
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

        if (this.deviceMotionRotationRate === true && this.deviceMotionAcceleration === true && this.deviceOrientationMagnetometer === true)
        {
            this.gyroscope = true;
        }

        this.ready = true;

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
        if (type === "mp3" && this.mp3 === true)
        {
            return true;
        }
        else if (type === "ogg" && (this.ogg === true || this.opus === true))
        {
            return true;
        }
        else if (type === "m4a" && this.m4a === true)
        {
            return true;
        }
        else if (type === "mp4" && this.mp4 === true)
        {
            return true;
        }
        else if (type === "opus" && this.opus === true)
        {
            return true;
        }
        else if (type === "wav" && this.wav === true)
        {
            return true;
        }
        else if (type === "aac" && this.aac === true)
        {
            return true;
        }
        else if (type === "webm" && this.webm === true)
        {
            return true;
        }
        else if (type === "weba" && this.weba === true)
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
        if (type === "webm" && (this.webmVideo === true || this.vp9Video === true))
        {
            return true;
        }
        else if (type === "mp4" && (this.mp4Video === true || this.h264Video === true))
        {
            return true;
        }
        else if ((type === "ogg" || type === "ogv") && this.oggVideo === true)
        {
            return true;
        }
        else if (type === "mpeg" && this.hlsVideo === true)
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
                return this.battery && !battery.charging && battery.level <= minLevel;
            }.bind(this), function()
            {
                return false;
            });
    };

    return new Tmp();

})(function()
{
    return function()
    {
        /**
         * Is device detection done?
         * @name FORGE.Device#ready
         * @type {boolean}
         */
        this.ready = false;

        /**
         * The user agent string.
         * @name FORGE.Device#ua
         * @type {string}
         */
        this.ua = "";

        /**
         * The browser language.
         * @name FORGE.Device#language
         * @type {string}
         */
        this.language = "";

        //OS

        /**
         * The OS name
         * @name FORGE.Device#os
         * @type {string}
         */
        this.os = "";

        /**
         * The OS major version number.
         * @name FORGE.Device#osVersion
         * @type {number}
         */
        this.osVersion = 0;

        /**
         * Is running on PS Vita?
         * @name FORGE.Device#vita
         * @type {boolean}
         */
        this.vita = false;

        /**
         * Is running on XBox?
         * @name FORGE.Device#xbox
         * @type {boolean}
         */
        this.xbox = false;

        /**
         * Is running on Kindle?
         * @name FORGE.Device#kindle
         * @type {boolean}
         */
        this.kindle = false;

        /**
         * Is running on android?
         * @name FORGE.Device#android
         * @type {boolean}
         */
        this.android = false;

        /**
         * Is running on chromeOS?
         * @name FORGE.Device#chromeOS
         * @type {boolean}
         */
        this.chromeOS = false;

        /**
         * Is running on iOS?
         * @name FORGE.Device#iOS
         * @type {boolean}
         */
        this.iOS = false;

        /**
         * Is running on Linux?
         * @name FORGE.Device#linux
         * @type {boolean}
         */
        this.linux = false;

        /**
         * Is running on MacOS?
         * @name FORGE.Device#macOS
         * @type {boolean}
         */
        this.macOS = false;

        /**
         * Is running on Windows?
         * @name FORGE.Device#windows
         * @type {boolean}
         */
        this.windows = false;

        /**
         * Is running on Windows Phone?
         * @name FORGE.Device#windowsPhone
         * @type {boolean}
         */
        this.windowsPhone = false;

        // Browsers

        /**
         * Is running in Firefox?
         * @name FORGE.Device#firefox
         * @type {boolean}
         */
        this.firefox = false;

        /**
         * Firefox major version number.
         * @name FORGE.Device#firefoxVersion
         * @type {number}
         */
        this.firefoxVersion = 0;

        /**
         * Is running in Chrome?
         * @name FORGE.Device#chrome
         * @type {boolean}
         */
        this.chrome = false;

        /**
         * Chrome major version number.
         * @name FORGE.Device#chromeVersion
         * @type {number}
         */
        this.chromeVersion = 0;

        /**
         * Is running in Internet Explorer?
         * @name FORGE.Device#ie
         * @type {boolean}
         */
        this.ie = false;

        /**
         * Internet Explorer major version number.
         * @name FORGE.Device#ieVersion
         * @type {number}
         */
        this.ieVersion = 0;

        /**
         * Is running in Opera?
         * @name FORGE.Device#opera
         * @type {boolean}
         */
        this.opera = false;

        /**
         * Opera major version number.
         * @name FORGE.Device#operaVersion
         * @type {number}
         */
        this.operaVersion = 0;

        /**
         * Is running in Edge?
         * @name FORGE.Device#edge
         * @type {boolean}
         */
        this.edge = false;

        /**
         * Edge major version number.
         * @name FORGE.Device#edgeVersion
         * @type {number}
         */
        this.edgeVersion = 0;

        /**
         * Is running in Safari?
         * @name FORGE.Device#safari
         * @type {boolean}
         */
        this.safari = false;

        /**
         * Safari (or Mobile Safari) major version number.
         * @name FORGE.Device#safariVersion
         * @type {number}
         */
        this.safariVersion = 0;

        /**
         * Is running in Silk (Kindle)?
         * @name FORGE.Device#silk
         * @type {boolean}
         */
        this.silk = false;

        /**
         * The nick name of the browser.
         * @name FORGE.Device#browser
         * @type {string}
         */
        this.browser = "";

        /**
         * The browser major version.
         * @name FORGE.Device#browserVersion
         * @type {number}
         */
        this.browserVersion = 0;

        /**
         * Is running in a standalone app?
         * @name FORGE.Device#webApp
         * @type {boolean}
         */
        this.webApp = false;

        /**
         * Detect if it's an Android Stock browser.
         * @name FORGE.Device#isAndroidStockBrowser
         * @type {boolean}
         */
        this.isAndroidStockBrowser = false;

        /**
         * The Android version linked to the stock browser.
         * @name FORGE.Device#androidStockBrowserVersion
         * @type {number}
         */
        this.androidStockBrowserVersion = 0;

        /**
         * Is the browser running in strict mode or quirks mode?
         * @name FORGE.Device#quirksMode
         * @type {boolean}
         */
        this.quirksMode = false;

        // Capabilities

        /**
         * Does the browser support full screen API?
         * @name FORGE.Device#fullscreenEnabled
         * @type {string}
         */
        this.fullscreenEnabled = "";

        /**
         * Request full screen method name.
         * @name FORGE.Device#requestFullscreen
         * @type {string}
         */
        this.requestFullscreen = "";

        /**
         * Exit full screen method name.
         * @name FORGE.Device#exitFullscreen
         * @type {string}
         */
        this.exitFullscreen = "";

        /**
         * fullscreenElement accessor name.
         * @name  FORGE.Device#fullscreenElement
         * @type {string}
         */
        this.fullscreenElement = "";

        /**
         * Does the browser support keyboard during full screen mode?
         * @name FORGE.Device#fullscreenKeyboard
         * @type {boolean}
         */
        this.fullscreenKeyboard = false;

        // Device

        /**
         * Is running on iPhone?
         * @name FORGE.Device#iPhone
         * @type {boolean}
         */
        this.iPhone = false;

        /**
         * Is running on Apple Retina display?
         * @name FORGE.Device#retina
         * @type {boolean}
         */
        this.retina = false;

        /**
         * Is running on iPod?
         * @name FORGE.Device#iPod
         * @type {boolean}
         */
        this.iPod = false;

        /**
         * Is running on iPad?
         * @name FORGE.Device#iPad
         * @type {boolean}
         */
        this.iPad = false;

        /**
         * Pixel ratio of the device.
         * @name FORGE.Device#pixelRatio
         * @type {number}
         */
        this.pixelRatio = 1;

        /**
         * Does the device support the Vibration API?
         * @name FORGE.Device#vibrate
         * @type {boolean}
         */
        this.vibrate = false;

        /**
         * Is the Battery API available?
         * @name FORGE.Device#battery
         * @type {boolean}
         */
        this.battery = false;

        /**
         * Is running on a desktop?
         * @name FORGE.Device#desktop
         * @type {boolean}
         */
        this.desktop = false;

        /**
         * Is running on a tablet?
         * @name FORGE.Device#tablet
         * @type {boolean}
         */
        this.tablet = false;

        /**
         * Is running on a mobile?
         * @name FORGE.Device#mobile
         * @type {boolean}
         */
        this.mobile = false;

        /**
         * Is running on a other device as smartTv...?
         * @name FORGE.Device#other
         * @type {boolean}
         */
        this.other = false;

        // Inputs

        /**
         * Is Touch API available?
         * @name FORGE.Device#touch
         * @type {boolean}
         */
        this.touch = false;

        /**
         * Is Gamepad API available?
         * @name FORGE.Device#gamepad
         * @type {boolean}
         */
        this.gamepad = false;

        /**
         * Are Force Touch Events supported?
         * Force Touch events are available in OS X 10.11 and later on devices equipped with Force Touch trackpads.
         * @name FORGE.Device#touchForce
         * @type {boolean}
         */
        this.touchForce = false;

        // Audio

        /**
         * Are Audio tags available?
         * @name FORGE.Device#audioTag
         * @type {boolean}
         */
        this.audioTag = false;

        /**
         * Is the WebAudio API available?
         * @name FORGE.Device#webAudio
         * @type {boolean}
         */
        this.webAudio = false;

        /**
         * Can play ogg files?
         * @name FORGE.Device#ogg
         * @type {boolean}
         */
        this.ogg = false;

        /**
         * Can play mp3 files?
         * @name FORGE.Device#mp3
         * @type {boolean}
         */
        this.mp3 = false;

        /**
         * Can play opus files?
         * @name FORGE.Device#opus
         * @type {boolean}
         */
        this.opus = false;

        /**
         * Can play wav files?
         * @name FORGE.Device#wav
         * @type {boolean}
         */
        this.wav = false;

        /**
         * Can play m4a files?
         * @name FORGE.Device#m4a
         * @type {boolean}
         */
        this.m4a = false;

        /**
         * Can play mp4 files?
         * @name FORGE.Device#mp4
         * @type {boolean}
         */
        this.mp4 = false;

        /**
         * Can play aac files?
         * @name FORGE.Device#aac
         * @type {boolean}
         */
        this.aac = false;

        /**
         * Can play webm files?
         * @name FORGE.Device#webm
         * @type {boolean}
         */
        this.webm = false;

        /**
         * Can play weba files?
         * @name FORGE.Device#weba
         * @type {boolean}
         */
        this.weba = false;

        // Video

        /**
         * Can play ogg video files?
         * @name FORGE.Device#oggVideo
         * @type {boolean}
         */
        this.oggVideo = false;

        /**
         * Can play h264 video files?
         * @name FORGE.Device#h264Video
         * @type {boolean}
         */
        this.h264Video = false;

        /**
         * Can play mp4 video files?
         * @name FORGE.Device#mp4Video
         * @type {boolean}
         */
        this.mp4Video = false;

        /**
         * Can play webm video files?
         * @name FORGE.Device#webmVideo
         * @type {boolean}
         */
        this.webmVideo = false;

        /**
         * Can play vp9 video files?
         * @name FORGE.Device#vp9Video
         * @type {boolean}
         */
        this.vp9Video = false;

        /**
         * Can play hls video files?
         * @name FORGE.Device#hlsVideo
         * @type {boolean}
         */
        this.hlsVideo = false;

        // Features

        /**
         * Is canvas available?
         * @name FORGE.Device#canvas
         * @type {boolean}
         */
        this.canvas = false;

        /**
         * Are winding rules for '<canvas>' (go clockwise or counterclockwise) available?
         * @name FORGE.Device#canvasWinding
         * @type {boolean}
         */
        this.canvasWinding = false;

        /**
         * Is text API for canvas available?
         * @name FORGE.Device#canvasText
         * @type {boolean}
         */
        this.canvasText = false;

        /**
         * Is native support of addEventListener available?
         * @name FORGE.Device#addEventListener
         * @type {boolean}
         */
        this.addEventListener = false;

        /**
         * Is requestAnimationFrame API supported?
         * @name FORGE.Device#raf
         * @type {boolean}
         */
        this.raf = false;

        /**
         * Is webGL available?
         * @name FORGE.Device#webGL
         * @type {boolean}
         */
        this.webGL = false;

        /**
         * Is WebVR available?
         * @name FORGE.Device#webVR
         * @type {boolean}
         */
        this.webVR = false;

        /**
         * Is file available?
         * @name FORGE.Device#file
         * @type {boolean}
         */
        this.file = false;

        /**
         * Is fileSystem available?
         * @name FORGE.Device#fileSystem
         * @type {boolean}
         */
        this.fileSystem = false;

        /**
         * Is localStorage available?
         * @name FORGE.Device#localStorage
         * @type {boolean}
         */
        this.localStorage = false;

        /**
         * Is Application Cache supported to enable web-based applications run offline?
         * @name FORGE.Device#applicationCache
         * @type {boolean}
         */
        this.applicationCache = false;

        /**
         * Is Geolocation API available?
         * @name FORGE.Device#geolocation
         * @type {boolean}
         */
        this.geolocation = false;

        /**
         * Is pointerLock available?
         * @name FORGE.Device#pointerLock
         * @type {boolean}
         */
        this.pointerLock = false;

        /**
         * Is context menu available?
         * @name FORGE.Device#contextMenu
         * @type {boolean}
         */
        this.contextMenu = false;

        /**
         * Is Media Source Extensions API available?
         * @name  FORGE.Device#mediaSource
         * @type {boolean}
         */
        this.mediaSource = false;

        /**
         * Is Encrypted Media Extensions API available?
         * @name  FORGE.Device#encryptedMedia
         * @type {boolean}
         */
        this.encryptedMedia = false;

        /**
         * Is JSON native support available?
         * @name FORGE.Device#JSON
         * @type {boolean}
         */
        this.JSON = false;

        /**
         * Is History API available?
         * @name FORGE.Device#history
         * @type {boolean}
         */
        this.history = false;

        /**
         * Is SVG in '<embed>' or '<object>' supported?
         * @name FORGE.Device#svg
         * @type {boolean}
         */
        this.svg = false;

        /**
         * Is the current page in secure mode?
         * @name FORGE.Device#isSecure
         * @type {boolean}
         */
        this.isSecure = false;

        /**
         * Is the current page is into an Iframe ?
         * @name FORGE.Device#isIframe
         * @type {boolean}
         */
        this.isIframe = false;

        /**
         * Hidden state name for the PageVisibility API.
         * @name FORGE.Device#visibilityState
         * @type {string}
         */
        this.visibilityState = "";

        /**
         * Visibility change event name for the PageVisibility API.
         * @name FORGE.Device#visibilityChange
         * @type {string}
         */
        this.visibilityChange = "";

        // CSS

        /**
         * Is css3D available?
         * @name FORGE.Device#css3D
         * @type {boolean}
         */
        this.css3D = false;

        /**
         * Is rgba (alpha) available?
         * @name FORGE.Device#cssRgba
         * @type {boolean}
         */
        this.cssRgba = false;

        /**
         * Is pointer-events available?
         * @name FORGE.Device#cssPointerEvents
         * @type {boolean}
         */
        this.cssPointerEvents = false;

        /**
         * Are css animations (keyframes) supported?
         * @name FORGE.Device#cssAnimation
         * @type {boolean}
         */
        this.cssAnimation = false;

        // Gyroscope

        /**
         * Device has a real gyroscope?
         * @name FORGE.Device#gyroscope
         * @type {boolean}
         */
        this.gyroscope = false;

        /**
         * Is Device Motion Event supported? (Accelerometer)
         * @name FORGE.Device#deviceMotion
         * @type {boolean}
         */
        this.deviceMotion = false;

        /**
         * Is Device Orientation Event supported? (Magnetometer)
         * @name FORGE.Device#deviceOrientation
         * @type {boolean}
         */
        this.deviceOrientation = false;

        /**
         * Is Device Motion acceleration supported?
         * @name FORGE.Device#deviceMotionAcceleration
         * @type {boolean}
         */
        this.deviceMotionAcceleration = false;

        /**
         * Is Device Motion rotation supported?
         * @name FORGE.Device#deviceMotionRotationRate
         * @type {boolean}
         */
        this.deviceMotionRotationRate = false;

        /**
         * Is Device Orientation motion supported?
         * @name FORGE.Device#deviceOrientationMagnetometer
         * @type {boolean}
         */
        this.deviceOrientationMagnetometer = false;

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
         * @name  FORGE.Device#dpi
         * @type {number}
         */
        this.dpi = 0;

        /**
         * Device screen width in pixels.
         * @name  FORGE.Device#screenWidth
         * @type {number}
         */
        this.screenWidth = 0;

        /**
         * Device screen height in pixels.
         * @name  FORGE.Device#screenHeight
         * @type {number}
         */
        this.screenHeight = 0;

        /**
         * Is screen orienation API available?
         * @name  FORGE.Device#screenOrientation
         * @type {boolean}
         */
        this.screenOrientation = false;

        /**
         * Screen orientation object name.
         * @name FORGE.Device#orientation
         * @type {string}
         */
        this.orientation = "";

        /**
         * Lock screen orientation method name.
         * @name FORGE.Device#lockOrientation
         * @type {string}
         */
        this.lockOrientation = "";

        /**
         * Unlock screen orientation method name.
         * @name FORGE.Device#unlockOrientation
         * @type {string}
         */
        this.unlockOrientation = "";

        this._check();
    };
});
