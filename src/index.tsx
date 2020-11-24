import { Provider, useDispatch } from "react-redux";
import React, { ReactElement, useEffect } from "react";
import { updateCues } from "./subtitleEdit/cues/cuesListActions";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { CueDto, Language } from "./subtitleEdit/model";
import ReactDOM from "react-dom";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import { readSubtitleSpecification } from "./subtitleEdit/toolbox/subtitleSpecificationSlice";
import testingStore from "./testUtils/testingStore";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
// Following CSS import has to be after SubtitleEdit import to override Bootstrap defaults
// eslint-disable-next-line sort-imports
import "./localTesting.scss";
import "draft-js/dist/Draft.css";
import { updateSourceCues } from "./subtitleEdit/cues/view/sourceCueSlices";

const language = { id: "en-US", name: "English (US)", direction: "LTR" } as Language;
// const language = { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language;

const trackType = "TRANSLATION";
// const trackType = "CAPTION";

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();
    // #############################################################################################
    // #################### Comment this out if you need to test Captioning mode ###################
    // #############################################################################################
    useEffect(() => {
        // @ts-ignore since it can manually be updated
        if (trackType === "TRANSLATION") {
            const cues = [] as CueDto[];
            for (let idx = 0; idx < 9999; idx++) {
                cues.push({
                    vttCue: new VTTCue(idx * 3, (idx + 1) * 3, `<i>Source <b>Line</b></i> ${idx + 1}\nWrapped text.`),
                    cueCategory: "DIALOGUE",
                    glossaryMatches: [
                        { source: "text", replacements: ["text replacement1", "text replacement2"]},
                        { source: "line", replacements: ["lineReplacement1"]}
                    ]
                });
            }
            setTimeout( // this simulates latency caused by server roundtrip

                () => dispatch(updateSourceCues(cues)),
                500
            );
        }
    });

    // #############################################################################################

    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateEditingTrack({
                type: trackType,
                language: language as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4250,
                progress: 50,
                id: "0fd7af04-6c87-4793-8d66-fdb19b5fd04d"
            })),
            500
        );
    });
    useEffect(() => {
        const cues = [] as CueDto[];
        for (let idx = 0; idx < 9999; idx++) {
            const randomContent = Math.random().toString(36).slice(Math.floor(Math.random() * 10));
            let text = `<i>Editing <b>Line</b></i> ${idx + 1}\n${randomContent} Wrapped text and text a text`;
            // @ts-ignore since it can be updated manually
            if (language.id === "ar-SA") {
                text = `<b>مرحبًا</b> أيها العالم ${idx + 1}.`;
            }
            cues.push({
                vttCue: new VTTCue(idx * 3, (idx + 1) * 3, text),
                cueCategory: "DIALOGUE"
            });
        }
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateCues(cues)),
            500
        );
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateTask({
                type: "TASK_CAPTION",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                editDisabled: false
            })),
            500
        );
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(readSubtitleSpecification({
                subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
                projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
                enabled: true,
                audioDescription: false,
                onScreenText: true,
                spokenAudio: false,
                speakerIdentification: "NUMBERED",
                dialogueStyle: "DOUBLE_CHEVRON",
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 40,
                minCaptionDurationInMillis: 500,
                maxCaptionDurationInMillis: 4000,
                comments: "Media comments, please click [here](https://dotsub.com)",
                mediaNotes: "Media notes, please click [here](https://dotsub.com)"
            })),
            500
        );
    });

    return (
        <SubtitleEdit
            poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
            mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
            onViewAllTracks={(): void => undefined}
            onSave={(): void => {
                setTimeout(
                    () => {
                        dispatch(setAutoSaveSuccess(true));
                    }, 500
                );
                return;
            }}
            onComplete={(): void => undefined}
            onExportFile={(): void => undefined}
            onImportFile={(): void => undefined}
            spellCheckerDomain="dev-spell-checker.videotms.com"
        />
    );
};

ReactDOM.render(
    <Provider store={testingStore}>
        <TestApp />
    </Provider>,
    document.getElementById("root")
);
