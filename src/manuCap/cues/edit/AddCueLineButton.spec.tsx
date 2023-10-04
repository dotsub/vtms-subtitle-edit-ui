import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";

import AddCueLineButton from "./AddCueLineButton";
import { CueDto, Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateCues } from "../cuesList/cuesListActions";
import { updateSourceCues } from "../view/sourceCueSlices";
import { updateEditingTrack } from "../../trackSlices";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";

let testingStore = createTestingStore();
const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

const updateCueMock = jest.fn();

describe("AddCueLineButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        jest.clearAllMocks();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="addCuelineButton-0"
                    style={{ maxHeight: "38px", height: "100%" }}
                    className="sbte-btn sbte-btn-primary sbte-add-cue-button w-full sbte-btn-sm"
                    data-pr-tooltip="Insert new subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <b>+</b>
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with custom text", () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="addCuelineButton-0"
                    style={{ maxHeight: "38px", height: "100%" }}
                    className="sbte-btn sbte-btn-primary sbte-add-cue-button w-full sbte-btn-sm"
                    data-pr-tooltip="Insert new subtitle"
                    data-pr-position="bottom"
                >
                    <span>Add Cue Line</span>
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton text="Add Cue Line" cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("adds cue when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].vttCue.align).toEqual("center");
        expect(testingStore.getState().cues[1].vttCue.line).toEqual("auto");
        expect(testingStore.getState().cues[1].vttCue.position).toEqual("auto");
        expect(testingStore.getState().cues[1].vttCue.positionAlign).toEqual("auto");
        expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
    });

    it("adds cue with non-default category when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "AUDIO_DESCRIPTION" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].cueCategory).toEqual("AUDIO_DESCRIPTION");
    });

    it("adds cue with non-default position when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        cue.vttCue.align = "left";
        cue.vttCue.line = 8;
        cue.vttCue.position = 35;
        cue.vttCue.positionAlign = "center";
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].vttCue.align).toEqual("left");
        expect(testingStore.getState().cues[1].vttCue.line).toEqual(8);
        expect(testingStore.getState().cues[1].vttCue.position).toEqual(35);
        expect(testingStore.getState().cues[1].vttCue.positionAlign).toEqual("center");
    });

    it("Does not add cue if clicking button creates overlap", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
    });

    it("Add cue if clicking button if there is greater or equal 1 milli gap", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(5.5, 6, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues).toHaveLength(3);
    });

    it("Always add cue if clicking button on last cue", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={1} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues).toHaveLength(3);
    });

    it("passes source cues parameters when cue is added", () => {
        // GIVEN
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(1, 1.225, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1.225, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[0, 1]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues).toHaveLength(2);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
    });

    it("shows tooltip when mouse hovers over", async () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="addCuelineButton-0"
                    style={{ maxHeight: 38, height: "100%" }}
                    className="sbte-btn sbte-btn-primary sbte-add-cue-button w-full sbte-btn-sm"
                    data-pr-tooltip="Insert new subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <b>+</b>
                </button>
            </div>
        );

        const actualNode = render(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.mouseOver(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
