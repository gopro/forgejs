/**
 * Gamepads manager that handles gamepads
 *
 * @constructor FORGE.GamepadsManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.GamepadsManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.GamepadsManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The list of associated gamepads
     * @name FORGE.GamepadsManager#_gamepads
     * @type {?Array<FORGE.Gamepad>}
     * @private
     */
    this._gamepads = null;

    /**
     * On gamepad connected event dispatcher.
     * @name FORGE.GamepadsManager#_onGamepadConnected
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onGamepadConnected = null;

    /**
     * On gamepad disconnected event dispatcher.
     * @name FORGE.GamepadsManager#_onGamepadDisconnected
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onGamepadDisconnected = null;

    FORGE.BaseObject.call(this, "GamepadsManager");

    this._boot();
};

FORGE.GamepadsManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.GamepadsManager.prototype.constructor = FORGE.GamepadsManager;

/**
 * Boot sequence.
 * @method FORGE.GamepadsManager#_boot
 * @private
 */
FORGE.GamepadsManager.prototype._boot = function()
{
    this._gamepads = [];
};

/**
 * Check if a gamepad (of type Gamepad) is connected.
 * @method FORGE.GamepadsManager#_isConnected
 * @param {Gamepad} gamepad - the gamepad to check
 * @return {boolean} is the gamepad present ?
 * @private
 */
FORGE.GamepadsManager.prototype._isConnected = function(gamepad)
{
    for (var i = 0, ii = this._gamepads.length; i < ii; i++)
    {
        if (this._gamepads[i].name === (gamepad.id + "-" + gamepad.index))
        {
            return true;
        }
    }

    return false;
};

/**
 * Connect a gamepad (of type Gamepad).
 * @method FORGE.GamepadsManager#_connect
 * @param {Gamepad} pad - the gamepad to connect
 * @private
 */
FORGE.GamepadsManager.prototype._connect = function(pad)
{
    var gamepad = new FORGE.Gamepad(this._viewer, pad);

    this._gamepads[pad.index] = gamepad;

    // TODO: add a haptic feedback if available

    if (this._onGamepadConnected !== null)
    {
        this._onGamepadConnected.dispatch(gamepad);
    }
};

/**
 * Disconnect a gamepad (of type FORGE.Gamepad).
 * @method FORGE.GamepadsManager#_disconnect
 * @param {number} index - the index of the gamepad to disconnect
 * @private
 */
FORGE.GamepadsManager.prototype._disconnect = function(index)
{
    var name = this._gamepads[index].name;

    this._gamepads[index].destroy();
    this._gamepads[index] = null;

    if (this._onGamepadDisconnected !== null)
    {
        this._onGamepadDisconnected.dispatch(name);
    }
};

/**
 * Update routine: check each time if a new gamepad is connected, and update any gamepad currently
 * connected in this manager.
 * @method FORGE.GamepadsManager#update
 */
FORGE.GamepadsManager.prototype.update = function()
{
    var gamepad, gamepads = navigator.getGamepads();

    for (var i = 0, ii = gamepads.length; i < ii; i++)
    {
        gamepad = gamepads[i];

        if (gamepad !== null)
        {
            if (this._isConnected(gamepad) === false)
            {
                this._connect(gamepad);
            }

            this._gamepads[i].update();
        }
        else if (gamepad === null && typeof this._gamepads[i] !== "undefined")
        {
            this._disconnect(i);
        }
    }
};

/**
 * Destroy sequence.
 * @method FORGE.GamepadsManager#destroy
 */
FORGE.GamepadsManager.prototype.destroy = function()
{
    this._viewer = null;

    for (var i = 0, ii = this._gamepads.length; i < ii; i++)
    {
        this._disconnect(i);
    }
    this._gamepads = null;

    if (this._onGamepadConnected !== null)
    {
        this._onGamepadConnected.destroy();
        this._onGamepadConnected = null;
    }

    if (this._onGamepadDisconnected !== null)
    {
        this._onGamepadDisconnected.destroy();
        this._onGamepadDisconnected = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * On gamepad connected event dispatcher.
 * @name FORGE.GamepadsManager#onGamepadConnected
 * @type {?FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.GamepadsManager.prototype, "onGamepadConnected",
{
    /** @this {FORGE.GamepadsManager} */
    get: function()
    {
        if (this._onGamepadConnected === null)
        {
            this._onGamepadConnected = new FORGE.EventDispatcher(this);
        }

        return this._onGamepadConnected;
    }
});

/**
 * On gamepad disconnected event dispatcher.
 * @name FORGE.GamepadsManager#onGamepadDisconnected
 * @type {?FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.GamepadsManager.prototype, "onGamepadDisconnected",
{
    /** @this {FORGE.GamepadsManager} */
    get: function()
    {
        if (this._onGamepadDisconnected === null)
        {
            this._onGamepadDisconnected = new FORGE.EventDispatcher(this);
        }

        return this._onGamepadDisconnected;
    }
});

/**
 * Get a list of all connected gamepads.
 * @name FORGE.GamepadsManager#all
 * @type {Array<FORGE.Gamepad>}
 * @readonly
 */
Object.defineProperty(FORGE.GamepadsManager.prototype, "all",
{
    /** @this {FORGE.GamepadsManager} */
    get: function()
    {
        return this._gamepads || [];
    }
});
