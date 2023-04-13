import "../../../testUtils/initBrowserEnvironment";
import { createRef } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { CueDto, Language, ScrollPosition, Track } from "../../model";
import { updateCues, updateVttCue } from "./cuesListActions";
import { updateSourceCues } from "../view/sourceCueSlices";
import CuesList from "./CuesList";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { updateEditingTrack } from "../../trackSlices";
import { changeScrollPosition, scrollPositionSlice } from "./cuesListScrollSlice";
import { act } from "react-dom/test-utils";
import CueLine from "../cueLine/CueLine";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import AddCueLineButton from "../edit/AddCueLineButton";
import { matchedCuesSlice } from "./cuesListSlices";
import CueListToolbar from "../../CueListToolbar";
import { createTestingMatchedCues, createTestingSourceCues, createTestingTargetCues } from "./cuesListTestUtils";

const scrollIntoViewCallsTracker = jest.fn();

/**
 * Can't use arrow syntax here, because need to use 'this' keyword for tracking caller element.
 * Inspired by https://github.com/jsdom/jsdom/issues/1695#issuecomment-438245889
 */
Element.prototype.scrollIntoView = function (): void {
    scrollIntoViewCallsTracker(this);
};

const testingCaptionTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    progress: 50
} as Track;

const testingTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

let testingStore = createTestingStore();

