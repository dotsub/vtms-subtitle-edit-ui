import "../../../testUtils/initBrowserEnvironment";
import { renderHook } from "@testing-library/react-hooks";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Language, Track } from "../../model";
import { updateCues } from "./cuesListActions";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateSourceCues } from "../view/sourceCueSlices";
import useMatchedCuesAsCsv from "./useMatchedCuesAsCsv";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { updateEditingTrack } from "../../trackSlices";

let testingStore = createTestingStore();

interface WrapperProps {
    children: ReactElement[];
}

describe("useMatchedCuesAsCsv", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 4000,
            progress: 50,
            sourceLanguage: { id: "ar-SA", name: "Arabic" } as Language
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
    });

    it("returns CSV for exact match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target \"Line\" 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source \"Line\" 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
        "00:00:00.000,00:00:01.000,\"Source \"\"Line\"\" 1\",00:00:00.000,00:00:01.000,\"Target \"\"Line\"\" 1\"\r\n" +
        "00:00:01.000,00:00:02.000,\"Source Line 2\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
        "00:00:02.000,00:00:03.000,\"Source Line 3\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for 1-n translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for 1-n with no match translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(3, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            ",,,00:00:03.000,00:00:04.000,\"Target Line 3\""
        );
    });

    it("returns CSV for n-1 translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:01.000,\"Source Line 1\",00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for caption match cues", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 4000,
            progress: 50,
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Start,End,Text\r\n" +
            "00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for direct translation match cues", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Start,End,Text\r\n" +
            "00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for n-1 no match translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:01.000,\"Source Line 1\",00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",,,"
        );
    });

    it("returns CSV for no match translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(4, 5, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(5, 6, "Target Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:01.000,\"Source Line 1\",,,\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",,,\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",,,\r\n" +
            ",,,00:00:04.000,00:00:05.000,\"Target Line 1\"\r\n" +
            ",,,00:00:05.000,00:00:06.000,\"Target Line 2\""
        );
    });

    it("returns CSV for 0-n translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            ",,,00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            ",,,00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            ",,,00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for n-0 translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n" +
            "00:00:00.000,00:00:01.000,\"Source Line 1\",,,\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",,,\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",,,"
        );
    });

    it("returns CSV for no match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [] as CueDto[];
        const sourceCues = [] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n"
        );
    });

});
