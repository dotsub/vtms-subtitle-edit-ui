import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import Toolbox from "./Toolbox";
import { readSubtitleSpecification } from "./subtitleSpecifications/subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { Language, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import SearchReplaceButton from "./SearchReplaceButton";
import { fireEvent, render, waitFor } from "@testing-library/react";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import { renderWithPortal } from "../../testUtils/testUtils";

describe("Toolbox", () => {
    afterEach(() => {
        // Cleaning JSDOM after each test. Otherwise, it may create inconsistency on tests.
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="mt-6 space-x-2 flex items-stretch z-100
                        justify-center sbte-button-toolbar"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <button
                        className="select-none sbte-dropdown-toggle sbte-btn sbte-btn-light flex
                                items-center justify-center"
                        aria-controls="toolboxMenu"
                        aria-haspopup="true"
                    >
                        <i className="fa-duotone fa-ellipsis-h" />
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox handleExportSourceFile={jest.fn()} handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for translation track", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="mt-6 space-x-2 flex items-stretch
                        z-100 justify-center sbte-button-toolbar"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportSourceTrackCuesButton handleExport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <button
                        className="select-none sbte-dropdown-toggle sbte-btn sbte-btn-light flex
                                items-center justify-center"
                        aria-controls="toolboxMenu"
                        aria-haspopup="true"
                    >
                        <i className="fa-duotone fa-ellipsis-h" />
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox handleExportSourceFile={jest.fn()} handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("passes exportFile function to export file button", () => {
        // GIVEN
        const mockExportFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={mockExportFile}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-button") as Element);

        // THEN
        expect(mockExportFile).toHaveBeenCalled();
    });

    it("passes importFile function to import file button", () => {
        // GIVEN
        const mockImportFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={jest.fn()}
                    handleImportFile={mockImportFile}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-import-button") as Element);

        // THEN
        expect(mockImportFile).toHaveBeenCalled();
    });

    it("passes exportSourceFile function to source export file button", () => {
        // GIVEN
        const mockExportSourceFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={mockExportSourceFile}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-source-button") as Element);

        // THEN
        expect(mockExportSourceFile).toHaveBeenCalled();
    });

    it("renders with toolbox menu open", async () => {
        // GIVEN
        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(
            actualNode.container.querySelector(".sbte-button-toolbar .sbte-dropdown-toggle") as Element);

        // THEN
        await waitFor(() => {
            expect(actualNode.container.querySelector("#toolboxMenu")).not.toBeNull();
        });
    });

    it("closes shift time modal on button click", async () => {
        // GIVEN
        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        // Opening Toolbox Menu.
        fireEvent.click(
            actualNode.container.querySelector(".sbte-button-toolbar .sbte-dropdown-toggle") as Element);
        // Clicking on "Unlock Time Code Button".
        fireEvent.click(
            actualNode.container.querySelector("#toolboxMenu .p-menuitem:nth-child(7) button") as Element);
        // Opening Toolbox Menu.
        fireEvent.click(
            actualNode.container.querySelector(".sbte-button-toolbar .sbte-dropdown-toggle") as Element);
        // Clicking on "Shift Track Time".
        fireEvent.click(
            actualNode.container.querySelector("#toolboxMenu .p-menuitem:nth-child(3) button") as Element);
        // Clicking on close button
        fireEvent.click(
            actualNode.container.querySelector(".dotsub-shift-modal-close-button") as Element);

        // THEN
        await waitFor(() => {
            expect(actualNode.container.querySelector(".p-dialog")).toBeNull();
        });
    });

    it("opens keyboard shortcut modal on button click", async () => {
        // GIVEN
        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(
            actualNode.container.querySelector(".sbte-button-toolbar .sbte-dropdown-toggle") as Element);
        fireEvent.click(
            actualNode.container.querySelector("#toolboxMenu .p-menuitem:nth-child(1) button") as Element);

        // THEN
        await waitFor(() => {
            expect(actualNode.container.querySelector(".p-dialog")).not.toBeNull();
        });
    });

    it("closes keyboard shortcut modal on button click", async () => {
        // GIVEN
        const mockExportSourceFile = jest.fn();

        const actualNode = renderWithPortal(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={mockExportSourceFile}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(
            actualNode.container.querySelector(".sbte-button-toolbar .sbte-dropdown-toggle") as Element);
        fireEvent.click(
            actualNode.container.querySelector("#toolboxMenu .p-menuitem:nth-child(1) button") as Element);
        fireEvent.click(
            actualNode.container.querySelector(".p-dialog .sbte-btn-primary") as Element);

        // THEN
        await waitFor(() => {
            expect(actualNode.container.querySelector(".p-dialog")).toBeNull();
        });
    });
});
