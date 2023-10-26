import "../../../testUtils/initBrowserEnvironment";
import {
    addIgnoredKeyword,
    generateSpellcheckHash, getMatchText,
    hasIgnoredKeyword,
    languageToolLanguageMapping
} from "./spellCheckerUtils";
import { Match, Replacement } from "./model";

describe("spellCheckerUtils", () => {
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const ruleId = "MORFOLOGIK_RULE_EN_US";
    const ignoresHashMap = JSON.stringify({
        "0fd7af04-6c87-4793-8d66-fdb19b5fd04d":{
            "hashes":[
                "21db4a58c10774db9f1b4802f89c380c"
            ],
            "creationDate":"2020-09-15T02:25:14.756Z"
        }
    });

    describe("getMatchText", () => {
        it("returns matched text from spellcheck match", () => {
            //GIVEN
            const match = { offset: 8, length: 13, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 8, length: 13 },
                rule: { id: ruleId }} as Match;

            //WHEN
            const matchText = getMatchText(match);

            //THEN
            expect(matchText).toEqual("falsex");
        });
    });

    describe("hasIgnoredKeyword", () => {
        it("returns true if it contains keyword generated hash", () => {
            //GIVEN
            const match = { offset: 8, length: 13, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 8, length: 13 },
                rule: { id: ruleId }} as Match;

            localStorage.setItem("SpellcheckerIgnores", ignoresHashMap);

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(match, trackId);

            //THEN
            expect(containsIgnoredKeyword).toBeTruthy();
        });

        it("returns false if it does not contain the keyword generated hash", () => {
            //GIVEN
            const match = { offset: 8, length: 5, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 8, length: 5 },
                rule: { id: ruleId }} as Match;

            localStorage.setItem("SpellcheckerIgnores", ignoresHashMap);

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(match, trackId);

            //THEN
            expect(containsIgnoredKeyword).toBeFalsy();
        });

        it("returns false if passed trackId undefined", () => {
            //GIVEN
            const match = { offset: 8, length: 5, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 8, length: 5 },
                rule: { id: ruleId }} as Match;
            localStorage.setItem("SpellcheckerIgnores", ignoresHashMap);

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(match, undefined);

            //THEN
            expect(containsIgnoredKeyword).toBeFalsy();
        });
    });

    describe("addIgnoredKeyword", () => {
        it("creates track entry and add generated hash to it", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(keyword, ruleId);
            addIgnoredKeyword(trackId, keyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const actualIgnores = JSON.parse(localStorage.getItem("SpellcheckerIgnores"));
            expect(actualIgnores[trackId].hashes).toContain(expectedHash);
            const creationDate = new Date(actualIgnores[trackId].creationDate);
            expect(creationDate.getTime()).toBeLessThan(new Date().getTime());
        });

        it("append new ignored keyword hash to already created track entry", () => {
            const newKeyword = "bumbum";
            const expectedHash = generateSpellcheckHash(newKeyword,ruleId);

            localStorage.setItem("SpellcheckerIgnores", ignoresHashMap);

            //WHEN
            addIgnoredKeyword(trackId, newKeyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const actualIgnores = JSON.parse(localStorage.getItem("SpellcheckerIgnores"));
            expect(actualIgnores[trackId].hashes.length).toEqual(2);
            expect(actualIgnores[trackId].hashes).toContain(expectedHash);
            const creationDate = new Date(actualIgnores[trackId].creationDate);
            expect(creationDate.getTime()).toBeLessThan(new Date().getTime());
        });
    });

    describe("generateSpellcheckHash", () => {
        it("creates a hash for the gives parameters", () => {
            //GIVEN
            const keyword = "falsex";

            //WHEN
            const expectedHash = generateSpellcheckHash(keyword,ruleId);

            //THEN
            expect(expectedHash).toEqual("21db4a58c10774db9f1b4802f89c380c");
        });

        it("returns same hash if called different times with same parameters", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(keyword,ruleId);

            //WHEN
            const hash1 = generateSpellcheckHash(keyword,ruleId);
            const hash2 = generateSpellcheckHash(keyword,ruleId);

            //THEN
            expect(hash1).toEqual(expectedHash);
            expect(hash2).toEqual(expectedHash);
        });

    });

    describe("manucap language tool language code mapper", () => {
        test.each([
            ["ar-SA", "ar"], ["ca", "ca-ES"], ["nl-NL", "nl"],
            ["en-IE", "en"], ["fr-FR", "fr"], ["fr-CA", "fr"], ["it-IT", "it"], ["no-NO", "no"],
            ["fa-AF", "fa"], ["fa-IR", "fa"], ["es-ES", "es"], ["es-MX", "es"],["sv-SE", "sv"]
        ])(
            "returns equivalent language tool language code for %s",
            (manucapLanguageId: string, languageToolValue: string) => {
                //THEN
                expect(languageToolLanguageMapping.get(manucapLanguageId)).toEqual(languageToolValue);
            },
        );

        it("returns undefined if passed unmapped key", () => {
            //WHEN, THEN
            expect(languageToolLanguageMapping.get("ar-EG")).toEqual(undefined);
        });
    });

});
