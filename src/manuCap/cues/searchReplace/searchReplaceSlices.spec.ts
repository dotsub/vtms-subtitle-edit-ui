import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../../testUtils/testingStore";

import {
    replaceCurrentMatch,
    searchCueText,
    searchNextCues,
    searchPreviousCues,
    searchReplaceSlice,
    setFind,
    setMatchCase,
    setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { updateCues } from "../cuesList/cuesListActions";
import { CueDto } from "../../model";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";
import { createTestingMatchedCues } from "../cuesList/cuesListTestUtils";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testingCuesWithEditDisabled = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE", editDisabled: true },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]},
        editDisabled: false
    },
    {
        vttCue: new VTTCue(6, 9, "Caption Line 4"), cueCategory: "ONSCREEN_TEXT",
        editDisabled: true
    },
] as CueDto[];

let testingStore = createTestingStore();
let testingMatchedCues = createTestingMatchedCues(3);

describe("searchReplaceSlices", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingMatchedCues = createTestingMatchedCues(3);
    });

    describe("setFind", () => {
        it("default is empty string", () => {
            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
        });

        it("sets search replace find state", () => {
            // WHEN
            testingStore.dispatch(setFind("testing") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("testing");
        });
    });

    describe("setReplacement", () => {
        it("default is empty string", () => {
            // THEN
            expect(testingStore.getState().searchReplace.replacement).toEqual("");
        });

        it("sets search replace replacement state", () => {
            // WHEN
            testingStore.dispatch(setReplacement("testing-repl") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.replacement).toEqual("testing-repl");
        });
    });

    describe("setMatchCase", () => {
        afterEach(() => {
            testingStore.dispatch(setMatchCase(false) as {} as AnyAction);
        });

        it("default is false", () => {
            // THEN
            expect(testingStore.getState().searchReplace.matchCase).toBeFalsy();
        });

        it("sets match case state", () => {
            // WHEN
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.matchCase).toBeTruthy();
        });
    });

    describe("searchNextCues", () => {
        it("searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("line 2");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 6,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("searches for find term in next cue match case - no match", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(null);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: -1,
                sourceCueIndex: -1,
                targetCueIndex: -1,
                matchLength: 0,
                offset: -1,
                offsetIndex: 0
            });
        });

        it("searches for find term in next cue match case - with match", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 6,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("searches for find term in cue with many matches next", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 8,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"

                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 16,
                offsetIndex: 1
            });
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("sets editing cue index to next when current cue is end of matches", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 16,
                offsetIndex: 1,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("wraps search to first when current cue is last", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 13,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("stops search if last cue match is last in whole track - next", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 13,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption bar and bar"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption bar"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 13,
                offsetIndex: 0
            });
        });

        it("sets editing cue index to next and first offsetIndex for cue", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 16,
                offsetIndex: 1,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("handles cues with empty cleansed vtt text", () => {
            // GIVEN
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "<b/>"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT"
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("doesn't skip cues with editDisabled when searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 6,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("searches in target cues that are disabled", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 12,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("does not search if find is empty string", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: -1,
                sourceCueIndex: -1,
                targetCueIndex: -1,
                matchLength: 0,
                offset: -1,
                offsetIndex: 0
            });
        });

        it("does not search if there are no cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setFind("test") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("test");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: -1,
                sourceCueIndex: -1,
                targetCueIndex: -1,
                matchLength: 0,
                offset: -1,
                offsetIndex: 0
            });
        });

        it("finds first match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds second match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 0,
                offsetIndex: 0
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            });
        });

        it("finds last match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            });
        });

        it("finds match in multi-matched source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-1") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 1,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 0,
                offsetIndex: 0
            }));
        });

        it("finds match when search direction is changed", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            });
        });
    });

    describe("searchPreviousCues", () => {
        it("searches for find term in previous cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().searchReplace.direction).toEqual("PREVIOUS");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 6,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("searches for find term in cue with many matches previous", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 16,
                offsetIndex: 1,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("wraps search to last cue when current cue is first", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                offset: 8,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("stops search if last cue match is last in whole track - previous", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 8,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption testing"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption bar"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("wraps search to last cue when current cue is last on top", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 8,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption testing"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("sets editing cue index to previous when current cue is end of matches", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 8,
                offsetIndex: 0,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo and foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("sets editing cue index to previous and last offsetIndex for cue", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 16,
                offsetIndex: 1,
                matchLength: 3
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 3,
                offset: 8,
                offsetIndex: 0
            });
        });

        it("searches in cues that are disabled for editing", () => {
            // GIVEN
            const searchReplaceIndices = {
                matchedCueIndex: 1,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 0,
                offsetIndex: 0,
                matchLength: 12
            };
            testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceIndices));
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
            expect(testingStore.getState().searchReplace.direction).toEqual("PREVIOUS");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                offset: 0,
                offsetIndex: 0,
                matchLength: 12
            });
        });

        it("does not search if find is empty string", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: -1,
                sourceCueIndex: -1,
                targetCueIndex: -1,
                matchLength: 0,
                offset: -1,
                offsetIndex: 0
            });
        });

        it("does not search if there are no cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setFind("test") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("test");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: -1,
                sourceCueIndex: -1,
                targetCueIndex: -1,
                matchLength: 0,
                offset: -1,
                offsetIndex: 0
            });
        });

        it("finds first match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds second match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            });
        });

        it("finds last match in source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            });
        });

        it("finds match in multi-matched source cues", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-1") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 1,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            }));
        });

        it("finds match when search direction is changed", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 10,
                offset: 20,
                offsetIndex: 2
            }));
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine2-0") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 10,
                offset: 10,
                offsetIndex: 1
            });
        });
    });

    describe("showSearchReplace", () => {
        it("sets search replace visible", () => {
            // WHEN
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
        });
    });

    describe("replaceCurrentMatch", () => {
        it("sets replacement", () => {
            // WHEN
            testingStore.dispatch(replaceCurrentMatch("replacementValue") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.replacement).toEqual("replacementValue");
        });
    });

    describe("searchCueText supports regex special character escaping", () => {
        test.each([
            ["$", "$te$est$"], ["[", "[te[est["], ["]", "]te]est]"], ["-", "-te-est-"],
            ["\\", "\\te\\est\\"], ["^", "^te^est^"], ["*", "*te*est*"], ["+", "+te+est+"],
            ["?", "?te?est?"], [".", ".te.est."], ["(", "(te(est("], [")", ")te)est)"],
            ["|", "|te|est|"], ["{", "{te{est{"], ["}", "}te}est}"], [")", ")te)est)"],
            ["/", "/te/est/"]
        ])(
            "returns proper search result array for special character %s",
            (find: string, text: string) => {
                // WHEN
                const result = searchCueText(text, find, false);

                //THEN
                expect(result).toEqual([0, 3, 7]);
            },
        );

        test.each([
            ["<i>Editing</i> Line Wrapped text and", "text", [21]],
            ["<i>Editing</i> <u>Line</u> Wrapped text and", "text", [21]],
            ["<i>Editing</i> <u>Line</u> Wr$%^&apped text and", "text", [25]],
            ["<i>Editing</i> <u>Line</u> $ >> Wr$%^&apped text and", "text", [30]],
            ["<i>Editing</i> Line $ >> Wr$%^&apped text and text", "text", [30, 39]],
            ["<i>Editing</i> Line $ <strong>>></strong> Wr$%^&apped text and", ">>", [15]],
            ["<i>Editing</i> Line $ <strong>>></strong> Wr$%^&apped text", "$", [13, 20]]
        ])(
            "returns proper search result for html text %s",
            (html: string, find: string, expectedResult: number[]) => {
                // WHEN
                const result = searchCueText(html, find, false);

                // THEN
                expect(result).toEqual(expectedResult);
            });
    });
});
