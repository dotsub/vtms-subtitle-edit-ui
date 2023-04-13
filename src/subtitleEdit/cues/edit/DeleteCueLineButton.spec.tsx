import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { AnyAction } from "redux";
import { CueDto, Track } from "../../model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex")
}));

let testingStore = createTestingStore();

describe("DeleteCueLineButton", () => {
    const saveTrack = jest.fn();

    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="p-1.5">
                <button
                    id="deleteCueLineButton0"
                    style={{ maxHeight: "38px" }}
                    className="sbte-btn sbte-btn-primary sbte-btn-sm sbte-delete-cue-button w-full"
                    data-pr-tooltip="Delete this subtitle"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <i className="fa-duotone fa-trash" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("calls saveTrack in redux store when delete button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );
        saveTrack.mockReset();

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
});
