import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCues } from "./cuesList/cuesListActions";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("saveSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    const saveTrack = jest.fn();
    const testingTrack = { mediaTitle: "testingTrack", timecodesUnlocked: true } as Track;

    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
    });

    describe("saveTrack", () => {
        it("calls saveTrack", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            callSaveTrack(testingStore.dispatch, testingStore.getState);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith(
                { cues: testingCues, editingTrack: testingTrack, shouldCreateNewVersion: true }
            );
        });

        it("calls saveTrack and update version", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            callSaveTrack(testingStore.dispatch, testingStore.getState);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith(
                { cues: testingCues, editingTrack: testingTrack, shouldCreateNewVersion: true }
            );
        });
    });

});
