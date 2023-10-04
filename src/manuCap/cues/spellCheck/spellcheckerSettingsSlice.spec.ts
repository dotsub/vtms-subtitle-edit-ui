import { AnyAction } from "@reduxjs/toolkit";
import testingStore from "../../../testUtils/testingStore";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";

describe("spellCheckSlices", () => {

    describe("initial values", () => {
        it("init object with default values", () => {
            //GIVEN
            const expectedSpellcheckerSettings = { "domain": null, "enabled": false };

            //THEN
            expect(testingStore.getState().spellCheckerSettings).toEqual(expectedSpellcheckerSettings);
        });
    });


    describe("setSpellCheckerDomain", () => {
        it("sets spell check domain", () => {
            // WHEN
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerSettings.domain).toEqual("testing-domain");
            expect(testingStore.getState().spellCheckerSettings.enabled).toEqual(true);
        });

        it("sets enabled as false if passed null domain", () => {
            // WHEN
            testingStore.dispatch(setSpellCheckDomain(null) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerSettings.domain).toEqual(null);
            expect(testingStore.getState().spellCheckerSettings.enabled).toEqual(false);
        });

        it("sets enabled as false if passed undefined domain", () => {
            // WHEN
            testingStore.dispatch(setSpellCheckDomain(undefined) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerSettings.domain).toEqual(undefined);
            expect(testingStore.getState().spellCheckerSettings.enabled).toEqual(false);
        });
    });

});
