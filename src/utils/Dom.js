
/**
 * Dom manager interface.
 * @type {Object}
 * @namespace FORGE.Dom
 */
FORGE.Dom = {};

/**
 * Get a CSS property.
 * @method FORGE.Dom.getCssProperty
 * @param  {Element} dom - DOM element to evaluate.
 * @param  {string} property - The CSS property you want to get.
 * @return {string} Returns the CSS property.
 */
FORGE.Dom.getCssProperty = function(dom, property)
{
    //If I want to get the real percent value, I have to temporarly hide the object to have it's true CSS value.
    var display = window.getComputedStyle(dom, null).getPropertyValue("display");
    dom.style.display = "none";

    var result = window.getComputedStyle(dom, null).getPropertyValue(property);
    dom.style.display = display;

    return result;
};

/**
 * Get the unit width of an element.
 * @method FORGE.Dom.getUnitWidth
 * @param  {Element} dom - DOM element to evaluate.
 * @return {string} Returns the unit. Can be px or %.
 */
FORGE.Dom.getUnitWidth = function(dom)
{
    var width = FORGE.Dom.getCssProperty(dom, "width");
    var unit = "px";

    if(width.indexOf("%") > -1)
    {
        unit = "%";
    }

    if(width.indexOf("px") > -1)
    {
        unit = "px";
    }

    return unit;
};

/**
 * Get the width value of an element.
 * @method FORGE.Dom.getValueWidth
 * @param  {Element} dom - DOM element to evaluate.
 * @return {number} Returns the width.
 */
FORGE.Dom.getValueWidth = function(dom)
{
    var width = parseInt(FORGE.Dom.getCssProperty(dom, "width"), 10);
    return isNaN(width) ? 0 : width;
};


/**
 * Get the unit height of an element.
 * @method FORGE.Dom.getUnitHeight
 * @param  {Element} dom - DOM element to evaluate.
 * @return {string} Returns the unit. Can be px or %.
 */
FORGE.Dom.getUnitHeight = function(dom)
{
    var height = FORGE.Dom.getCssProperty(dom, "height");
    var unit = "px";

    if(height.indexOf("%") > -1)
    {
        unit = "%";
    }

    if(height.indexOf("px") > -1)
    {
        unit = "px";
    }

    return unit;
};

/**
 * Get the height value of an element.
 * @method FORGE.Dom.getValueHeight
 * @param  {Element} dom - DOM element to evaluate.
 * @return {number} Returns the height.
 */
FORGE.Dom.getValueHeight = function(dom)
{
    var height = parseInt(FORGE.Dom.getCssProperty(dom, "height"), 10);
    return isNaN(height) ? 0 : height;
};

/**
 * Verify if a dom element is on document
 * @param  {Element|HTMLElement}  dom - dom element you want to check
 * @return {boolean}     Returns true if the dom element is in document, false if not
 */
FORGE.Dom.has = function(dom)
{
    return document.body.contains(dom);
};

/**
 * Is it an HTMLElement?
 * @method FORGE.Dom.isHtmlElement
 * @param  {*} dom - DOM element to evaluate.
 * @return {boolean} Returns true if element is an HTMLElement, if not, false.
 */
FORGE.Dom.isHtmlElement = function(dom)
{
    return dom instanceof HTMLElement;
};

/**
 * Get mouse/pointer/touch offset values for an element.
 * @method FORGE.Dom.getMouseEventOffset
 * @param  {(Event|MouseEvent|HammerEvent)} event - The event.
 * @return {Object} Object which describe the x and y offset values.
 */
FORGE.Dom.getMouseEventOffset = function(event)
{
    var rect, offsetX, offsetY;

    // If the event is coming from HammerJS, the native MouseEvent, PointerEvent or TouchEvent is in srcEvent property
    // Hammer.js event
    var nativeEvents = [ "MouseEvent", "PointerEvent", "TouchEvent" ];
    if(typeof event.srcEvent === "object" && nativeEvents.indexOf(event.srcEvent.constructor.toString()))
    {
        rect = event.target.getBoundingClientRect();
        offsetX = event.srcEvent.clientX - rect.left;
        offsetY = event.srcEvent.clientY - rect.top;
    }
    // Classic MouseEvent case
    else
    {
        var target = event.currentTarget || event.target || event.srcElement;
        rect = target.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
    }

    return { x: offsetX, y: offsetY };
};
