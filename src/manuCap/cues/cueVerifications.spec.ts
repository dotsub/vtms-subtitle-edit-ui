import { getTimeGapLimits } from "./cueVerifications";
import { SubtitleSpecification } from "../toolbox/model";

describe("cueVerifications", () => {
    describe("getTimeGapLimits", () => {
        it("Gets default time gaps if subtitleSpecs is null", () => {
            // GIVEN // WHEN
            const timeGap = getTimeGapLimits(null);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets time gap limits from subtitle specs if provided and enabled", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(2);
            expect(timeGap.maxGap).toEqual(6);
        });

        it("Gets time gap limits from subtitle specs if provided but not enabled", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: false
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets default min gap limit if subtitle specs is enabled but min caption is null", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: null,
                maxCaptionDurationInMillis: 7500,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(7.5);
        });

        it("Gets default min gap limit if subtitle specs is disabled and min caption provided", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 200,
                maxCaptionDurationInMillis: 7500,
                enabled: false
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets default max gap limit if subtitle specs is enabled but max caption is null", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 1500,
                maxCaptionDurationInMillis: null,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(1.5);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });
    });
});
