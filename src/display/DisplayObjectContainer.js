
/**
 * A display object container is a {@link FORGE.DisplayObject} that can contains other {@link FORGE.DisplayObject} as children.
 *
 * @constructor FORGE.DisplayObjectContainer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {?(Element|HTMLElement)=} dom - Use a specific dom element to be the display object, if undefined a div will be created.
 * @param {?string=} className - Define a className of object for objects that extends DisplayObjectContainer.
 * @param {(Element|HTMLElement)=} root - Is this container a root? Root is the main viewer container or any container<br>
 * that haven't a FORGE.DisplayObject as parent but a dom element that is not a ForgeJS object.
 * @extends {FORGE.DisplayObject}
 *
 * @todo Delete children on demand (recursive) + remove only children (recursive)
 */
FORGE.DisplayObjectContainer = function(viewer, dom, className, root)
{
    /**
     * Array of {@link FORGE.DisplayObject} of this display object container.
     * @name FORGE.DisplayObjectContainer#_children
     * @type {Array<FORGE.DisplayObject>}
     * @private
     */
    this._children = [];

    /**
     * Is this container a root one?
     * @name  FORGE.DisplayObjectContainer#_root
     * @type {Element|HTMLElement}
     * @private
     */
    this._root = (typeof root !== "undefined") ? root : null;

    /**
     * This object handles all variables related to a root resizable container.
     * @name  FORGE.DisplayObjectContainer#_rootData
     * @type {?DisplayObjectContainerRootData}
     * @private
     */
    this._rootData = null;

    /**
     * Fit has been already applied on the container?
     * @name  FORGE.DisplayObjectContainer#_fitted
     * @type {boolean}
     * @private
     */
    this._fitted = false;

    /**
     * The overflow mode of the container (CSS property)
     * @name  FORGE.DisplayObjectContainer#_overflow
     * @type {string}
     * @private
     */
    this._overflow = "hidden";

    FORGE.DisplayObject.call(this, viewer, dom, className || "DisplayObjectContainer");
};

FORGE.DisplayObjectContainer.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.DisplayObjectContainer.prototype.constructor = FORGE.DisplayObjectContainer;


/**
 * Boot sequence
 * @method  FORGE.DisplayObjectContainer#_boot
 * @private
 */
FORGE.DisplayObjectContainer.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    if(this._className === "DisplayObjectContainer")
    {
        //root container have to be updated
        var needsUpdate = this._root !== null;

        if(needsUpdate === true)
        {
            this._rootData =
            {
                originalWidth: this._root.clientWidth,
                originalHeight: this._root.clientHeight,
                currentWidth: this._root.clientWidth,
                currentHeight: this._root.clientHeight,
                scaleWidth: 1,
                scaleHeight: 1,

                frameCount: 0, //Current frame count
                frameInterval: 10 //Number of frame needed to check size
            };

            this._width = this._rootData.currentWidth;
            this._dom.style.width = this.pixelWidth+"px";

            this._height = this._rootData.currentHeight;
            this._dom.style.height = this.pixelHeight+"px";

            this._dom.style.position = "absolute";

            this._root.appendChild(this._dom);
        }

        this._viewer.display.register(this, needsUpdate);
        this._notifyReady();
        this._applyPending(false);
    }
};

/**
 * Notify that the dispay object has been resized.<br>
 * This method ovverrides the {@link FORGE.DisplayObject} method.<br>
 * The parent will notify their children of its resize.
 * @method  FORGE.DisplayObjectContainer#_notifyResize
 * @private
 * @param {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.DisplayObjectContainer.prototype._notifyResize = function(data)
{
    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        this._children[i]._notifyParentResize(data);
    }

    FORGE.DisplayObject.prototype._notifyResize.call(this, data);
};


/**
 * Internal method used by parents to notify that this DisplayObject has been added to DOM.
 * It notifies all children in addition of the usual behavior.
 * @method FORGE.DisplayObject#_notifyAddedToDom
 * @private
 */
FORGE.DisplayObjectContainer.prototype._notifyAddedToDom = function()
{
    FORGE.DisplayObject.prototype._notifyAddedToDom.call(this);

    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        this._children[i]._notifyAddedToDom();
    }
};

/**
 * Notify that the visibility of this DisplayObjectContainer has changed to visible.<br>
 * This method overrides the DisplayObject's one.<br>
 * It notifies all children in addition of the usual behavior.
 * @method FORGE.DisplayObjectContainer#_notifyShow
 * @private
 */
