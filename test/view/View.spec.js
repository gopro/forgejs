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

    describe("#screenToWorld()", function()
    {
        // values may seem random, but they are computed independently from
        // FORGE and then normalized, hence the curious values below
        var sqrt2 = Math.sqrt(2) / 2,
            sqrt3 = Math.sqrt(3) / 2,

            hf90 = Math.atan2(1, 4/3) * Math.tan(Math.PI / 4),
            sqrt217 = 2 * Math.sqrt(2 / 17),
            sqrt334 = 3 / Math.sqrt(34),

            hf60 = Math.atan2(1, 4/3* Math.tan(Math.PI / 6)),
            sqrt213 = 2 / Math.sqrt(13),
            sqrt3213 = 3 / (2 * Math.sqrt(13)),
            sqrt33132 = 3 * Math.sqrt(3 / 13) / 2,
            sqrt443 = 4 / Math.sqrt(43),
            sqrt3343 = 3 * Math.sqrt(3 / 43),

            hf120 = Math.atan2(1, 4/3 * Math.tan(Math.PI / 3)),
            sqrt27 = 2 / Math.sqrt(7),
            sqrt327 = 3 / (2 * Math.sqrt(7)),
            sqrt372 = Math.sqrt(3 / 7) / 2;

        var tests =
        [
            { value: new THREE.Vector2(0, 0),     expected: new THREE.Vector3(-sqrt217, -sqrt334, -sqrt334) },
            { value: new THREE.Vector2(0, 300),   expected: new THREE.Vector3(-Math.cos(hf90), 0, -Math.sin(hf90)) },
            { value: new THREE.Vector2(0, 600),   expected: new THREE.Vector3(-sqrt217, sqrt334, -sqrt334) },
            { value: new THREE.Vector2(400, 0),   expected: new THREE.Vector3(0, -sqrt2, -sqrt2) },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, 0, -1) },
            { value: new THREE.Vector2(400, 600), expected: new THREE.Vector3(0, sqrt2, -sqrt2) },
            { value: new THREE.Vector2(800, 0),   expected: new THREE.Vector3(sqrt217, -sqrt334, -sqrt334) },
            { value: new THREE.Vector2(800, 300), expected: new THREE.Vector3(Math.cos(hf90), 0, -Math.sin(hf90)) },
            { value: new THREE.Vector2(800, 600), expected: new THREE.Vector3(sqrt217, sqrt334, -sqrt334) },

            { value: new THREE.Vector2(0, 0),     expected: new THREE.Vector3(-sqrt213, -sqrt3213, -sqrt33132),     camera: { fov: 60 } },
            { value: new THREE.Vector2(0, 300),   expected: new THREE.Vector3(-Math.cos(hf60), 0, -Math.sin(hf60)), camera: { fov: 60 } },
            { value: new THREE.Vector2(0, 600),   expected: new THREE.Vector3(-sqrt213, sqrt3213, -sqrt33132),      camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 0),   expected: new THREE.Vector3(0, -0.5, -sqrt3),                     camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, 0, -1),                            camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 600), expected: new THREE.Vector3(0, 0.5, -sqrt3),                      camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 0),   expected: new THREE.Vector3(sqrt213, -sqrt3213, -sqrt33132),      camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 300), expected: new THREE.Vector3(Math.cos(hf60), 0, -Math.sin(hf60)),  camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 600), expected: new THREE.Vector3(sqrt213, sqrt3213, -sqrt33132),       camera: { fov: 60 } },

            { value: new THREE.Vector2(0, 0),     expected: new THREE.Vector3(-sqrt27, -sqrt327, -sqrt372),           camera: { fov: 120 } },
            { value: new THREE.Vector2(0, 300),   expected: new THREE.Vector3(-Math.cos(hf120), 0, -Math.sin(hf120)), camera: { fov: 120 } },
            { value: new THREE.Vector2(0, 600),   expected: new THREE.Vector3(-sqrt27, sqrt327, -sqrt372),            camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 0),   expected: new THREE.Vector3(0, -sqrt3, -0.5),                       camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, 0, -1),                              camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 600), expected: new THREE.Vector3(0, sqrt3, -0.5),                        camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 0),   expected: new THREE.Vector3(sqrt27, -sqrt327, -sqrt372),            camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 300), expected: new THREE.Vector3(Math.cos(hf120), 0, -Math.sin(hf120)),  camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 600), expected: new THREE.Vector3(sqrt27, sqrt327, -sqrt372),             camera: { fov: 120 } },

            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(sqrt2, 0, -sqrt2), camera: { yaw: 45 } },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(1, 0, 0),          camera: { yaw: 90 } },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, -1, 0),         camera: { pitch: -90 } },
            { value: new THREE.Vector2(400, 300), expected: new THREE.Vector3(0, -1, 0),         camera: { yaw: 180, pitch: -90 } },

            { value: new THREE.Vector2(801, 1),   expected: null },
            { value: new THREE.Vector2(1, 601),   expected: null },
            { value: new THREE.Vector2(-1, 1),    expected: null },
            { value: new THREE.Vector2(1, -1),    expected: null }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                var camera = FORGE.Utils.extendMultipleObjects({ yaw: 0, pitch: 0, fov: 90 }, test.camera);
                this.viewer.camera.lookAt(camera.yaw, camera.pitch, 0, camera.fov);
                this.viewer.update();

                var res = this.viewer.view.screenToWorld(test.value);

                if (test.expected !== null)
                {
                    expect(res.x).toBeCloseTo(test.expected.x, 10);
                    expect(res.y).toBeCloseTo(test.expected.y, 10);
                    expect(res.z).toBeCloseTo(test.expected.z, 10);
                }
                else
                {
                    expect(res).toBe(null);
                }
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
