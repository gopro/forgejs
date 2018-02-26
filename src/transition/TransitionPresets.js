
/**
 * @namespace {Object} FORGE.TransitionPresets
 */
FORGE.TransitionPresets = {};

/**
 * @name FORGE.TransitionPresets.NONE
 * @type {LayoutConfig}
 * @const
 */
FORGE.TransitionPresets.NONE =
{
    uid: "forge-transition-preset-none",
    name: "None",
    type: null,
    duration: 0
};

/**
 * @name FORGE.TransitionPresets.SLIDE
 * @type {LayoutConfig}
 * @const
 */
FORGE.TransitionPresets.SLIDE =
{
    uid: "forge-transition-preset-slide",
    name: "Screen slide",
    type: "screen",
    duration: 500
};

/**
 * @name FORGE.TransitionPresets.SPHERICAL
 * @type {LayoutConfig}
 * @const
 */
FORGE.TransitionPresets.SPHERICAL =
{
    uid: "forge-transition-preset-spherical",
    name: "Spherical",
    type: "spherical",
    duration: 500
};