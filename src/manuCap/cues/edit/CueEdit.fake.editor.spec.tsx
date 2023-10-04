/* eslint react/no-unknown-property: 0 */ // custom attribute added by react-advanced-timefield
import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import { Provider } from "react-redux";
import { AnyAction } from "redux";
import { render } from "@testing-library/react";

import { CueDto, Track } from "../../model";
import CueEdit from "./CueEdit";
import { CueTextEditorProps } from "./CueTextEditor";
import { createTestingStore } from "../../../testUtils/testingStore";
import { MockedDebouncedFunction } from "../../../testUtils/testUtils";
import { updateCues } from "../cuesList/cuesListActions";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { updateEditingTrack } from "../../trackSlices";
import { fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { setCurrentPlayerTime } from "../cuesList/cuesListScrollSlice";
import { ReactElement } from "react";
import { focusedInputSlice } from "./cueEditorSlices";

jest.mock("lodash", () => (
    {
        debounce: (fn: MockedDebouncedFunction): Function => {
            fn.cancel = jest.fn();
            return fn;
        },
        get: jest.requireActual("lodash/get"),
        sortBy: jest.requireActual("lodash/sortBy"),
        findIndex: jest.requireActual("lodash/findIndex")
    }));
jest.mock("../spellCheck/spellCheckFetch");
jest.mock("" +
    "./CueTextEditor",
    // eslint-disable-next-line react/display-name
    () => (props: CueTextEditorProps): ReactElement => <div>CueTextEditor: {JSON.stringify(props)}</div>
);
// @ts-ignore we are mocking this function
fetchSpellCheck.mockImplementation(() => jest.fn());

let testingStore = createTestingStore();

const cues = [
    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { id: "cue-2", vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

describe("CueEdit", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        testingStore = createTestingStore();
        const testingSubtitleSpecification = {
            minCaptionDurationInMillis: 500,
            maxCaptionDurationInMillis: 960000,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
            enabled: true
        } as SubtitleSpecification;
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        jest.resetAllMocks();
    });

    describe("focus", () => {
        it("is assigned to cue text editor", () => {
            // GIVEN
            testingStore.dispatch(focusedInputSlice.actions.updateFocusedInput("EDITOR"));
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[1];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            // render(
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueEdit index={1} cue={cue} setGlossaryTerm={jest.fn()} matchedCuesIndex={0} />
                </Provider>
            );

            // THEN
            const editorContainer = actualNode.getByTestId("sbte-cue-editor-container");
            expect(editorContainer.innerHTML).toContain(
                 "<div>CueTextEditor: {\"index\":1,\"vttCue\":{\"hasBeenReset\":false,\"id\":\"\"," +
                 "\"pauseOnExit\":false,\"startTime\":3,\"endTime\":7,\"text\":\"Caption Line 2\",\"region\":null," +
                 "\"vertical\":\"\",\"snapToLines\":true,\"line\":\"auto\",\"lineAlign\":\"start\"," +
                 "\"position\":\"auto\",\"positionAlign\":\"auto\",\"size\":100,\"align\":\"center\"}," +
                 "\"autoFocus\":true}</div>"
             );
            expect(document.activeElement?.outerHTML).toContain("<body>");
        });

        it("is assigned to start time editor", () => {
            // GIVEN
            testingStore.dispatch(focusedInputSlice.actions.updateFocusedInput("START_TIME"));
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[1];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            // render(
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueEdit index={1} cue={cue} setGlossaryTerm={jest.fn()} matchedCuesIndex={1} />
                </Provider>
            );

            // THEN
            const editorContainer = actualNode.getByTestId("sbte-cue-editor-container");
            expect(editorContainer.innerHTML).toContain(
                 "<div>CueTextEditor: {\"index\":1,\"vttCue\":{\"hasBeenReset\":false,\"id\":\"\"," +
                 "\"pauseOnExit\":false,\"startTime\":3,\"endTime\":7,\"text\":\"Caption Line 2\",\"region\":null," +
                 "\"vertical\":\"\",\"snapToLines\":true,\"line\":\"auto\",\"lineAlign\":\"start\"," +
                 "\"position\":\"auto\",\"positionAlign\":\"auto\",\"size\":100,\"align\":\"center\"}," +
                 "\"autoFocus\":false}</div>"
            );
            // noinspection HtmlUnknownAttribute
            expect(document.activeElement?.outerHTML).toEqual(
                "<input type=\"text\" class=\"sbte-form-control mousetrap block text-center\" value=\"00:00:03.000\">"
            );
        });
    });
});
