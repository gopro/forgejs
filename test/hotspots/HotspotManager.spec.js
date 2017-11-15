describe("HotspotManager", function() {
    var container = document.createElement("div");
    container.id = "container";
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);

    beforeAll(function(done) {
        this.viewer = new FORGE.Viewer("container", {});
        this.viewer.onConfigLoadComplete.add(done, this);
    });

    afterAll(function() {
        this.viewer.destroy();
        this.viewer = null;
    });

    describe("#clear()", function() {
        var config;

        beforeEach(function() {
            this.viewer.hotspots.clear();

            config = [
                { uid: "hotspot-3d-1", type: "3d" },
                { uid: "hotspot-3d-2" },
                { uid: "hotspot-3d-3", type: "3d" },
                { uid: "hotspot-dom-1", type: "dom" },
                { uid: "hotspot-dom-2", type: "dom" }
            ];

            this.viewer.hotspots.addConfig(config);
        });

        it("should delete all hotspots", function() {
            this.viewer.hotspots.clear();
            expect(this.viewer.hotspots.all).toEqual([]);
        });

        it("should not contain DOM hotspots", function() {
            this.viewer.hotspots.clear(FORGE.HotspotType.DOM);

            var all = this.viewer.hotspots.all;
            var dom = false;

            for (var i = 0, ii = all.length; i < ii; i++)
            {
                if (all[i].type === FORGE.HotspotType.DOM)
                {
                    dom = true;
                }
            }

            expect(dom).toBe(false);
        });

        it("should not contain 3D hotspots", function() {
            this.viewer.hotspots.clear(FORGE.HotspotType.THREE_DIMENSIONAL);

            var all = this.viewer.hotspots.all;
            var dom = false;

            for (var i = 0, ii = all.length; i < ii; i++)
            {
                if (all[i].type === FORGE.HotspotType.THREE_DIMENSIONAL)
                {
                    dom = true;
                }
            }

            expect(dom).toBe(false);
        });
    });
});
