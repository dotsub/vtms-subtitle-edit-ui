import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCues } from "./cuesList/cuesListActions";
import { callSaveCueDelete, saveCueDeleteSlice } from "./saveCueDeleteSlices";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

const deleteCueMock = jest.fn();
const testingTrack = { mediaTitle: "testingTrack", timecodesUnlocked: true } as Track;

describe("saveCueDeleteSlices", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueMock));
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        jest.clearAllMocks();
    });

    it("calls deleteCue function when callSaveCueDelete is invoked", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", errors: []}
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        // WHEN
        callSaveCueDelete(testingStore.getState, testingCues[0]);

        // THEN
        expect(deleteCueMock).toHaveBeenCalledTimes(1);
        expect(deleteCueMock).toBeCalledWith(
            { cue: testingCues[0], editingTrack: testingTrack }
        );
    });

});
