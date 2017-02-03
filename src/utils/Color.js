/**
 * @namespace FORGE.Color
 */
FORGE.Color = {};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.<br>
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 * @method FORGE.Color.rgbToHsl
 * @param {number} r - The red color value.
 * @param {number} g - The green color value.
 * @param {number} b - The blue color value.
 * @return {HSLColor} The HSL representation.
 */
FORGE.Color.rgbToHsl = function(r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min)
    {
        h = s = 0; // achromatic
    }
    else
    {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h:h, s:s, l:l };
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.<br>
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @method FORGE.Color.hslToRgb
 * @param {number} h - The hue
 * @param {number} s - The saturation
 * @param {number} l - The lightness
 * @return {RGBaColor} The RGB representation
 */
FORGE.Color.hslToRgb = function(h, s, l)
{
    var r, g, b;

    if (s === 0)
    {
        r = g = b = l; // achromatic
    }
    else
    {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = FORGE.Color.hueToRgb(p, q, h + 1/3);
        g = FORGE.Color.hueToRgb(p, q, h);
        b = FORGE.Color.hueToRgb(p, q, h - 1/3);
    }

    return {r: r * 255, g: g * 255, b: b * 255};
};

/**
 * Convert hue to rgb.
 * @method FORGE.Color.hueToRgb
 * @param  {number} p
 * @param  {number} q
 * @param  {number} t
 * @return {number}
 */
FORGE.Color.hueToRgb = function(p, q, t)
{
    if (t < 0)
    {
        t += 1;
    }
    else if (t > 1)
    {
        t -= 1;
    }
    else if (t < 1 / 6)
    {
        return p + (q - p) * 6 * t;
    }
    else if (t < 1 / 2)
    {
        return q;
    }
    else if (t < 2 / 3)
    {
        return p + (q - p) * (2 / 3 - t) * 6;
    }

    return p;
};

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 * @method  FORGE.Color.rgbToHsv
 * @param {number} r - The red color value.
 * @param {number} g - The green color value.
 * @param {number} b - The blue color value.
 * @return {HSVColor} The HSV representation.
 */
FORGE.Color.rgbToHsv = function(r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min)
    {
        h = 0; // achromatic
    }
    else
    {
        switch (max)
        {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return {h: h, s: s, v: v};
};

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.<br>
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @method  FORGE.Color.hsvToRgb
 * @param {number} h - The hue
 * @param {number} s - The saturation
 * @param {number} v - The value
 * @return {RGBaColor} The RGB representation
 */
FORGE.Color.hsvToRgb = function(h, s, v)
{
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6)
    {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return {r: r * 255, g: g * 255, b: b * 255};
};

/**
 * Convert a color component into hexa value.
 * @method FORGE.Color.componentToHex
 * @param  {number} c - The color component to convert.
 * @return {string} The convert componenet into hex string.
 */
FORGE.Color.componentToHex = function(c)
{
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};

/**
 * Convert rgb values into a css compatible hexadecimal string.
 * @method FORGE.Color.regbToHex
 * @param {number} r - Red component.
 * @param {number} g - Green component.
 * @param {number} b - Blue component.
 * @return {string} Returns the hexadecimal string for the color.
 */
FORGE.Color.rgbToHex = function(r, g, b)
{
    return "#" + FORGE.Color.componentToHex(r) + FORGE.Color.componentToHex(g) + FORGE.Color.componentToHex(b);
};


/**
 * Convert rgba/rgb string into a four/three components object.
 * @method FORGE.Color.fromRgbaString
 * @param {string} rgbaString - rgba/rgb string with format rgba(r,g,b,a)/rgb(r,g,b)
 * @return {RGBaColor} The rgb color in four/three components.
 */
FORGE.Color.fromRgbaString = function(rgbaString)
{
    var rgba = rgbaString.split("(")[1].split(")")[0];
    var components = rgba.split(",");
    var color = {
        r: parseInt(components[0], 10),
        g: parseInt(components[1], 10),
        b: parseInt(components[2], 10)
    };

    if (components.length > 3)
    {
        color.a = parseInt(components[3], 10);
    }

    return color;
};


/**
 * Convert hexadecimal color string to rgb components.
 * @method  FORGE.Color.hexToRgb
 * @param  {string} hex - hexadecimal color string to convert.
 * @return {?RGBaColor} The rgb color in three components.
 */
FORGE.Color.hexToRgb = function(hex)
{
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b)
    {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Convert RGB into YCbCr color space
 * @method  FORGE.Color.rgbToYcbcr
 * @param  {RGBaColor} color color in RGB space ([0 .. 255])
 * @return {YCbCrColor} color in YCrCb space (Y,Cr,Cb [0 .. 255])
 */
FORGE.Color.rgbToYcbcr = function(color)
{
    var c = new THREE.Vector3(color.r, color.g, color.b);

    //jscs:disable
    var mat = new THREE.Matrix3().set(
         0.299,  0.587, 0.114,
        -0.169, -0.331, 0.500,
         0.500, -0.419, -0.081
    );
    //jscs:enable

    var offset = new THREE.Vector3(0, 128, 128);

    c.applyMatrix3(mat).add(offset);

    return {
        Y: c.x,
        Cr: c.y,
        Cb: c.z
    };
};

/**
 * Convert YCbCr into RGB color space
 * @method  FORGE.Color.ycbcrToRgb
 * @param {YCbCrColor} color color in YCrCb space (Y,Cr,Cb [0 .. 255])
 * @return  {RGBaColor} color in RGB space ([0 .. 255])
 */
FORGE.Color.ycbcrToRgb = function(color)
{
    var c = new THREE.Vector3(color.Y, color.Cr, color.Cb);

    var offset = new THREE.Vector3(0, -128, -128);

    //jscs:disable
    var mat = new THREE.Matrix3().set(
        1.000,  0.000,  1.400,
        1.000, -0.343, -0.711,
        1.000,  1.765,  0.000
    );
    //jscs:enable

    c.add(offset).applyMatrix3(mat);

    return {
        r: c.x,
        g: c.y,
        b: c.z
    };
};

/**
 * Rotate color in YCbCr color space
 * @method FORGE.Color.ycbcrRotate
 * @param {YCbCrColor} color YCbCr color
 * @param {number} angle rotation angle (degrees)
 * @return  {YCbCrColor} YCbCr rotated color
 */
FORGE.Color.ycbcrRotate = function(color, angle)
{
    var theta = FORGE.Math.degToRad(angle);
    var c = Math.cos(theta), s = Math.sin(theta);

    return {
        Y: color.Y,
        Cb: color.Cb * c - color.Cr * s,
        Cr: color.Cb * s + color.Cr * c
    };
};

/**
 * Evaluate euclidian distance between two colors
 * @param  {YCbCrColor} a 1st color in YCrCb colorspace
 * @param  {YCbCrColor} b 2nd color in YCrCb colorspace
 * @return {number} distance
 */
FORGE.Color.distance = function(a, b)
{
    return Math.sqrt((a.Cb - b.Cb) * (a.Cb - b.Cb) + (a.Cr - b.Cr) * (a.Cr - b.Cr));
};
