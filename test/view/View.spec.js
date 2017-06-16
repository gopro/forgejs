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

    describe("screenToWorld", function()
    {
        var tests =
        [
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, 0, -1) },
            { value: new THREE.Vector2(0, 0), expected: new THREE.Vector3(-0.5773502691896257, -0.5773502691896257, -0.5773502691896258) },
            { value: new THREE.Vector2(800, 0), expected: new THREE.Vector3(0.5773502691896257, -0.5773502691896257, -0.5773502691896258) },
            { value: new THREE.Vector2(800, 600), expected: new THREE.Vector3(0.5773502691896257, 0.5773502691896257, -0.5773502691896258) },
            { value: new THREE.Vector2(0, 600), expected: new THREE.Vector3(-0.5773502691896257, 0.5773502691896257, -0.5773502691896258) },
            { value: new THREE.Vector2(400, 300), camera: {yaw:90, pitch:0}, expected: new THREE.Vector3(1, 0, -6.123234262925839e-17) },
            { value: new THREE.Vector2(400, 300), camera: {yaw:0, pitch:-90}, expected: new THREE.Vector3(0, -1, -6.123234262925839e-17) },
            { value: new THREE.Vector2(400, 300), camera: {yaw:180, pitch:-90}, expected: new THREE.Vector3(7.498798786105971e-33, -1, 6.123234262925839e-17) },
            { value: new THREE.Vector2(801, 1), expected: null },
            { value: new THREE.Vector2(1, 601), expected: null },
            { value: new THREE.Vector2(-1, 1), expected: null },
            { value: new THREE.Vector2(1, -1), expected: null },
            { value: new THREE.Vector2(400, 300), camera: {yaw:180, pitch:-90, fov: 45}, expected: new THREE.Vector3(0, 0, -1) },
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                var camera = test.camera || {yaw:0, pitch:0, fov: 90};
                this.viewer.camera.lookAt(camera.yaw, camera.pitch, 0, camera.fov);

                expect(this.viewer.view.screenToWorld(test.value)).toEqual(test.expected);
            });
        });
    });

    describe("worldToScreen", function()
    {
        var tests =
        [
            { expected: new THREE.Vector2(400, 300), value: new THREE.Vector3(0, 0, -1) },
            // { expected: new THREE.Vector2(0, 0), value: new THREE.Vector3(-0.5773502691896257, -0.5773502691896257, -0.5773502691896258) },
            // { expected: new THREE.Vector2(800, 0), value: new THREE.Vector3(0.5773502691896257, -0.5773502691896257, -0.5773502691896258) },
            // { expected: new THREE.Vector2(800, 600), value: new THREE.Vector3(0.5773502691896257, 0.5773502691896257, -0.5773502691896258) },
            // { expected: new THREE.Vector2(0, 600), value: new THREE.Vector3(-0.5773502691896257, 0.5773502691896257, -0.5773502691896258) },
            // { expected: new THREE.Vector2(400, 300), camera: {yaw:90, pitch:0}, expected: new THREE.Vector3(1, 0, -6.123234262925839e-17) },
            // { expected: new THREE.Vector2(400, 300), camera: {yaw:0, pitch:-90}, expected: new THREE.Vector3(0, -1, -6.123234262925839e-17) },
            // { expected: new THREE.Vector2(400, 300), camera: {yaw:180, pitch:-90}, expected: new THREE.Vector3(7.498798786105971e-33, -1, 6.123234262925839e-17) },
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                var camera = test.camera || {yaw:0, pitch:0};
                this.viewer.camera.lookAt(camera.yaw, camera.pitch);

                expect(this.viewer.view.worldToScreen(test.value)).toEqual(test.expected);
            });
        });
    });
});
