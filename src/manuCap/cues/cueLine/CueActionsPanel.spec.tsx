import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, fireEvent } from "@testing-library/react";

import AddCueLineButton from "../edit/AddCueLineButton";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto, Track } from "../../model";
import DeleteCueLineButton from "../edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";
import SplitCueLineButton from "../edit/SplitCueLineButton";
import { saveCueDeleteSlice } from "../saveCueDeleteSlices";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

let testingStore = createTestingStore();

const saveTrack = jest.fn();
const updateCueMock = jest.fn();
const deleteCueMock = jest.fn();

describe("CueActionsPanel", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueMock));
        testingStore.dispatch(updateEditingTrack({ timecodesUnlocked: true } as Track) as {} as AnyAction);
        jest.resetAllMocks();
    });

    it("renders for caption cue in edit mode", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "column",
                        flex: "0 0 50px"
                    }}
                    className="sbte-actions-panel border-l border-blue-light-mostly-transparent bg-white"
                >
                    <DeleteCueLineButton cueIndex={1} />
                    <PlayCueButton cue={cues[1]} cueIndex={1} />
                    <SplitCueLineButton cueIndex={1} />
                    <AddCueLineButton cueIndex={1} sourceCueIndexes={[]} />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        const actual = removeDraftJsDynamicValues(actualNode.container.outerHTML);
        const expected = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
    });

    it("renders for caption cue in view mode", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "column",
                        flex: "0 0 50px"
                    }}
                    className="sbte-actions-panel border-l border-blue-light-mostly-transparent bg-gray-0"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} cueIndex={1} />
                    <div />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit={false} sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        const actual = removeDraftJsDynamicValues(actualNode.container.outerHTML);
        const expected = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
    });

    it("opens next cue line for editing when add button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(2);
        expect(updateCueMock).toHaveBeenCalledTimes(1);
    });

    it("deletes cue when delete button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });


    it("calls deleteCueCallback in redux store when delete button is clicked", () => {
        // GIVEN
        const cues = [
            { id: "test-cue-1", vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { id: "test-cue-2", vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );
        saveTrack.mockReset();
        const deleteCueCallback = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueCallback));

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

        // THEN
        expect(deleteCueCallback).toHaveBeenCalledWith(
            { "cue": cues[1], "editingTrack": { "timecodesUnlocked": true }}
        );
        expect(saveTrack).not.toBeCalled();
    });

    it("splits cue line when split button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-split-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(3);
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Editing Line 2");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(1.5);
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.5);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(2);
    });
});
