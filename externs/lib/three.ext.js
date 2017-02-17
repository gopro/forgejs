/**
 * Simple extern file for THREEjs, used in ForgeJS player.
 * Only include used methods from THREEjs. There may be some
 * custom methods, not officially in THREEjs that we added.
 */

/**
 * @const
 */
var THREE = {};

/**
 * @const
 * @type {number}
 */
THREE.ClampToEdgeWrapping;

/**
 * @const
 * @type {number}
 */
THREE.LinearFilter;

/**
 * @const
 * @type {number}
 */
THREE.NearestFilter;

/**
 * @const
 * @type {number}
 */
THREE.RGBFormat;

/**
 * @const
 * @type {number}
 */
THREE.RGBAFormat;

/**
 * @const
 * @type {number}
 */
THREE.FrontSide;

/**
 * @const
 * @type {number}
 */
THREE.BackSide;

/**
 * @const
 * @type {Object}
 */
THREE.ShaderLib;

/**
 * @const
 * @type {Object}
 */
THREE.ShaderChunk;

/**
 * @const
 * @type {Object}
 */
THREE.ShaderLib.equirect;

/**
 * @const
 * @type {number}
 */
THREE.DoubleSide;

/**
 * @const
 * @type {number}
 */
THREE.CustomBlending;

/**
 * @const
 * @type {number}
 */
THREE.AddEquation;

/**
 * @const
 * @type {number}
 */
THREE.SrcAlphaFactor;

/**
 * @const
 * @type {number}
 */
THREE.OneMinusSrcAlphaFactor;

/**
 * @constructor
 * @param {Object=} arg1
 * @return {!THREE.WebGLRenderer}
 */
THREE.WebGLRenderer = function(arg1) {};

/** @type {HTMLElement} */
THREE.WebGLRenderer.prototype.domElement;

/** @type {boolean} */
THREE.WebGLRenderer.prototype.autoClear;

/** @type {boolean} */
THREE.WebGLRenderer.prototype.autoClearDepth;

/** @type {boolean} */
THREE.WebGLRenderer.prototype.autoClearColor;

/** @type {boolean} */
THREE.WebGLRenderer.prototype.sortObjects;


/**
 */
THREE.WebGLRenderer.prototype.clearColor = function() {};

/**
 * @return {THREE.WebGLRenderer}
 */
THREE.WebGLRenderer.prototype.clearDepth = function() {};

/**
 * @return {WebGLRenderingContext}
 */
THREE.WebGLRenderer.prototype.getContext = function() {};

/**
 * @return {{width:number, height:number}}
 */
THREE.WebGLRenderer.prototype.getSize = function() {};

/**
 * @param {THREE.Scene} arg1
 * @param {THREE.Camera} arg2
 * @param {THREE.WebGLRenderTarget=} arg3
 * @param  {boolean=} arg4
 */
THREE.WebGLRenderer.prototype.render = function(arg1, arg2, arg3, arg4) {};

/**
 * @param {number} arg1
 * @param {number} arg2
 * @param {boolean=} arg3
 * @return {THREE.WebGLRenderer}
 */
THREE.WebGLRenderer.prototype.setSize = function(arg1, arg2, arg3) {};

/**
 * @param {number} arg1
 * @return {THREE.WebGLRenderer}
 */
THREE.WebGLRenderer.prototype.setPixelRatio = function(arg1) {};

/**
 * @return {number}
 */
THREE.WebGLRenderer.prototype.getPixelRatio = function() {};

/**
 * @param  {number} arg1
 * @param  {number} arg2
 * @param  {number} arg3
 * @param  {number} arg4
 */
THREE.WebGLRenderer.prototype.setViewport = function(arg1, arg2, arg3, arg4) {};

/**
 * @param  {THREE.WebGLRenderTarget} arg1
 * @param  {number} arg2
 * @param  {number} arg3
 * @param  {number} arg4
 * @param  {number} arg5
 * @param  {Uint8Array} arg6
 */
