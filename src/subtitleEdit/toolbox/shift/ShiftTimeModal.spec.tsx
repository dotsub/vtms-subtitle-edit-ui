import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Language, Track } from "../../model";
import { Provider } from "react-redux";
import ShiftTimesModal from "./ShiftTimeModal";
import { setSaveTrack } from "../../cues/saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";
import { cleanup, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { removeIds, renderWithPortal } from "../../../testUtils/testUtils";
import { updateEditingCueIndex } from "../../cues/edit/cueEditorSlices";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex"),
    findLastIndex: jest.requireActual("lodash/findLastIndex")
}));

const testCuesForNegativeShifting = [
    { vttCue: new VTTCue(1, 3, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(3, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testCuesChunk = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", editDisabled: true },
    {
        vttCue: new VTTCue(1.25, 1.5, "Caption Line 2"), cueCategory: "DIALOGUE",
        editDisabled: false
    },
    {
        vttCue: new VTTCue(1.5, 2.5, "Caption Line 3"), cueCategory: "DIALOGUE",
        editDisabled: false
    },
    { vttCue: new VTTCue(5, 6, "Caption Line 4"), cueCategory: "DIALOGUE", editDisabled: true },
] as CueDto[];

const testingCaptionTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    mediaChunkStart: 1000,
    mediaChunkEnd: 3000,
    progress: 50
} as Track;

let testingStore = createTestingStore();

describe("ShiftTimesModal", () => {
    const saveTrack = jest.fn();
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        jest.clearAllMocks();
        document.body.innerHTML = "";
        cleanup();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="p-dialog p-component max-w-3xl p-dialog-enter p-dialog-enter-active"
                role="dialog"
                aria-labelledby=""
                aria-describedby=""
                aria-modal="true"
            >
                <div className="p-dialog-header">
                    <div className="p-dialog-title">Shift Track Lines Time</div>
                    <div className="p-dialog-header-icons">
                        <button
                            type="button"
                            className="p-dialog-header-icon p-dialog-header-close p-link"
                            aria-label="Close"
                        >
                            <span className="p-dialog-header-close-icon pi pi-times" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="p-dialog-content">
                    <form className="space-y-4">
                        <div>
                            <label>Time Shift in Seconds.Milliseconds</label>
                            <input
                                name="shiftTime"
                                type="number"
                                className="sbte-form-control dotsub-track-line-shift mt-2"
                                style={{ width: "120px" }}
                                placeholder="0.000"
                                step="0.100"
                                onChange={jest.fn()}
                            />
                        </div>
                        <fieldset className="space-y-2">
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        value="0"
                                    /> Shift all
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        value="1"
                                    /> Shift all before editing cue
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        value="2"
                                    /> Shift all after editing cue
                                </label>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <div className="p-dialog-footer">
                    <button
                        type="submit"
                        className="dotsub-shift-modal-apply-button sbte-btn sbte-btn-primary"
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        className="dotsub-shift-modal-close-button sbte-btn sbte-btn-light"
                    >
                        Close
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        const allCuesRadioBtn = actualNode.container.querySelectorAll(".form-check input[value='0']")[0];
        fireEvent.click(allCuesRadioBtn);

        // THEN
        const actual = removeIds((actualNode.container.querySelector(".p-dialog") as Element).outerHTML);
        const expected = (expectedNode.container.querySelector(".p-dialog") as Element).outerHTML;
        expect(actual).toEqual(expected);
    });

    it("doesn't render error message and disable apply button if track is chunked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="p-dialog p-component max-w-3xl p-dialog-enter p-dialog-enter-active"
                    role="dialog"
                    aria-labelledby=""
                    aria-describedby=""
                    aria-modal="true"
                >
                    <div className="p-dialog-header">
                        <div className="p-dialog-title">Shift Track Lines Time</div>
                        <div className="p-dialog-header-icons">
                            <button
                                type="button"
                                className="p-dialog-header-icon p-dialog-header-close p-link"
                                aria-label="Close"
                            >
                                <span className="p-dialog-header-close-icon pi pi-times" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div className="p-dialog-content">
                        <form className="space-y-4">
                            <div>
                                <label>Time Shift in Seconds.Milliseconds</label>
                                <input
                                    name="shiftTime"
                                    type="number"
                                    className="sbte-form-control dotsub-track-line-shift mt-2"
                                    style={{ width: "120px" }}
                                    placeholder="0.000"
                                    step="0.100"
                                    onChange={jest.fn()}
                                />
                            </div>
                            <fieldset className="space-y-2">
                                <div className="form-check">
                                    <label>
                                        <input
                                            name="shiftPosition"
                                            type="radio"
                                            value="0"
                                        /> Shift all
                                    </label>
                                </div>
                                <div className="form-check">
                                    <label>
                                        <input
                                            name="shiftPosition"
                                            type="radio"
                                            value="1"
                                        /> Shift all before editing cue
                                    </label>
                                </div>
                                <div className="form-check">
                                    <label>
                                        <input
                                            name="shiftPosition"
                                            type="radio"
                                            value="2"
                                        /> Shift all after editing cue
                                    </label>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                    <div className="p-dialog-footer">
                        <button
                            type="submit"
                            className="dotsub-shift-modal-apply-button sbte-btn sbte-btn-primary"
                        >Apply
                        </button>
                        <button
                            type="button"
                            className="dotsub-shift-modal-close-button sbte-btn sbte-btn-light"
                        >Close
                        </button>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider>
        );

        const input = actualNode.container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = actualNode.container.querySelectorAll(".form-check input[value='0']")[0];
        userEvent.type(input, "-1");
        fireEvent.click(allCuesRadioBtn);

        // THEN
        const actual = removeIds(actualNode.container.querySelectorAll(".p-dialog")[0].outerHTML);
        expect(actual)
            .toEqual(expectedNode.container.querySelectorAll(".p-dialog")[0].outerHTML);
    });

    it("applies the shift time on form submit with a valid shift value", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = actualNode.container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = actualNode.container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = actualNode.container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "1");
        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
    });

    it("validates the shift time on form submit for media chunk start", async () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        fireEvent.change(input, { target: { value: "-0.5" }});
        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(container.querySelectorAll(".p-inline-message-text")[0].innerHTML)
            .toEqual("Exceeds media chunk start range");

        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.25);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.5);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
    });

    it("validates the shift time on form submit for media chunk end", async () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "0.6");
        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(container.querySelectorAll(".p-inline-message-text")[0].innerHTML)
            .toEqual("Exceeds media chunk end range");

        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.25);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.5);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(2.5);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
    });

    it("shifts time on form submit for media chunk cues", async () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "0.25");
        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(container.querySelectorAll(".alert-danger").length).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.50);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(1.75);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.75);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(2.75);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
        expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(6);
    });

    it("calls cancel when click apply", () => {
        // GIVEN
        const onClose = jest.fn();
        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={onClose} />
            </Provider>
        );

        // WHEN
        const closeBtn = container.querySelectorAll(".sbte-btn.sbte-btn-light")[0];
        fireEvent.click(closeBtn);

        // THEN
        expect(onClose).toBeCalled();
    });

    it("calls saveTrack in redux store when shift value", async () => {
        // // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "1");
        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("shift by minus when shifting value does not generate negative cue time", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCuesForNegativeShifting) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];

        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });

        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.847);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.847);
    });

    it("doesn't shift by minus when shifting value would generate negative cue time (all)", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='0']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];

        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });

        fireEvent.click(allCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(container.querySelectorAll(".text-red-light")[0].innerHTML)
            .toEqual("The start time of the first cue plus the shift value must be greater or equal to 0");

        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
    });

    it("doesn't shift by minus when shifting value would generate negative cue time (before)", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const beforeCuesRadioBtn = container.querySelectorAll(".form-check input[value='1']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];

        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });

        fireEvent.click(beforeCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(container.querySelectorAll(".text-red-light")[0].innerHTML)
            .toEqual("The start time of the first cue plus the shift value must be greater or equal to 0");

        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
    });

    it("shifts time by minus when shifting after selected cue", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        const { container } = renderWithPortal(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const afterCuesRadioBtn = container.querySelectorAll(".form-check input[value='2']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];

        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });

        fireEvent.click(afterCuesRadioBtn);
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(0.847);
    });
});
