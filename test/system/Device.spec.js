describe("Device", function()
{
    FORGE.DEBUG = false;
    FORGE.WARNING = false;

    describe("#check() scenario 0", function()
    {
        it("test should return true", function()
        {
            expect(FORGE.Device.check()).toBe(true);
        });
    });

    describe("#check() scenario 1", function()
    {
        var device =
        {
            desktop: false,
            webGL: true
        };

        var tests =
        [
            { config: {desktop: false, webGL: true}, expected: true },
            { config: {desktop: true, webGL: false}, expected: false },
            { config: {desktop: true, webGL: true}, expected: false },
            { config: {desktop: false, webGL: false}, expected: false }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 2", function()
    {
        var device =
        {
            desktop: false,
            webGL: true
        };

        var tests =
        [
            { config: {and: {desktop: false, webGL: true}}, expected: true },
            { config: {and: {desktop: true, webGL: false}}, expected: false },
            { config: {and: {desktop: true, webGL: true}}, expected: false },
            { config: {and: {desktop: false, webGL: false}}, expected: false }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 3", function()
    {
        var device =
        {
            desktop: false,
            webGL: true
        };

        var tests =
        [
            { config: {or: {desktop: false, webGL: true}}, expected: true },
            { config: {or: {desktop: true, webGL: false}}, expected: false },
            { config: {or: {desktop: true, webGL: true}}, expected: true },
            { config: {or: {desktop: false, webGL: false}}, expected: true }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 4", function()
    {
        var device =
        {
            desktop: false,
            webGL: true,
            gyro: false
        };

        var tests =
        [
            { config: {desktop: true, or: {gyro: false, webGL: true}}, expected: false },
            { config: {desktop: true, or: {gyro: true, webGL: false}}, expected: false },
            { config: {desktop: true, or: {gyro: true, webGL: true}}, expected: false },
            { config: {desktop: true, or: {gyro: false, webGL: false}}, expected: false },
            { config: {desktop: false, or: {gyro: false, webGL: true}}, expected: true },
            { config: {desktop: false, or: {gyro: true, webGL: false}}, expected: false },
            { config: {desktop: false, or: {gyro: true, webGL: true}}, expected: true },
            { config: {desktop: false, or: {gyro: false, webGL: false}}, expected: true }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 5", function()
    {
        var device0 =
        {
            tablet: false,
            mobile: true,
            iPhone: false
        };

        var device1 =
        {
            tablet: true,
            mobile: false,
            iPhone: false
        };

        var tests =
        [
            { device: device0, config: {or: {tablet: true, and: {mobile: true, iPhone: false}}}, expected: true },
            { device: device0, config: {or: {tablet: true, and: {mobile: true, iPhone: true}}}, expected: false },
            { device: device0, config: {or: {tablet: true, and: {mobile: false, iPhone: false}}}, expected: false },
            { device: device0, config: {or: {tablet: true, and: {mobile: false, iPhone: true}}}, expected: false },

            { device: device0, config: {or: {tablet: false, and: {mobile: true, iPhone: false}}}, expected: true },
            { device: device0, config: {or: {tablet: false, and: {mobile: true, iPhone: true}}}, expected: true },
            { device: device0, config: {or: {tablet: false, and: {mobile: false, iPhone: false}}}, expected: true },
            { device: device0, config: {or: {tablet: false, and: {mobile: false, iPhone: true}}}, expected: true },

            { device: device1, config: {or: {tablet: true, and: {mobile: true, iPhone: false}}}, expected: true },
            { device: device1, config: {or: {tablet: true, and: {mobile: true, iPhone: true}}}, expected: true },
            { device: device1, config: {or: {tablet: true, and: {mobile: false, iPhone: false}}}, expected: true },
            { device: device1, config: {or: {tablet: true, and: {mobile: false, iPhone: true}}}, expected: true },

            { device: device1, config: {or: {tablet: false, and: {mobile: true, iPhone: false}}}, expected: false },
            { device: device1, config: {or: {tablet: false, and: {mobile: true, iPhone: true}}}, expected: false },
            { device: device1, config: {or: {tablet: false, and: {mobile: false, iPhone: false}}}, expected: true },
            { device: device1, config: {or: {tablet: false, and: {mobile: false, iPhone: true}}}, expected: false }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, test.device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 6", function()
    {
        var config =
        {
            mp4Video: true,
            or:
            {
                webGL: false,
                and:
                {
                    webGL: true,
                    desktop: true
                },
                and:
                {
                    webGL: true,
                    ie: false
                }
            }
        };

        var tests =
        [
            { device: {mp4Video: true, webGL: false, desktop: true, ie: false}, config: config, expected: true },
            { device: {mp4Video: true, webGL: true, desktop: true, ie: false}, config: config, expected: true },
            { device: {mp4Video: true, webGL: true, desktop: false, ie: false}, config: config, expected: true },
            { device: {mp4Video: true, webGL: true, desktop: false, ie: true}, config: config, expected: false },

            { device: {mp4Video: false, webGL: false, desktop: true, ie: false}, config: config, expected: false },
            { device: {mp4Video: false, webGL: true, desktop: true, ie: false}, config: config, expected: false },
            { device: {mp4Video: false, webGL: true, desktop: false, ie: false}, config: config, expected: false },
            { device: {mp4Video: false, webGL: true, desktop: false, ie: true}, config: config, expected: false }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, test.device)).toBe(test.expected);
            });
        });
    });

    describe("#check() scenario 7", function()
    {
        var device =
        {
            desktop: false,
            version: 10,
        };

        var tests =
        [
            { config: {desktop: false}, expected: true },
            { config: {desktop: true}, expected: false },
            { config: {version: 10}, expected: true },
            { config: {version: 11}, expected: false },
            { config: {version: {operation: "==", value: 9}}, expected: false },
            { config: {version: {operation: "==", value: 10}}, expected: true },
            { config: {version: {operation: "!=", value: 9}}, expected: true },
            { config: {version: {operation: "!=", value: 10}}, expected: false },
            { config: {version: {operation: "<", value: 9}}, expected: false },
            { config: {version: {operation: "<", value: 10}}, expected: false },
            { config: {version: {operation: "<", value: 11}}, expected: true },
            { config: {version: {operation: "<=", value: 9}}, expected: false },
            { config: {version: {operation: "<=", value: 10}}, expected: true },
            { config: {version: {operation: "<=", value: 11}}, expected: true },
            { config: {version: {operation: ">", value: 9}}, expected: true },
            { config: {version: {operation: ">", value: 10}}, expected: false },
            { config: {version: {operation: ">", value: 11}}, expected: false },
            { config: {version: {operation: ">=", value: 9}}, expected: true },
            { config: {version: {operation: ">=", value: 10}}, expected: true },
            { config: {version: {operation: ">=", value: 11}}, expected: false }
        ];

        tests.forEach(function(test, index)
        {
            it("test " + index + " should return " + test.expected, function()
            {
                expect(FORGE.Device.check(test.config, device)).toBe(test.expected);
            });
        });
    });
});
