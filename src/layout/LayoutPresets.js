
/**
 * @namespace {Object} FORGE.LayoutPresets
 */
FORGE.LayoutPresets = {};


/**
 * @name FORGE.LayoutPresets.SINGLE
 * @type {LayoutConfig}
 * @const
 */
FORGE.LayoutPresets.SINGLE =
{
    uid: "forge-layout-preset-single",
    name: "Single",
    viewports :
    [
        {
            rectangle: { x: 0, y: 0, width: 100, height: 100 }
        }
    ]
};

/**
 * @name FORGE.LayoutPresets.VR
 * @type {LayoutConfig}
 * @const
 */
FORGE.LayoutPresets.VR =
{
    uid: "forge-layout-preset-vr",
    name: "VR",
    viewports :
    [
        {
            rectangle: { x: 0, y: 0, width: 50, height: 100 },
            vr: true
        },

        {
            rectangle: { x: 50, y: 0, width: 50, height: 100 },
            vr: true
        }
    ]
};

/**
 * @name FORGE.LayoutPresets.SINGLE
 * @type {LayoutConfig}
 * @const
 */
FORGE.LayoutPresets.TWO_BY_TWO =
{
    uid: "forge-layout-preset-two-by-two",
    name: "Two by two",
    viewports :
    [
        {
            rectangle: { x: 0, y: 0, width: 50, height: 50 }
        },

        {
            rectangle: { x: 50, y: 0, width: 50, height: 50 }
        },

        {
            rectangle: { x: 0, y: 50, width: 50, height: 50 }
        },

        {
            rectangle: { x: 50, y: 50, width: 50, height: 50 }
        }
    ]
};
