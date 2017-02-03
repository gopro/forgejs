
// ----------------------------------------------------------------------------
// ---------------------------------- Display ---------------------------------
// ----------------------------------------------------------------------------

/**
 * @typedef {{url:string, i18n:(boolean|undefined)}}
 * @name IframeConfig
 * @property {string} url
 * @property {boolean=} i18n
 */
var IframeConfig;

/**
 * @typedef {{default:(string|undefined), skin:(ButtonSkinConfig|undefined), skins:(Array<ButtonSkinConfig>|undefined)}}
 * @name ButtonSkinConfig
 * @property {string=} default
 * @property {ButtonSkinConfig=} skin
 * @property {Array<ButtonSkinConfig>=} skins
 */
var ButtonConfig;

/**
 * @typedef {{name:(string|undefined), states:(Object<ButtonSkinStateConfig>|undefined)}}
 * @name ButtonSkinConfig
 * @property {string=} name
 * @property {Object<ButtonSkinStateConfig>=} states
 */
var ButtonSkinConfig;

/**
 * @typedef {{name:(string|undefined), background:(string|undefined), borderStyle:(string|undefined), borderColor:(string|undefined), borderRadius:(number|undefined), borderWidth:(number|undefined), autoWidth:(boolean|undefined), autoHeight:(boolean|undefined), align:(string|undefined), padding:(number|undefined), spacing:(number|undefined), first:(string|undefined), image:(ImageConfig|undefined), label:(TextFieldConfig|undefined)}}
 * @name ButtonSkinStateConfig
 * @property {string=} name
 * @property {string=} background
 * @property {string=} borderStyle
 * @property {string=} borderColor
 * @property {number=} borderRadius
 * @property {number=} borderWidth
 * @property {boolean=} autoWidth
 * @property {boolean=} autoHeight
 * @property {string=} align
 * @property {number=} padding
 * @property {number=} spacing
 * @property {string=} first
 * @property {ImageConfig=} image
 * @property {TextFieldConfig=} label
 */
var ButtonSkinStateConfig;

/**
 * @typedef {{value:(string|undefined), i18n:(boolean|undefined), color:(string|undefined), font:(string|undefined), fontFamily:(string|undefined), fontStyle:(string|undefined), fontVariant:(string|undefined), textAlign:(string|undefined), textShadow:(string|undefined), textDecoration:(string|undefined), textOverflow:(string|undefined), textTransform:(string|undefined), whiteSpace:(string|undefined), wordWrap:(boolean|undefined), lineHeight:(string|number|undefined), autoWidth:(boolean|undefined), autoHeight:(boolean|undefined), padding:(string|number|undefined), selectable:(boolean|undefined), editable:(boolean|undefined), fontWeight:(string|number|undefined), fontSize:(string|number|undefined)}}
 * @name TextFieldConfig
 * @property {string=} value
 * @property {boolean=} i18n
 * @property {string=} color
 * @property {string=} font
 * @property {string=} fontFamily
 * @property {(number|string)=} fontWeight
 * @property {(number|string)=} fontSize
 * @property {string=} fontStyle
 * @property {string=} fontVariant
 * @property {string=} textAlign
 * @property {string=} textShadow
 * @property {string=} textDecoration
 * @property {string=} textOverflow
 * @property {string=} textTransform
 * @property {string=} whiteSpace
 * @property {boolean=} wordWrap
 * @property {(number|string)=} lineHeight
 * @property {boolean=} autoWidth
 * @property {boolean=} autoHeight
 * @property {(number|string)=} padding
 * @property {boolean=} selectable
 * @property {boolean=} editable
 */
var TextFieldConfig;

/**
 * @typedef {{key:(string|undefined), i18n:(boolean|undefined), url:(string|undefined), frames:(string|Array<ImageFrameConfig>|undefined), alpha:(number|undefined), keepRatio:(boolean|undefined), maximized:(boolean|undefined), width:(number|string|undefined), height:(number|string|undefined)}}
 * @name TextFieldConfig
 * @property {string=} key
 * @property {boolean=} i18n
 * @property {string=} url
 * @property {(Array<ImageFrameConfig>|string)=} frames
 * @property {number=} alpha
 * @property {boolean=} keepRatio
 * @property {boolean=} maximized
 * @property {(string|number)=} width
 * @property {(string|number)=} height
 */
var ImageConfig;

/**
 * @typedef {{frame:ImageFrame, filename:(string|undefined), rotated:(boolean|undefined), trimmed:(boolean|undefined), spriteSourceSize:(ImageFrame|undefined), sourceSize:(Object|undefined)}}
 * @name ImageFrameConfig
 * @property {ImageFrame} frame
 * @property {string=} filename
 * @property {boolean=} rotated
 * @property {boolean=} trimmed
 * @property {ImageFrame=} spriteSourceSize
 * @property {Object=} sourceSize
 */
var ImageFrameConfig;

/**
 * @typedef {{x:number, y:number, w:number, h:number}}
 * @name ImageFrame
 * @property {number} x - x coordinates
 * @property {number} y - y coordinates
 * @property {number} w - width of the frame
 * @property {number} h - height of the frame
 */
var ImageFrame;

/**
 * @typedef {{property:string}}
 * @name PropertyToUpdate
 * @property {string} property - the name of the property to update
 */
var PropertyToUpdate;

/**
 * @typedef {{originalWidth:number, originalHeight:number, currentWidth:number, currentHeight:number, scaleWidth:number, scaleHeight:number, frameCount:number, frameInterval:number}}
 * @name DisplayObjectContainerRootData
 * @property {number} originalWidth
 * @property {number} originalHeight
 * @property {number} currentWidth
 * @property {number} currentHeight
 * @property {number} scaleWidth
 * @property {number} scaleHeight
 * @property {number} frameCount
 * @property {number} frameInterval
 */
var DisplayObjectContainerRootData;

/**
 * @typedef {{x:number, y:number, width:number, height:number, unitWidth:string, unitHeight:string, top:(number|null), left:(number|null), right:(number|null), bottom:(number|null)}}
 * @name ScreenData
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} unitWidth
 * @property {string} unitHeight
 * @property {?number} top
 * @property {?number} left
 * @property {?number} right
 * @property {?number=} bottom
 */
var ScreenData;