THREE.WebGLRenderer.prototype.readRenderTargetPixels = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {Object=} arg3
 * @return {!THREE.WebGLRenderTarget}
 */
THREE.WebGLRenderTarget = function(arg1, arg2, arg3) {};

/** @type {THREE.Texture} */
THREE.WebGLRenderTarget.prototype.texture;

/**
 */
THREE.WebGLRenderTarget.prototype.dispose = function() {};

/**
 * @param {number} arg1
 * @param {number} arg2
 */
THREE.WebGLRenderTarget.prototype.setSize = function(arg1, arg2) {};

/**
 * @constructor
 * @return {!THREE.TextureLoader}
 */
THREE.TextureLoader = function() {};

/**
 * @param  {string} arg1
 * @param  {function(THREE.Texture): undefined} arg2
 * @param  {function(XMLHttpRequest): undefined} arg3
 * @param  {function(XMLHttpRequest): undefined} arg4
 */
THREE.TextureLoader.prototype.load = function(arg1, arg2, arg3, arg4) {};

/**
 * @constructor
 * @return {!THREE.Clock}
 */
THREE.Clock = function() {};

/**
 * @return {number}
 */
THREE.Clock.prototype.getDelta = function() {};

/**
 * @constructor
 * @return {!THREE.Pass}
 */
THREE.Pass = function() {};

/** @type {(Object<string,TShaderUniform>|FORGEUniform)} */
THREE.Pass.prototype.uniforms;

/** @type {boolean} */
THREE.Pass.prototype.enabled;

/** @type {boolean} */
THREE.Pass.prototype.needsSwap;

/** @type {boolean} */
THREE.Pass.prototype.clear;

/** @type {boolean} */
THREE.Pass.prototype.renderToScreen;

/**
 * @constructor
 * @param {Object} arg1
 * @param {string=} arg2
 * @extends {THREE.Pass}
 * @return {!THREE.ShaderPass}
 */
THREE.ShaderPass = function(arg1, arg2) {};

/**
 * @param {THREE.WebGLRenderer} arg1
 * @param {THREE.WebGLRenderTarget} arg2
 * @param {THREE.WebGLRenderTarget} arg3
 * @param {number=} arg4
 * @param {boolean=} arg5
 */
THREE.ShaderPass.prototype.render = function(arg1, arg2, arg3, arg4, arg5) {};

/**
 * @constructor
 * @param {Object} arg1
 * @param {number=} arg2
 * @extends {THREE.Pass}
 * @return {!THREE.TexturePass}
 */
THREE.TexturePass = function(arg1, arg2) {};

/** @type {?THREE.Texture} */
THREE.TexturePass.prototype.map;

/**
 * @constructor
 * @param {THREE.Scene} arg1
 * @param {THREE.Camera} arg2
 * @param {THREE.Material=} arg3
 * @param {THREE.Color=} arg4
 * @param {boolean=} arg5
 * @extends {THREE.Pass}
 * @return {!THREE.RenderPass}
 */
THREE.RenderPass = function(arg1, arg2, arg3, arg4, arg5) {};

/** @type {THREE.Material} */
THREE.RenderPass.prototype.overrideMaterial;

/**
 * @constructor
 * @param {Object} arg1
 * @param {string=} arg2
 * @extends {THREE.Pass}
 * @return {!THREE.MaskPass}
 */
THREE.MaskPass = function(arg1, arg2) {};

/**
 * @constructor
 * @param {Object} arg1
 * @param {string=} arg2
 * @extends {THREE.Pass}
 * @return {!THREE.ClearMaskPass}
 */
THREE.ClearMaskPass = function(arg1, arg2) {};

/**
 * @constructor
 * @param {THREE.WebGLRenderer} arg1
 * @param {THREE.WebGLRenderTarget=} arg2
 * @return {!THREE.EffectComposer}
 */
THREE.EffectComposer = function(arg1, arg2) {};

/** @type {?THREE.WebGLRenderTarget} */
THREE.EffectComposer.prototype.writeBuffer;

