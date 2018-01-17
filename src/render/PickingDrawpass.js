/**
 * FORGE.PickingDrawpass
 * PickingDrawpass class.
 *
 * @constructor FORGE.PickingDrawpass
 * 
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingDrawpass = function(viewer)
{
    this._material = null;

    this._renderTarget = null;

    FORGE.Picking.call(this, viewer, "PickingDrawpass");
};

FORGE.PickingDrawpass.prototype = Object.create(FORGE.Picking.prototype);
FORGE.PickingDrawpass.prototype.constructor = FORGE.PickingDrawpass;

/**
 * Boot sequence.
 * @method FORGE.PickingDrawpass#_boot
 * @private
 */
FORGE.PickingDrawpass.prototype._boot = function()
{
    // var shader = FORGE.Utils.clone(this._sceneRenderer.view.current.shaderWTS.mapping);
    // shader.uniforms.tColor = { type: "c", value: new THREE.Color( 0x000000 ) };

    // this._material = new THREE.RawShaderMaterial({
    //     fragmentShader: FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_frag_color),
    //     vertexShader: FORGE.ShaderLib.parseIncludes(shader.vertexShader),
    //     uniforms: shader.uniforms,
    //     side: THREE.FrontSide,
    //     name: "Picking"
    // });

    // this._material = new THREE.MeshBasicMaterial({color: new THREE.Color("#07f")});
    // this._material.name = "PickingMaterial";

    FORGE.Picking.prototype._boot.call(this);
};

/**
 * Update.
 * @method FORGE.PickingDrawpass#render
 * @param {THREE.Scene} scene - scene with objects
 * @param {THREE.Camera} camera - camera
 * @param {THREE.WebGLRenderTarget} target - render target
 * @param {FORGE.ViewType} viewType - type of view (objects projection)
 */
FORGE.PickingDrawpass.prototype.render = function(scene, camera, target, viewType)
{
    var x = this._sceneRenderer.viewport.x + 20;
    var y = this._sceneRenderer.viewport.y + 20;
    var w = this._sceneRenderer.viewport.width * 0.2;
    var h = this._sceneRenderer.viewport.height * 0.2;

    target.viewport.set(x, y, w, h);
    target.scissor.set(x, y, w, h);
    target.scissorTest = true;

    scene.overrideMaterial = this._viewer.renderer.getMaterialForView(viewType, "picking");

    this._viewer.renderer.webGLRenderer.render(scene, camera, target, false);

    // Restore scene params
    scene.overrideMaterial = null;
};

/**
 * Destroy sequence.
 * @method FORGE.PickingDrawpass#destroy
 */
FORGE.PickingDrawpass.prototype.destroy = function()
{
    FORGE.Picking.prototype.destroy.call(this);
};

