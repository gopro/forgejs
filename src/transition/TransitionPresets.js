
/**
 * @namespace {Object} FORGE.TransitionPresets
 */
FORGE.TransitionPresets = {};

/**
 * @name FORGE.TransitionPresets.NONE
 * @type {TransitionConfig}
 * @const
 */
FORGE.TransitionPresets.NONE =
{
    uid: "forge-transition-preset-none"
};

/**
 * @name FORGE.TransitionPresets.SLIDE
 * @type {TransitionConfig}
 * @const
 */
FORGE.TransitionPresets.SLIDE =
{
    uid: "forge-transition-preset-slide",

    screen:
    {
        type: "slide",
        easing: FORGE.Easing.LINEAR,
        duration: 2000
    }
};

/**
 * @name FORGE.TransitionPresets.BLEND
 * @type {TransitionConfig}
 * @const
 */
FORGE.TransitionPresets.BLEND =
{
    uid: "forge-transition-preset-blend",

    screen:
    {
        type: "blend",
        easing: FORGE.Easing.LINEAR,
        duration: 2000
    }
};

/**
 * @name FORGE.TransitionPresets.SPHERICAL
 * @type {TransitionConfig}
 * @const
 */
FORGE.TransitionPresets.SPHERICAL =
{
    uid: "forge-transition-preset-spherical",

    background:
    {
        type: 2,
        easing: FORGE.Easing.LINEAR,
        duration: 2000
    }
};