FORGE.DisplayObjectContainer.prototype._notifyShow = function()
{
    FORGE.DisplayObject.prototype._notifyShow.call(this);

    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        this._children[i]._notifyShow();
    }
};

/**
 * Notify that the visibility of this DisplayObjectContainer has changed to invisible.<br>
 * This method overrides the DisplayObject's one.<br>
 * It notifies all children in addition of the usual behavior.
 * @method FORGE.DisplayObjectContainer#_notifyHide
 * @private
 */
FORGE.DisplayObjectContainer.prototype._notifyHide = function()
{
    FORGE.DisplayObject.prototype._notifyHide.call(this);

    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        this._children[i]._notifyHide();
    }
};

/**
 * Get the index of a child.
 * @method  FORGE.DisplayObjectContainer#_indexOfChild
 * @private
 * @param  {FORGE.DisplayObject} child - The child you search for.
 * @return {number} Returns index of the searched child if found, -1 if not found.
 */
FORGE.DisplayObjectContainer.prototype._indexOfChild = function(child)
{
    if(this._children === null)
    {
        return -1;
    }

    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        if(this._children[i] === child)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Apply the index of the children.
 * @method  FORGE.DisplayObjectContainer#_applyChildrenIndexes
 * @private
 */
FORGE.DisplayObjectContainer.prototype._applyChildrenIndexes = function()
{
    var child;
    for(var i = 0, ii = this._children.length; i < ii; i++)
    {
        child = this._children[i];
        child.index = i;
    }
};

/**
 * Update method that is called only if the container is a root container.
 * @method FORGE.DisplayObjectContainer#update
 */
FORGE.DisplayObjectContainer.prototype.update = function()
{
    this._rootData.frameCount++;

    //trigger update every X frames defined by this._frameInterval
    if(this._rootData.frameCount < this._rootData.frameInterval)
    {
        return;
    }

    this._rootData.frameCount = 0;

    var w = this._root.clientWidth;
    var h = this._root.clientHeight;

    var resized = false;

    if(w !== this._rootData.currentWidth)
    {
        this._rootData.currentWidth = w;
        this._rootData.scaleWidth = this._rootData.currentWidth / this._rootData.originalWidth;
        resized = true;
    }

    if(h !== this._rootData.currentHeight)
    {
        this._rootData.currentHeight = h;
        this._rootData.scaleHeight = this._rootData.currentHeight / this._rootData.scaleHeight;
        resized = true;
    }

    if(resized === true)
    {
        this.resize(this._rootData.currentWidth, this._rootData.currentHeight);
    }
};

/**
 * Add a child to this display object container.
 * @method  FORGE.DisplayObjectContainer#addChild
 * @param {FORGE.DisplayObject} child - The {@link FORGE.DisplayObject} you want to add to this display object container.
 */
FORGE.DisplayObjectContainer.prototype.addChild = function(child)
{
    if(child === this)
    {
        throw "You can't add a FORGE.DisplayObjectContainer to itself!";
    }

    /** @type {FORGE.DisplayObject} */
    var c = child;

    // If a DOM Element is added, convert it to a display object.
    if(child instanceof Element)
    {
        c = new FORGE.DisplayObject(child);
    }

    //Add dom element to the container dom
    this._dom.appendChild(c.dom);

    //Affect the parent value (it triigers the added to parent event so it is important to be in DOM before!)
    c.parent = this;

    //Set the index
    var index = this._children.push(c) - 1;
    if(c.index === null)
    {
        c.index = index;
    }

    //this._fitToContent(this._children);
};

/**
 * Add a child to this display object container at a specific index.
 * @method  FORGE.DisplayObjectContainer#addChildAt
 * @param {FORGE.DisplayObject} child - The {@link FORGE.DisplayObject} you want to add to this display object container.
 * @param {number} index - The index you want to apply to your child.
 */
FORGE.DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
    var c = child;

    // If a DOM Element is added, convert it to a display object.
    if(child instanceof Element)
    {
        c = new FORGE.DisplayObject(child);
    }

    //Add dom element to the container dom
    this._dom.appendChild(c.dom);

    //Affect the parent value (it triggers the added to parent event so it is important to be in DOM before!)
    c.parent = this;

    //Set the index
    this._children.splice(index, 0, c);
    c.index = index;

    this._applyChildrenIndexes();

    //this._fitToContent(this._children);
};

/**
 * Make the container to fit content.
 * @method  FORGE.DisplayObjectContainer#fitToContent
 */
