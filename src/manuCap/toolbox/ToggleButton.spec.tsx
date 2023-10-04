import "../../testUtils/initBrowserEnvironment";
import { mount, shallow } from "enzyme";
import { ReactElement } from "react";
import ToggleButton from "./ToggleButton";
import { render } from "@testing-library/react";

describe("ToggleButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders toggled", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-btn-secondary outline-0 active">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                className="sbte-btn-secondary"
                toggled
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with class", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-btn-secondary">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                className="sbte-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with title", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="" title="Testing title">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                title="Testing title"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-btn-secondary" disabled>
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                className="sbte-btn-secondary"
                disabled
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls onClick on click", () => {
        // GIVEN
        const mockOnClick = jest.fn();
        const actualNode = mount(
            <ToggleButton
                onClick={mockOnClick}
                className="sbte-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(mockOnClick).toBeCalled();
    });

    it("appends toggle class on toggle", () => {
        // GIVEN
        const mockOnClick = jest.fn();
        const actualNode = mount(
            <ToggleButton
                onClick={mockOnClick}
                className="sbte-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(actualNode.find("button").props().className)
            .toEqual("sbte-btn-secondary outline-0 active");
    });

    it("passes toggle state to render prop", () => {
        // GIVEN
        const render = jest.fn();
        const actualNode = mount(
            <ToggleButton
                render={render}
            />
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(render).toHaveBeenCalledWith(true);
    });
});
