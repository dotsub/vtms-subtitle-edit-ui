import "../../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import ShiftTimeButton from "./ShiftTimeButton";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { Language, Track } from "../../model";
import { AnyAction } from "redux";

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

describe("ShiftTimeButton", () => {
    beforeEach(() => {
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    title="Unlock timecodes to enable"
                >
                    <i className="w-7 fa-duotone fa-arrow-right-arrow-left text-blue-primary" />
                    <span>Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );
        actualNode.find("button.mc-shift-time-button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders enabled if timecodes are locked but track is caption", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    title="Unlock timecodes to enable"
                >
                    <i className="w-7 fa-duotone fa-arrow-right-arrow-left text-blue-primary" />
                    <span>Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders disabled if timecodes are locked and track is translation", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack( { ...testTranslationTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    disabled
                    title="Unlock timecodes to enable"
                >
                    <i className="w-7 fa-duotone fa-arrow-right-arrow-left text-blue-primary" />
                    <span>Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
