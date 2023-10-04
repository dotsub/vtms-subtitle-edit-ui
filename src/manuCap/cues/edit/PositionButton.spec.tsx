import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue type
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { mount } from "enzyme";
import { fireEvent, render } from "@testing-library/react";

describe("PositionButton", () => {
    it("renders button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const expectedNode = mount(
            <button
                className="sbte-position-toggle-button sbte-dropdown-toggle sbte-btn sbte-btn-light"
                aria-controls="positionButtonMenu"
                aria-haspopup="true"
            >
                <span>↓↓</span>
                <span className="caret" />
            </button>
        );

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with dropdown", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        // noinspection HtmlUnknownAttribute
        const expectedNode = render(
            <>
                <button
                    className="sbte-position-toggle-button sbte-dropdown-toggle sbte-btn sbte-btn-light"
                    aria-controls="positionButtonMenu"
                    aria-haspopup="true"
                >
                    <span>↓↓</span>
                    <span className="caret" />
                </button>
                <div
                    id="positionButtonMenu"
                    className="p-menu p-component p-menu-overlay sbte-position-button-list
                        p-connected-overlay-enter p-connected-overlay-enter-active"
                    style={{
                        zIndex: 1001,
                        visibility: "visible",
                        display: "none",
                        transformOrigin: "top",
                        top: 0,
                        left: 0
                    }}
                >
                    <ul
                        className="p-menu-list p-reset"
                        role="menu"
                    >
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↖↖
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↖↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option" >
                                ↑↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↑↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↗↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↖←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↖
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                →↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ←←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                •
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                →
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                →→
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↙←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↙
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                →↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↙↙
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↙↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↓↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↓↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="sbte-position-button-option">
                                ↘↘
                            </span>
                        </li>
                    </ul>
                </div>
            </>
        );

        // WHEN
        const actualNode = render(<PositionButton vttCue={vttCue} changePosition={jest.fn()} />, {
            container: document.body
        });

        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.innerHTML).toEqual(expectedNode.container.innerHTML);
    });

    it("changes position", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const changePosition = jest.fn();

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={changePosition} />);
        actualNode.find("button").simulate("click");
        actualNode.find("li").at(3).find("span").simulate("click");

        // THEN
        expect(changePosition).toBeCalledWith(Position.Row1Column4);
    });

    it("initializes icon on button according to vttCue styles", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        vttCue.line = 4;
        vttCue.align = "start";
        vttCue.positionAlign = "center";
        vttCue.position = 65;

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        expect(actualNode.find(".sbte-dropdown-toggle").text()).toEqual("↖");
    });
});
