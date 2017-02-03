
/**
 * ColorRGBA Object
 * @constructor FORGE.ColorRGBA
 * @param {number} r - Red channel
 * @param {number} g - Green channel
 * @param {number} b - Blue channel
 * @param {number} a - Alpha channel
 */
FORGE.ColorRGBA = function(r, g, b, a)
{
    /**
     * Red channel
     * @name FORGE.ColorRGBA#red
     * @type {number}
     */
    this.red = r;

    /**
     * Green channel
     * @name FORGE.ColorRGBA#green
     * @type {number}
     */
    this.green = g;

    /**
     * Blue channel
     * @name FORGE.ColorRGBA#blue
     * @type {number}
     */
    this.blue = b;

    /**
     * Alpha channel
     * @name FORGE.ColorRGBA#alpha
     * @type {number}
     */
    this.alpha = a;
};