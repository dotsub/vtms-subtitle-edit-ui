import "../../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { createTestingStore } from "../../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { CueLineState } from "../../model";
import { fireEvent, render } from "@testing-library/react";
import { AnyAction } from "@reduxjs/toolkit";
import { showMerge } from "../merge/mergeSlices";
import { addCuesToMergeList } from "../cuesList/cuesListActions";

let testingStore = createTestingStore();

describe("CueLineFlap", () => {
    beforeEach(() => testingStore = createTestingStore());

    it("renders without content", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.NONE}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue and edit disabled line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-error"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-exclamation-triangle" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.ERROR}
                    cues={testingStore.getState().cues[0]}
                    showErrors
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted and edit disabled cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-error"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-exclamation-triangle" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.ERROR}
                    cues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for enabled cue line when merge mode is activated", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for disabled cue line when merge mode is activated", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for cue line when merge mode is activated and no contiguous cue is checked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 3 }) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for cue line when merge mode is activated and a contiguous cue is checked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 1 }) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for cue line when merge mode is activated and multiple cues are checked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 1 }) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 2 }) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("adds line index to merge list when merge checkbox is checked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-cue-line-flap-checkbox") as Element);

        // THEN
        expect(testingStore.getState().rowsToMerge).toEqual([{ index: 0 }]);
    });

    it("removes line index to merge list when merge checkbox is unchecked", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-cue-line-flap-checkbox") as Element);
        fireEvent.click(actualNode.container.querySelector(".sbte-cue-line-flap-checkbox") as Element);

        // THEN
        expect(testingStore.getState().rowsToMerge).toEqual([]);
    });

    it("renders good enabled cue with 0 comments", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                    cueCommentsCount={0}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good enabled cue with 1 comment", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "80px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "55px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <div>
                            <i
                                id="cuelineComment-0"
                                className="fa-duotone fa-comments"
                                data-pr-tooltip="Subtitle(s) has comments"
                                data-pr-position="right"
                                data-pr-at="right+10 top+10"
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                    cueCommentsCount={1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good disabled cue with 1 comment", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "100px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "55px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <div>
                            <i
                                id="cuelineComment-0"
                                className="fa-duotone fa-comments"
                                data-pr-tooltip="Subtitle(s) has comments"
                                data-pr-position="right"
                                data-pr-at="right+10 top+10"
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    cues={testingStore.getState().cues[0]}
                    editDisabled
                    cueCommentsCount={1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted disabled cue with 3 comments", () => {
        // GIVEN
        testingStore.dispatch(showMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-error"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "100px"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "55px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <div>
                            <i
                                id="cuelineComment-0"
                                className="fa-duotone fa-comments"
                                data-pr-tooltip="Subtitle(s) has comments"
                                data-pr-position="right"
                                data-pr-at="right+10 top+10"
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa-duotone fa-exclamation-triangle" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.ERROR}
                    cues={testingStore.getState().cues[0]}
                    editDisabled
                    cueCommentsCount={3}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