/** @type {?THREE.WebGLRenderTarget} */
THREE.EffectComposer.prototype.readBuffer;

/** @type {boolean} */
THREE.EffectComposer.prototype.renderToScreen;

/** @type {Array<THREE.Pass>} */
THREE.EffectComposer.prototype.passes;

/**
 * @param {THREE.Pass} arg1
 */
THREE.EffectComposer.prototype.addPass = function(arg1) {};

/**
 * @param {THREE.Pass} arg1
 * @param  {number=} arg2
 */
THREE.EffectComposer.prototype.insertPass = function(arg1, arg2) {};

/**
 * @param  {number} arg1
 */
THREE.EffectComposer.prototype.render = function(arg1) {};

/**
 * @param  {number} arg1
 * @param  {number} arg2
 */
THREE.EffectComposer.prototype.setSize = function(arg1, arg2) {};

/**
 *
 */
THREE.EffectComposer.prototype.swapBuffers = function() {};

/**
 * @constructor
 * @param {number|string} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @return {!THREE.Color}
 */
THREE.Color = function(arg1, arg2, arg3) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @return {!THREE.Vector2}
 */
THREE.Vector2 = function(arg1, arg2) {};

/** @type {number} */
THREE.Vector2.prototype.x;

/** @type {number} */
THREE.Vector2.prototype.y;

/**
 * @param {(number)} arg1
 * @param {(number)} arg2
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.set = function(arg1, arg2) {};

/**
 * @param {(number|THREE.Vector2)} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.add = function(arg1) {};

/**
 * @param {THREE.Vector2} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.copy = function(arg1) {};

/**
 * @param {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.addScalar = function(arg1) {};

/**
 * @param {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.multiplyScalar = function(arg1) {};

/**
 * @param {THREE.Vector2} arg1
 * @param {THREE.Vector2} arg2
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.subVectors = function(arg1, arg2) {};

/**
 * @param  {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.divideScalar = function(arg1) {};

/**
 * @return {number}
 */
THREE.Vector2.prototype.length = function() {};

/**
 * @param  {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.setLength = function(arg1) {};

/**
 * @param  {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.setX = function(arg1) {};

/**
 * @param  {number} arg1
 * @return {THREE.Vector2}
 */
THREE.Vector2.prototype.setY = function(arg1) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @return {!THREE.Vector3}
 */
THREE.Vector3 = function(arg1, arg2, arg3) {};

/** @type {number} */
THREE.Vector3.prototype.x;

/** @type {number} */
THREE.Vector3.prototype.y;

/** @type {number} */
THREE.Vector3.prototype.z;

/**
 * @param {(number|THREE.Vector3)} arg1
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.add = function(arg1) {};

/**
 * @param {THREE.Matrix3} arg1
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.applyMatrix3 = function(arg1) {};

/**
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.clone = function() {};

/**
 * @param {THREE.Vector3} arg1
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.copy = function(arg1) {};

/**
 * @param {(Array|Float32Array)} arg1
 * @param {number=} arg2
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.fromArray = function(arg1, arg2) {};

/**
 * @param {(number|THREE.Vector3)} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.set = function(arg1, arg2, arg3) {};

/**
 * @param {THREE.Spherical} arg1
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.setFromSpherical = function(arg1) {};

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.Vector3}
 */
THREE.Vector3.prototype.applyQuaternion = function(arg1) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @return {!THREE.Vector4}
 */
THREE.Vector4 = function(arg1, arg2, arg3, arg4) {};

/** @type {number} */
THREE.Vector4.prototype.x;

/** @type {number} */
THREE.Vector4.prototype.y;

/** @type {number} */
THREE.Vector4.prototype.z;

/** @type {number} */
THREE.Vector4.prototype.w;

/**
 * @param {THREE.Matrix4} arg1
 * @return {THREE.Vector4}
 */
THREE.Vector4.prototype.applyMatrix4 = function(arg1) {};

