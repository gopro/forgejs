"use strict";

describe("FORGE.View", function()
{
    beforeAll(function(done)
    {
        var config =
        {
            story:
            {
                uid: "hotspots-editor",
                scenes:
                [
                    {
                        uid: "scene-0",
                        media:
                        {
                            uid: "media-0",
                            type: "grid"
                        }
                    }
                ]
            }
        };

        this.div = document.createElement('div');
        this.div.id = "container";
        this.div.style.width = "800px";
        this.div.style.height = "600px";
        document.body.appendChild(this.div);

        var onViewerReadyHandler = function()
        {
            this.viewer.story.onSceneLoadComplete.addOnce(onSceneLoadCompleteHandler);
        };

        var onSceneLoadCompleteHandler = function()
        {
            done();
        };

        this.viewer = new FORGE.Viewer("container", config);
        this.viewer.onReady.addOnce(onViewerReadyHandler.bind(this));
    });

    afterAll(function()
    {
        this.viewer.destroy();
        document.body.innerHTML = "";
        this.viewer = null;
    });

    it("should be rectilinear as default view", function()
    {
        expect(this.viewer.view.current.type).toEqual(FORGE.ViewType.RECTILINEAR);
    });

    it("screenToWorld", function()
    {
        var screenPoint = new THREE.Vector2(400, 300);
        var res = this.viewer.view.screenToWorld();
        console.log(res);
    });

    it("worldToScreen", function()
    {
        var worldPoint = new THREE.Vector3(0, 0, 300);
        var res = this.viewer.view.worldToScreen(worldPoint);
        console.log(res);
    });
});
