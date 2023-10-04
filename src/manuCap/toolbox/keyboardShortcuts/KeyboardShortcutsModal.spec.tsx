import { fireEvent, render } from "@testing-library/react";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import { removeIds, renderWithPortal } from "../../../testUtils/testUtils";
import { ReactElement } from "react";

// We are mocking here.
// eslint-disable-next-line react/display-name
jest.mock("./KeyboardShortcutLabel", () => (): ReactElement => <span>ShortcutLabel</span>);

describe("KeyboardShortcutsModal", () => {
    afterEach(() => {
        // Cleaning JSDOM after each test. Otherwise, it may create inconsistency on tests.
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    it("renders", () => {
        // GIVEN
        const actualNode = renderWithPortal((
            <KeyboardShortcutsModal onClose={jest.fn()} show />
        ));

        // WHEN
        const expectedNode = render(
            <>
                <div />
                <div
                    className="p-dialog-mask p-dialog-center p-component-overlay
                        p-component-overlay-enter p-dialog-visible"
                >
                    <div
                        className="p-dialog p-component max-w-4xl p-dialog-enter p-dialog-enter-active"
                        role="dialog"
                        aria-labelledby=""
                        aria-describedby=""
                        aria-modal
                    >
                        <div className="p-dialog-header">
                            <div className="p-dialog-title">
                                Keyboard Shortcuts
                            </div>
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
                            <div className="space-y-4">
                                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
                                <KeyboardShortcutLabel character="k" name="Toggle Play / Pause Current Cue" />
                                <KeyboardShortcutLabel character="←" name="Seek Back 1 Second" />
                                <KeyboardShortcutLabel character="→" name="Seek Ahead 1 Second" />
                                <KeyboardShortcutLabel character="↑" name="Set Cue Start Time" />
                                <KeyboardShortcutLabel character="↓" name="Set Cue End Time" />
                                <KeyboardShortcutLabel character="Esc" name="Edit Previous Cue" />
                                <KeyboardShortcutLabel
                                    hideAlternativeKey
                                    hideAltKey
                                    character="Space"
                                    name="Show a spelling error [You must be stepping on an spelling error word]"
                                />
                                <KeyboardShortcutLabel
                                    hideAlternativeKey
                                    hideAltKey
                                    character="b"
                                    name="Insert bidirectional text control code"
                                />
                            </div>
                        </div>
                        <div className="p-dialog-footer">
                            <button className="sbte-btn sbte-btn-primary" onClick={jest.fn()}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );

        // THEN
        const actual = removeIds(actualNode.container.innerHTML).replace(/ style=""/g, "");
        expect(actual).toEqual(expectedNode.container.innerHTML);
    });

    it("calls onClose on modal close", () => {
        // GIVEN
        const onClose = jest.fn();

        const actualNode = renderWithPortal(
            <KeyboardShortcutsModal onClose={onClose} show />
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".p-dialog-header-close") as Element);

        // THEN
        expect(onClose).toHaveBeenCalled();
    });
});
