import {
    hasDataLoaded
} from "./subtitleEditUtils";

import {Language, LoadingIndicator, Track} from "./model";

describe("cueUtils", () => {
    describe("hasDataLoaded", () => {
        it("return true if all data is loaded for Caption track", () => {
            // GIVEN
            const testingTrack = {
                type: "CAPTION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                mediaTitle: "This is the video title",
            } as Track;
            const loadingIndicator = {
                cuesLoaded: true,
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(testingTrack, loadingIndicator);

            // THEN
            expect(result).toBeTruthy();
        });

        it("return true if all data is loaded for Translation track", () => {
            // GIVEN
            const testingTrack = {
                type: "TRANSLATION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                mediaTitle: "This is the video title",
            } as Track;
            const loadingIndicator = {
                cuesLoaded: true,
                sourceCuesLoaded: true
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(testingTrack, loadingIndicator);

            // THEN
            expect(result).toBeTruthy();
        });

        it("return false if track is not loaded", () => {
            // GIVEN
            const loadingIndicator = {
                cuesLoaded: true,
                sourceCuesLoaded: true
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(null, loadingIndicator);

            // THEN
            expect(result).toBeFalsy();
        });

        it("return false if cues are not loaded for Caption", () => {
            // GIVEN
            const testingTrack = {
                type: "CAPTION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                mediaTitle: "This is the video title",
            } as Track;
            const loadingIndicator = {
                cuesLoaded: false,
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(testingTrack, loadingIndicator);

            // THEN
            expect(result).toBeFalsy();
        });

        it("return false if cues are not loaded for Translation", () => {
            // GIVEN
            const testingTrack = {
                type: "TRANSLATION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                mediaTitle: "This is the video title",
            } as Track;
            const loadingIndicator = {
                cuesLoaded: false,
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(testingTrack, loadingIndicator);

            // THEN
            expect(result).toBeFalsy();
        });

        it("return false if sourceCues are not loaded for Translation", () => {
            // GIVEN
            const testingTrack = {
                type: "TRANSLATION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                mediaTitle: "This is the video title",
            } as Track;
            const loadingIndicator = {
                cuesLoaded: true,
                sourceCuesLoaded: false
            } as LoadingIndicator;

            // WHEN
            const result = hasDataLoaded(testingTrack, loadingIndicator);

            // THEN
            expect(result).toBeFalsy();
        });
    });
});
