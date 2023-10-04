import "../../../testUtils/initBrowserEnvironment";
import { SearchReplaceMatch } from "./SearchReplaceMatch";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

describe("SearchReplaceMatch", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <span style={{ backgroundColor: "#D9E9FF" }}>
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceMatch><div className="text" /></SearchReplaceMatch>
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
