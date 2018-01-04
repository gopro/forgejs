/**
 * FORGE.BackgroundSphereRenderer
 * BackgroundSphereRenderer class.
 *
 * @constructor FORGE.BackgroundSphereRenderer
 * @extends {FORGE.BackgroundMeshRenderer}
 *
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 */
FORGE.BackgroundSphereRenderer = function(viewer, sceneRenderer)
{
    FORGE.BackgroundMeshRenderer.call(this, viewer, sceneRenderer, "BackgroundSphereRenderer");
};

FORGE.BackgroundSphereRenderer.prototype = Object.create(FORGE.BackgroundMeshRenderer.prototype);
FORGE.BackgroundSphereRenderer.prototype.constructor = FORGE.BackgroundSphereRenderer;

/**
 * Boot routine.
 * @method FORGE.BackgroundSphereRenderer#_boot
 * @private
 */
FORGE.BackgroundSphereRenderer.prototype._boot = function()
{
    FORGE.BackgroundMeshRenderer.prototype._boot.call(this);

    this._subdivision = 64;

    this._bootComplete();
};

/**
 * Return an array containing each coord for the uv mapping of the sphere geometry
 * @method FORGE.BackgroundSphereRenderer#_computeUVMap
 * @return {Float32Array} The array containing the UVs
 * @private
 */
FORGE.BackgroundSphereRenderer.prototype._computeUVMap = function()
{
    // the final array of uv coord for mapping
    var uvMap = new Float32Array(this._mesh.geometry.attributes.uv.array.byteLength / 4);

    // iterator accross the uv coord
    var it = uvMap.keys();

    var div = this._subdivision;
    var d = 1 / div;

    var ix, iy;

    for (iy = 0; iy <= div; iy++)
    {
        var v = iy * d;

        for (ix = 0; ix <= div; ix++)
        {
            var u = ix * d;
            uvMap[it.next().value] = 1 - u;
            uvMap[it.next().value] = 1 - v;
        }
    }

    return uvMap;
};

/**
 * Create geometry
 * @method FORGE.BackgroundSphereRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundSphereRenderer.prototype._createGeometry = function()
{
    return new THREE.SphereBufferGeometry(this._size, this._subdivision, this._subdivision);
};

/**
 * It will be called if it exists, once the mesh is created
 * @method FORGE.BackgroundSphereRenderer#_onMeshCreated
 * @private
 */
FORGE.BackgroundSphereRenderer.prototype._onMeshCreated = function()
{
    // Equirectangular mapping on a sphere needs a yaw shift of PI/2 to set front at center of the texture
    if (this._media.source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
    {
        this._mesh.rotation.set(0, Math.PI / 2, 0, "YXZ");
    }

    this._mesh.geometry.attributes.uv.set(this._computeUVMap());

    FORGE.BackgroundMeshRenderer.prototype._onMeshCreated.call(this);
};
