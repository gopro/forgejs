/**
 * @typedef {{previous:number, next:number}}
 * @name TimelinePrevNextIndexes
 * @property {number} previous
 * @property {number} next
 */
var TimelinePrevNextIndexes;

/**
 * @typedef {{previous:?$_Keyframe, next:?$_Keyframe}}
 * @name TimelinePrevNext
 * @property {?FORGE.Keyframe} previous
 * @property {?FORGE.Keyframe} next
 */
var TimelinePrevNext;

/**
 * @typedef {{prop:(string|Array<string>), smooth:boolean, additional:(Function|undefined), cancelRoll:(boolean|undefined)}}
 * @name AnimationInstruction
 * @property {string|Array<string>} prop - The name or list of the prop to animate
 * @property {boolean} smooth - Is the animation smooth or linear ?
 */
var AnimationInstruction;
