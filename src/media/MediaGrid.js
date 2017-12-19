/**
 * MediaGrid class.
 *
 * @constructor FORGE.MediaGrid
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input MediaGrid configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.MediaGrid = function(viewer, config)
{
    FORGE.Media.call(this, viewer, config, "MediaGrid");
};

FORGE.MediaGrid.prototype = Object.create(FORGE.Media.prototype);
FORGE.MediaGrid.prototype.constructor = FORGE.MediaGrid;

/**
 * Configuration parsing.
 * @method FORGE.MediaGrid#_parseConfig
 * @param {SceneMediaConfig} config input MediaGrid configuration
 * @private
 */
FORGE.MediaGrid.prototype._parseConfig = function(config)
{
    FORGE.Media.prototype._parseConfig.call(this, config);
};

/**
 * MediaGrid load
 * @method FORGE.MediaGrid#load
 */
FORGE.MediaGrid.prototype.load = function()
{
    this._notifyLoadComplete();
};

/**
 * MediaGrid destroy sequence
 * @method FORGE.MediaGrid#destroy
 */
FORGE.MediaGrid.prototype.destroy = function()
{
    this.unload();

    FORGE.Media.prototype.destroy.call(this);
};