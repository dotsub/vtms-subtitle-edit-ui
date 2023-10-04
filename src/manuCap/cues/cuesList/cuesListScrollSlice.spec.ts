import { createTestingStore } from "../../../testUtils/testingStore";
import { changeScrollPosition, currentCueErrorIndexSlice, scrollPositionSlice } from "./cuesListScrollSlice";
import { CueDto, ScrollPosition } from "../../model";
import { AnyAction } from "@reduxjs/toolkit";
import each from "jest-each";
import { MatchedCuesWithEditingFocus } from "./cuesListTimeMatching";
import deepFreeze from "deep-freeze";

const testingMatchedCues = { matchedCues: [], matchedCuesFocusIndex: 58 } as MatchedCuesWithEditingFocus;
testingMatchedCues.matchedCues = Array.from({ length: 120 }, () => ({}));

const testingSourceCues = Array.from({ length: 120 }, (_element, index) => (
    { vttCue: new VTTCue(index, index + 1, "Source Line " + index), cueCategory: "DIALOGUE" } as CueDto
));

const testingTargetCues = Array.from({ length: 70 },(_element, index) => (
    { vttCue: new VTTCue(index, index + 1, "Target Line " + index), cueCategory: "DIALOGUE" } as CueDto
));

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cuesListScrollSlice", () => {
    describe("changeScrollPosition with not null previous focused index", () => {
        beforeEach(() => {
            testingStore = createTestingStore({
                matchedCues: testingMatchedCues,
                cues: testingTargetCues,
                sourceCues: testingSourceCues,
                editingCueIndex: 108,
                currentPlayerTime: 65,
                focusedCueIndex: 110
            });
        });

        each([
            [ScrollPosition.NONE, null],
            [ScrollPosition.FIRST, 0],
            [ScrollPosition.LAST, 119],
            [ScrollPosition.CURRENT, 58],
            [ScrollPosition.PLAYBACK, 64],
            [ScrollPosition.NEXT_PAGE, 200],
            [ScrollPosition.PREVIOUS_PAGE, 99],
            [ScrollPosition.LAST_TRANSLATED, 69],
            [undefined, null],
        ])
        .it("updates scroll position focused cue index in Redux store for scroll position %s", (
            scrollPosition: ScrollPosition,
            expectedFocusedCueIndex: number
        ) => {
            // WHEN
            testingStore.dispatch(changeScrollPosition(scrollPosition) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(expectedFocusedCueIndex);
        });
    });

    describe("changeScrollPosition with null previous focused index", () => {
        beforeEach(() => {
            testingStore = createTestingStore({
                matchedCues: testingMatchedCues,
                cues: testingTargetCues,
                sourceCues: testingSourceCues,
                editingCueIndex: 108,
                currentPlayerTime: 65,
            });
        });

        each([
            [ScrollPosition.NONE, null],
            [ScrollPosition.FIRST, 0],
            [ScrollPosition.LAST, 119],
            [ScrollPosition.CURRENT, 58],
            [ScrollPosition.PLAYBACK, 64],
            [ScrollPosition.NEXT_PAGE, 100],
            [ScrollPosition.PREVIOUS_PAGE, -1],
            [ScrollPosition.LAST_TRANSLATED, 69],
            [undefined, null],
        ])
            .it("updates scroll position focused cue index in Redux store for scroll position %s", (
                scrollPosition: ScrollPosition,
                expectedFocusedCueIndex: number
            ) => {
                // WHEN
                testingStore.dispatch(changeScrollPosition(scrollPosition) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().focusedCueIndex).toEqual(expectedFocusedCueIndex);
            });
    });

    it("do not trigger redux actions when user is just scrolling", () => {
        // GIVEN
        const changeFocusedCueIndexSpy = jest.spyOn(scrollPositionSlice.actions, "changeFocusedCueIndex");
        changeFocusedCueIndexSpy.mockClear();
        const changeCurrentCueErrorPositionSpy =
            jest.spyOn(currentCueErrorIndexSlice.actions, "changeCurrentCueErrorPosition");
        changeCurrentCueErrorPositionSpy.mockClear();

        testingStore = createTestingStore({
            matchedCues: testingMatchedCues,
            cues: testingTargetCues,
            sourceCues: testingSourceCues,
            editingCueIndex: null,
            currentPlayerTime: 65,
            focusedCueIndex: 110
        });

        // WHEN
        testingStore.dispatch(changeScrollPosition(ScrollPosition.NONE) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.NONE) as {} as AnyAction);

        // THEN
        expect(changeFocusedCueIndexSpy).toBeCalledTimes(1);
        expect(changeCurrentCueErrorPositionSpy).toBeCalledTimes(1);
    });
});
