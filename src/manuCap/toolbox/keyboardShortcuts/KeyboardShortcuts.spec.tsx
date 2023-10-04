import "../../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../utils/shortcutConstants";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { fireEvent, render } from "@testing-library/react";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button className="mc-keyboard-shortcuts-button flex items-center">
                <i className="w-7 fa-duotone fa-keyboard text-blue-primary" />
                <span>Keyboard Shortcuts</span>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls setShow with opposite value of show", () => {
        // GIVEN
        const setShow = jest.fn();

        mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={setShow} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.SLASH_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(setShow).toHaveBeenCalledWith(false);
    });

    it("calls setShow with true on button click", () => {
        // GIVEN
        const setShow = jest.fn();

        const { container } = render(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={setShow} />
            </Provider>
        );

        // WHEN
        fireEvent.click(container.querySelector("button") as Element);

        // THEN
        expect(setShow).toHaveBeenCalledWith(true);
    });
});
