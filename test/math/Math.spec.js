describe("Math", function() {
    describe("#degToRad()", function() {
        var tests = [
            { value: 180, expected: Math.PI },
            { value: 360, expected: 2 * Math.PI },
            { value: 90, expected: Math.PI / 2 },
            { value: -90, expected: -Math.PI / 2 },
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.degToRad(test.value)).toBe(test.expected);
            });
        });
    });

    describe("#radToDeg()", function() {
        var tests = [
            { value: Math.PI, expected: 180 },
            { value: 2 * Math.PI, expected: 360 },
            { value: Math.PI / 2, expected: 90 },
            { value: -Math.PI / 2, expected: -90 },
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.radToDeg(test.value)).toBe(test.expected);
            });
        });
    });

    describe("round10()", function() {
        var tests = [
            { value: 10.1203, expected: 10.1 },
            { value: Math.PI, expected: 3.1 },
            { value: -34.2112390, expected: -34.2 },
            { value: 3.85123098, expected: 3.9 },
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.round10(test.value)).toBe(test.expected);
            });
        });
    });

    describe("clamp()", function() {
        var tests = [
            { value: 2, min: 1, max: 3, expected: 2 },
            { value: 1, min: 2, max: 3, expected: 2 },
            { value: 5, min: 1, max: 3, expected: 3 },
            { value: 2, min: 3, max: 3, expected: 3 }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.clamp(test.value, test.min, test.max)).toBe(test.expected);
            });
        });
    });

    describe("wrap()", function() {
        var tests = [
            { value: 2, min: 1, max: 3, expected: 2 },
            { value: 1, min: 2, max: 3, expected: 2 },
            { value: 4, min: 1, max: 3, expected: 2 },
            { value: -1, min: 1, max: 3, expected: 1 },
            { value: 3.5 * Math.PI, min: -Math.PI, max: Math.PI, expected: -Math.PI / 2 },
            { value: 2, min: 3, max: 3, expected: 3 }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.wrap(test.value, test.min, test.max)).toBe(test.expected);
            });
        });
    });

    describe("mix()", function() {
        var tests = [
            { a: 1, b: 1, mix: 1, expected: 1 },
            { a: 5, b: 10, mix: 3, expected: -5 },
            { a: 10, b: 5, mix: 3, expected: 20 },
            { a: -5, b: 5, mix: 5, expected: -45 },
            { a: -5, b: -5, mix: 5, expected: -5 }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.mix(test.a, test.b, test.mix)).toBe(test.expected);
            });
        });
    });

    describe("smoothStep()", function() {
        var tests = [
            { value: 0.5, edge0: 0, edge1: 1, expected: 0.5 },
            { value: 2, edge0: 0, edge1: 3, expected: 20 / 27 },
            { value: -5, edge0: -2, edge1: 5, expected: 0 },
            { value: 10, edge0: -5, edge1: 5, expected: 1 }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.smoothStep(test.value, test.edge0, test.edge1)).toBe(test.expected);
            });
        });
    });

    describe("isPowerOfTwo()", function() {
        var tests = [
            { value: 0, expected: false },
            { value: 1, expected: true },
            { value: 2, expected: true },
            { value: 3, expected: false },
            { value: 24, expected: false },
            { value: 32, expected: true },
            { value: 127, expected: false },
            { value: 128, expected: true },
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.isPowerOfTwo(test.value)).toBe(test.expected);
            });
        });
    });

    describe("rotationMatrixToEuler", function() {
        var pi2 = Math.PI / 2;

        // don't forget it is roll, -pitch, yaw
        var tests = [
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: 0, roll: 0 } },
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: 0, roll: pi2 } },
            { mat: new THREE.Matrix4(), euler: { yaw: pi2, pitch: -pi2, roll: 0 } }
        ];

        tests[1].mat.set(0, -1, 0, 0,
                         1,  0, 0, 0,
                         0,  0, 1, 0,
                         0,  0, 0, 1);

        tests[2].mat.set( 0, 0,  1, 0,
                          0, 0, -1, 0,
                         -1, 1,  0, 0,
                          0, 0,  0, 1);

        tests.forEach(function(test) {
            it("should return " + test.euler, function() {
                var res = FORGE.Math.rotationMatrixToEuler(test.mat);
                var yaw = res.yaw;
                var pitch = res.pitch;
                var roll = res.roll;

                expect(yaw).toBe(test.euler.yaw);
                expect(pitch).toBe(test.euler.pitch);
                expect(roll).toBe(test.euler.roll);
            });
        });
    });

    describe("eulerToRotationMatrix", function() {
        var pi2 = Math.PI / 2;

        // don't forget it is roll, -pitch, yaw
        var tests = [
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: 0, roll: 0 } },
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: 0, roll: 0 }, order: true },
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: 0, roll: pi2 } },
            { mat: new THREE.Matrix4(), euler: { yaw: pi2, pitch: 0, roll: 0 }, order: true },
            { mat: new THREE.Matrix4(), euler: { yaw: pi2, pitch: -pi2, roll: 0 } },
            { mat: new THREE.Matrix4(), euler: { yaw: 0, pitch: pi2, roll: pi2 }, order: true }
        ];

        tests[2].mat.set(0, -1, 0, 0,
                         1,  0, 0, 0,
                         0,  0, 1, 0,
                         0,  0, 0, 1);

        tests[3].mat.set( 0, 0, 1, 0,
                          0, 1, 0, 0,
                         -1, 0, 0, 0,
                          0, 0, 0, 1);

        tests[4].mat.set( 0, 0, 1, 0,
                          1, 0, 0, 0,
                          0, 1, 0, 0,
                          0, 0, 0, 1);

        tests[5].mat.set( 0, -1, 0, 0,
                          0,  0, 1, 0,
                         -1,  0, 0, 0,
                          0, 0,  0, 1);

        tests.forEach(function(test) {
            it("should return " + test.mat.elements, function() {
                var a = FORGE.Math.eulerToRotationMatrix(test.euler.yaw, test.euler.pitch, test.euler.roll, test.order).elements
                var b = test.mat.elements;

                for (var i = 0; i < a.length; i++)
                    expect(a[i]).toBeCloseTo(b[i], 10);
            });
        });
    });
});
