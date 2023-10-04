import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AnyAction } from "@reduxjs/toolkit";

import { CueDto, CueError, Language, Track } from "../../model";
import CueView from "./CueView";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import { updateCues } from "../cuesList/cuesListActions";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { searchReplaceSlice, setFind, showSearchReplace } from "../searchReplace/searchReplaceSlices";

let testingStore = createTestingStore();

describe("CueView", () => {
    beforeEach(()=> {
       testingStore = createTestingStore();
    });
    it("renders with class name parameter", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex" }}
                    className="testingClassName border-b border-blue-light-mostly-transparent sbte-click-cue-wrapper"
                >
                    <div
                        className="sbte-cue-line-left-section"
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column" }}>
                            <div>00:00:01.000</div>
                            <div>00:00:02.000</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between",  paddingBottom: "5px" }} >
                            <div className="text-sm">Dialogue</div>
                            <div className="text-sm" style={{ paddingRight: "10px" }}>↓↓</div>
                        </div>
                    </div>
                    <div
                        className="border-l border-blue-light-mostly-transparent flex items-stretch"
                        style={{ flex: "1 1 70%" }}
                    >
                        <div
                            className="sbte-cue-editor"
                            style={{
                                flexBasis: "auto",
                                paddingLeft: "10px",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                                minHeight: "54px",
                                height: "100%",
                                width: "100%"
                            }}
                        >
                            Caption Line 1
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue={false}
                    targetCueIndex={1}
                    cue={cue}
                    className="testingClassName"
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders without actions panel", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex" }}
                    className="border-b border-blue-light-mostly-transparent sbte-click-cue-wrapper"
                >
                    <div
                        className="sbte-cue-line-left-section"
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column" }}>
                            <div>00:00:01.000</div>
                            <div>00:00:02.000</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between",  paddingBottom: "5px" }} >
                            <div className="text-sm">Dialogue</div>
                            <div className="text-sm" style={{ paddingRight: "10px" }}>↓↓</div>
                        </div>
                    </div>
                    <div
                        className="border-l border-blue-light-mostly-transparent flex items-stretch"
                        style={{ flex: "1 1 70%" }}
                    >
                        <div
                            className="sbte-cue-editor"
                            style={{
                                flexBasis: "auto",
                                paddingLeft: "10px",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                                minHeight: "54px",
                                height: "100%",
                                width: "100%"
                            }}
                        >
                            Caption Line 1
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue={false}
                    targetCueIndex={1}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders with actions panel", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex" }}
                    className="border-b border-blue-light-mostly-transparent sbte-click-cue-wrapper"
                >
                    <div
                        className="sbte-cue-line-left-section"
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column" }}>
                            <div>00:00:01.000</div>
                            <div>00:00:02.000</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between",  paddingBottom: "5px" }} >
                            <div className="text-sm">Dialogue</div>
                            <div className="text-sm" style={{ paddingRight: "10px" }}>↓↓</div>
                        </div>
                    </div>
                    <div
                        className="border-l border-blue-light-mostly-transparent flex items-stretch"
                        style={{ flex: "1 1 70%" }}
                    >
                        <div
                            className="sbte-cue-editor"
                            style={{
                                flexBasis: "auto",
                                paddingLeft: "10px",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                                minHeight: "54px",
                                height: "100%",
                                width: "100%"
                            }}
                        >
                            Caption Line 1
                        </div>
                        <CueActionsPanel index={0} cue={cue} isEdit={false} sourceCueIndexes={[]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        const actual = removeDraftJsDynamicValues(actualNode.container.outerHTML);
        const expected = removeDraftJsDynamicValues(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
    });

    it("renders text in RTL direction", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "text\nwrapped"), cueCategory: "DIALOGUE" } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
                dir="RTL"
            >
                text<br />wrapped
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    languageDirection={testingTrack.language.direction}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("converts VTT text to HTML", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "text\nwrapped"), cueCategory: "DIALOGUE" } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                text<br />wrapped
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("sanitizes HTML for XSS attack", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some<script>alert(\"problem\")</script>text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                sometext
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("keeps selected styling (b,i,u) HTML tags", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<b>bold</b><i>italic</i><u>underline</u>"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                <b>bold</b><i>italic</i><u>underline</u>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("removed HTML tags that are not allowed", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<v speaker><div>some text</div>"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                some text
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("hides cue text if required", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "auto",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            />
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    hideText
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("renders source cue with glossary terms highlighted if enabled", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "text", replacements: ["text replacement1", "text replacement2"]},
                { source: "Line", replacements: ["lineReplacement1"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "<i>Source <b><span onclick=\"pickSetGlossaryTerm('lineReplacement1')\" " +
            "class=\"sbte-glossary-match\">Line</span></b></i> <br>Wrapped " +
            "<span onclick=\"pickSetGlossaryTerm('text replacement1/text replacement2')\" " +
            "class=\"sbte-glossary-match\">text</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("filters out string sources from glossary that are empty", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "", replacements: ["this is a replacement"]},
                { source: "", replacements: ["another replacement"]},
                { source: " ", replacements: ["another replacement"]},
                { source: "  ", replacements: ["another replacement"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "<i>Source <b>Line</b></i> <br>Wrapped text";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    isTargetCue
                    rowIndex={0}
                    targetCueIndex={1}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("should only highlight whole words glossary matches", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "This is some sample text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "some", replacements: ["qualche"]},
                { source: "ample", replacements: ["amplio"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "This is <span onclick=\"pickSetGlossaryTerm('qualche')\" " +
            "class=\"sbte-glossary-match\">some</span> sample text";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("renders source cue without glossary terms highlighted if not enabled", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                { source: "Line", replacements: ["lineReplacement1"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "<i>Source <b>Line</b></i> <br>Wrapped text";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms={false}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("sends simple glossary term to redux when clicked", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                { source: "Line", replacements: ["lineReplacement1"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const setGlossaryTerm = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                    setGlossaryTerm={setGlossaryTerm}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelectorAll("span")[0]);

        // THEN
        expect(setGlossaryTerm).toBeCalledWith("lineReplacement1");
    });

    it("sends composite glossary term to redux when clicked", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                { source: "Line", replacements: ["lineReplacement1"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const setGlossaryTerm = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                    setGlossaryTerm={setGlossaryTerm}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelectorAll("span")[1]);

        // THEN
        expect(setGlossaryTerm).toBeCalledWith("text replacement1/text replacement2/repl3");
    });

    it("handles glossary case insensitively", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text LINE"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "line", replacements: ["replacement"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "<i>Source <b><span onclick=\"pickSetGlossaryTerm('replacement')\" " +
            "class=\"sbte-glossary-match\">Line</span></b></i> <br>Wrapped text " +
            "<span onclick=\"pickSetGlossaryTerm('replacement')\" " +
            "class=\"sbte-glossary-match\">LINE</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("handles glossary for multi word phrases", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source Line</i> \nWrapped text"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "Wrapped text", replacements: ["text replacement1", "text replacement2"]},
                { source: "Source Line", replacements: ["lineReplacement1"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent = "<i><span onclick=\"pickSetGlossaryTerm('lineReplacement1')\" " +
            "class=\"sbte-glossary-match\">Source Line</span></i> <br>" +
            "<span onclick=\"pickSetGlossaryTerm('text replacement1/text replacement2')\" " +
            "class=\"sbte-glossary-match\">Wrapped text</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("handles glossary for overlapping sources, long first", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "Networking and Advanced Security Extra Business Group"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "advanced security extra", replacements: ["extra different moretext"]},
                { source: "advanced security", replacements: ["sometext different moretext"]},
                { source: "advanced", replacements: ["sometext"]},
                { source: "networking", replacements: ["connection;connecting"]},
                { source: "security", replacements: ["moretext"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent =
            "<span onclick=\"pickSetGlossaryTerm('connection;connecting')\" " +
            "class=\"sbte-glossary-match\">Networking</span> and " +
            "<span onclick=\"pickSetGlossaryTerm('extra different moretext')\" " +
            "class=\"sbte-glossary-match\">Advanced Security Extra</span> Business Group";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("handles glossary for overlapping sources, long last", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "Networking and Advanced Security Extra Business Group"),
            cueCategory: "DIALOGUE",
            glossaryMatches: [
                { source: "advanced", replacements: ["sometext"]},
                { source: "networking", replacements: ["connection;connecting"]},
                { source: "advanced security extra", replacements: ["extra different moretext"]},
                { source: "advanced security", replacements: ["sometext different moretext"]},
                { source: "security", replacements: ["moretext"]}
            ]
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedSourceCueContent =
            "<span onclick=\"pickSetGlossaryTerm('connection;connecting')\" " +
            "class=\"sbte-glossary-match\">Networking</span> and " +
            "<span onclick=\"pickSetGlossaryTerm('extra different moretext')\" " +
            "class=\"sbte-glossary-match\">Advanced Security Extra</span> Business Group";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("renders source cue with first match highlighted", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text Line"),
            cueCategory: "DIALOGUE",
        } as CueDto;

        const expectedSourceCueContent = "<i>Source <b><span style=\"background-color:#D9E9FF\"" +
            " data-reactroot=\"\">Line</span></b></i> <br>Wrapped text Line";

        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(setFind("Line") as {} as AnyAction);
        testingStore.dispatch(searchReplaceSlice.actions.setIndices({
            matchedCueIndex: 5,
            sourceCueIndex: 1,
            targetCueIndex: -1,
            matchLength: 4,
            offset: 7,
            offsetIndex: 0
        }));

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={5}
                    isTargetCue={false}
                    targetCueIndex={1}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                    matchedNestedIndex={1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("renders target cue with first match highlighted", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text Line"),
            cueCategory: "DIALOGUE",
        } as CueDto;

        const expectedSourceCueContent = "<i>Source <b><span style=\"background-color:#D9E9FF\"" +
            " data-reactroot=\"\">Line</span></b></i> <br>Wrapped text Line";

        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(setFind("Line") as {} as AnyAction);
        testingStore.dispatch(searchReplaceSlice.actions.setIndices({
            matchedCueIndex: 5,
            sourceCueIndex: -1,
            targetCueIndex: 1,
            matchLength: 4,
            offset: 7,
            offsetIndex: 0
        }));

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={5}
                    isTargetCue
                    targetCueIndex={1}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                    matchedNestedIndex={1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("renders source cue with second match highlighted", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text Line"),
            cueCategory: "DIALOGUE",
        } as CueDto;

        const expectedSourceCueContent = "<i>Source <b>Line</b></i> <br>Wrapped text " +
            "<span style=\"background-color:#D9E9FF\" data-reactroot=\"\">Line</span>";

        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(setFind("Line") as {} as AnyAction);
        testingStore.dispatch(searchReplaceSlice.actions.setIndices({
            matchedCueIndex: 5,
            sourceCueIndex: 1,
            targetCueIndex: -1,
            matchLength: 4,
            offset: 26,
            offsetIndex: 1
        }));

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={5}
                    isTargetCue={false}
                    targetCueIndex={1}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                    matchedNestedIndex={1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("open cue for editing if clicked for existing one", async () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const cues = [ cue ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={8}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // WHEN
        await act(async () => {
            fireEvent.click(actualNode.container.querySelector("div") as Element);
        });

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(0);
    });

    it("doesn't propagate click event on actions panel to parent DOM node", async () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // WHEN
        await act(async() => {
            fireEvent.click(actualNode.container.querySelector(".sbte-actions-panel") as Element);
        });

        // THEN
        expect(testingStore.getState().cues).toHaveLength(0);
    });

    it("validates cue if errors property is undefined", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const cue = {
            vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE"
        } as CueDto;
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 10,
            maxCaptionDurationInMillis: 6000
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

        const expectedSourceCueContent = "Line 1<br>Line 2<br>Line 3";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms={false}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
        expect(testingStore.getState().cues[0].errors).toEqual(
            [CueError.LINE_COUNT_EXCEEDED, CueError.TIME_GAP_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
        expect(testingStore.getState().cues[1].errors).toEqual(
            [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
    });

    it("validates cue if errors property is null (previously not validated -> old/imported)", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE", errors: null },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: null },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const cue = {
            vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE", errors: null
        } as CueDto;
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 10,
            maxCaptionDurationInMillis: 6000
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

        const expectedSourceCueContent = "Line 1<br>Line 2<br>Line 3";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms={false}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
        expect(testingStore.getState().cues[0].errors).toEqual(
            [CueError.LINE_COUNT_EXCEEDED, CueError.TIME_GAP_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
        expect(testingStore.getState().cues[1].errors).toEqual(
            [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
    });

    it("does not validate source cue", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const cue = {
            vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE"
        } as CueDto;
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 10,
            maxCaptionDurationInMillis: 6000
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

        const expectedSourceCueContent = "Line 1<br>Line 2<br>Line 3";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue={false}
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms={false}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
        expect(testingStore.getState().cues[0].errors).toBeUndefined();
        expect(testingStore.getState().cues[1].errors).toBeUndefined();
    });

    it("does not validate cues if previous validated", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const cue = {
            vttCue: new VTTCue(1, 40, "Line 1\nLine 2\nLine 3"), cueCategory: "DIALOGUE", errors: []
        } as CueDto;
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 10,
            maxCaptionDurationInMillis: 6000
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

        const expectedSourceCueContent = "Line 1<br>Line 2<br>Line 3";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    rowIndex={0}
                    isTargetCue={false}
                    targetCueIndex={0}
                    cue={cue}
                    showGlossaryTerms={false}
                    targetCuesLength={0}
                    sourceCuesIndexes={[]}
                    nextTargetCueIndex={-1}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
        expect(testingStore.getState().cues[0].errors).toEqual([]);
        expect(testingStore.getState().cues[1].errors).toEqual([]);
    });
});
