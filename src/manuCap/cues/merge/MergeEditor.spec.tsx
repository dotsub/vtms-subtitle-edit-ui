import "../../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { CueDto, Track } from "../../model";
import { addCuesToMergeList, updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { showMerge } from "./mergeSlices";
import MergeEditor from "./MergeEditor";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";
import { saveCueDeleteSlice } from "../saveCueDeleteSlices";

let testingStore = createTestingStore();

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(4, 6, "Caption Line 3"), cueCategory: "DIALOGUE" }
] as CueDto[];

describe("MergeEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
                <label style={{ marginTop: "10px" }}>
                    Select the lines to be merged then click Merge
                </label>
                <button
                    className="sbte-btn sbte-btn-light sbte-btn-sm !text-blue-light"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-prev"
                >
                    Merge
                </button>
                <span style={{ flex: 1 }} />
                <button
                    className="sbte-btn sbte-btn-danger sbte-btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-close-merge-sbte-btn"
                >
                    <i className="fa-duotone fa-times-circle" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <MergeEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("does not render of show is false", () => {
        // GIVEN
        testingStore.dispatch(showMerge(false) as {} as AnyAction);

        // WHEN
        const { container } = render(
            <Provider store={testingStore}>
                <MergeEditor />
            </Provider>
        );

        // THEN
        expect(container.outerHTML).toEqual("<div></div>");
    });

    it("hides when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <MergeEditor />
            </Provider>
        );
        const closeButton = getByTestId("sbte-close-merge-sbte-btn");

        // WHEN
        fireEvent.click(closeButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeFalsy();
    });

    it("merges cues when Merge button is clicked", async () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        const updateCueMock = jest.fn();
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        const deleteCueMock = jest.fn();
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueMock));
        testingStore.dispatch(addCuesToMergeList(
            { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList(
            { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <MergeEditor />
            </Provider>
        );
        const mergeButton = getByText("Merge");

        // WHEN
        fireEvent.click(mergeButton);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 3");
        expect(updateCueMock).toHaveBeenCalledTimes(1);
        expect(deleteCueMock).toHaveBeenCalledTimes(2);
        expect(saveTrack).not.toBeCalled();
    });
});
