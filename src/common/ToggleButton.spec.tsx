import "../testUtils/initBrowserEnvironment";
import { mount, shallow } from "enzyme";
import React, { ReactElement } from "react";
import ToggleButton from "./ToggleButton";

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

    it("renders with class", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="btn-secondary">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                className="btn-secondary"
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
                className="btn-secondary"
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
                className="btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(actualNode.find("button").props().className)
            .toEqual("btn-secondary sbte-toggled-btn");
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