import "../../testUtils/initBrowserEnvironment";
import { render } from "@testing-library/react";
import { CueError } from "../model";
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";
import CueErrorLine from "./CueErrorLine";

describe("CueErrorLine", () => {
    it("renders", () => {
        // GIVEN
        const expectedContent = render(
            <div>&#8226; Max Characters Per Line Exceeded<br /></div>
        );

        //WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueErrorLine cueIndex={0} cueError={CueError.LINE_CHAR_LIMIT_EXCEEDED} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
});
