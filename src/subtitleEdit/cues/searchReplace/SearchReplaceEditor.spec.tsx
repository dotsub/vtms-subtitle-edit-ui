/**  * @jest-environment jsdom-sixteen  */
import "../../../testUtils/initBrowserEnvironment";
import { ReactElement } from "react";
import SearchReplaceEditor from "./SearchReplaceEditor";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { setFind, setReplacement, showSearchReplace } from "./searchReplaceSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { CueDto, Track } from "../../model";
import { updateCues } from "../cuesList/cuesListActions";
import { SaveState, setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import ToggleButton from "../../toolbox/ToggleButton";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";

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


describe("SearchReplaceEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
                <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                    <input type="text" defaultValue="" placeholder="Find" className="form-control" />
                    <input
                        type="text"
                        defaultValue=""
                        placeholder="Replace"
                        className="form-control"
                        style={{ marginLeft: "5px" }}
                    />
                </div>
                <button
                    className="btn btn-secondary btn-sm sbte-search-next"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-next"
                >
                    <i className="fa fa-arrow-down" />
                </button>
                <button
                    className="btn btn-secondary btn-sm sbte-search-prev"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-prev"
                >
                    <i className="fa fa-arrow-up" />
                </button>
                <button className="btn btn-secondary btn-sm" type="button" disabled style={{ marginLeft: "5px" }}>
                    Replace
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px", marginRight: "5px" }}
                >
                    Replace All
                </button>
                <ToggleButton
                    className="btn btn-secondary"
                    toggled={false}
                    onClick={jest.fn()}
                    render={(): ReactElement => (<span>Aa</span>)}
                    title="Case insensitive"
                />
                <span style={{ flex: 1 }} />
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-close-search-replace-btn"
                >
                    <i className="far fa-times-circle" />
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
        const closeButton = getByTestId("sbte-close-search-replace-btn");

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

    it("searches for next match when Next button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const nextButton = getByTestId("sbte-search-next");

        // WHEN
        fireEvent.click(nextButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
    });

    it("searches for previous match when Previous button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(3) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const prevButton = getByTestId("sbte-search-prev");

        // WHEN
        fireEvent.click(prevButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(1);
        expect(testingStore.getState().focusedCueIndex).toEqual(1);
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
        expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([8]);
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
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
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 5");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
        expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.REQUEST_SENT);
        expect(testingStore.getState().saveAction.multiCuesEdit).toBeTruthy();
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
        testingStore.dispatch(matchedCuesSlice.actions
            .matchCuesByTime({ cues: [], sourceCues: [], editingCueIndex: 0 })
        );

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
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 2");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>New Line 2</b> and <i>New Line 2</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>New Line 2</b> and New Line 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 2");
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
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
        expect(testingStore.getState().searchReplace.replacement).toEqual("test");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>test</b> and <i>test</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>test</b> and test");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption test");
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
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
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
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
        expect(testingStore.getState().searchReplace.replacement).toEqual("[LINE 2]");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>[LINE 2]</b> and <i>{Line 2}</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>[LINE 2]</b> and {Line 2}");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption [LINE 2]");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
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
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Text Update");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("New Text Update 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("New Text Update 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption Line 4");
        expect(testingStore.getState().focusedCueIndex).toEqual(0);
    });
});
