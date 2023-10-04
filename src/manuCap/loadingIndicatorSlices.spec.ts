import { createTestingStore } from "../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { AnyAction } from "@reduxjs/toolkit";
import { updateCues } from "./cues/cuesList/cuesListActions";
import { resetEditingTrack } from "./trackSlices";
import { updateSourceCues } from "./cues/view/sourceCueSlices";

const testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("loadingIndicators", () => {
    it("Read initial loaded flags as false", () => {
        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeFalsy();
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeFalsy();
    });

    it("Sets cuesLoaded as true when updateCues is called", () => {
        //WHEN
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeTruthy();
    });

    it("Sets sourceCuesLoaded as true when updateCues is called", () => {
        //WHEN
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeTruthy();
    });

    it("Resets sourceCuesLoaded and cuesLoaded on resetEditingTrack", () => {
        //GIVEN
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);


        //WHEN
        testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeFalsy();
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeFalsy();
    });
});
