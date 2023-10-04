import "../../../testUtils/initBrowserEnvironment";

import { ReactElement } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { mount, ReactWrapper } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { CueDto } from "../../model";
import "video.js";
import { act } from "react-dom/test-utils";

jest.mock("./SubtitleSpecificationsModal");

// @ts-ignore We are mocking module
SubtitleSpecificationsModal.mockImplementation(({ show }): ReactElement => show ? <div>shown</div> : <div />);

const cues = [
    { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
] as CueDto[];
let testingStore = createTestingStore();

describe("SubtitleSpecificationsButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders with shown modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    id="subtitleSpecsBtn"
                    className="dotsub-subtitle-specifications-button sbte-btn sbte-btn-light"
                    data-pr-tooltip="Subtitle Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <i className="fa-duotone fa-clipboard-list fa-lg" />
                </button>
                <div>shown</div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with hidden modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    id="subtitleSpecsBtn"
                    className="dotsub-subtitle-specifications-button sbte-btn sbte-btn-light"
                    data-pr-tooltip="Subtitle Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <i className="fa-duotone fa-clipboard-list fa-lg" />
                </button>
                <div />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("opens subtitle specifications modal when button is clicked", () => {
        // GIVEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button")
            .simulate("click");

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(true);
    });

    it("closes subtitle specifications modal when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        let actualNode = {} as ReactWrapper;
        act(() => {
            actualNode = mount(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsButton />
                </Provider>
            );
        });

        // WHEN
        act(() => {
            actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");
            actualNode.find(SubtitleSpecificationsModal).props().onClose();
        });

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(false);
    });

    it("Hides subtitle button if subtitle specification is null", () => {
         // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find("button[hidden]").length).toEqual(1);
    });

    it("Auto shows subtitle specification if cues are empty", () => {
        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: true } as SubtitleSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(true);
    });

    it("Does auto show subtitle specification if cues are not empty", () => {
        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: true } as SubtitleSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(true);
    });

    it("Does not auto show subtitle specification if subtitle specification is null", () => {
        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(false);
    });

    it("Does not auto show subtitle specification if enabled is false", () => {
        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(false);
    });

    it("Auto shows subtitle specification only once even with cues change", () => {
        // GIVEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: true } as SubtitleSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        let actualNode = {} as ReactWrapper;
        act(() => {
             actualNode = mount(
                 <Provider store={testingStore}>
                     <SubtitleSpecificationsButton />
                 </Provider>
            );
            actualNode.find(SubtitleSpecificationsModal).props().onClose();
        });

        //WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(false);
    });
});