FORGE.DisplayObjectContainer.prototype.fitToContent = function()
{
    var children = this._children;

    if(children.length > 0)
    {
        this._fitted = true;

        for(var i = 0, ii = children.length; i < ii; i++)
        {
            if(children[i].isInDom() === true && children[i].visible === true)
            {
                //@todo what happens if visible or isInDOM are set after?

                var maxWidth = Math.max(children[i].width + children[i].x, children[i].width + children[i].left, children[i].width + children[i].right);
                var maxHeight = Math.max(children[i].height + children[i].y, children[i].height + children[i].top, children[i].height + children[i].bottom);
                if(maxWidth > this.pixelWidth)
                {
                    this.width = maxWidth;
                }
                if(maxHeight > this.pixelHeight)
                {
                    this.height = maxHeight;
                }
            }
        }
    }

    if(this.parent !== null && FORGE.Utils.isTypeOf(this.parent, "DisplayObjectContainer") === true && this.parent._fitted === true)
    {
        //recursive to parent
        this.parent.fitToContent();
    }
};

/**
 * Remove a child from this display object container.
 * @method  FORGE.DisplayObjectContainer#removeChild
 * @param {FORGE.DisplayObject} child - The {@link FORGE.DisplayObject} you want to remove from this display object container.
 * @param {boolean=} destroy - Does the container have to destroy the child that is removed.
 */
FORGE.DisplayObjectContainer.prototype.removeChild = function(child, destroy)
{
    var index = this._indexOfChild(child);

    if(index !== -1)
    {
        this.removeChildAt(index, destroy);
    }
};

/**
 * Remove child at a specific index.
 * @method  FORGE.DisplayObjectContainer#removeChildAt
 * @param  {number} index - The index at which you want to remove the child .
 * @param  {boolean=} destroy - Does the method should destroy the child in addtion of removing of the display list.
 */
FORGE.DisplayObjectContainer.prototype.removeChildAt = function(index, destroy)
{
    if(index >= 0 && index < this._children.length)
    {
        var child = this._children[index];

        this._children.splice(index, 1);

        this._dom.removeChild(child.dom);

        if(typeof destroy === "undefined" || destroy === true)
        {
            child.destroy();
        }

        // reset container size if fit to content
        if(this._fitted === true && this._children.length === 0)
        {
            this.width = 0;
            this.height = 0;
        }
    }
};

/**
 * Remove all children.
 * @method  FORGE.DisplayObjectContainer#empty
 * @param  {boolean} destroy - Does the method should destroy the children in addtion of removing of the display list.
 */
FORGE.DisplayObjectContainer.prototype.empty = function(destroy)
{
    var index = this._children.length;

    while(index--)
    {
        this.removeChildAt(index, destroy);
    }
};

/**
 * Check if a {@link FORGE.DisplayObject} is a child of this display object container.
 * @method  FORGE.DisplayObjectContainer#hasChild
 * @param {FORGE.DisplayObject} child - The {@link FORGE.DisplayObject} you want to check.
 */
FORGE.DisplayObjectContainer.prototype.hasChild = function(child)
{
    return this._indexOfChild(child) !== -1;
};

/**
 * Destroy method.
 * @method FORGE.DisplayObjectContainer#destroy
 */
FORGE.DisplayObjectContainer.prototype.destroy = function()
{
    this.empty(false);

    this._children = null;

    this._root = null;
    this._rootData = null;

    FORGE.DisplayObject.prototype.destroy.call(this);
};

/**
* Get the children array.
* @name FORGE.DisplayObjectContainer#children
* @readonly
* @type {Array}
*/
Object.defineProperty(FORGE.DisplayObjectContainer.prototype, "children",
{
    /** @this {FORGE.DisplayObjectContainer} */
    get: function()
    {
        return this._children;
    }
});

/**
* Get and set the overflow property.
* @name FORGE.DisplayObjectContainer#oveflow
* @type {string}
*/
Object.defineProperty(FORGE.DisplayObjectContainer.prototype, "overflow",
{
    /** @this {FORGE.DisplayObjectContainer} */
    get: function()
    {
        return this._overflow;
    },

    /** @this {FORGE.DisplayObjectContainer} */
    set: function(value)
    {
        var values = ["hidden", "visible", "scroll"];

        if(values.indexOf(value) !== -1)
        {
            this._overflow = value;
            this._dom.style.overflow = value;
        }

    }
});
