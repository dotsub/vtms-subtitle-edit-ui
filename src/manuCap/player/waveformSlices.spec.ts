import { Track } from "../model";
import { resetEditingTrack, updateEditingTrack } from "../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { waveformVisibleSlice } from "./waveformSlices";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaTitle: "This is the video title",
    timecodesUnlocked: true
} as Track;

const testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("waveformVisibleSlice", () => {
    it("resetEditingTrack resets the waveformVisible flag", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(waveformVisibleSlice.actions.setWaveformVisible(false));

        // WHEN
        testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

        // THEN
        expect(testingStore.getState().waveformVisible).toBeTruthy();
    });

    it("show waveform by default", () => {
        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().waveformVisible).toBeTruthy();
    });
});
