import { Track } from "./model";
import { resetEditingTrack, updateEditingTrack } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../testUtils/testingStore";
import deepFreeze from "deep-freeze";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaTitle: "This is the video title",
    timecodesUnlocked: true
} as Track;

const testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("trackSlices", () => {
    describe("updateEditingTrack", () => {
        it("updates editing track", () => {
            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(testingTrack);
        });
    });

    describe("resetEditingTrack", () => {
        it("resets editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(null);
        });
    });
});
