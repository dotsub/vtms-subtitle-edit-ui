import "video.js"; // import VTTCue type
import { formatStartOrEndTime, getTimeString } from "./timeUtils";
import each from "jest-each";

const timeInSeconds = 3750.599; // 1h 2m 30sec 599millis

describe("timeUtils", () => {
    describe("getTimeString", () => {
        it("Gets time formatted as string", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds);

            // THEN
            expect(formattedTime).toEqual("01:02:30.599");
        });
    });

    describe("getTimeString", () => {
        it("Gets time formatted as string hide hours", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, () => true);

            // THEN
            expect(formattedTime).toEqual("02:30.599");
        });
    });

    describe("getTimeString", () => {
        it("Gets time formatted as string hide hours and millis", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, () => true);

            // THEN
            expect(formattedTime).toEqual("02:30.599");
        });
    });

    describe("getTimeString", () => {
        it("Gets time formatted as string show full format if hide methods return false", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, () => false);

            // THEN
            expect(formattedTime).toEqual("01:02:30.599");
        });
    });

    each([
        ["", ""],
        ["2.5", "2.5"],
        ["3.6666", "3.666"],
        ["-3.6666", "-3.666"],
        ["-9999.66669999", "-9999.666"],
        ["1", "1"],
        ["99999", "99999"],
        ["1.", "1."],
        ["asd", "asd"],
    ])
        .it("format '%s' to correct start/end time format if possible",
            (testingValue: string, expectedValue: string) => {
                // GIVEN, WHEN
                const value = formatStartOrEndTime(testingValue);

                // THEN
                expect(value).toEqual(expectedValue);
            });


});
