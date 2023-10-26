import "video.js"; // VTTCue definition
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import { v4 as uuidv4 } from "uuid";
import { act } from "react-dom/test-utils";

import {
    addCue,
    addCueComment,
    addCuesToMergeList,
    applyShiftTimeByPosition,
    checkErrors,
    checkSpelling,
    deleteCue,
    deleteCueComment,
    mergeCues,
    removeCuesToMergeList,
    splitCue,
    syncCues,
    updateCueCategory,
    updateCues,
    updateVttCue,
    updateVttCueTextOnly,
    validateCorruptedCues,
    validateVttCue,
} from "./cuesListActions";
import { CueDto, CueError, ScrollPosition, Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { resetEditingTrack, updateEditingTrack } from "../../trackSlices";
import { generateSpellcheckHash } from "../spellCheck/spellCheckerUtils";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { updateSourceCues } from "../view/sourceCueSlices";
import { clearLastCueChange, lastCueChangeSlice, updateEditingCueIndex } from "../edit/cueEditorSlices";
import { setSaveTrack } from "../saveSlices";
import { cuesSlice, matchedCuesSlice, ShiftPosition } from "./cuesListSlices";
import * as cuesListScrollSlice from "./cuesListScrollSlice";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";
import { saveCueDeleteSlice } from "../saveCueDeleteSlices";

const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingChunkTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaChunkStart: 4000,
    mediaChunkEnd: 6000
} as Track;

