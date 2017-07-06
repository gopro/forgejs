"use strict";

describe("FORGE.ViewGoPro", function()
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
                        view:
                        {
                            type: "gopro"
                        },
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

    it("should be gopro", function()
    {
        expect(this.viewer.view.current.type).toEqual(FORGE.ViewType.GOPRO);
    });

    describe("#screenToWorld()", function()
    {
        // values may seem random, but they are computed independently from
        // FORGE and then normalized, hence the curious values below
        // They are NOT copied and pasted !
        var sqrt2 = Math.sqrt(2) / 2,
            sqrt3 = Math.sqrt(3) / 2,

            hf90 = Math.atan2(1, 4/3) * Math.tan(Math.PI / 4),
            mg90 = Math.atan(0.5),
            hfmg90 = Math.atan(3 / 8),
            sqrt217 = 2 * Math.sqrt(2 / 17),
            sqrt334 = 3 / Math.sqrt(34),

            hf60 = Math.atan2(1, 4/3 * Math.tan(Math.PI / 6)),
            sqrt213 = 2 / Math.sqrt(13),
            sqrt3213 = 3 / (2 * Math.sqrt(13)),
            sqrt33132 = 3 * Math.sqrt(3 / 13) / 2,
            sqrt443 = 4 / Math.sqrt(43),
            sqrt3343 = 3 * Math.sqrt(3 / 43),

            hf120 = 0.364812929641159,
            z774 = 0.774026368100448,
            z580 = 0.5805197760753361,
            z252 = 0.25274487348049507,

            hf240 = 0.8172757101951851,
            z494 = 0.49487165930539356,
            z371 = 0.37115374447904526,
            z785 = 0.7857142857142856;

        var tests =
        [
            { value: new THREE.Vector2(0, 0),      expected: new THREE.Vector3(-sqrt217, sqrt334, -sqrt334) },
            { value: new THREE.Vector2(0, 300),    expected: new THREE.Vector3(-Math.cos(hf90), 0, -Math.sin(hf90)) },
            { value: new THREE.Vector2(0, 600),    expected: new THREE.Vector3(-sqrt217, -sqrt334, -sqrt334) },
            { value: new THREE.Vector2(400, 0),    expected: new THREE.Vector3(0, sqrt2, -sqrt2) },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, 0, -1) },
            { value: new THREE.Vector2(400, 600),  expected: new THREE.Vector3(0, -sqrt2, -sqrt2) },
            { value: new THREE.Vector2(800, 0),    expected: new THREE.Vector3(sqrt217, sqrt334, -sqrt334) },
            { value: new THREE.Vector2(800, 300),  expected: new THREE.Vector3(Math.cos(hf90), 0, -Math.sin(hf90)) },
            { value: new THREE.Vector2(800, 600),  expected: new THREE.Vector3(sqrt217, -sqrt334, -sqrt334) },

            { value: new THREE.Vector2(0, 0),      expected: new THREE.Vector3(-sqrt213, sqrt3213, -sqrt33132),       camera: { fov: 60 } },
            { value: new THREE.Vector2(0, 300),    expected: new THREE.Vector3(-Math.cos(hf60), 0, -Math.sin(hf60)),   camera: { fov: 60 } },
            { value: new THREE.Vector2(0, 600),    expected: new THREE.Vector3(-sqrt213, -sqrt3213, -sqrt33132),        camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 0),    expected: new THREE.Vector3(0, 0.5, -sqrt3),                       camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, 0, -1),                              camera: { fov: 60 } },
            { value: new THREE.Vector2(400, 600),  expected: new THREE.Vector3(0, -0.5, -sqrt3),                        camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 0),    expected: new THREE.Vector3(sqrt213, sqrt3213, -sqrt33132),        camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 300),  expected: new THREE.Vector3(Math.cos(hf60), 0, -Math.sin(hf60)),    camera: { fov: 60 } },
            { value: new THREE.Vector2(800, 600),  expected: new THREE.Vector3(sqrt213, -sqrt3213, -sqrt33132),         camera: { fov: 60 } },

            { value: new THREE.Vector2(0, 0),      expected: new THREE.Vector3(-z774, z580, -z252),                   camera: { fov: 120 } },
            { value: new THREE.Vector2(0, 300),    expected: new THREE.Vector3(-Math.cos(hf120), 0, -Math.sin(hf120)), camera: { fov: 120 } },
            { value: new THREE.Vector2(0, 600),    expected: new THREE.Vector3(-z774, -z580, -z252),                    camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 0),    expected: new THREE.Vector3(0, sqrt3, -0.5),                       camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, 0, -1),                              camera: { fov: 120 } },
            { value: new THREE.Vector2(400, 600),  expected: new THREE.Vector3(0, -sqrt3, -0.5),                        camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 0),    expected: new THREE.Vector3(z774 , z580, -z252),                   camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 300),  expected: new THREE.Vector3(Math.cos(hf120), 0, -Math.sin(hf120)),  camera: { fov: 120 } },
            { value: new THREE.Vector2(800, 600),  expected: new THREE.Vector3(z774 , -z580, -z252),                    camera: { fov: 120 } },

            { value: new THREE.Vector2(0, 0),      expected: new THREE.Vector3(-z494, z371, z785),                    camera: { fov: 240 } },
            { value: new THREE.Vector2(0, 300),    expected: new THREE.Vector3(-Math.sin(hf240), 0, Math.cos(hf240)),  camera: { fov: 240 } },
            { value: new THREE.Vector2(0, 600),    expected: new THREE.Vector3(-z494, -z371, z785),                     camera: { fov: 240 } },
            { value: new THREE.Vector2(400, 0),    expected: new THREE.Vector3(0, sqrt3, 0.5),                        camera: { fov: 240 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, 0, -1),                              camera: { fov: 240 } },
            { value: new THREE.Vector2(400, 600),  expected: new THREE.Vector3(0, -sqrt3, 0.5),                         camera: { fov: 240 } },
            { value: new THREE.Vector2(800, 0),    expected: new THREE.Vector3(z494 , z371, z785),                    camera: { fov: 240 } },
            { value: new THREE.Vector2(800, 300),  expected: new THREE.Vector3(Math.sin(hf240), 0, Math.cos(hf240)),   camera: { fov: 240 } },
            { value: new THREE.Vector2(800, 600),  expected: new THREE.Vector3(z494 , -z371, z785),                     camera: { fov: 240 } },

            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(sqrt2, 0, -sqrt2),                      camera: { yaw: 45 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(1, 0, 0),                               camera: { yaw: 90 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, -1, 0),                              camera: { pitch: -90 } },
            { value: new THREE.Vector2(400, 300),  expected: new THREE.Vector3(0, -1, 0),                              camera: { yaw: 180, pitch: -90 } },

            { value: new THREE.Vector2(1200, 300), expected: new THREE.Vector3(Math.cos(hfmg90), 0, -Math.sin(hfmg90)) },
            { value: new THREE.Vector2(400, 900),  expected: new THREE.Vector3(0, -Math.cos(mg90), -Math.sin(mg90)) },
            { value: new THREE.Vector2(-400, 300), expected: new THREE.Vector3(-Math.cos(hfmg90), 0, -Math.sin(hfmg90)) },
            { value: new THREE.Vector2(400, -300), expected: new THREE.Vector3(0, Math.cos(mg90), -Math.sin(mg90)) },

            { value: new THREE.Vector2(1201, 1),   expected: null },
            { value: new THREE.Vector2(1, 901),    expected: null },
            { value: new THREE.Vector2(-401, 1),   expected: null },
            { value: new THREE.Vector2(1, -301),   expected: null }
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

    describe("#worldToScreen()", function()
    {
        // values may seem random, but they are computed independently from
        // FORGE and then normalized, hence the curious values below
        // They are NOT copied and pasted !
        var sqrt3 = Math.sqrt(3) / 2,

            mg90 = Math.atan(0.5),
            hfmg90 = Math.atan(3 / 8),
            sqrt217 = 2 * Math.sqrt(2 / 17),
            sqrt334 = 3 / Math.sqrt(34),

            hf60 = Math.atan2(1, 4/3* Math.tan(Math.PI / 6)),
            sqrt213 = 2 / Math.sqrt(13),
            sqrt3213 = 3 / (2 * Math.sqrt(13)),
            sqrt33132 = 3 * Math.sqrt(3 / 13) / 2,
            sqrt443 = 4 / Math.sqrt(43),
            sqrt3343 = 3 * Math.sqrt(3 / 43),

            hf120 = 0.364812929641159,
            z774 = 0.774026368100448,
            z580 = 0.5805197760753361,
            z252 = 0.25274487348049507,

            hf240 = 0.8172757101951851,
            z494 = 0.49487165930539356,
            z371 = 0.37115374447904526,
            z785 = 0.7857142857142856;

        var tests =
        [
            { value: new THREE.Vector3(-sqrt217, -sqrt334, -sqrt334),            expected: new THREE.Vector2(0, 600) },
            { value: new THREE.Vector3(-80, 0, -60),                             expected: new THREE.Vector2(0, 300) },
            { value: new THREE.Vector3(-sqrt217, sqrt334, -sqrt334),             expected: new THREE.Vector2(0, 0) },
            { value: new THREE.Vector3(0, -22, -22),                             expected: new THREE.Vector2(400, 600) },
            { value: new THREE.Vector3(0, 0, -37),                               expected: new THREE.Vector2(400, 300) },
            { value: new THREE.Vector3(0, 67, -67),                              expected: new THREE.Vector2(400, 0) },
            { value: new THREE.Vector3(sqrt217, -sqrt334, -sqrt334),             expected: new THREE.Vector2(800, 600) },
            { value: new THREE.Vector3(160, 0, -120),                            expected: new THREE.Vector2(800, 300) },
            { value: new THREE.Vector3(sqrt217, sqrt334, -sqrt334),              expected: new THREE.Vector2(800, 0) },

            { value: new THREE.Vector3(-sqrt213, -sqrt3213, -sqrt33132),         expected: new THREE.Vector2(0, 600),     camera: { fov: 60 } },
            { value: new THREE.Vector3(-Math.cos(hf60), 0, -Math.sin(hf60)),     expected: new THREE.Vector2(0, 300),     camera: { fov: 60 } },
            { value: new THREE.Vector3(-sqrt213, sqrt3213, -sqrt33132),          expected: new THREE.Vector2(0, 0),       camera: { fov: 60 } },
            { value: new THREE.Vector3(0, -0.5, -sqrt3),                         expected: new THREE.Vector2(400, 600),   camera: { fov: 60 } },
            { value: new THREE.Vector3(0, 0, -78),                               expected: new THREE.Vector2(400, 300),   camera: { fov: 60 } },
            { value: new THREE.Vector3(0, 0.5, -sqrt3),                          expected: new THREE.Vector2(400, 0),     camera: { fov: 60 } },
            { value: new THREE.Vector3(sqrt213, -sqrt3213, -sqrt33132),          expected: new THREE.Vector2(800, 600),   camera: { fov: 60 } },
            { value: new THREE.Vector3(Math.cos(hf60), 0, -Math.sin(hf60)),      expected: new THREE.Vector2(800, 300),   camera: { fov: 60 } },
            { value: new THREE.Vector3(sqrt213, sqrt3213, -sqrt33132),           expected: new THREE.Vector2(800, 0),     camera: { fov: 60 } },

            { value: new THREE.Vector3(-z774, z580, -z252),                      expected: new THREE.Vector2(0, 0),       camera: { fov: 120 } },
            { value: new THREE.Vector3(-Math.cos(hf120), 0, -Math.sin(hf120)),   expected: new THREE.Vector2(0, 300),     camera: { fov: 120 } },
            { value: new THREE.Vector3(-z774, -z580, -z252),                     expected: new THREE.Vector2(0, 600),     camera: { fov: 120 } },
            { value: new THREE.Vector3(0, sqrt3, -0.5),                          expected: new THREE.Vector2(400, 0),     camera: { fov: 120 } },
            { value: new THREE.Vector3(0, 0, -1),                                expected: new THREE.Vector2(400, 300),   camera: { fov: 120 } },
            { value: new THREE.Vector3(0, -sqrt3, -0.5),                         expected: new THREE.Vector2(400, 600),   camera: { fov: 120 } },
            { value: new THREE.Vector3(z774 , z580, -z252),                      expected: new THREE.Vector2(800, 0),     camera: { fov: 120 } },
            { value: new THREE.Vector3(Math.cos(hf120), 0, -Math.sin(hf120)),    expected: new THREE.Vector2(800, 300),   camera: { fov: 120 } },
            { value: new THREE.Vector3(z774 , -z580, -z252),                     expected: new THREE.Vector2(800, 600),   camera: { fov: 120 } },

            { value: new THREE.Vector3(-z494, z371, z785),                       expected: new THREE.Vector2(0, 0),       camera: { fov: 240 } },
            { value: new THREE.Vector3(-Math.sin(hf240), 0, Math.cos(hf240)),    expected: new THREE.Vector2(0, 300),     camera: { fov: 240 } },
            { value: new THREE.Vector3(-z494, -z371, z785),                      expected: new THREE.Vector2(0, 600),     camera: { fov: 240 } },
            { value: new THREE.Vector3(0, sqrt3, 0.5),                           expected: new THREE.Vector2(400, 0),     camera: { fov: 240 } },
            { value: new THREE.Vector3(0, 0, -1),                                expected: new THREE.Vector2(400, 300),   camera: { fov: 240 } },
            { value: new THREE.Vector3(0, -sqrt3, 0.5),                          expected: new THREE.Vector2(400, 600),   camera: { fov: 240 } },
            { value: new THREE.Vector3(z494 , z371, z785),                       expected: new THREE.Vector2(800, 0),     camera: { fov: 240 } },
            { value: new THREE.Vector3(Math.sin(hf240), 0, Math.cos(hf240)),     expected: new THREE.Vector2(800, 300),   camera: { fov: 240 } },
            { value: new THREE.Vector3(z494 , -z371, z785),                      expected: new THREE.Vector2(800, 600),   camera: { fov: 240 } },

            { value: new THREE.Vector3(20, 0, -20),                              expected: new THREE.Vector2(400, 300),   camera: { yaw: 45 } },
            { value: new THREE.Vector3(36, 0, 0),                                expected: new THREE.Vector2(400, 300),   camera: { yaw: 90 } },
            { value: new THREE.Vector3(0, -54, 0),                               expected: new THREE.Vector2(400, 300),   camera: { pitch: -90 } },
            { value: new THREE.Vector3(0, -570, 0),                              expected: new THREE.Vector2(400, 300),   camera: { yaw: 180, pitch: -90 } },

            { value: new THREE.Vector3(Math.cos(hfmg90), 0, -Math.sin(hfmg90)),  expected: new THREE.Vector2(1200, 300) },
            { value: new THREE.Vector3(0, Math.cos(mg90), -Math.sin(mg90)),      expected: new THREE.Vector2(400, -300) },
            { value: new THREE.Vector3(-Math.cos(hfmg90), 0, -Math.sin(hfmg90)), expected: new THREE.Vector2(-400, 300) },
            { value: new THREE.Vector3(0, -Math.cos(mg90), -Math.sin(mg90)),     expected: new THREE.Vector2(400, 900) },

            { value: new THREE.Vector3(0, 0, 8573),                              expected: null },
            { value: new THREE.Vector3(234, -493, 20),                           expected: null },
            { value: new THREE.Vector3(138, 3120, 329),                          expected: null },
            { value: new THREE.Vector3(-31, -59, 328),                           expected: null }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                var camera = FORGE.Utils.extendMultipleObjects({ yaw: 0, pitch: 0, fov: 90 }, test.camera);
                this.viewer.camera.lookAt(camera.yaw, camera.pitch, 0, camera.fov);
                this.viewer.update();

                var res = this.viewer.view.worldToScreen(test.value);

                if (test.expected !== null)
                {
                    expect(res.x).toBeCloseTo(test.expected.x, 10);
                    expect(res.y).toBeCloseTo(test.expected.y, 10);
                }
                else
                {
                    expect(res).toBe(null);
                }
            });
        });
    });
});

