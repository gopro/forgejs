describe("Math", function() {
    describe("#degToRad()", function() {
        var tests = [
            { args: 180, expected: Math.PI }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Math.degToRad(test.args)).toBe(test.expected);
            });
        });
    });
});
