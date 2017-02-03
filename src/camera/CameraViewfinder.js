/**
 * Camera viewfinder
 *
 * @constructor FORGE.CameraViewfinder
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @param {string} type - viewfinder type
 * @extends {FORGE.BaseObject}
 */
FORGE.CameraViewfinder = function(viewer, type)
{
    /**
     * The viewer reference.
     * @name FORGE.CameraViewfinder#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Viewfinder type
     * @name FORGE.CameraViewfinder#_type
     * @type {string}
     * @private
     */
    this._type = type || FORGE.CameraViewfinderType.RING;

    /**
     * THREE object
     * @name FORGE.CameraViewfinder#_object
     * @type {THREE.Object3D}
     * @private
     */
    this._object = null;

    FORGE.BaseObject.call(this, "CameraViewfinder");

    this._boot();
};

FORGE.CameraViewfinder.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.CameraViewfinder.prototype.constructor = FORGE.CameraViewfinder;


/**
 * Boot sequence.
 * @method FORGE.CameraViewfinder#_boot
 * @private
 */
FORGE.CameraViewfinder.prototype._boot = function()
{
    this._object = this._createMesh();
    this._object.name = "CameraViewfinder";
    this._object.position.z = -2;
};

/**
 * Create ring object.
 * @method FORGE.CameraViewfinder#_createObjectRing
 * @return {THREE.Mesh} mesh ring
 * @private
 */
FORGE.CameraViewfinder.prototype._createObjectRing = function()
{
    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
    });

    var geometry = new THREE.RingBufferGeometry(0.02, 0.04, 32);

    return new THREE.Mesh(geometry, material);
};

/**
 * Create crosshair object.
 * @method FORGE.CameraViewfinder#_createObjectCrosshair
 * @return {THREE.Line} crosshair line
 * @private
 */
FORGE.CameraViewfinder.prototype._createObjectCrosshair = function()
{
    var material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 4,
        opacity: 0.5,
        transparent: true
    });

    //jscs:disable
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0));
    geometry.vertices.push(new THREE.Vector3(-0.02,  0, 0));
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0));
    geometry.vertices.push(new THREE.Vector3( 0.02,  0, 0));
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0));
    geometry.vertices.push(new THREE.Vector3( 0,  0.02, 0));
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0));
    geometry.vertices.push(new THREE.Vector3( 0, -0.02, 0));
    //jscs:enable

    return new THREE.Line(geometry, material);
};

/**
 * Create object.
 * @method FORGE.CameraViewfinder#_createMesh
 * @private
 */
FORGE.CameraViewfinder.prototype._createMesh = function()
{
    switch (this._type)
    {
        case FORGE.CameraViewfinderType.CROSSHAIR:
            return this._createObjectCrosshair();

        case FORGE.CameraViewfinderType.RING:
        default:
            return this._createObjectRing();
    }
};

/**
 * Destroy sequence.
 * @method FORGE.CameraViewfinder#destroy
 */
FORGE.CameraViewfinder.prototype.destroy = function()
{
    if (this._object !== null)
    {
        this._object.geometry.dispose();
        this._object.material.dispose();
        this._object = null;
    }

    this._scene = null;
};

/**
 * Viewfinder visibility.
 * @name FORGE.CameraViewfinder#visible
 * @type {boolean}
 */
Object.defineProperty(FORGE.CameraViewfinder.prototype, "visible",
{
    /** @this {FORGE.CameraViewfinder} */
    get: function()
    {
        return this._object.visible;
    },

    /** @this {FORGE.CameraViewfinder} */
    set: function(value)
    {
        this._object.visible = value;
    }
});

/**
 * Viewfinder object
 * @name FORGE.CameraViewfinder#object
 * @readonly
 * @type {THREE.Mesh}
  */
Object.defineProperty(FORGE.CameraViewfinder.prototype, "object",
{
    /** @this {FORGE.CameraViewfinder} */
    get: function()
    {
        return this._object;
    }
});


