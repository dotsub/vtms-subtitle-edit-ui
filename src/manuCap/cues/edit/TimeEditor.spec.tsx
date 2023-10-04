/* eslint react/no-unknown-property: 0 */ // custom attribute added by react-advanced-timefield
import "../../../testUtils/initBrowserEnvironment";
import TimeEditor from "./TimeEditor";
import { mount } from "enzyme";

describe("TimeEditor", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="00:00:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 1 second", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="00:00:01.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={1} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 5 minutes", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="00:05:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={300} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 120 minutes 35 seconds and 976 millis", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="02:00:35.976"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={7235.976} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="99:59:59.999"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={359999.999} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values for minutes and seconds but not hours and millis", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-form-control mousetrap block text-center"
                value="01:59:59.025"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={7199.025} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("inputs ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("TimeField").props().value).toEqual("00:00:00.000");
    });

    it("call onChange with correct value", () => {
        // GIVEN
        const onChange = jest.fn();
        const actualNode = mount(
            <TimeEditor onChange={onChange} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "60:00:00.000", selectionEnd: 12 }});

        // THEN
        expect(onChange).toBeCalledWith(216000);
        expect(onChange).toBeCalledTimes(1);
    });
});
