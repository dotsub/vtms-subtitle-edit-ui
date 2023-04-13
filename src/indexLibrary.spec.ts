import * as indexLibrary from "./indexLibrary";

describe("indexLibrary", () => {
    it("exports all the necessary actions/reducers", () => {
        // WHEN import of indexLibrary

        // THEN
        expect(indexLibrary.Actions.setAutoSaveSuccess).toBeDefined();
        expect(indexLibrary.Actions.updateCues).toBeDefined();
        expect(indexLibrary.Actions.updateSourceCues).toBeDefined();
        expect(indexLibrary.Actions.updateEditingTrack).toBeDefined();
        expect(indexLibrary.Actions.updateSubtitleUser).toBeDefined();
        expect(indexLibrary.Reducers).toBeDefined();
    });

    it("exports all the necessary hooks", () => {
        // WHEN import of indexLibrary

        // THEN
        expect(indexLibrary.Hooks.useMatchedCuesAsCsv).toBeDefined();
    });

    it("exports all the necessary components", () => {
        // WHEN import of indexLibrary

        // THEN
        expect(indexLibrary.SubtitleEdit).toBeDefined();
        expect(indexLibrary.VideoPlayer).toBeDefined();
    });
});
