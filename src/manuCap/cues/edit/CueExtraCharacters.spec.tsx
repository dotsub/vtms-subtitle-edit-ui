import "../../../testUtils/initBrowserEnvironment";
import { mount } from "enzyme";
import { CueExtraCharacters } from "./CueExtraCharacters";

describe("CueExtraCharacters", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <span className="text-red-primary">
                <div className="text">sample text</div>
            </span>
        );

        // WHEN
        const actualNode = mount(
            <CueExtraCharacters>
                <div className="text">sample text</div>
            </CueExtraCharacters>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
