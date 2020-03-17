import "../../../testUtils/initBrowserEnvironment";
import CueCategoryButton from "./CueCategoryButton";
import React from "react";
import each from "jest-each";
import { mount } from "enzyme";

describe("CueCategoryButton", () => {
    it("renders button for undefined category", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="false"
                    id="cue-line-category"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    Dialogue
                </button>
            </div>
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
            <div className="dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="false"
                    id="cue-line-category"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    Audio Descriptions
                </button>
            </div>
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
        // noinspection HtmlUnknownAttribute
        const expectedNode = mount(
            <div className="show dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="true"
                    id="cue-line-category"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    Dialogue
                </button>
                <div
                    x-placement="bottom-start"
                    aria-labelledby="cue-line-category"
                    style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        opacity: "0",
                        pointerEvents: "none"
                    }}
                    className="dropdown-menu show"
                >
                    <a
                        style={{ padding: "8px 24px" }}
                        href="#"
                        className="btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Dialogue
                    </a>
                    <div className="dropdown-divider" role="separator" />
                    <a
                        style={{ padding: "8px 24px" }}
                        href="#"
                        className="btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        On Screen Text
                    </a>
                    <a
                        style={{ padding: "8px 24px" }}
                        href="#"
                        className="btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Audio Descriptions
                    </a>
                    <a
                        style={{ padding: "8px 24px" }}
                        href="#"
                        className="btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Lyrics
                    </a>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <CueCategoryButton onChange={jest.fn()} />
        );
        actualNode.find("button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
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
                const actualNode = mount(
                    <CueCategoryButton onChange={onChange} />
                );
                actualNode.find("button").simulate("click");
                actualNode.find("a").at(index).simulate("click");

                // THEN
                expect(onChange).toHaveBeenCalledWith(expectedValue);
            });
    });
});
