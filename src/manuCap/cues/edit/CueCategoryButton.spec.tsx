import "../../../testUtils/initBrowserEnvironment";
import CueCategoryButton from "./CueCategoryButton";
import each from "jest-each";
import { mount } from "enzyme";
import { fireEvent, render } from "@testing-library/react";

describe("CueCategoryButton", () => {
    it("renders button for undefined category", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                className="sbte-dropdown-toggle sbte-btn sbte-btn-light !font-normal"
                aria-controls="cueCategoryMenu"
                aria-haspopup="true"
            >
                Dialogue
            </button>
        );

        // WHEN
        const actualNode = mount(
            <CueCategoryButton onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders button for already defined category", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                className="sbte-dropdown-toggle sbte-btn sbte-btn-light !font-normal"
                aria-controls="cueCategoryMenu"
                aria-haspopup="true"
            >
                Audio Descriptions
            </button>
        );

        // WHEN
        const actualNode = mount(
            <CueCategoryButton onChange={jest.fn()} category={"AUDIO_DESCRIPTION"} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with dropdown", () => {
        // GIVEN
        const expectedNode = render((
            <>
                <button
                    className="sbte-dropdown-toggle sbte-btn sbte-btn-light"
                    aria-controls="cueCategoryMenu"
                    aria-haspopup="true"
                >
                    Dialogue
                </button>
                <div
                    id="cueCategoryMenu"
                    className="p-menu p-component p-menu-overlay p-connected-overlay-enter
                        p-connected-overlay-enter-active"
                    style={{
                        zIndex: 1001,
                        visibility: "visible",
                        display: "none",
                        transformOrigin: "top",
                        top: 0,
                        left: 0
                    }}
                >
                    <ul className="p-menu-list p-reset" role="menu">
                        <li className="p-menuitem" role="none"><span>Dialogue</span></li>
                        <li className="p-menuitem" role="none"><span>On Screen Text</span></li>
                        <li className="p-menuitem" role="none"><span>Audio Descriptions</span></li>
                        <li className="p-menuitem" role="none"><span>Lyrics</span></li>
                    </ul>
                </div>
            </>
        ), { container: document.body });

        // WHEN
        const actualNode = render(<CueCategoryButton onChange={jest.fn()} />, { container: document.body });
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    describe("CueCategory options", () => {
        // GIVEN
        const onChange = jest.fn();

        each([
            [0, "DIALOGUE"],
            [1, "ONSCREEN_TEXT"],
            [2, "AUDIO_DESCRIPTION"],
            [3, "LYRICS"],
        ])
            .it("call onChange with correct value", (
                index: number,
                expectedValue: string
            ) => {
                // WHEN
                const actualNode = mount(<CueCategoryButton onChange={onChange} />);
                actualNode.find("button").simulate("click");
                actualNode.find("li").at(index).find("span").simulate("click");

                // THEN
                expect(onChange).toHaveBeenCalledWith(expectedValue);
            });
    });
});