/**
 * @return {THREE.Vector4}
 */
THREE.Vector4.prototype.normalize = function() {};

/**
 * @constructor
 * @return {!THREE.Matrix3}
 */
THREE.Matrix3 = function() {};

/**
 * @param {(number|THREE.Matrix3)} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @param {number=} arg5
 * @param {number=} arg6
 * @param {number=} arg7
 * @param {number=} arg8
 * @param {number=} arg9
 * @return {THREE.Matrix3}
 */
THREE.Matrix3.prototype.set = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {};

/**
 * @constructor
 * @return {!THREE.Matrix4}
 */
THREE.Matrix4 = function() {};

/** @type {Float32Array} */
THREE.Matrix4.prototype.elements;

/**
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.clone = function() {};

/**
 * @param {THREE.Matrix4} arg1
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.copy = function(arg1) {};

/**
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.transpose = function() {};

/**
 * @param {(number|THREE.Matrix3)} arg1
 * @param {...number} arg2
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.set = function(arg1, arg2) {};

/**
 * @param {THREE.Matrix4} arg1
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.multiply = function(arg1) {};

/**
 * @param {Float32Array} arg1
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.fromArray = function(arg1) {};

/**
 * @param {THREE.Matrix4} arg1
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.getInverse = function(arg1) {};

/**
 * @param  {number} arg1
 * @param  {number} arg2
 * @param  {number} arg3
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.makeTranslation = function(arg1, arg2, arg3) {};

/**
 * @param {THREE.Vector3} arg1
 * @param {THREE.Quaternion} arg2
 * @param {THREE.Vector3} arg3
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.decompose = function(arg1, arg2, arg3) {};

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.makeRotationFromQuaternion = function(arg1) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @return {!THREE.Spherical}
 */
THREE.Spherical = function(arg1, arg2, arg3) {};

/** @type {number} */
THREE.Spherical.prototype.radius;

/** @type {number} */
THREE.Spherical.prototype.phi;

/** @type {number} */
THREE.Spherical.prototype.theta;

/**
 * @param {THREE.Vector3} arg1
 */
THREE.Spherical.prototype.setFromVector3 = function(arg1) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @return {!THREE.Quaternion}
 */
THREE.Quaternion = function(arg1, arg2, arg3, arg4) {};

/** @type {number} */
THREE.Quaternion.prototype.x;

/** @type {number} */
THREE.Quaternion.prototype.y;

/** @type {number} */
THREE.Quaternion.prototype.z;

/** @type {number} */
THREE.Quaternion.prototype.w;

/**
 * @param {THREE.Quaternion} arg1
 * @param {THREE.Quaternion} arg2
 * @param {THREE.Quaternion} arg3
 * @param {number} arg4
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.slerp = function(arg1, arg2, arg3, arg4) {};

/**
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.inverse = function() {};

/**
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.normalize = function() {};

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.dot = function(arg1) {};

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.multiply = function(arg1) {};

/**
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.conjugate = function() {};

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.copy = function(arg1) {};

/**
 * @param {THREE.Matrix4} arg1
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.setFromRotationMatrix = function(arg1) {};

/**
 * @param {THREE.Euler} arg1
 * @return {THREE.Quaternion}
 */
THREE.Quaternion.prototype.setFromEuler = function(arg1) {};

/**
 * @constructor
 * @param {Object|number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {string=} arg4
 * @return {!THREE.Euler}
 */
THREE.Euler = function(arg1, arg2, arg3, arg4) {};

/** @type {number} */
THREE.Euler.prototype.x;

/** @type {number} */
THREE.Euler.prototype.y;

/** @type {number} */
THREE.Euler.prototype.z;

/** @type {string} */
THREE.Euler.prototype.order;

/**
 * @param {THREE.Quaternion} arg1
 * @param {string} arg2
 * @return {THREE.Euler}
 */
THREE.Euler.prototype.setFromQuaternion = function(arg1, arg2) {};

