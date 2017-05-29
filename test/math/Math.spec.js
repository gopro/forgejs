describe("Math", function() {
    var pi = Math.PI,
        pi2 = pi / 2,
        pi3 = pi / 3,
        pi4 = pi / 4,
        sqrt2 = Math.sqrt(2),
        sqrt3 = Math.sqrt(3);

    describe("#degToRad()", function() {
        var tests = [
            { value: 180, expected: pi },
            { value: 360, expected: 2 * pi },
            { value: 90, expected: pi2 },
            { value: -90, expected: -pi2 },
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.degToRad(test.value)).toBe(test.expected);
            });
        });
    });

    describe("#radToDeg()", function() {
        var tests = [
            { value: pi, expected: 180 },
            { value: 2 * pi, expected: 360 },
            { value: pi2, expected: 90 },
            { value: -pi2, expected: -90 },
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
            { value: pi, expected: 3.1 },
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
            { value: 3.5 * pi, min: -pi, max: pi, expected: -pi2 },
            { value: 2, min: 3, max: 3, expected: 3 },
            { value: -8 * pi + pi3, min: -pi2, max: pi2, expected: pi3 }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.wrap(test.value, test.min, test.max)).toBeCloseTo(test.expected, 10);
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

    describe("#sphericalToCartesian", function() {
        var tests = [
            { spherical: { r: 10, t: 0, p: 0 }, cartesian: { x: 0, y: 0, z: -10 } },
            { spherical: { r: 10, t: pi, p: 0 }, cartesian: { x: 0, y: 0, z: 10 } },
            { spherical: { r: 10, t: 0, p: pi2 }, cartesian: { x: 0, y: 10, z: 0 } },
            { spherical: { r: 10, t: 632.534, p: pi2 }, cartesian: { x: 0, y: 10, z: 0 } },
            { spherical: { r: 10, t: pi4, p: pi4 }, cartesian: { x: 5, y: 5 * sqrt2, z: -5 } },
            { spherical: { r: 10, t: -5 * pi + pi4, p: 8 * pi + pi3 }, cartesian: { x: -5 / sqrt2, y: 5 * sqrt3, z: 5 / sqrt2 } },
            { spherical: { r: -10, t: 0, p: 0 }, cartesian: { x: 0, y: 0, z: 10 } },
            { spherical: { r: 0, t: 0, p: 0 }, cartesian: { x: 0, y: 0, z: 0 } }
        ];

        tests.forEach(function(test) {
            it("should return " + test.cartesian.toString(), function() {
                var res = FORGE.Math.sphericalToCartesian(test.spherical.r, test.spherical.t, test.spherical.p);

                expect(res.x).toBeCloseTo(test.cartesian.x, 10);
                expect(res.y).toBeCloseTo(test.cartesian.y, 10);
                expect(res.z).toBeCloseTo(test.cartesian.z, 10);
            });
        });
    });

    describe("#cartesianToSpherical", function() {
        var tests = [
            { spherical: { radius: 10, theta: 0, phi: 0 }, cartesian: { x: 0, y: 0, z: -10 } },
            { spherical: { radius: 10, theta: pi, phi: 0 }, cartesian: { x: 0, y: 0, z: 10 } },
            { spherical: { radius: 10, theta: 0, phi: pi2 }, cartesian: { x: 0, y: 10, z: 0 } },
            { spherical: { radius: 10, theta: pi4, phi: pi4 }, cartesian: { x: 5, y: 5 * sqrt2, z: -5 } },
            { spherical: { radius: 10, theta: -pi + pi4, phi: pi3 }, cartesian: { x: -5 / sqrt2, y: 5 * sqrt3, z: 5 / sqrt2 } },
            { spherical: { radius: 0, theta: 0, phi: 0 }, cartesian: { x: 0, y: 0, z: 0 } }
        ];

        tests.forEach(function(test) {
            it("should return " + test.spherical.radius + ", " + test.spherical.theta + ", " + test.spherical.phi, function() {
                var res = FORGE.Math.cartesianToSpherical(test.cartesian.x, test.cartesian.y, test.cartesian.z);

                expect(res.radius).toBeCloseTo(test.spherical.radius, 10);
                expect(res.theta).toBeCloseTo(test.spherical.theta, 10);
                expect(res.phi).toBeCloseTo(test.spherical.phi, 10);
            });
        });
    });
});
