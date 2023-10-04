import "../../../testUtils/initBrowserEnvironment";
import { ReactElement } from "react";
import SearchReplaceEditor from "./SearchReplaceEditor";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { searchReplaceSlice, setFind, setReplacement, showSearchReplace } from "./searchReplaceSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { CueDto, Track } from "../../model";
import { updateCues, updateMatchedCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import ToggleButton from "../../toolbox/ToggleButton";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";
import { createTestingMatchedCues } from "../cuesList/cuesListTestUtils";

let testingStore = createTestingStore();

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
    {
        vttCue: new VTTCue(6, 8, "Caption Line 2"),
        cueCategory: "ONSCREEN_TEXT"
    },
] as CueDto[];

const testingCuesWithEditDisabled = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", editDisabled: true },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]},
        editDisabled: false
    },
    {
        vttCue: new VTTCue(6, 8, "Caption Line 4"),
        cueCategory: "ONSCREEN_TEXT",
        editDisabled: true
    },
] as CueDto[];

let testingMatchedCues = createTestingMatchedCues(3);

describe("SearchReplaceEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingMatchedCues = createTestingMatchedCues(3);
    });

    it("renders", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
                <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                    <input type="text" defaultValue="" placeholder="Find" className="sbte-form-control !h-full" />
                    <input
                        type="text"
                        defaultValue=""
                        placeholder="Replace"
                        className="sbte-form-control !h-full"
                        style={{ marginLeft: "5px" }}
                    />
                </div>
                <button
                    className="sbte-btn sbte-btn-light sbte-btn-sm sbte-search-next"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-next"
                >
                    <i className="fa-duotone fa-arrow-down" />
                </button>
                <button
                    className="sbte-btn sbte-btn-light sbte-btn-sm sbte-search-prev"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-prev"
                >
                    <i className="fa-duotone fa-arrow-up" />
                </button>
                <button
                    className="sbte-btn sbte-btn-light sbte-btn-sm !text-blue-light"
                    type="button"
                    disabled
                    style={{ marginLeft: "5px" }}
                >
                    Replace
                </button>
                <button
                    className="sbte-btn sbte-btn-light sbte-btn-sm !text-blue-light"
                    type="button"
                    style={{ marginLeft: "5px", marginRight: "5px" }}
                >
                    Replace All
                </button>
                <ToggleButton
                    className="sbte-btn sbte-btn-light !text-blue-light"
                    toggled={false}
                    onClick={jest.fn()}
                    render={(): ReactElement => (<span>Aa</span>)}
                    title="Case insensitive"
                />
                <span style={{ flex: 1 }} />
                <button
                    className="sbte-btn sbte-btn-danger sbte-btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-close-search-replace-sbte-btn"
                >
                    <i className="fa-duotone fa-times-circle" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("does not render of show is false", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(false) as {} as AnyAction);

        // WHEN
        const { container } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(container.outerHTML).toEqual("<div></div>");
    });

    it("sets find in redux when changed", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const findInput = getByPlaceholderText("Find");

        // WHEN
        fireEvent.change(findInput, { target: { value: "testing" }});

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("testing");
    });

    it("sets replacement in redux when changed and replace button clicked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByPlaceholderText, getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceInput = getByPlaceholderText("Replace");
        const replaceButton = getByText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "testing-repl" }});
        fireEvent.click(replaceButton);

        // THEN
        expect(testingStore.getState().searchReplace.replacement).toEqual("testing-repl");
    });

    it("sets show search replace to false when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const closeButton = getByTestId("sbte-close-search-replace-sbte-btn");

        // WHEN
        fireEvent.click(closeButton);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeFalsy();
    });

    it("sets matchCase to true when match case button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const matchCaseButton = getByText("Aa");

        // WHEN
        fireEvent.click(matchCaseButton);

        // THEN
        expect(testingStore.getState().searchReplace.matchCase).toBeTruthy();
    });

    describe("search next", () => {
        it("doesn't find match", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("no-match") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("no-match");
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

        it("finds match in next source line", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("Line") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 4,
                offset: 3,
                offsetIndex: 0
            });
        });

        it("finds match in next target line", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 0,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 7,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds next match in multi matched source cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 2,
                targetCueIndex: 9007199254740991,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds next third match in multi matched source cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 2,
                targetCueIndex: 9007199254740991,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("finds next match in multi matched target cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 2,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds next third match in multi matched target cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 2,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 2,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("finds match in target cue after changing search direction", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: 2,
                targetCueIndex: -1,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 2,
                targetCueIndex: 9007199254740991,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("finds match in target cue after changing search direction", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-2") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: -1,
                targetCueIndex: 2,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-2");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 2,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("searches for next match with regex special chars when Next button is clicked", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 2, "Caption [Line 2]"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
                {
                    vttCue: new VTTCue(6, 8, "Caption [Line 2]"),
                    cueCategory: "ONSCREEN_TEXT"
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("[Line 2]") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const nextButton = getByTestId("sbte-search-next");

            // WHEN
            fireEvent.click(nextButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("[Line 2]");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.indices.offset).toEqual(8);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });
    });

    describe("search previous", () => {
        it("doesn't find match", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("no-match") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("no-match");
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

        it("finds match in previous source line", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(219);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 219,
                sourceCueIndex: 2,
                targetCueIndex: -1,
                matchLength: 7,
                offset: 24,
                offsetIndex: 2
            });
        });

        it("finds match in previous target line", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine");
            expect(testingStore.getState().editingCueIndex).toEqual(219);
            expect(testingStore.getState().focusedCueIndex).toEqual(219);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 219,
                sourceCueIndex: -1,
                targetCueIndex: 2,
                matchLength: 7,
                offset: 24,
                offsetIndex: 2
            });
        });

        it("finds last previous match in multi matched source cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("finds previous first match in multi matched source cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");
            fireEvent.click(prevButton);
            fireEvent.click(prevButton);

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds last previous match in multi matched target cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 11,
                offset: 22,
                offsetIndex: 2
            });
        });

        it("finds previous first match in multi matched target cue", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds match in source cue after changing search direction", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("SrcLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: 0,
                targetCueIndex: 9007199254740991,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("SrcLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });

        it("finds match in target cue after changing search direction", () => {
            // GIVEN
            testingStore.dispatch(
                matchedCuesSlice.actions.setMatchCuesForTesting(testingMatchedCues) as {} as AnyAction
            );
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
            testingStore.dispatch(setFind("TrgLine10-0") as {} as AnyAction);
            const { getByTestId } = render(
                <Provider store={testingStore}>
                    <SearchReplaceEditor />
                </Provider>
            );
            const prevButton = getByTestId("sbte-search-prev");
            testingStore.dispatch(searchReplaceSlice.actions.setIndices({
                matchedCueIndex: 10,
                sourceCueIndex: 9007199254740991,
                targetCueIndex: 0,
                matchLength: 11,
                offset: 11,
                offsetIndex: 1
            }));

            // WHEN
            fireEvent.click(prevButton);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("TrgLine10-0");
            expect(testingStore.getState().editingCueIndex).toEqual(10);
            expect(testingStore.getState().focusedCueIndex).toEqual(10);
            expect(testingStore.getState().searchReplace.indices).toEqual({
                matchedCueIndex: 10,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 11,
                offset: 0,
                offsetIndex: 0
            });
        });
    });

    it("invokes replace current match when Replace button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceButton = getByText("Replace");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Line 2" }});
        fireEvent.click(replaceButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
    });

    it("replaces all matches and save when Replace All button is clicked", async () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");
        testingStore.dispatch(matchedCuesSlice.actions
            .matchCuesByTime({ cues: [], sourceCues: [], editingCueIndex: 0 })
        );

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Line 5" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 5");
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("Update matched cues in Redux when Replace All button is clicked", async () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");
        testingStore.dispatch(updateMatchedCues() as {} as AnyAction);

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Line 5" }});
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(4);
    });

    it("replaces all matches replace contains find", async () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "Caption <b>Line 2</b> and <i>Line 2</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>Line 2</b> and Line 2"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption Line 2"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Line 2" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>New Line 2</b> and <i>New Line 2</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>New Line 2</b> and New Line 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 2");
    });

    it("replaces all matches replace shorter than find", async () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "Caption <b>Line 2</b> and <i>Line 2</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>Line 2</b> and Line 2"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption Line 2"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "test" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>test</b> and <i>test</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>test</b> and test");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption test");
    });

    it("replaces all matches replace is empty string", async () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "  Caption <b>Line 2</b> and <i>Line 2</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>Line 2</b> and Line 2"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption Line 2"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption  and ");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption  and ");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption ");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
    });

    it("replaces all matches with regex special chars when Replace button is clicked", async () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "  Caption <b>[Line 2]</b> and <i>{Line 2}</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>[Line 2]</b> and {Line 2}"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption [Line 2]"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("[Line 2]") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "[LINE 2]" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("[Line 2]");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>[LINE 2]</b> and <i>{Line 2}</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>[LINE 2]</b> and {Line 2}");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption [LINE 2]");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
    });

    it("does not replace all match when Replace All button is clicked and find is empty", async () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(setFind("") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 5") as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Line 5" }});
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 5");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().focusedCueIndex).toEqual(null);
    });

    it("replaces all matches and skips editDisabled and save when Replace All button is clicked",
        async () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "New Text Update" }});
        fireEvent.click(replaceAllButton);

        // THEN
        await waitFor(() => expect(saveTrack).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
        expect(testingStore.getState().searchReplace.replacement).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("New Text Update 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("New Text Update 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption Line 4");
    });
});
