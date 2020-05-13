import "../../testUtils/initBrowserEnvironment";
import Accordion from "react-bootstrap/Accordion";
import { AnyAction } from "@reduxjs/toolkit";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import React from "react";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import Toolbox from "./Toolbox";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                            Toolbox
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <ButtonToolbar className="sbte-button-toolbar">
                                    <KeyboardShortcuts />
                                    <SubtitleSpecificationsButton />
                                    <ShiftTimeButton />
                                    <CaptionOverlapToggle />
                                    <ExportTrackCuesButton handleExport={() => {}} />
                                    <ImportTrackCuesButton handleImport={() => {}} />
                                </ButtonToolbar>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("passes exportFile function to export file button", () => {
        // GIVEN
        const mockExportFile = jest.fn();

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox handleExportFile={mockExportFile} handleImportFile={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(".sbte-export-button").props().onClick).toEqual(mockExportFile);
    });

    it("passes importFile function to import file button", () => {
        // GIVEN
        const mockImportFile = jest.fn();

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox handleExportFile={jest.fn()} handleImportFile={mockImportFile} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(".sbte-import-button").props().onClick).toEqual(mockImportFile);
    });
});