const testingCues = [
    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        id: "cue-3",
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testComments = [
    { author: "username", comment: "this is the first comment", date: "2021-01-01T11:00:00.000Z" },
    { author: "username", comment: "this is the second comment", date: "2021-01-01T11:00:00.000Z" },
    { author: "username", comment: "this is the third comment", date: "2021-01-01T11:00:00.000Z" }
];

const testingCuesWithComments = [
    {
        id: "cue-c-1",
        vttCue: new VTTCue(0, 2, "Caption Line 1"),
        cueCategory: "DIALOGUE",
        comments: [testComments[0], testComments[1]]
    },
    {
        id: "cue-c-1",
        vttCue: new VTTCue(2, 4, "Caption Line 2"),
        cueCategory: "ONSCREEN_TEXT",
        comments: [testComments[2]]
    },
    {
        id: "cue-c-1",
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testingCuesEditDisabled = [
    {
        id: "cue-e-1",
        vttCue: new VTTCue(0, 2, "Caption Line 1"),
        cueCategory: "DIALOGUE",
        editDisabled: true
    },
    { id: "cue-e-1", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        id: "cue-e-1",
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testingCuesWithGaps = [
    { id: "cue-g-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { id: "cue-g-1", vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { id: "cue-g-1", vttCue: new VTTCue(12, 18, "Caption Line 3"), cueCategory: "DIALOGUE" },
] as CueDto[];
const ruleId = "MORFOLOGIK_RULE_EN_US";
const ignoredKeyword = "falsex";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

const updateCueMock = jest.fn();
updateCueMock.mockImplementation(() => Promise.resolve({}));

const deleteCueMock = jest.fn();
const saveTrackMock = jest.fn();

describe("cueListActions", () => {
    beforeEach(() => {
        localStorage.clear();
        testingStore = createTestingStore();
        // @ts-ignore mocking here
        testingStore.dispatch(setSaveTrack(saveTrackMock));
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueMock));
        jest.clearAllMocks();
    });

    describe("updateVttCue", () => {
        it("update top level cue", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[1].editUuid;

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.5);
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("EDIT");
            expect(testingStore.getState().lastCueChange.index).toEqual(1);
            expect(testingStore.getState().lastCueChange.vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue === testingStore.getState().lastCueChange.vttCue)
                .toBeTruthy();
            expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(3);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("preserves all other existing cue parameters", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[2].editUuid;

            // WHEN
            testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[2].spellCheck)
                .toEqual({ matches: [{ message: "some-spell-check-problem" }]});
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("doesn't update top level cue when editUuid is different", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(clearLastCueChange() as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.5, "Dummy Cue"), uuidv4()) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().lastCueChange).toBeNull();
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("doesn't update top level cue when not existing already in the array", () => {
            // WHEN
            testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2.5, "Dummy Cue"), uuidv4()) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues.length).toEqual(0);
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().lastCueChange).toBeNull();
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        describe("spell checking", () => {
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";

            it("updates cues in redux with spell checking state", async () => {
                // GIVEN
                const testingResponse = {
                    matches: [
                        {
                            message: "This sentence does not start with an uppercase letter",
                            replacements: [{ "value": "Txt" }],
                            "offset": 0,
                            "length": 3,
                            context: { text: "txt", length: 3, offset: 0 },
                            rule: { id: ruleId }
                        },
                        {
                            "message": "Possible spelling mistake found.",
                            "replacements": [
                                { value: "check" },
                                { value: "Chuck" },
                                { value: "chick" },
                                { value: "chuck" },
                                { value: "chock" },
                                { value: "CCK" },
                                { value: "CHC" },
                                { value: "CHK" },
                                { value: "cock" },
                                { value: "ch ck" }
                            ],
                            "offset": 7,
                            "length": 4,
                            context: { text: "text", length: 4, offset: 7 },
                            rule: { id: ruleId }
                        }
                    ]
                };
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                // WHEN
                await act(async () => {
                    testingStore
                        .dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue")) as {} as AnyAction);
                });

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                      method: "POST",
                      body: "language=en-US&text=Dummy Cue" +
                          "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                expect(testingStore.getState().cues[2].spellCheck).toEqual(testingResponse);
                expect(testingStore.getState().cues[2].editUuid).not.toBeNull();
                expect(testingStore.getState().cues[2].errors).toEqual(
                    [CueError.TIME_GAP_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP, CueError.SPELLCHECK_ERROR]);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("does not mark a cue as corrupted if a spell check is fixed", async () => {
                // GIVEN
                const testingResponse = { matches: []};
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                // WHEN
                await act(async () => {
                    testingStore
                        .dispatch(updateVttCue(2, new VTTCue(4, 6, "Dummy Cue")) as {} as AnyAction);
                });

                // THEN
                expect(testingStore.getState().cues[2].errors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("retains corrupted mark if spell check problems are added to existing ones", async () => {
                // GIVEN
                const testingResponse = {
                    matches: [
                        {
                            message: "There are spelling errors",
                            replacements: [{ "value": "false" }],
                            offset: 0,
                            length: 6,
                            context: { text: "Dummyx is not a word", length: 6, offset: 0 },
                            rule: { id: ruleId }
                        }

                    ]
                };
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                // WHEN
                await act(async () => {
                    testingStore
                        .dispatch(updateVttCue(2, new VTTCue(4, 6, "Dummyx Cue")) as {} as AnyAction);
                });

                // THEN
                expect(testingStore.getState().cues[2].errors).toEqual([CueError.SPELLCHECK_ERROR]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("retains corrupted mark if spell check problems are added to existing ones and cue has other errors",
                async () => {
                // GIVEN
                const testingResponse = {
                    matches: [
                        {
                            message: "There are spelling errors",
                            replacements: [{ "value": "false" }],
                            offset: 0,
                            length: 6,
                            context: { text: "Dummyx is not a word", length: 6, offset: 0 },
                            rule: { id: ruleId }
                        }

                    ]
                };
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                // WHEN
                await act(async () => {
                    testingStore
                        .dispatch(updateVttCue(2, new VTTCue(3, 3.5, "Dummyx Cue")) as {} as AnyAction);
                });

                // THEN
                expect(testingStore.getState().cues[2].errors).toEqual(
                    [CueError.TIME_GAP_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP, CueError.SPELLCHECK_ERROR]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("triggers autosave content is changed", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);


                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                      body: "language=en-US&text=Dummy Cue" +
                          "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END",
                      method: "POST"
                    }
                );
            });

            test.each([
                ["ar-SA", "ar"], ["ca", "ca-ES"], ["nl-NL", "nl"],
                ["en-IE", "en"], ["fr-FR", "fr"], ["fr-CA", "fr"], ["it-IT", "it"], ["no-NO", "no"],
                ["fa-AF", "fa"], ["fa-IR", "fa"], ["es-ES", "es"], ["es-MX", "es"], ["sv-SE", "sv"]
            ])(
                "calls spellchecker domain with correctly mapped language for %s",
                (manucapLanguageId: string, languageToolValue: string) => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: manucapLanguageId }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);


                    const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                        body: `language=${languageToolValue
                        }&text=Dummy Cue&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END`,
                        method: "POST"
                    }
                );
            });

            test.each([
                ["en-US", "en-US"], ["en-GB", "en-GB"], ["pt-BR", "pt-BR"],
                ["pt-PT", "pt-PT"], ["sk-SK", "sk-SK"], ["ru-RU", "ru-RU"]
            ])(
                "calls spellchecker with manucap languages codes if language is defined but" +
                " not found in language tool mapper",
                (manucapLanguageId: string, languageToolValue: string) => {
                    // GIVEN
                    testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                    testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                    testingStore.dispatch(updateEditingTrack(
                        { language: { id: manucapLanguageId }, id: trackId } as Track
                    ) as {} as AnyAction);
                    testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                    const editUuid = testingStore.getState().cues[2].editUuid;
                    // @ts-ignore modern browsers does have it
                    global.fetch = jest.fn()
                        .mockImplementation(() =>
                            new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                    // WHEN
                    testingStore.dispatch(updateVttCue(2,
                        new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                    // THEN
                    // @ts-ignore modern browsers does have it
                    expect(global.fetch).toBeCalledWith(
                        "https://testing-domain/v2/check",
                        {
                            body: `language=${languageToolValue
                            }&text=Dummy Cue&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END`,
                            method: "POST"
                        }
                    );
                });

            it("does not trigger spell check if domain is undefined", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
            });

            it("does not trigger spell check if language is undefined", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
            });

            it("exclude spell check match that matches ignored hash in local storage ", async () => {
                // GIVEN
                const cues = [
                    {
                        vttCue: new VTTCue(0, 2, "falsex Line 1"), cueCategory: "DIALOGUE",
                        errors: [CueError.SPELLCHECK_ERROR]
                    }] as CueDto[];
                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                const testingResponse = {
                    matches: [
                        {
                            message: "there are spelling errors",
                            replacements: [{ "value": "false" }],
                            offset: 0,
                            length: 6,
                            context: { text: "falsex is not a word", length: 6, offset: 0 },
                            rule: { id: ruleId }
                        }
                    ]
                };
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
                testingStore.dispatch(matchedCuesSlice.actions
                    .matchCuesByTime({ cues: testingCues, sourceCues: [], editingCueIndex: 0 })
                );

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                const hash = generateSpellcheckHash(ignoredKeyword, ruleId);
                const ignoredKeyWordMap = {};
                ignoredKeyWordMap[trackId] = {
                    hashes: [hash],
                    creationDate: new Date()
                };
                localStorage.setItem("SpellcheckerIgnores", JSON.stringify(ignoredKeyWordMap));

                //WHEN
                await act(async () => {
                    testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"),
                        testingStore.getState().cues[0].editUuid) as {} as AnyAction);
                });

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                        method: "POST",
                        body: "language=en-US&text=Dummy Cue" +
                            "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                expect(testingStore.getState().cues[0].spellCheck).toEqual({ "matches": []});
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.errors).toEqual([]);
            });

            it("doesn't disable calls to spellchecker when if language tool responds with random error", async () => {
                // GIVEN
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((resolve) =>
                        resolve({ status: 400, ok: false })));

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                //WHEN
                for (let i = 0; i < 10; i++) {
                    await act(async () => {
                        const editUuid = testingStore.getState().cues[2].editUuid;
                        testingStore.dispatch(
                            updateVttCue(2, new VTTCue(2, 2.5, "Dummyx Cue"), editUuid) as {} as AnyAction
                        );
                    });
                }

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(10);
            });

            it("doesn't disable calls to spellchecker when if spell checker fetch promise is rejected", async () => {
                // GIVEN
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((_resolve, reject) => reject()));

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                //WHEN
                for (let i = 0; i < 10; i++) {
                    await act(async () => {
                        const editUuid = testingStore.getState().cues[2].editUuid;
                        testingStore.dispatch(
                            updateVttCue(2, new VTTCue(2, 2.5, "Dummyx Cue"), editUuid) as {} as AnyAction
                        );
                    });
                }

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(10);
            });

            it("disable calls to spellchecker when if language tool responds no language supported error", async () => {
                // GIVEN
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn().mockImplementation(() => new Promise((resolve) => resolve({
                    status: 400,
                    ok: false,
                    text: () => Promise.resolve("Error: 'gg' is not a language code known to LanguageTool. " +
                        "Supported language codes are: ar, ar-DZ, ast-ES, be-BY, br-FR, ca-ES, ca-ES-valencia, " +
                        "da-DK, de, de-AT, de-CH, de-DE, de-DE-x-simple-language, el-GR, en, en-AU, en-CA, en-GB, " +
                        "en-NZ, en-US, en-ZA, eo, es, fa, fr, ga-IE, gl-ES, it, ja-JP, km-KH, nl, pl-PL, pt, pt-AO, " +
                        "pt-BR, pt-MZ, pt-PT, ro-RO, ru-RU, sk-SK, sl-SI, sv, ta-IN, tl-PH, uk-UA, zh-CN. " +
                        "The list of languages is read from META-INF/org/languagetool/language-module.properties " +
                        "in the Java classpath. See http://wiki.languagetool.org/java-api for details.")
                })));

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "gg" }, id: trackId } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

                //WHEN
                for (let i = 0; i < 10; i++) {
                    await act(async () => {
                        const editUuid = testingStore.getState().cues[2].editUuid;
                        testingStore.dispatch(
                            updateVttCue(2, new VTTCue(2, 2.5, "Dummyx Cue"), editUuid) as {} as AnyAction
                        );
                    });
                }

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(1);
            });

            it("triggers call to spellchecker even with trackId undefined", async () => {
                const cues = [
                    {
                        vttCue: new VTTCue(0, 2, "falsex Line 1"), cueCategory: "DIALOGUE",
                        errors: [CueError.SPELLCHECK_ERROR]
                    }] as CueDto[];
                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                const testingResponse = {
                    matches: [
                        {
                            message: "there are spelling errors",
                            replacements: [{ "value": "false" }],
                            offset: 0,
                            length: 6,
                            context: { text: "falsex is not a word", length: 6, offset: 0 },
                            rule: { id: ruleId }
                        }
                    ]
                };
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: undefined } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                //WHEN
                await act(async () => {
                    testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2.5, "Dummyx Cue"),
                        editUuid) as {} as AnyAction);
                });

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(1);
                expect(testingStore.getState().cues[0].spellCheck).toEqual(testingResponse);
            });

            it("does not triggers call to spellchecker for previous and following cues if called before",
                async () => {

                const cues = [
                    {
                        vttCue: new VTTCue(0, 2, "falsex Line 1"),
                        cueCategory: "DIALOGUE", errors: [CueError.SPELLCHECK_ERROR], spellCheck: { matches: []}
                    },
                    {
                        vttCue: new VTTCue(2, 4, "falsex Line 2"),
                        cueCategory: "DIALOGUE", errors: [CueError.SPELLCHECK_ERROR], spellCheck: { matches: []}
                    },
                    {
                        vttCue: new VTTCue(6, 8, "falsex Line 3"),
                        cueCategory: "DIALOGUE", errors: [CueError.SPELLCHECK_ERROR], spellCheck: { matches: []}
                    }
                ] as CueDto[];
                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: undefined } as Track
                ) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((resolve) =>
                        resolve({ json: () => ({}), ok: true })));
                //WHEN
                await act(async () => {
                    testingStore.dispatch(updateVttCue(1, cues[1].vttCue, editUuid) as {} as AnyAction);
                });

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(1);

                // @ts-ignore modern browsers does have it
                expect(global.fetch.mock.calls[0][1].body).toContain("text=falsex Line 2");
            });
        });

        describe("range prevention", () => {
            it("apply invalid end time prevention on start time change", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.999);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_START);
            });

            it("apply invalid end time prevention on end time change", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 0, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.001);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_END);
            });

            it("doesn't allow start time to be less than chunk start time", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingChunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(3, 6, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.OUT_OF_CHUNK_RAGE);
            });

            it("doesn't allow end time to be greater than chunk end time", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingChunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(4, 6.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.OUT_OF_CHUNK_RAGE);
            });

            it("doesn't allow start time to be less than chunk start time with sub spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(testingChunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(3, 6, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.OUT_OF_CHUNK_RAGE);
            });

            it("doesn't allow end time to be greater than chunk end time with sub spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(testingChunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(4, 6.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.OUT_OF_CHUNK_RAGE);
            });

            it("Adjust startTime to follow min caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(3, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.8);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_START);
            });

            it("doesn't apply min range limitation for start/end time if time values weren't changed", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("Adjust endtime to follow min caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 3, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.2);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_END);
            });

            it("Adjust startTime to follow max caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 500,
                    maxCaptionDurationInMillis: 1000,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2.8, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_START);
            });

            it("doesn't apply max range limitation for start/end time if time values weren't changed", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 1500,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[0].errors).toEqual([CueError.TIME_GAP_LIMIT_EXCEEDED]);
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("Adjust endtime to follow max caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 500,
                    maxCaptionDurationInMillis: 1000,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toEqual(
                    [CueError.TIME_GAP_OVERLAP, CueError.INVALID_RANGE_END]);
            });

            it("Adjust startTime to follow min caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(4, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3.999);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_START);
            });

            it("Adjust endtime to follow min caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("Adjust startTime to follow max caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(5, 18, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(18);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("Adjust endtime to follow max caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(2, new VTTCue(12, 12, "Dummy Cue"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(12);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(12.001);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.INVALID_RANGE_END);
            });

            it("applies the change if current cue doesn't conform to character limitation rules", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "Change to be applied"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Change to be applied");
            });
        });

        describe("overlap prevention", () => {
            it("apply overlap prevention for end time", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toEqual(
                    [CueError.TIME_GAP_OVERLAP]);
            });

            it("doesn't apply overlap prevention for end time if wasn't changed", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("doesn't apply overlap prevention for end time if overlapping is enabled", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Caption Line 1"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("apply overlap prevention for start time", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(0, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("doesn't apply overlap prevention for start time if overlapping is enabled", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(1, new VTTCue(1, 4, "Caption Line 2"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("doesn't apply overlap prevention for start time if not changed", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("doesn't apply overlap prevention if overlapping is enabled and there are no subtitle specs", () => {
                // GIVEN
                const testingSubtitleSpecification = { enabled: false } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Caption Line 1"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });

            it("doesn't apply overlap prevention if overlapping is enabled and there are subtitle specs", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    enabled: true,
                    minCaptionDurationInMillis: 1000,
                    maxCaptionDurationInMillis: 2000
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(1.5, 2.4, "Caption Line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.4);
                expect(testingStore.getState().cues[1].errors).toEqual([]);
                expect(testingStore.getState().cues[0].errors).toEqual([]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.TIME_GAP_OVERLAP);
            });
        });

        describe("character/line count limitation", () => {
            it("ignore line count prevention if null in subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: null,
                    maxCharactersPerLine: 30,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy \n\nCue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy \n\nCue");
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("ignore line count prevention if subtitle specs are disabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: false,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy \n\nCue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy \n\nCue");
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("doesn't apply character count limitation to first line", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 15,
                } as SubtitleSpecification;
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(0, 2, "Long long line 1\nline 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Long long line 1\nline 2");
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_COUNT_EXCEEDED);
            });

            it("doesn't apply character count limitation to second line", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 15,
                } as SubtitleSpecification;
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(0, 2, "line 1\nlong long line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("line 1\nlong long line 2");
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_CHAR_LIMIT_EXCEEDED);
            });

            it("do not count HTML tags into line count limitation", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\n<i>l<b>ine</b></i> 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\n<i>l<b>ine</b></i> 2");
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_COUNT_EXCEEDED);
            });

            it("ignore character line count limitation if null in subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: null,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_CHAR_LIMIT_EXCEEDED);
            });

            it("ignore character line count limitation if subtitle specs are disabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: false,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_COUNT_EXCEEDED);
            });

            it("does not apply character limitation if previous cue doesn't conform to rules as well", () => {
                // GIVEN
                const cuesLong = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesLong) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().cues[0].errors).toEqual([CueError.LINE_CHAR_LIMIT_EXCEEDED]);
                expect(testingStore.getState().validationErrors).not.toContain(CueError.LINE_CHAR_LIMIT_EXCEEDED);
            });
        });

        describe("text only update", () => {
            it("ignores time code changes if text only change", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCueTextOnly(0, new VTTCue(1, 3, "Caption Line X"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line X");
            });

            it("doesn't set validation error if change is text only and time codes are different", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCueTextOnly(0, new VTTCue(1, 3, "Caption Line X"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line X");
                expect(testingStore.getState().validationErrors).toEqual([]);
            });

            it("updates single matched cue for textOnly update in captioning mode", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
                testingStore.dispatch(
                    updateVttCueTextOnly(1, new VTTCue(1, 3, "Caption Line X"), undefined) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;
                testingStore.dispatch(matchedCuesSlice.actions
                    .matchCuesByTime({ cues: testingCues, sourceCues: [], editingCueIndex: 1 })
                );
                changeScrollPositionSpy.mockClear();

                // WHEN
                testingStore.dispatch(
                    updateVttCueTextOnly(1, new VTTCue(1, 3, "Caption Line X updated"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(3);
                expect(testingStore.getState().matchedCues.matchedCues[1].targetCues[0].cue.vttCue.text)
                    .toEqual("Caption Line X updated");
                expect(changeScrollPositionSpy).not.toBeCalled();
            });

            it("updates single matched cue for textOnly update in translation mode", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
                testingStore.dispatch(
                    updateVttCueTextOnly(1, new VTTCue(1, 3, "Caption Line X"), undefined) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;
                testingStore.dispatch(matchedCuesSlice.actions
                    .matchCuesByTime({
                        cues: testingCues,
                        sourceCues: [{ vttCue: new VTTCue(0, 6, "Source Line 1"), cueCategory: "DIALOGUE" }],
                        editingCueIndex: 1
                    })
                );
                changeScrollPositionSpy.mockClear();

                // WHEN
                testingStore.dispatch(
                    updateVttCueTextOnly(1, new VTTCue(1, 3, "Caption Line X updated"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(1);
                expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[1].cue.vttCue.text)
                    .toEqual("Caption Line X updated");
                expect(changeScrollPositionSpy).not.toBeCalled();
            });

            it("updates matched cues for non textOnly update", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(
                    updateVttCueTextOnly(0, new VTTCue(1, 3, "Caption Line X"), undefined) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;
                testingStore.dispatch(matchedCuesSlice.actions
                    .matchCuesByTime({ cues: [], sourceCues: [], editingCueIndex: 0 })
                );

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(1, 3, "Caption Line X updated"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(3);
                expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.CURRENT);
            });
        });

        describe("reordering", () => {
            it("reorder cues if cue position changes when editing start time", () => {
                // GIVEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(1.5, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.5);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(testingStore.getState().lastCueChange.changeType).toEqual("UPDATE_ALL");
                expect(testingStore.getState().lastCueChange.index).toEqual(-1);
                expect(testingStore.getState().lastCueChange.vttCue).toBeUndefined();
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(3);
                expect(testingStore.getState().editingCueIndex).toEqual(1);
                expect(testingStore.getState().focusedInput).toEqual("START_TIME");
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("don't reorder cues if cue position doesn't change when editing start time", () => {
                // GIVEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(testingStore.getState().lastCueChange.changeType).toEqual("EDIT");
                expect(testingStore.getState().lastCueChange.index).toEqual(2);
                expect(testingStore.getState().lastCueChange.vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[2].vttCue === testingStore.getState().lastCueChange.vttCue)
                    .toBeTruthy();
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(3);
                expect(testingStore.getState().editingCueIndex).toEqual(2);
                expect(testingStore.getState().focusedInput).toEqual("EDITOR");
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });

        // TODO: We should maybe re-consider cues matching algorithm for this test case
        //  Check `testingStore.getState().matchedCues.matchedCues` in THEN phase. But not cure about it.
        it("reorder also for translation interface", () => {
            // GIVEN
            const track = { ...testingTrack, overlapEnabled: true };
            testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[1].editUuid;

            // WHEN
            testingStore.dispatch(updateVttCue(2, new VTTCue(1.5, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.5);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 2");
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("UPDATE_ALL");
            expect(testingStore.getState().lastCueChange.index).toEqual(-1);
            expect(testingStore.getState().lastCueChange.vttCue).toBeUndefined();
            expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(4);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedInput).toEqual("START_TIME");
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("validateCue", () => {
        it("mark cue as corrupted if it doesn't conform to rules", async () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { id: "cue-4", vttCue: new VTTCue(5, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            await testingStore.dispatch(validateVttCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toEqual([]);
            expect(testingStore.getState().cues[2].errors).toEqual(
                [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
            expect(testingStore.getState().cues[3].errors).toEqual([CueError.TIME_GAP_OVERLAP]);
            expect(testingStore.getState().matchedCues.matchedCues["0"].targetCues["0"].cue.errors).toBeUndefined();
            expect(testingStore.getState().matchedCues.matchedCues["1"].targetCues["0"].cue.errors).toBeUndefined();
            expect(testingStore.getState().matchedCues.matchedCues["2"].targetCues["0"].cue.errors).toEqual(
                [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.TIME_GAP_OVERLAP]);
            expect(testingStore.getState().matchedCues.matchedCues["3"].targetCues["0"].cue.errors).toBeUndefined();
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("does not mark cues as corrupted if maxCharactersPerLine is null", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Long 1"),
                    cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"),
                    cueCategory: "DIALOGUE" },
                { id: "cue-4", vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: null,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toEqual([]);
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().cues[3].errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("does not mark cues as corrupted if maxCharactersPerLine is 0", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Long 1"),
                    cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"),
                    cueCategory: "DIALOGUE" },
                { id: "cue-4", vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 0,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toEqual([]);
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().cues[3].errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("does trigger autosave if errors count is different", () => {
            // GIVEN
            const cuesCorrupted = [
                {
                    id: "cue-c-1",
                    vttCue: new VTTCue(0, 2, "Caption Long 1"),
                    cueCategory: "DIALOGUE"
                },
                { id: "cue-c-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-c-3",
                    vttCue: new VTTCue(4, 6, "Caption Long\nLine 2\nLine 3"),
                    cueCategory: "DIALOGUE"
                },
                { id: "cue-c-4", vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 0,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toEqual([]);
            expect(testingStore.getState().cues[2].errors).toEqual(["Max Lines Per Caption Exceeded"]);
            expect(testingStore.getState().cues[3].errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("marks cue as corrupted if chars per second max is exceeded", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "line with too many characters per second."),
                    cueCategory: "DIALOGUE"
                },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxCharactersPerSecondPerCaption: 20,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues["1"].targetCues["0"].cue.errors)
                .toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("marks cue as corrupted if chars per second max is exceeded in multiple lines", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "line with too many \ncharacters \nper second."),
                    cueCategory: "DIALOGUE"
                },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxCharactersPerSecondPerCaption: 20,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues["1"].targetCues["0"].cue.errors)
                .toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("marks cue as corrupted if chars per second max and chars per line are exceeded", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "line with too many characters per second."),
                    cueCategory: "DIALOGUE"
                },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxCharactersPerLine: 15,
                maxCharactersPerSecondPerCaption: 20,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).toEqual(
                [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.CHARS_PER_SECOND_EXCEEDED]);
            expect(testingStore.getState().matchedCues.matchedCues["1"].targetCues["0"].cue.errors)
                .toEqual([CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.CHARS_PER_SECOND_EXCEEDED]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("marks cue as corrupted if chars per second max and lines per caption are exceeded", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "line with\ntoo many\ncharacters per second."),
                    cueCategory: "DIALOGUE"
                },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerSecondPerCaption: 15,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("line with\ntoo many\ncharacters per second.");
            expect(testingStore.getState().cues[1].errors).toEqual(
                [CueError.LINE_COUNT_EXCEEDED, CueError.CHARS_PER_SECOND_EXCEEDED]);
            expect(testingStore.getState().matchedCues.matchedCues["1"].targetCues["0"].cue.errors)
                .toEqual([CueError.LINE_COUNT_EXCEEDED, CueError.CHARS_PER_SECOND_EXCEEDED]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("doesn't mark cue as corrupted if chars per second max is not exceeded", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "line with many characters, but not too many"),
                    cueCategory: "DIALOGUE"
                },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxCharactersPerSecondPerCaption: 40,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).not.toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("ignores max chars per second if null in subtitle specs", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "line with too many characters per second"),
                    cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                enabled: true,
                maxCharactersPerSecondPerCaption: null,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).not.toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("ignores max chars per second if subtitle specs are disabled", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "line with too many characters per second"),
                    cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                enabled: false,
                maxCharactersPerSecondPerCaption: 15,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).not.toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("do not count HTML tags into max chars per second limitation", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4,
                        "line with <i>too</i> many <b>characters</b> per second"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxCharactersPerSecondPerCaption: 20,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(validateVttCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].errors).not.toContain(CueError.CHARS_PER_SECOND_EXCEEDED);
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("checkErrors", () => {
        it("does not trigger autosave if error count is the same", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { id: "cue-4", vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: null,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(checkErrors({ index: 2, shouldSpellCheck: false }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toBeUndefined();
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().cues[3].errors).toBeUndefined();
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("checkSpelling", () => {
        it("does not trigger autosave if error count is the same", () => {
            // GIVEN
            const cuesCorrupted = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { id: "cue-4", vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: null,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(cuesSlice.actions.updateCues({ cues: cuesCorrupted }));

            // WHEN
            testingStore.dispatch(checkSpelling({ index: 2 }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].errors).toBeUndefined();
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().cues[3].errors).toBeUndefined();
            expect(testingStore.getState().matchedCues.matchedCues).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("updateCueCategory", () => {
        it("ignores category update if cue doesn't exist in top level cues", () => {
            // WHEN
            testingStore.dispatch(updateCueCategory(3, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[3]).toBeUndefined();
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("updates top level cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "AUDIO_DESCRIPTION") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].cueCategory).toEqual("AUDIO_DESCRIPTION");
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("preserves all other existing cue parameters", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCueCategory(2, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().cues[2].errors).toBeUndefined();
            expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[2].spellCheck)
                .toEqual({ matches: [{ message: "some-spell-check-problem" }]});
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("addCueComment", () => {
        it("adds a comment to a cue without comments", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const newComment = {
                author: "Username",
                comment: "This is a comment",
                date: "2021-01-01T09:24:00.000Z"
            };

            // WHEN
            testingStore.dispatch(addCueComment(1, newComment) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].comments).toEqual([newComment]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("adds a comment to a cue with comments", () => {
            // GIVEN
            const existingComment = {
                author: "Username",
                comment: "This is an existing comment",
                date: "2021-01-01T09:24:00.000Z"
            };
            const testingCuesWithComments = [
                { ...testingCues[0], comments: [existingComment]},
                testingCues[1]
            ];
            testingStore.dispatch(updateCues(testingCuesWithComments) as {} as AnyAction);
            const newComment = {
                author: "Username",
                comment: "This is a comment",
                date: "2021-01-01T09:24:00.000Z"
            };

            // WHEN
            testingStore.dispatch(addCueComment(0, newComment) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].comments).toEqual([existingComment, newComment]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("deleteCueComment", () => {
        it("deletes a comment on a cue", () => {
            // GIVEN
            const existingComment = {
                userId: "jane.doe",
                author: "Username",
                comment: "This is an existing comment",
                date: "2021-01-01T09:24:00.000Z"
            };
            const testingCuesWithComments = [
                { ...testingCues[0], comments: [existingComment]},
                testingCues[1]
            ];
            testingStore.dispatch(updateCues(testingCuesWithComments) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCueComment(0, 0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].comments).toEqual([]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("addCue", () => {
        beforeEach(() => {
            testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
        });

        it("scrolls to added cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(addCue(3, []) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(3);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        describe("without source cues", () => {
            it("uses min duration value as step if default step value is lower", () => {
                // GIVEN
                testingStore.dispatch(
                    readSubtitleSpecification({
                        minCaptionDurationInMillis: 5000,
                        enabled: true
                    } as SubtitleSpecification) as {} as AnyAction
                );
                testingStore.dispatch(updateCues([]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(0, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(5);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).toHaveBeenCalled();
            });

            it("adds first cue to the cue array", () => {
                // GIVEN
                testingStore.dispatch(updateCues([]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(0, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().cues[0].editUuid).not.toBeNull();
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).toHaveBeenCalled();
            });

            it("record cues change when cue is added", () => {
                // GIVEN
                testingStore.dispatch(updateCues([]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(0, []) as {} as AnyAction);

                // THEN
                const lastCueChange = testingStore.getState().lastCueChange;
                expect(lastCueChange.changeType).toEqual("ADD");
                expect(lastCueChange.index).toEqual(0);
                expect(lastCueChange.vttCue.text).toEqual("");
                expect(lastCueChange.vttCue.startTime).toEqual(0);
                expect(lastCueChange.vttCue.endTime).toEqual(3);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).toHaveBeenCalled();
            });

            it("adds cue to the end of the cue array", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(3, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(4, 6, "Caption Line 3"));
                expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(9);
                expect(testingStore.getState().cues[3].cueCategory).toEqual("ONSCREEN_TEXT");
                expect(testingStore.getState().editingCueIndex).toEqual(3);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("add cue in middle of cue array cues", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(4.225, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(1, []) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4.225);
                expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().editingCueIndex).toEqual(1);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("doesn't add cue in middle of cue array cues if there's overlap", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(1, []) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_OVERLAP);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("adds cue in middle of cue array cues if there's overlap but overlapping is enabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(addCue(1, []) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("doesn't add cue to the end of the cue array if out of chunk range", () => {
                // GIVEN
                const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 4000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_LIMIT_EXCEEDED);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("adds cue to the end of the cue array if in chunk range", () => {
                // GIVEN
                const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 10000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(7);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });

        describe("with source cues", () => {
            it("adds first cue to the cue array", () => {
                // GIVEN
                testingStore.dispatch(updateCues([]) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(0, [0, 1]) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().cues[0].editUuid).not.toBeNull();
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).toHaveBeenCalled();
            });

            it("adds cue to the end of the cue array", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const sourceCues = [
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "ONSCREEN_TEXT" },
                    {
                        id: "cue-3",
                        vttCue: new VTTCue(4, 6, "Source Line 3"),
                        cueCategory: "ONSCREEN_TEXT",
                        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                    },
                ] as CueDto[];
                testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(3, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(4, 6, "Caption Line 3"));
                expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(9);
                expect(testingStore.getState().cues[3].cueCategory).toEqual("ONSCREEN_TEXT");
                expect(testingStore.getState().editingCueIndex).toEqual(3);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("add cue in middle of cue array cues with one source cue", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(4.225, 5, "Caption Line 3"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-3", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-4", vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                    { id: "cue-5", vttCue: new VTTCue(4.225, 5, "Source Line 3"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(1, [1]) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().editingCueIndex).toEqual(1);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("add cue in middle of cue array cues with two source cues", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(4.225, 5, "Caption Line 3"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-3", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-4", vttCue: new VTTCue(3, 3.5, "Source Line 2"), cueCategory: "DIALOGUE" },
                    { id: "cue-5", vttCue: new VTTCue(3.5, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
                    { id: "cue-6", vttCue: new VTTCue(4.225, 5, "Source Line 4"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(addCue(1, [1, 2]) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().editingCueIndex).toEqual(1);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("adds cue in middle of cue array cues if there's overlap but overlapping is enabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 5, "Caption Line 3"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-3", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-4", vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                    { id: "cue-5", vttCue: new VTTCue(2, 3.1, "Source Line 3"), cueCategory: "DIALOGUE" },
                    { id: "cue-6", vttCue: new VTTCue(4.225, 5, "Source Line 4"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(addCue(1, [1, 2]) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                // TODo refactor towards this expectation
                // expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                // expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.1);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(5);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("cue is not added when minimum time gap is exceeded", () => {
                // GIVEN
                const testingStore = createTestingStore();
                testingStore.dispatch(
                    readSubtitleSpecification({
                        minCaptionDurationInMillis: 3000,
                        enabled: true
                    } as SubtitleSpecification) as {} as AnyAction
                );
                testingStore.dispatch(updateCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(3, 4, "Caption Line 3"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-3", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-4", vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                    { id: "cue-5", vttCue: new VTTCue(2, 3.1, "Source Line 3"), cueCategory: "DIALOGUE" },
                    { id: "cue-6", vttCue: new VTTCue(4.225, 5, "Source Line 4"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(addCue(1, [1, 2]) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_LIMIT_EXCEEDED);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("uses source cues times for target cue with index 0", () => {
                // GIVEN
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" }
                ]) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(0, [0]) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
                expect(testingStore.getState().cues[0].editUuid).not.toBeNull();
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).toHaveBeenCalled();
            });

            it("doesn't add cue to the end of the cue array if out of chunk range", () => {
                // GIVEN
                const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 6000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const sourceCues = [
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "ONSCREEN_TEXT" },
                    {
                        id: "cue-3",
                        vttCue: new VTTCue(4, 6, "Source Line 3"),
                        cueCategory: "ONSCREEN_TEXT",
                        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                    },
                ] as CueDto[];
                testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(3, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_LIMIT_EXCEEDED);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("adds cue to the end of the cue array if in chunk range", () => {
                // GIVEN
                const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 10000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const sourceCues = [
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "ONSCREEN_TEXT" },
                    {
                        id: "cue-3",
                        vttCue: new VTTCue(4, 6, "Source Line 3"),
                        cueCategory: "ONSCREEN_TEXT",
                        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                    },
                ] as CueDto[];
                testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(3, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(4, 6, "Caption Line 3"));
                expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(9);
                expect(testingStore.getState().cues[3].cueCategory).toEqual("ONSCREEN_TEXT");
                expect(testingStore.getState().editingCueIndex).toEqual(3);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });

        describe("range prevention", () => {
            it("adjusts endTime to be following cue startTime if it exceeds following startTime", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(1, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationErrors).toEqual([]);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("does not add cue if duration is less than min gap limit", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 5000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(1, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().validationErrors).toContain(CueError.TIME_GAP_OVERLAP);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("picks default step if it less than max gap limit provided by subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 5000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(9);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("picks subtitle specs max gap as step if it is greater than default step value", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1000,
                    maxCaptionDurationInMillis: 2000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(8);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("uses default NEW_ADDED_CUE_DEFAULT_STEP if no subtitle specs provided", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2, []) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(9);
                expect(updateCueMock).toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });
    });

    describe("deleteCue", () => {
        beforeEach(() => {
            testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
        });

        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(0);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues([
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { id: "cue-3", vttCue: new VTTCue(4.225, 5, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(4.225, 5, "Caption Line 3"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(1);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(2);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("delete all cues in the array leaves one default empty cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(2) as {} as AnyAction);
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].addId).toBeDefined();
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues.length).toEqual(1);

            expect(testingStore.getState().cues[0].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("center");
            expect(testingStore.getState().cues[0].vttCue.line).toEqual("auto");
            expect(testingStore.getState().cues[0].vttCue.position).toEqual("auto");
            expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("auto");
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("record an edit change when removing last cue", () => {
            // GIVEN
            const recordCueChangeSpy = jest.spyOn(lastCueChangeSlice.actions, "recordCueChange");
            const cue0 = testingCues[0];
            testingStore.dispatch(updateCues([cue0]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(recordCueChangeSpy).toBeCalledWith(
                { "changeType": "EDIT", "index": 0,
                    "vttCue": new VTTCue(0, 0, "") });
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("updateCues", () => {
        it("initializes cues", () => {
            // GIVEN
            const expectedCues = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT", errors: []},
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(expectedCues[0].vttCue);
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues[0].errors).toBeUndefined();
            expect(testingStore.getState().cues[0].editUuid).not.toBeNull();
            expect(testingStore.getState().cues[1].vttCue).toEqual(expectedCues[1].vttCue);
            expect(testingStore.getState().cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[1].errors).toBeUndefined();
            expect(testingStore.getState().cues[1].editUuid).not.toBeNull();
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("replaces existing cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const replacementCues = [
                { id: "cue-1", vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE", errors: []},
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(replacementCues[0].vttCue);
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues[0].errors).toEqual([]);
            expect(testingStore.getState().cues[0].editUuid).not.toBeNull();
            expect(testingStore.getState().lastCueChange.changeType).toEqual("UPDATE_ALL");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("reorder cues based on start time", () => {
            // GIVEN
            const notOrderedCues = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-2", vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-3", vttCue: new VTTCue(1, 3, "Caption Line 3"), cueCategory: "DIALOGUE",
                    errors: [], editUuid: "lala" },
                { id: "cue-4", vttCue: new VTTCue(2, 4, "Caption Line 4"), cueCategory: "ONSCREEN_TEXT", errors: []},
            ] as CueDto[];
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCues(notOrderedCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("resets editing cue index if out of range when reordering cues", () => {
            // GIVEN
            testingStore.dispatch(updateEditingCueIndex(8) as {} as AnyAction);
            const notOrderedCues = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-2", vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-3", vttCue: new VTTCue(1, 3, "Caption Line 3"), cueCategory: "DIALOGUE", errors: []},
                { id: "cue-4", vttCue: new VTTCue(2, 4, "Caption Line 4"), cueCategory: "ONSCREEN_TEXT", errors: []},
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(notOrderedCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("set editing cue index to 0 if cues are first cue being updated while editing", () => {
            // GIVEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const notOrderedCues = [
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(notOrderedCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("applyShiftTimeByPosition", () => {
        beforeEach(() => {
            testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
        });

        it("apply shift time to all cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.ALL, -1, 2.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(2.123);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4.123);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4.123);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6.123);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("apply shift time after cue index", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.AFTER, 0, 2.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4.123);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6.123);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("apply shift time before cue index", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.BEFORE, 2, 1.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.123);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3.123);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3.123);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5.123);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(6);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("reorder cues when shifting time before cue index", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.BEFORE, 2, 2.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(2.123);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4.123);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(4.123);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(6.123);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("reorder cues when shifting time after cue index", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.AFTER, 1, -2.12) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.88);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.88);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("validate start cue index for shift position BEFORE", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            const error = () => {
                testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.BEFORE, -1, 2.123) as {} as AnyAction);
            };
            // THEN
            expect(error).toThrow("No editing cue selected to begin shifting");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("validate start cue index for shift position AFTER", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            const error = () => {
                testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.AFTER, -1, 2.123) as {} as AnyAction);
            };
            // THEN
            expect(error).toThrow("No editing cue selected to begin shifting");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("validate shift not possible before first cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            const error = () => {
                testingStore.dispatch(applyShiftTimeByPosition(ShiftPosition.BEFORE, 0, 2.123) as {} as AnyAction);
            };
            // THEN
            expect(error).toThrow("Cannot shift before first cue");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("validate shift position provided", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            const error = () => {
                // @ts-ignore need to simulate undefined parameter
                testingStore.dispatch(applyShiftTimeByPosition(undefined, 0, 2.123) as {} as AnyAction);
            };
            // THEN
            expect(error).toThrow("Invalid position provided, all, before or after expected");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("resetEditingTrack", () => {
        it("Resets cues on resetEditingTrack", () => {
            //GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            //WHEN
            testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues.length).toEqual(0);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("Resets source cues on resetEditingTrack", () => {
            //GIVEN
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

            //WHEN
            testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().sourceCues.length).toEqual(0);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("syncCues", () => {
        beforeEach(() => {
            testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
        });

        it("doesn't sync timecodes if there are no sourceCues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(syncCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("syncs timecodes between sourceCues and cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const sourceTestingCues = [
                { id: "cue-1", vttCue: new VTTCue(1, 3, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(3, 5, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
                { id: "cue-3", vttCue: new VTTCue(5, 7, "Caption Line 3"), cueCategory: "ONSCREEN_TEXT" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceTestingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(syncCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });

        it("doesn't syncs timecodes between sourceCues and cues if editDisabled", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesEditDisabled) as {} as AnyAction);
            const sourceTestingCues = [
                { id: "cue-1", vttCue: new VTTCue(1, 3, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(3, 5, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
                { id: "cue-3", vttCue: new VTTCue(5, 7, "Caption Line 3"), cueCategory: "ONSCREEN_TEXT" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceTestingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(syncCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(5);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(7);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).toHaveBeenCalled();
        });
    });

    describe("validateCorruptedCues", () => {
        it("validate only corrupted cues with ignored text", async () => {
            // GIVEN
            const cues = [
                {
                    id: "cue-1",
                    vttCue: new VTTCue(0, 3, "Caption Linex 1"),
                    cueCategory: "DIALOGUE", errors: []
                },
                {
                    id: "cue-2",
                    vttCue: new VTTCue(2, 4, "Caption Linex 2"),
                    cueCategory: "DIALOGUE", errors: []
                },
                {
                    id: "cue-3",
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "DIALOGUE", errors: []
                },
                {
                    id: "cue-4",
                    vttCue: new VTTCue(6, 8, "Caption Line 4"),
                    cueCategory: "DIALOGUE", errors: []
                },
                {
                    id: "cue-5",
                    vttCue: new VTTCue(8, 0, "Caption Line 5"), // bad timing
                    cueCategory: "DIALOGUE", errors: []
                }
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);

            // WHEN
            await testingStore.dispatch(validateCorruptedCues("Linex") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].errors).toEqual([CueError.TIME_GAP_OVERLAP]);
            expect(testingStore.getState().cues[1].errors).toEqual([CueError.TIME_GAP_OVERLAP]);
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().cues[3].errors).toEqual([]);
            expect(testingStore.getState().cues[4].errors).toEqual([]);
            expect(updateCueMock).toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("addRowToMergeList", () => {
        it("adds row index to merge list", () => {
            // GIVEN
            // WHEN
            testingStore.dispatch(addCuesToMergeList({ index: 1 }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().rowsToMerge).toEqual([{ index: 1 }]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("removeRowToMergeList", () => {
        it("removes row index from merge list", () => {
            // GIVEN
            // WHEN
            testingStore.dispatch(addCuesToMergeList({ index: 1 }) as {} as AnyAction);
            testingStore.dispatch(removeCuesToMergeList({ index: 1 }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().rowsToMerge).toEqual([]);
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });

    describe("mergeCues", () => {
        beforeEach(() => {
            const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 10000 };
            testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            jest.clearAllMocks();
        });
        describe("without source cues", () => {
            it("merges 2 single cue lines", () => {
                // GIVEN
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].addId).toBeDefined();
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("doesn't merge 2 single cue lines if merged cue is too long", () => {
                // GIVEN
                const chunkTrack = { ...testingTrack, mediaChunkStart: 0, mediaChunkEnd: 5000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 2000,
                    maxCaptionDurationInMillis: 4000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 2, cues: [{ index: 2, cue: testingCues[2] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().validationErrors).toEqual([CueError.MERGE_ERROR]);
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(updateCueMock).not.toHaveBeenCalled();
                expect(deleteCueMock).not.toHaveBeenCalled();
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 3 single cue lines", () => {
                // GIVEN
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 2, cues: [{ index: 2, cue: testingCues[2] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(1);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual(
                    "Caption Line 1\nCaption Line 2\nCaption Line 3");
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(3);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 2 multiple cue lines", () => {
                // GIVEN
                const cues = [
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                    { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Line 3"), cueCategory: "DIALOGUE" },
                    { id: "cue-4", vttCue: new VTTCue(6, 8, "Caption Line 4"), cueCategory: "DIALOGUE" }
                ] as CueDto[];

                testingStore.dispatch(addCuesToMergeList({
                    index: 0,
                    cues: [
                        { index: 0, cue: cues[0] },
                        { index: 1, cue: cues[1] }
                    ]
                }) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList({
                    index: 1,
                    cues: [
                        { index: 0, cue: cues[2] },
                        { index: 1, cue: cues[3] }
                    ]
                }) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(8);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual(
                    "Caption Line 1\nCaption Line 2\nCaption Line 3\nCaption Line 4");
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("scrolls to merged cue on edit mode on merge", () => {
                // GIVEN
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().focusedCueIndex).toEqual(0);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 2 single cue lines with errors", () => {
                // GIVEN
                const corruptedCue1 = { ...testingCues[0], errors: [CueError.LINE_COUNT_EXCEEDED]} as CueDto;
                const corruptedCue2 = { ...testingCues[1], errors: [CueError.LINE_CHAR_LIMIT_EXCEEDED]} as CueDto;
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: corruptedCue1 }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: corruptedCue2 }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
                expect(testingStore.getState().cues[0].errors).toEqual(
                    [CueError.LINE_COUNT_EXCEEDED, CueError.LINE_CHAR_LIMIT_EXCEEDED]);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 2 single cue lines with errors", () => {
                // GIVEN
                const cue1 = { ...testingCues[0],
                    glossaryMatches: [{ source: "1", replacements: ["rep1"]}]} as CueDto;
                const cue2 = { ...testingCues[1],
                    glossaryMatches: [{ source: "2", replacements: ["rep2"]}]} as CueDto;
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: cue1 }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: cue2 }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
                expect(testingStore.getState().cues[0].glossaryMatches).toEqual(
                    [{ source: "1", replacements: ["rep1"]}, { source: "2", replacements: ["rep2"]}]);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 2 single cue lines with comments", () => {
                // GIVEN
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCuesWithComments[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCuesWithComments[1] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
                expect(testingStore.getState().cues[0].comments).toEqual(testComments);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });

            it("merges 2 multiple cue lines with comments", () => {
                // GIVEN
                const cues = [
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    {
                        id: "cue-2",
                        vttCue: new VTTCue(2, 4, "Caption Line 2"),
                        cueCategory: "DIALOGUE",
                        comments: [testComments[0]]
                    },
                    { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Line 3"), cueCategory: "DIALOGUE" },
                    {
                        id: "cue-4",
                        vttCue: new VTTCue(6, 8, "Caption Line 4"),
                        cueCategory: "DIALOGUE",
                        comments: [testComments[1], testComments[2]]
                    }
                ] as CueDto[];

                testingStore.dispatch(addCuesToMergeList({
                    index: 0,
                    cues: [
                        { index: 0, cue: cues[0] },
                        { index: 1, cue: cues[1] }
                    ]
                }) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList({
                    index: 1,
                    cues: [
                        { index: 0, cue: cues[2] },
                        { index: 1, cue: cues[3] }
                    ]
                }) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(8);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual(
                    "Caption Line 1\nCaption Line 2\nCaption Line 3\nCaption Line 4");
                expect(testingStore.getState().cues[0].comments).toEqual(testComments);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });

        describe("without source cues", () => {
            it("merges 2 single cue lines", () => {
                // GIVEN
                testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues([
                    { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[]) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 0, cues: [{ index: 0, cue: testingCues[0] }]}) as {} as AnyAction);
                testingStore.dispatch(addCuesToMergeList(
                    { index: 1, cues: [{ index: 1, cue: testingCues[1] }]}) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(mergeCues() as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1\nCaption Line 2");
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(deleteCueMock).toHaveBeenCalledTimes(2);
                expect(saveTrackMock).not.toHaveBeenCalled();
            });
        });
    });

    describe("splitCue", () => {
        beforeEach(() => {
            testingStore.dispatch(updateEditingTrack(testingTrack as Track) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        });

        it("splits cue", async () => {
            // GIVEN
            // WHEN
            await testingStore.dispatch(splitCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().cues.length).toEqual(4);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(updateCueMock).toHaveBeenCalledTimes(2);
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("splits cue with comments", async () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithComments) as {} as AnyAction);

            // WHEN
            await testingStore.dispatch(splitCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().cues.length).toEqual(4);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
            expect(testingStore.getState().cues[0].comments).toEqual([testComments[0], testComments[1]]);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[1].comments).toBeUndefined();
            expect(updateCueMock).toHaveBeenCalledTimes(2);
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("doesn't split too short cue", async () => {
            // GIVEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 4000,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            await testingStore.dispatch(splitCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationErrors).toEqual([CueError.SPLIT_ERROR]);
            expect(testingStore.getState().cues.length).toEqual(3);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
            expect(updateCueMock).not.toHaveBeenCalled();
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });

        it("splits cue with source cues", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { id: "cue-1", vttCue: new VTTCue(0, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { id: "cue-2", vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            // WHEN
            await testingStore.dispatch(splitCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationErrors).toEqual([]);
            expect(testingStore.getState().cues.length).toEqual(4);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(updateCueMock).toHaveBeenCalledTimes(2);
            expect(deleteCueMock).not.toHaveBeenCalled();
            expect(saveTrackMock).not.toHaveBeenCalled();
        });
    });
});
