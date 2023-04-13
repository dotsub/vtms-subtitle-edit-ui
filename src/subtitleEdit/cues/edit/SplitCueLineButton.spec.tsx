import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";

import SplitCueLineButton from "./SplitCueLineButton";
import { CueDto, Language, Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cuesList/cuesListActions";
import { lastCueChangeSlice } from "./cueEditorSlices";

let testingStore = createTestingStore();
const testTrack = {
    type: "CAPTION",
    mediaTitle: "testingTrack",
    language: { id: "en-US", name: "English", direction: "LTR" },
    timecodesUnlocked: true
};
const testTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;
const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

describe("SplitCueLineButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="splitCueLineButton-0"
                    style={{ maxHeight: "38px" }}
                    className="sbte-btn sbte-btn-primary sbte-split-cue-button w-full sbte-btn-sm"
                    title="Unlock timecodes to enable"
                    data-pr-tooltip="Split this subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <i className="fa-duotone fa-cut" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SplitCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        const actual = actualNode.container.outerHTML;
        const expected = expectedNode.container.outerHTML;
        expect(actual).toEqual(expected);
    });

    it("renders enabled if timecodes are locked but track is caption", () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="splitCueLineButton-0"
                    style={{ maxHeight: "38px" }}
                    className="sbte-btn sbte-btn-primary sbte-split-cue-button w-full sbte-btn-sm"
                    title="Unlock timecodes to enable"
                    data-pr-tooltip="Split this subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <i className="fa-duotone fa-cut" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SplitCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        const actual = actualNode.container.outerHTML;
        const expected = expectedNode.container.outerHTML;
        expect(actual).toEqual(expected);
    });

    it("renders disabled if timecodes are locked and track is translation", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack({ ...testTranslationTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="splitCueLineButton-0"
                    style={{ maxHeight: "38px" }}
                    className="sbte-btn sbte-btn-primary sbte-split-cue-button w-full sbte-btn-sm"
                    disabled
                    title="Unlock timecodes to enable"
                    data-pr-tooltip="Split this subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <i className="fa-duotone fa-cut" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SplitCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        const actual = actualNode.container.outerHTML;
        const expected = expectedNode.container.outerHTML;
        expect(actual).toEqual(expected);
    });

    it("splits a cue on split button click", async() => {
        // GIVEN
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        const recordCueChangeSpy = jest.spyOn(lastCueChangeSlice.actions, "recordCueChange");


        const actualNode = render(
            <Provider store={testingStore}>
                <SplitCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-split-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(3);


        await waitFor(() => {
            expect(recordCueChangeSpy).toHaveBeenNthCalledWith(1, {
                "changeType": "EDIT",
                "index": 0,
                "vttCue": { ...testingCues[0].vttCue, startTime: 0, endTime: 1, hasBeenReset: true }
            });

            expect(recordCueChangeSpy).toHaveBeenNthCalledWith(2, {
                "changeType": "SPLIT",
                "index": 0,
                "vttCue": { ...testingCues[0].vttCue, startTime: 0, endTime: 2, hasBeenReset: false }
            });

            expect(recordCueChangeSpy).toHaveBeenNthCalledWith(3, {
                "changeType": "ADD",
                "index": 1,
                "vttCue": { ...testingCues[0].vttCue, startTime: 1, endTime: 2, hasBeenReset: true, text: "" }
            });
        });


    });
});
