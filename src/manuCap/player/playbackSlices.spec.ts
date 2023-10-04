import { AnyAction } from "@reduxjs/toolkit";
import { playVideoSection } from "./playbackSlices";
import testingStore from "../../testUtils/testingStore";

describe("playbackSlices", () => {
    describe("playVideoSection", () => {
        it("configured new player time in redux", () => {
            // WHEN
            testingStore.dispatch(playVideoSection(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 1 });
        });
    });
});