/**
 * @param {number} arg1
 * @param {number} arg2
 * @param {number} arg3
 * @param {string} arg4
 * @return {THREE.Euler}
 */
THREE.Euler.prototype.set = function(arg1, arg2, arg3, arg4) {};

/**
 * @constructor
 * @param {THREE.Geometry|THREE.BufferGeometry=} arg1
 * @param {THREE.Material=} arg2
 * @extends {THREE.Object3D}
 * @return {!THREE.Line}
 */
THREE.Line = function(arg1, arg2) {};

/**
 */
THREE.Geometry.prototype.dispose = function() {};

/**
 * @constructor
 * @param {number} arg1
 * @param {number} arg2
 * @param {number} arg3
 * @extends {THREE.Geometry}
 * @return {!THREE.PlaneGeometry}
 */
THREE.PlaneGeometry = function(arg1, arg2, arg3) {};


/**
 * @constructor
 * @param {Object} arg1
 * @param {THREE.WebGLProgram} arg2
 * @param {THREE.WebGLRenderer} arg3
 * @return {!THREE.WebGLUniforms}
 */
THREE.WebGLUniforms = function(arg1, arg2, arg3) {};

/** @type {Object} */
THREE.WebGLUniforms.prototype.map;

/** @type {Object} */
THREE.WebGLUniforms.prototype.seq;

/**
 * @param {Object} arg1
 * @param {string} arg2
 * @param {number} arg3
 */
THREE.WebGLUniforms.prototype.setValue = function(arg1, arg2, arg3) {};

/**
 * @constructor
 * @param {THREE.WebGLRenderer} arg1
 * @param {string} arg2
 * @param {THREE.Material} arg3
 * @param {Object} arg4
 * @return {!THREE.WebGLProgram}
 */
THREE.WebGLProgram = function(arg1, arg2, arg3, arg4) {};

/**
 * @return {Object}
 */
THREE.WebGLProgram.prototype.getUniforms = function() {};

/** @type {number} */
THREE.WebGLProgram.prototype.program;

/**
 * @constructor
 * @return {!THREE.Material}
 */
THREE.Material = function() {};

/** @type {THREE.WebGLProgram} */
THREE.Material.prototype.program;

/**
 */
THREE.Material.prototype.dispose = function() {};

/**
 * @constructor
 * @param {{color:(number|undefined), linewidth:(number|undefined), linecap:(string|undefined), linejoin:(string|undefined), vertexColors:(number|undefined), fog:(boolean|undefined)}=} arg1
 * @extends {THREE.Material}
 * @return {!THREE.LineBasicMaterial}
 */
THREE.LineBasicMaterial = function(arg1) {};

/**
 * @constructor
 * @param {{uniforms:FORGEUniform, vertexShader:string, fragmentShader:string, side:number}=} arg1
 * @extends {THREE.Material}
 * @return {!THREE.ShaderMaterial}
 */
THREE.ShaderMaterial = function(arg1) {};

/** @type {number} */
THREE.ShaderMaterial.prototype.id;

/** @type {Object<string,TShaderUniform>|FORGEUniform} */
THREE.ShaderMaterial.prototype.uniforms;

/**
 * @constructor
 * @param {{uniforms:FORGEUniform, vertexShader:string, fragmentShader:string, side:number}=} arg1
 * @extends {THREE.ShaderMaterial}
 * @return {!THREE.RawShaderMaterial}
 */
THREE.RawShaderMaterial = function(arg1) {};

/** @type {number} */
THREE.RawShaderMaterial.prototype.id;

/** @type {Object<string,TShaderUniform>|FORGEUniform} */
THREE.RawShaderMaterial.prototype.uniforms;

/**
 * @constructor
 * @param {MeshBasicMaterialOptions} arg1
 * @extends {THREE.Material}
 * @return {!THREE.MeshBasicMaterial}
 */
THREE.MeshBasicMaterial = function(arg1) {};

/**
 * @constructor
 * @return {!THREE.Object3D}
 */
