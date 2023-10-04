import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCues } from "./cuesList/cuesListActions";
import { callSaveCueUpdate, saveCueUpdateSlice } from "./saveCueUpdateSlices";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

const updateCueMock = jest.fn();
const testingTrack = { mediaTitle: "testingTrack", timecodesUnlocked: true } as Track;

describe("saveCueUpdateSlices", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        jest.clearAllMocks();
    });

    it("calls updateCue function when callSaveCueUpdate is invoked", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        const expectedCueUpdate = {
            editingTrack: testingTrack,
            cue: testingCues[0],
            onAddCueSaveSuccess: expect.any(Function)
        };

        // WHEN
        testingStore.dispatch(callSaveCueUpdate(0) as {} as AnyAction);

        // THEN
        expect(updateCueMock).toHaveBeenCalledTimes(1);
        expect(updateCueMock).toBeCalledWith(expectedCueUpdate);
    });

    it("updates cue when onAddCueSaveSuccess callback in called", () => {
        // GIVEN
        const testingCues = [
            {
                addId: "test-add-id",
                vttCue: new VTTCue(0, 1, "testing-cue"),
                cueCategory: "LYRICS",
                errors: []
            }
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        const responseCueDto = {
            ...testingCues[0],
            addId: undefined,
            id: "testing-cue-id",
            trackVersionId: "testing-track-version-id"
        };
        const expectedCueDto = {
            ...testingCues[0],
            addId: undefined,
            id: "testing-cue-id"
        };
        testingStore.dispatch(callSaveCueUpdate(0) as {} as AnyAction);

        // WHEN
        updateCueMock.mock.calls[0][0].onAddCueSaveSuccess(responseCueDto);

        // THEN
        expect(testingStore.getState().cues).toEqual([expectedCueDto]);
    });

    it("doesn't call updateCue function when callSaveCueUpdate is invoked with invalid index", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        // WHEN
        testingStore.dispatch(callSaveCueUpdate(1) as {} as AnyAction);

        // THEN
        expect(updateCueMock).not.toHaveBeenCalled();
    });

});
