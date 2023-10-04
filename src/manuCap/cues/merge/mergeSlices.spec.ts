import testingStore from "../../../testUtils/testingStore";
import { AnyAction } from "@reduxjs/toolkit";
import { showMerge } from "./mergeSlices";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { CueDto } from "../../model";
import { updateCues } from "../cuesList/cuesListActions";
import { setFind } from "../searchReplace/searchReplaceSlices";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" }
] as CueDto[];

describe("mergeSlices", () => {
    describe("showMerge", () => {
        it("sets merge visible", () => {
            // WHEN
            testingStore.dispatch(showMerge(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().mergeVisible).toBeTruthy();
        });

        it("clears editing cue index on merge visible change", () => {
            // GIVEN
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(showMerge(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("resets search replace state on merge visible change", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            testingStore.dispatch(setFind("Line") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(showMerge(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
        });
    });
});