THREE.Object3D = function() {};

/** @type {Array<THREE.Object3D>} */
THREE.Object3D.prototype.children;

/** @type {number} */
THREE.Object3D.prototype.id;

/** @type {THREE.Quaternion} */
THREE.Object3D.prototype.quaternion;

/** @type {THREE.Layer} */
THREE.Object3D.prototype.layers;

/** @type {THREE.Matrix4} */
THREE.Object3D.prototype.matrixWorld;

/** @type {boolean} */
THREE.Object3D.prototype.matrixAutoUpdate;

/** @type {?THREE.Vector3} */
THREE.Object3D.prototype.position;

/** @type {?THREE.Euler} */
THREE.Object3D.prototype.rotation;

/** @type {THREE.Vector3} */
THREE.Object3D.prototype.scale;

/**
 * @param {THREE.WebGLRenderer} arg1
 * @param {THREE.Scene} arg2
 * @param {THREE.Camera} arg3
 * @param {THREE.Geometry} arg4
 * @param {THREE.Material} arg5
 * @param {THREE.Group} arg6
 */
THREE.Object3D.prototype.onBeforeRender = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/**
 * @param {THREE.WebGLRenderer} arg1
 * @param {THREE.Scene} arg2
 * @param {THREE.Camera} arg3
 * @param {THREE.Geometry} arg4
 * @param {THREE.Material} arg5
 * @param {THREE.Group} arg6
 */
THREE.Object3D.prototype.onAfterRender = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/**
 * @param {...THREE.Object3D} arg1
 */
THREE.Object3D.prototype.add = function(arg1) {};

/**
 * @param {...THREE.Object3D} arg1
 */
THREE.Object3D.prototype.remove = function(arg1) {};

/**
 * @param {THREE.Vector3} arg1
 * @param {number} arg2
 */
THREE.Object3D.prototype.translateOnAxis = function(arg1, arg2) {};

/**
 * @param {boolean} arg1
 */
THREE.Object3D.prototype.updateMatrixWorld = function(arg1) {};

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @return {!THREE.Group}
 */
THREE.Group = function() {};

/**
 * @constructor
 * @param {(THREE.Geometry|THREE.BufferGeometry)=} arg1
 * @param {THREE.Material=} arg2
 * @extends {THREE.Line}
 * @return {!THREE.LineSegments}
 */
THREE.LineSegments = function(arg1, arg2) {};

/** @type {?THREE.Geometry} */
THREE.LineSegments.prototype.geometry;

/** @type {?THREE.Material} */
THREE.LineSegments.prototype.material;

/**
 * @constructor
 * @param {THREE.Geometry|THREE.BufferGeometry=} arg1
 * @param {THREE.Material=} arg2
 * @extends {THREE.Object3D}
 * @return {!THREE.Mesh}
 */
THREE.Mesh = function(arg1, arg2) {};

/** @type {?THREE.Geometry|THREE.BufferGeometry?} */
THREE.Mesh.prototype.geometry;

/** @type {?THREE.Material} */
THREE.Mesh.prototype.material;

/**
 * @param {number} arg1
 * @return {THREE.Mesh}
 */
THREE.Mesh.prototype.rotateX = function(arg1) {};

/**
 * @param {number} arg1
 * @return {THREE.Mesh}
 */
THREE.Mesh.prototype.rotateY = function(arg1) {};

/**
 * @param {number} arg1
 * @return {THREE.Mesh}
 */
THREE.Mesh.prototype.rotateZ = function(arg1) {};

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @return {!THREE.Camera}
 */
THREE.Camera = function() {};

/** @type {THREE.Matrix4} */
THREE.Camera.prototype.matrixWorldInverse;

/** @type {THREE.Matrix4} */
THREE.Camera.prototype.projectionMatrix;

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @extends {THREE.Camera}
 * @return {!THREE.PerspectiveCamera}
 */
THREE.PerspectiveCamera = function(arg1, arg2, arg3, arg4) {};