const testingMatchedCues = createTestingMatchedCues(1);
let testingSourceCues = createTestingSourceCues(testingMatchedCues);
let testingTargetCues = createTestingTargetCues(testingMatchedCues);

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingSourceCues = createTestingSourceCues(testingMatchedCues);
        testingTargetCues = createTestingTargetCues(testingMatchedCues);
        jest.resetAllMocks();
    });

    describe("renders", () => {
        it("empty track", () => {
            // GIVEN
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        style={{
                            flex: "1 1 60%",
                            height: "90%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                        <div style={{ overflow: "auto" }} className="sbte-cue-list" />
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const expected = removeDraftJsDynamicValues(actualNode.container.outerHTML);
            const actual = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
            expect(expected).toEqual(actual);
        });

        it("without pagination", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const matchedCuesShort = [
                { targetCues: [{ index: 0, cue: targetCues[0] }], sourceCues: [{ index: 0, cue: sourceCues[0] }]},
                { targetCues: [{ index: 1, cue: targetCues[1] }], sourceCues: [{ index: 1, cue: sourceCues[1] }]},
                { targetCues: [{ index: 2, cue: targetCues[2] }], sourceCues: [{ index: 2, cue: sourceCues[2] }]},
            ];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        style={{
                            flex: "1 1 60%",
                            height: "90%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ overflow: "auto" }} className="sbte-cue-list">
                            <CueLine
                                key={0}
                                data={matchedCuesShort[0]}
                                rowIndex={0}
                                rowProps={{
                                    targetCuesLength: 3,
                                    withoutSourceCues: false,
                                    matchedCues: matchedCuesShort,
                                    commentAuthor: "Linguist"
                                }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                key={1}
                                data={matchedCuesShort[1]}
                                rowIndex={1}
                                rowProps={{
                                    targetCuesLength: 3,
                                    withoutSourceCues: false,
                                    matchedCues: matchedCuesShort,
                                    commentAuthor: "Linguist"
                                }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                key={2}
                                data={matchedCuesShort[2]}
                                rowIndex={2}
                                rowProps={{
                                    targetCuesLength: 3,
                                    withoutSourceCues: false,
                                    matchedCues: matchedCuesShort,
                                    commentAuthor: "Linguist"
                                }}
                                rowRef={createRef()}
                            />
                        </div>
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const expected = removeDraftJsDynamicValues(actualNode.container.outerHTML);
            const actual = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
            expect(expected).toEqual(actual);
        });

        it("first page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        style={{
                            flex: "1 1 60%",
                            height: "90%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ overflow: "auto" }} className="sbte-cue-list">
                            {
                                Array.from({ length: 105 }, (_element, index) => (
                                    <CueLine
                                        key={index}
                                        data={testingMatchedCues[index]}
                                        rowIndex={index}
                                        rowProps={{
                                            targetCuesLength: 120,
                                            withoutSourceCues: false,
                                            matchedCues: testingMatchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                ))
                            }
                            <button
                                className="sbte-btn sbte-btn-primary sbte-next-button w-full"
                                onClick={jest.fn()}
                            >
                                Load Next Cues
                            </button>
                        </div>
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const expected = removeDraftJsDynamicValues(actualNode.container.outerHTML);
            const actual = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
            expect(expected).toEqual(actual);
        });

        it("middle page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(102) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        style={{
                            flex: "1 1 60%",
                            height: "90%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ overflow: "auto" }} className="sbte-cue-list">
                            <button
                                style={{ marginBottom: 5 }}
                                className="sbte-btn sbte-btn-primary sbte-previous-button w-full"
                                onClick={jest.fn()}
                            >
                                Load Previous Cues
                            </button>
                            {
                                Array.from({ length: 110 }, (_element, index) => (
                                    <CueLine
                                        key={index + 95}
                                        data={testingMatchedCues[index + 95]}
                                        rowIndex={index + 95}
                                        rowProps={{
                                            targetCuesLength: 120,
                                            withoutSourceCues: false,
                                            matchedCues: testingMatchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                ))
                            }
                            <button
                                className="sbte-btn sbte-btn-primary sbte-next-button w-full"
                                onClick={jest.fn()}
                            >
                                Load Next Cues
                            </button>
                        </div>
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const expected = removeDraftJsDynamicValues(actualNode.container.outerHTML);
            const actual = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
            expect(expected).toEqual(actual);
        });

        it("last page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(202) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        style={{
                            flex: "1 1 60%",
                            height: "90%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ overflow: "auto" }} className="sbte-cue-list">
                            <button
                                style={{ marginBottom: 5 }}
                                className="sbte-btn sbte-btn-primary sbte-previous-button w-full"
                                onClick={jest.fn()}
                            >
                                Load Previous Cues
                            </button>
                            {
                                Array.from({ length: 25 }, (_element, index) => (
                                    <CueLine
                                        key={index + 195}
                                        data={testingMatchedCues[index + 195]}
                                        rowIndex={index + 195}
                                        rowProps={{
                                            targetCuesLength: 120,
                                            withoutSourceCues: false,
                                            matchedCues: testingMatchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                ))
                            }
                        </div>
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const expected = removeDraftJsDynamicValues(actualNode.container.outerHTML);
            const actual = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
            expect(expected).toEqual(actual);
        });
    });

    describe("pagination button", () => {
        it("'Load previous Cues' scrolls to previous page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(102) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-previous-button") as Element);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(99);
        });

        it("'Load Previous Cues' scrolls to previous page if focusedCueIndex is null", async () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(202) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector(".sbte-previous-button") as Element);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(199);
        });

        it("'Load Next Cues' scrolls to next page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(52) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-next-button") as Element);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(100);
        });

        it("'Load Next Cues' scrolls to next page is focused cue index is null", async () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(52) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector(".sbte-next-button") as Element);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(100);
        });
    });

    describe("scrolling into view", () => {
        it("starts at correct focused cue index when times are synced in translation mode", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).not.toContain("Target Line 0");
            expect(scrolledElement.outerHTML).not.toContain("Target Line 1");
            expect(scrolledElement.outerHTML).toContain("Target Line 2");
        });

        it("starts at correct focused cue index when target cue end time is shorter", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 1.5, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];


            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).not.toContain("Target Line 0");
            expect(scrolledElement.outerHTML).toContain("Target Line 1");
            expect(scrolledElement.outerHTML).not.toContain("Target Line 2");
        });
    });

    describe("pagination based on editing cue index", () => {
        it("renders first page and editing cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
        });

        it("renders first page and editing cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(49) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
        });

        it("renders second page and editing cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine50-0TrgLine50-0TrgLine50-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine50-0TrgLine50-0TrgLine50-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine99-0TrgLine99-0TrgLine99-0");
        });

        it("renders third page and editing cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(111) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine111-0TrgLine111-0TrgLine111-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine100-0TrgLine100-0TrgLine100-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine129-0TrgLine129-0TrgLine129-0");
        });
    });

    describe("pagination based on focused cue index", () => {
        it("renders first page and focused cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(0) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
        });

        it("renders first page and focused cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(49) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine0-0TrgLine0-0TrgLine0-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine49-0TrgLine49-0TrgLine49-0");
        });

        it("renders second page and focused cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine50-0TrgLine50-0TrgLine50-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine50-0TrgLine50-0TrgLine50-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine99-0TrgLine99-0TrgLine99-0");
        });

        it("renders third page and focused cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(111) as {} as AnyAction);

            // WHEN

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("TrgLine111-0TrgLine111-0TrgLine111-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine100-0TrgLine100-0TrgLine100-0");
            expect(actualNode.container.outerHTML).toContain("TrgLine119-0TrgLine119-0TrgLine119-0");
        });
    });

    describe("jumps", () => {
        it("scrolls to last cue", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("Caption Line 7");
            expect(testingStore.getState().focusedCueIndex).toEqual(6);
        });

        it("scrolls to first cue", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            });

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("Caption Line 1");
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("scrolls to last cue twice in a row", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(2);
            const scrolledElement1 = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement1.outerHTML).toContain("Caption Line 7");
            const scrolledElement2 = scrollIntoViewCallsTracker.mock.calls[1][0];
            expect(scrolledElement2.outerHTML).toContain("Caption Line 7");
            expect(testingStore.getState().focusedCueIndex).toEqual(6);
        });

        it("scrolls to last cue on different page twice in a row", async () => {
            const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
                { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
            ));
            testingStore.dispatch(updateCues(testingSourceCuesForPagination) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(119);
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(3);
            const scrolledElement1 = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement1.outerHTML).toContain("Caption Line 119");
            const scrolledElement2 = scrollIntoViewCallsTracker.mock.calls[1][0];
            expect(scrolledElement2.outerHTML).toContain("Caption Line 119");
            const scrolledElement3 = scrollIntoViewCallsTracker.mock.calls[2][0];
            expect(scrolledElement3.outerHTML).toContain("Caption Line 119");
        });

        it("prevent losing page index when focused cue index is null", async () => {
            const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
                { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
            ));
            testingStore.dispatch(updateCues(testingSourceCuesForPagination) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(null);
            expect(actualNode.container.querySelector("div")?.outerHTML).toContain("Caption Line 119");
            expect(actualNode.container.querySelector("div")?.outerHTML).toContain("Caption Line 100");
        });

        it("scrolls to first media chunk when task is open", async () => {
            // GIVEN
            const testingCaptionTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                mediaChunkStart: 4000,
                mediaChunkEnd: 5000,
                progress: 50
            } as Track;

            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", editDisabled: true },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", editDisabled: true  },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE", editDisabled: true  },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE", editDisabled: true  },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE", editDisabled: false  },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE", editDisabled: false  },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE", editDisabled: true  },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);

            // WHEN
            render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );
            expect(testingStore.getState().focusedCueIndex).toEqual(4);
        });
    });

    describe("handles correctly complicated edge cases", () => {
        it("doesn't save editor change to next cue when cue is quickly deleted after text updates", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Target Line 1");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual("Target Line 1");
        });

        it("does save editor change if text is being written and user quickly hits Enter", async () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
            testingStore.dispatch(updateVttCue(0, new VTTCue(0, 1, "Target Line 0 edited")) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Target Line 0 edited Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual("Target Line 0 edited Paste text to end");
            expect(actualNode.container.outerHTML).toContain("Target Line 0 edited Paste text to end");
        });

        it("renders changed value if user edits and quickly navigates away for newly created caption cue", async () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);

            // THEN
            await waitFor(() => {
                expect(testingStore.getState().cues[0].vttCue.text).toEqual(" Paste text to end");
                expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                    .toEqual(" Paste text to end");
                expect(actualNode.container.outerHTML).toContain(" Paste text to end");
            });
        });

        it("renders changed value if user edits and quickly navigates away for newly created translated cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(matchedCuesSlice.actions.matchCuesByTime(
                { cues: targetCues, sourceCues, editingCueIndex: -1 }
            ) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual(" Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual(" Paste text to end");
            expect(actualNode.container.outerHTML).toContain(" Paste text to end");
        });

        it("remains scroll into view working if cues are imported", async () => {
            // GIVEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        commentAuthor="Linguist"
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            testingStore.dispatch(updateCues(testingTargetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector(".sbte-cue-list")?.dispatchEvent(new Event("scroll"));
            });

            // THEN
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("TrgLine50-0TrgLine50-0TrgLine50-0");
        });
    });
});
