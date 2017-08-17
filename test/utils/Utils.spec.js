describe("Utils", function() {
    describe("#arrayUnique()", function() {
        var tests = [
            { value: [1, 2, 3, 4, 5, 6, 5, 4, 3, 1, 2], expected: [1, 2, 3, 4, 5, 6] },
            { value: ["one", "two", "one", "three", "four", "one"], expected: ["one", "two", "three", "four"] },
            { value: [1, "two", 3, "four", "four", 6], expected: [1, "two", 3, "four", 6] },
            { value: [[], {}, {}, []], expected: [[], {}, {}, []] }
        ];

        tests.forEach(function(test) {
            it("should return " + test.expected, function() {
                expect(FORGE.Utils.arrayUnique(test.value)).toEqual(test.expected);
            });
        });
    });
});