/** @type {number} */
THREE.PerspectiveCamera.prototype.fov;

/** @type {number} */
THREE.PerspectiveCamera.prototype.aspect;

/** @type {number} */
THREE.PerspectiveCamera.prototype.near;

/** @type {number} */
THREE.PerspectiveCamera.prototype.far;

/**
 * @param {THREE.Quaternion} arg1
 * @return {THREE.PerspectiveCamera}
 */
THREE.PerspectiveCamera.prototype.applyQuaternion = function(arg1) {};

/**
 * @return {THREE.PerspectiveCamera}
 */
THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function() {};

/**
 * @return {THREE.PerspectiveCamera}
 */
THREE.PerspectiveCamera.prototype.clone = function() {};

/**
 * @constructor
 * @param {number} arg1
 * @param {number} arg2
 * @param {number} arg3
 * @param {number} arg4
 * @param {number} arg5
 * @param {number} arg6
 * @extends {THREE.Camera}
 * @return {!THREE.OrthographicCamera}
 */
THREE.OrthographicCamera = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/**
 * @constructor
 * @return {!THREE.Raycaster}
 */
THREE.Raycaster = function() {};

/**
 * @param {THREE.Vector2} arg1
 * @param {THREE.PerspectiveCamera} arg2
 */
THREE.Raycaster.prototype.setFromCamera = function(arg1, arg2) {};

/**
 * @param {Array} arg1
 * @return {Array}
 */
THREE.Raycaster.prototype.updateProjectionMatrix = function(arg1) {};

/**
 * @param {Array<THREE.Object3D>} arg1
 * @return {Array<IntersectedObject>}
 */
THREE.Raycaster.prototype.intersectObjects = function(arg1) {};

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @return {!THREE.Scene}
 */
THREE.Scene = function() {};

/**
 * @constructor
 * @param {(Element|HTMLElement)=} arg1
 * @return {!THREE.Texture}
 */
THREE.Texture = function(arg1) {};

/** @const */
THREE.Texture.DEFAULT_IMAGE = undefined;

/** @const */
THREE.Texture.DEFAULT_MAPPING = {};

/** @type {?string} */
THREE.Texture.prototype.uuid;

/** @type {Image} */
THREE.Texture.prototype.image;

/** @type {number} */
THREE.Texture.prototype.format;

/** @type {Object} */
THREE.Texture.prototype.mapping;

/** @type {number} */
THREE.Texture.prototype.magFilter;

/** @type {number} */
THREE.Texture.prototype.minFilter;

/** @type {number} */
THREE.Texture.prototype.wrapS;

/** @type {number} */
THREE.Texture.prototype.wrapT;

/** @type {boolean} */
THREE.Texture.prototype.generateMipmaps;

/** @type {boolean} */
THREE.Texture.prototype.needsUpdate;

/**
 */
THREE.Texture.prototype.dispose = function() {};

/**
 * @constructor
 * @return {!THREE.Geometry}
 */
THREE.Geometry = function() {};

/** @type {Array<THREE.Vector3>} */
THREE.Geometry.prototype.vertices;

/**
 * @constructor
 * @return {!THREE.BufferGeometry}
 */
THREE.BufferGeometry = function() {};

/** @type {{position:(THREE.BufferAttribute|undefined), normal:(THREE.BufferAttribute|undefined), color:(THREE.BufferAttribute|undefined), index:(THREE.BufferAttribute|undefined), uv:(THREE.BufferAttribute|undefined)}} */
THREE.BufferGeometry.prototype.attributes;

/**
 * @param  {number} arg1
 * @param  {number} arg2
 * @param  {number} arg3
 */
THREE.BufferGeometry.prototype.scale = function(arg1, arg2, arg3) {};

/**
 * @constructor
 * @param {(THREE.Geometry|THREE.BufferGeometry)} arg1
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.WireframeGeometry}
 */
THREE.WireframeGeometry = function(arg1) {};

