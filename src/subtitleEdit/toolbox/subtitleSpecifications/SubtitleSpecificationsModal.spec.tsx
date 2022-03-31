import "../../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../../testUtils/testingStore";
import { removeIds } from "../../../testUtils/testUtils";

describe("SubtitleSpecificationsModal", () => {
    it("renders shown", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="p-dialog-mask p-component-overlay p-component-overlay-enter
                        p-dialog-visible p-dialog-center"
                >
                    <div
                        className="p-dialog p-component tw-max-w-3xl p-dialog-enter p-dialog-enter-active"
                        role="dialog"
                        aria-labelledby=""
                        aria-describedby=""
                        aria-modal="true"
                    >
                        <div className="p-dialog-header">
                            <div className="p-dialog-title">
                                Subtitle Specifications
                            </div>
                            <div className="p-dialog-header-icons">
                                <button
                                    type="button"
                                    className="p-dialog-header-icon p-dialog-header-close p-link"
                                    aria-label="Close"
                                >
                                    <span className="p-dialog-header-close-icon pi pi-times" />
                                </button>
                            </div>
                        </div>
                        <div className="p-dialog-content">
                            <label><strong>Enabled:&nbsp;</strong></label>
                            <label>No</label>
                        </div>
                        <div className="p-dialog-footer">
                            <button className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsModal show onClose={(): void => undefined} />
            </Provider>
        );

        // THEN
        expect(removeIds(actualNode.html())).toEqual(expectedNode.html());
    });
});
