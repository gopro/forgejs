describe("FORGE.Viewer", function()
{
    describe("Boot sequence", function()
    {
        beforeAll(function()
        {
            this.div = document.createElement('div');
            this.div.id = "container";
            this.div.style.width = "800px";
            this.div.style.height = "600px";
            document.body.appendChild(this.div);

            this.bootCallback = jasmine.createSpy('bootCallback');

            this.viewer = new FORGE.Viewer("container");
        });

        afterAll(function()
        {
            this.viewer.destroy();
            document.body.innerHTML = "";
            this.viewer = null;
        });

        it("should instantiate as a FORGE.Viewer", function()
        {
            expect(this.viewer).toEqual(jasmine.any(FORGE.Viewer));
        });

        it("should self register its instance in FORGE.UID and save it's UID into KEN.VIEWERS", function()
        {
            var uid = this.viewer.uid;
            expect(FORGE.VIEWERS).toContain(uid);
            expect(FORGE.UID.isTypeOf(uid, "Viewer"));
            expect(FORGE.UID.get(uid)).toBe(this.viewer);
        });

        it("should have a FORGE.Clock instance", function()
        {
            expect(this.viewer.clock).not.toBe(null);
            expect(this.viewer.clock).toEqual(jasmine.any(FORGE.Clock));
        });

        it("should have a FORGE.SoundManager instance", function()
        {
            expect(this.viewer.audio).not.toBe(null);
            expect(this.viewer.audio).toEqual(jasmine.any(FORGE.SoundManager));
        });

        it("should have a FORGE.RequestAnimationFrame instance", function()
        {
            expect(this.viewer.raf).not.toBe(null);
            expect(this.viewer.raf).toEqual(jasmine.any(FORGE.RequestAnimationFrame));
        });

        it("should have a FORGE.LocaleManager instance", function()
        {
            expect(this.viewer.i18n).not.toBe(null);
            expect(this.viewer.i18n).toEqual(jasmine.any(FORGE.LocaleManager));
        });

        it("should have a FORGE.Tour instance", function()
        {
            expect(this.viewer.story).not.toBe(null);
            expect(this.viewer.story).toEqual(jasmine.any(FORGE.Story));
        });

        it("should have a FORGE.History instance", function()
        {
            expect(this.viewer.history).not.toBe(null);
            expect(this.viewer.history).toEqual(jasmine.any(FORGE.History));
        });

        it("should have a FORGE.PlaylistManager instance", function()
        {
            expect(this.viewer.playlists).not.toBe(null);
            expect(this.viewer.playlists).toEqual(jasmine.any(FORGE.PlaylistManager));
        });

        it("should have a FORGE.PluginManager instance", function()
        {
            expect(this.viewer.plugins).not.toBe(null);
            expect(this.viewer.plugins).toEqual(jasmine.any(FORGE.PluginManager));
        });

        it("should have a FORGE.Keyboard instance", function()
        {
            expect(this.viewer.keyboard).not.toBe(null);
            expect(this.viewer.keyboard).toEqual(jasmine.any(FORGE.Keyboard));
        });

        it("should have a FORGE.Cache instance", function()
        {
            expect(this.viewer.cache).not.toBe(null);
            expect(this.viewer.cache).toEqual(jasmine.any(FORGE.Cache));
        });

        it("should have a FORGE.Loader instance", function()
        {
            expect(this.viewer.load).not.toBe(null);
            expect(this.viewer.load).toEqual(jasmine.any(FORGE.Loader));
        });

        it("should have a FORGE.TweenManager instance", function()
        {
            expect(this.viewer.tween).not.toBe(null);
            expect(this.viewer.tween).toEqual(jasmine.any(FORGE.TweenManager));
        });
    });

    describe("The main container", function()
    {
        beforeAll(function(done)
        {
            this.div = document.createElement('div');
            this.div.id = "container";
            this.div.style.width = "800px";
            this.div.style.height = "600px";
            document.body.appendChild(this.div);

            this.viewer = new FORGE.Viewer("container");

            this.viewer.onReady.add(done, this);
        });

        afterAll(function()
        {
            this.viewer.destroy();
            document.body.innerHTML = "";
            this.viewer = null;
        });

        it("should not be null", function()
        {
            expect(this.viewer.container).not.toBe(null);
        });

        it("should be in DOM", function()
        {
            expect("#" + this.viewer.container.id).toBeInDOM();
        });

        it("should be a FORGE.DisplayObjectContainer", function()
        {
            expect(this.viewer.container).toEqual(jasmine.any(FORGE.DisplayObjectContainer));
            expect(this.viewer.container.className).toEqual("DisplayObjectContainer");
        });

        it("should have the same size than the initial dom container", function()
        {
            expect(this.viewer.container.width).toEqual(800);
            expect(this.viewer.container.height).toEqual(600);
        });
    });

    describe("The canvas container", function()
    {
        beforeAll(function(done)
        {
            this.div = document.createElement('div');
            this.div.id = "container";
            this.div.style.width = "800px";
            this.div.style.height = "600px";
            document.body.appendChild(this.div);

            this.viewer = new FORGE.Viewer("container");

            this.viewer.onReady.add(done, this);
        });

        afterAll(function()
        {
            this.viewer.destroy();
            document.body.innerHTML = "";
            this.viewer = null;
        });

        it("should not be null", function()
        {
            expect(this.viewer.canvasContainer).not.toBe(null);
        });

        it("should be in DOM", function()
        {
            expect("#" + this.viewer.canvasContainer.id).toBeInDOM();
        });

        it("should be a FORGE.DisplayObjectContainer", function()
        {
            expect(this.viewer.canvasContainer).toEqual(jasmine.any(FORGE.DisplayObjectContainer));
            expect(this.viewer.canvasContainer.className).toEqual("DisplayObjectContainer");
        });

        it("should have the same size than the main container", function()
        {
            expect(this.viewer.canvasContainer.width).toEqual(this.viewer.container.pixelWidth);
            expect(this.viewer.canvasContainer.height).toEqual(this.viewer.container.pixelHeight);
        });

        it("should be the first child of the main container", function()
        {
            expect(this.viewer.container.children[0]).toEqual(this.viewer.canvasContainer);
        });

        it("should contain a FORGE.Canvas as only child", function()
        {
            expect(this.viewer.canvasContainer.children[0]).toEqual(jasmine.any(FORGE.Canvas));
            expect(this.viewer.canvasContainer.children.length).toEqual(1);
        });

    });

    describe("The plugin container", function()
    {
        beforeAll(function(done)
        {
            this.div = document.createElement('div');
            this.div.id = "container";
            this.div.style.width = "800px";
            this.div.style.height = "600px";
            document.body.appendChild(this.div);

            this.viewer = new FORGE.Viewer("container");

            this.viewer.onReady.add(done, this);
        });

        afterAll(function()
        {
            this.viewer.destroy();
            document.body.innerHTML = "";
            this.viewer = null;
        });

        it("should not be null", function()
        {
            expect(this.viewer.pluginContainer).not.toBe(null);
        });

        it("should be a FORGE.DisplayObjectContainer", function()
        {
            expect(this.viewer.pluginContainer).toEqual(jasmine.any(FORGE.DisplayObjectContainer));
            expect(this.viewer.pluginContainer.className).toEqual("DisplayObjectContainer");
        });

        it("should have the same size than the main container", function()
        {
            expect(this.viewer.pluginContainer.width).toEqual(this.viewer.container.pixelWidth);
            expect(this.viewer.pluginContainer.height).toEqual(this.viewer.container.pixelHeight);
        });

        it("should be the second child of the main container", function()
        {
            expect(this.viewer.container.children[2]).toEqual(this.viewer.pluginContainer);
        });
    });

    it("should destroy well");
});