/**
 * @constructor
 * @param  {TypedArray} array
 * @param  {number} itemSize
 * @param  {boolean=} normalized
 * @return {!THREE.BufferAttribute}
 */
THREE.BufferAttribute = function(array, itemSize, normalized) {};

/** @type {TypedArray} */
THREE.BufferAttribute.prototype.array;

/** @type {number} */
THREE.BufferAttribute.prototype.itemSize;

/** @type {number} */
THREE.BufferAttribute.prototype.count;

/** @type {boolean} */
THREE.BufferAttribute.prototype.needsUpdate;

/** @type {boolean} */
THREE.BufferAttribute.prototype.normalized;

/** @type {number} */
THREE.BufferAttribute.prototype.version;

/**
 * @param {Array<number>|TypedArray} arg1
 */
THREE.BufferAttribute.prototype.set = function(arg1) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @param {number=} arg5
 * @param {number=} arg6
 * @param {number=} arg7
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.SphereBufferGeometry}
 */
THREE.SphereBufferGeometry = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @param {number=} arg5
 * @param {boolean=} arg6
 * @param {number=} arg7
 * @param {number=} arg8
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.CylinderBufferGeometry}
 */
THREE.CylinderBufferGeometry = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {};

/**
 * @constructor
 * @param {number=} arg1
 * @param {number=} arg2
 * @param {number=} arg3
 * @param {number=} arg4
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.PlaneBufferGeometry}
 */
THREE.PlaneBufferGeometry = function(arg1, arg2, arg3, arg4) {};

/**
 * @constructor
 * @param {number} arg1
 * @param {number} arg2
 * @param {number} arg3
 * @param {number=} arg4
 * @param {number=} arg5
 * @param {number=} arg6
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.BoxBufferGeometry}
 */
THREE.BoxBufferGeometry = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/** @type {{position:(THREE.BufferAttribute|undefined), normal:(THREE.BufferAttribute|undefined), color:(THREE.BufferAttribute|undefined), index:(THREE.BufferAttribute|undefined), uv:(THREE.BufferAttribute|undefined)}} */
THREE.BoxBufferGeometry.prototype.attributes;

/**
 * @param {string} name
 * @param {THREE.BufferAttribute} attribute
 */
THREE.BoxBufferGeometry.prototype.addAttribute = function(name, attribute) {};

/**
 * @constructor
 * @param {number} arg1
 * @param {number} arg2
 * @param {number} arg3
 * @param {number=} arg4
 * @param {number=} arg5
 * @param {number=} arg6
 * @extends {THREE.BufferGeometry}
 * @return {!THREE.RingBufferGeometry}
 */
THREE.RingBufferGeometry = function(arg1, arg2, arg3, arg4, arg5, arg6) {};

/**
 * @constructor
 */
THREE.Layer = function() {};

/** @type {number} */
THREE.Layer.prototype.mask;

/**
 * @param {number} arg1
 */
THREE.Layer.prototype.enable = function(arg1) {};

/**
 * @param {number} arg1
 */
THREE.Layer.prototype.disable = function(arg1) {};

/**
 * @param {number} arg1
 */
THREE.Layer.prototype.toggle = function(arg1) {};

/**
 * @param {number} arg1
 */
THREE.Layer.prototype.set = function(arg1) {};

/**
 * @param {THREE.Layer} arg1
 */
THREE.Layer.prototype.test = function(arg1) {};


// OTHER CUSTOM TYPES USED BY THREE ===============================================================================================

/**
 * @typedef {{opacity:(number|undefined), transparent:(boolean|undefined), color:(number|string|undefined), side:(number|undefined)}}
 */
var MeshBasicMaterialOptions;

/**
 * @typedef {{distance:number, point:THREE.Vector3, face:Object, faceIndex:Array<number>, indices:Array<number>, object:THREE.Object3D, uv:THREE.Vector2}}
 * @name {IntersectedObject}
 */
var IntersectedObject;

/**
 * @typedef {{value:*}}
 */
var TShaderUniform;
