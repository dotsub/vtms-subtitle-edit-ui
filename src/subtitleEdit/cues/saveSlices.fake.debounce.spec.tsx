import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, SaveState, setAutoSaveSuccess, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCues } from "./cuesList/cuesListActions";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex")
}));

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
            expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
            expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.REQUEST_SENT);
        });

        it("calls saveTrack and update version", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            callSaveTrack(testingStore.dispatch, testingStore.getState, true);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith(
                { cues: testingCues, editingTrack: testingTrack, shouldCreateNewVersion: true }
            );
            expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.REQUEST_SENT);
            expect(testingStore.getState().saveAction.multiCuesEdit).toBeTruthy();
        });
    });

    describe("setAutoSaveSuccess", () => {
        it("saves track without updating version", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            callSaveTrack(testingStore.dispatch, testingStore.getState);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
            expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.SAVED);
            expect(testingStore.getState().saveAction.multiCuesEdit).toBeFalsy();
        });

        it("saves track and create new version", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            callSaveTrack(testingStore.dispatch, testingStore.getState, true);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith(
                { cues: testingCues, editingTrack: testingTrack, shouldCreateNewVersion: true }
            );
            expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.SAVED);
            expect(testingStore.getState().saveAction.multiCuesEdit).toBeFalsy();
        });
    });
});
