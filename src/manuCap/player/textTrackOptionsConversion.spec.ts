import { Language, Track } from "../model";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import videojs from "video.js";

describe("textTrackOptionsConversion", () => {
    describe("convertToTextTrackOptions", () => {
        it("converts caption track to options", () => {
            // GIVEN
            const track = {
                type: "CAPTION",
                language: { id: "en-US" } as Language,
                default: true
            } as Track;

            const expectedTrackOptions = {
                kind: "captions",
                mode: "showing",
                srclang: "en-US",
                default: true,
            } as videojs.TextTrackOptions;

            // WHEN
            const actualTrackCaptions = convertToTextTrackOptions(track);

            // THEN
            expect(actualTrackCaptions).toEqual(expectedTrackOptions);
        });

        it("converts translation track to options", () => {
            // GIVEN
            const track = {
                type: "TRANSLATION",
                language: { id: "es-ES" } as Language,
                default: false
            } as Track;

            const expectedTrackOptions = {
                kind: "subtitles",
                mode: "showing",
                srclang: "es-ES",
                default: false,
            } as videojs.TextTrackOptions;

            // WHEN
            const actualTrackCaptions = convertToTextTrackOptions(track);

            // THEN
            expect(actualTrackCaptions).toEqual(expectedTrackOptions);
        });
    });
});
