import "@fortawesome/fontawesome-pro/css/fontawesome.min.css";
import "@fortawesome/fontawesome-pro/css/duotone.min.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { Provider, useDispatch } from "react-redux";
import { ReactElement, useEffect } from "react";
import { updateCues } from "./subtitleEdit/cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./subtitleEdit/trackSlices";
import { updateSubtitleUser } from "./subtitleEdit/userSlices";
import { CueDto, Language, Track, User } from "./subtitleEdit/model";
import ReactDOM from "react-dom";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import { readSubtitleSpecification } from "./subtitleEdit/toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import testingStore from "./testUtils/testingStore";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
import "draft-js/dist/Draft.css";
import { updateSourceCues } from "./subtitleEdit/cues/view/sourceCueSlices";

// ################## TESTING DATA TWEAKS ##############################
const language = { id: "en-US", name: "English (US)", direction: "LTR" } as Language;
// const language = { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language;

const trackType = "TRANSLATION";
// const trackType = "CAPTION";

const TIME_MATCH_TESTING = false;
const LONG_VIDEO_TESTING = false;

const mediaChunkStart = undefined;
const mediaChunkEnd = undefined;
// const mediaChunkStart = TIME_MATCH_TESTING ? 0 : 13000;
// const mediaChunkEnd = 305000;

// ################## TESTING DATA TWEAKS - END ########################

const sourceLanguage = { id: "sk", name: "Slovak", direction: "LTR" } as Language;
const MIN_DURATION_SECONDS = 0.5;
const START_SHIFT = TIME_MATCH_TESTING ? 30 : 0;

const randomTime = (max: number): number => MIN_DURATION_SECONDS + Math.random() * (max - MIN_DURATION_SECONDS);

const inChunkRange = (start: number, end: number): boolean => {
    if (mediaChunkStart && mediaChunkEnd) {
        const chunkStartSeconds = mediaChunkStart / 1000;
        const chunkEndSeconds = mediaChunkEnd / 1000;
        return start >= chunkStartSeconds  && end <= chunkEndSeconds;
    } else {
        return true;
    }
};

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();

    // ################################## Source Cues ###########################################
    useEffect(() => {
        // @ts-ignore
        if (trackType === "TRANSLATION") {
            const sourceCues = [] as CueDto[];

            if (TIME_MATCH_TESTING) {
                sourceCues.push({
                    vttCue: new VTTCue(0, 1, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(0, 1)
                });
                sourceCues.push({
                    vttCue: new VTTCue(1, 2, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(1, 2)
                });
                sourceCues.push({
                    vttCue: new VTTCue(2, 3, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(2, 3)
                });
                sourceCues.push({
                    vttCue: new VTTCue(3, 6, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(3, 6)
                });

                sourceCues.push({
                    vttCue: new VTTCue(7.673, 10.208, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(7.673, 10.208)
                });
                sourceCues.push({
                    vttCue: new VTTCue(10.746, 11.782, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(10.746, 11.782)
                });
                sourceCues.push({
                    vttCue: new VTTCue(12.504, 14.768, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(12.504, 14.768)
                });
                sourceCues.push({
                    vttCue: new VTTCue(15.169, 17.110, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(15.169, 17.110)
                });

                sourceCues.push({
                    vttCue: new VTTCue(18.954, 20.838, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(18.954, 20.838)
                });
                sourceCues.push({
                    vttCue: new VTTCue(21.674, 23.656, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(21.674, 23.656)
                });
                sourceCues.push({
                    vttCue: new VTTCue(24.024, 24.504, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(24.024, 24.504)
                });
                sourceCues.push({
                    vttCue: new VTTCue(25.383, 28.115, "text"),
                    cueCategory: "DIALOGUE",
                    editDisabled: !inChunkRange(25.383, 28.115)
                });
            }

            let endTime = START_SHIFT;
            for (let idx = 0; idx < 9999; idx++) {
                const randomStart = TIME_MATCH_TESTING ? endTime + randomTime(1) : idx * 3;
                const randomEnd = endTime = TIME_MATCH_TESTING ? randomStart + randomTime(3) : (idx + 1) * 3;
                const withinChunkRange = inChunkRange(randomStart, randomEnd);
                sourceCues.push({
                   vttCue: new VTTCue(randomStart, randomEnd, `<i>Source <b>Line</b></i> ${idx + 1}\nWrapped text.`),
                    cueCategory: "DIALOGUE",
                    editDisabled: !withinChunkRange,
                    glossaryMatches: [
                        { source: "text", replacements: ["text replacement1", "text replacement2"]},
                        { source: "line", replacements: ["lineReplacement1"]}
                    ]
                });
            }


            setTimeout( // this simulates latency caused by server roundtrip

                () => dispatch(updateSourceCues(sourceCues)),
                500
            );
        }
    });

    // ################################## Target Cues ###########################################
    useEffect(() => {
        const targetCues = [] as CueDto[];
        if (TIME_MATCH_TESTING) {
            targetCues.push({
                vttCue: new VTTCue(0, 3, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(0, 3)
            });
            targetCues.push({
                vttCue: new VTTCue(3, 4, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(3, 4)
            });
            targetCues.push({
                vttCue: new VTTCue(4, 5, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(4, 5)
            });
            targetCues.push({
                vttCue: new VTTCue(5, 6, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(5, 6)
            });

            targetCues.push({
                vttCue: new VTTCue(7.087, 10.048, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(7.087, 10.048)
            });
            targetCues.push({
                vttCue: new VTTCue(10.411, 11.231, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(10.411, 11.231)
            });
            targetCues.push({
                vttCue: new VTTCue(11.240, 13.985, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(11.240, 13.985)
            });
            targetCues.push({
                vttCue: new VTTCue(14.380, 16.998, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(14.380, 16.998)
            });

            targetCues.push({
                vttCue: new VTTCue(20.140, 21.494, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(20.140, 21.494)
            });
            targetCues.push({
                vttCue: new VTTCue(21.979, 22.055, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(21.979, 22.055)
            });
            targetCues.push({
                vttCue: new VTTCue(22.414, 25.209, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(22.414, 25.209)
            });
            targetCues.push({
                vttCue: new VTTCue(26.198, 27.412, "text"),
                cueCategory: "DIALOGUE",
                editDisabled: !inChunkRange(26.198, 27.412)
            });
        }

        let endTime = START_SHIFT;
        for (let idx = 0; idx < 9999; idx++) {
            const randomContent = Math.random().toString(36).slice(Math.floor(Math.random() * 10));
            let text = `<i>Editing <b>Line</b></i> ${idx + 1}\n${randomContent} Wrapped text and text a text`;
            // @ts-ignore since it can be updated manually
            if (language.id === "ar-SA") {
                text = `<b>مرحبًا</b> أيها العالم ${idx + 1}.`;
            }
            const randomStart = (TIME_MATCH_TESTING ? endTime + randomTime(1) : idx * 3);
            const randomEnd = endTime = TIME_MATCH_TESTING ? randomStart + randomTime(3) : (idx + 1) * 3;
            const withinChunkRange = inChunkRange(randomStart, randomEnd);
            const comments = [];
            const randomComments = Math.random() * 4;
            for (let i = 1; i <= randomComments; i++) {
                const isLinguist = Math.random() < 0.5;
                const commentDate = isLinguist ? "2021-08-06T19:49:44.493Z" : "2021-08-08T14:02:20.100Z";
                comments.push({
                    userId: isLinguist ? "jane.doe" : "other.user",
                    author: isLinguist ? "Reviewer": "Linguist",
                    comment: "this is a comment " + i,
                    date: commentDate
                });
            }
            targetCues.push({
                vttCue: new VTTCue(randomStart, randomEnd, text),
                cueCategory: "DIALOGUE",
                editDisabled: !withinChunkRange,
                errors: null,
                comments
            });
        }

        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateCues(targetCues)),
            500
        );
    });

    // ################################## Track ###########################################
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateEditingTrack({
                type: trackType,
                language: language,
                sourceLanguage,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: LONG_VIDEO_TESTING ? 3612542 : 125526,
                mediaChunkStart,
                mediaChunkEnd,
                progress: 50,
                id: "0fd7af04-6c87-4793-8d66-fdb19b5fd04d",
                createdBy: {
                    displayName: "John Doe",
                    email: "john.doe@dotsub.com",
                    firstname: "John",
                    lastname: "Doe",
                    systemAdmin: "",
                    userId: "john.doe"
                }
            } as Track)),
            500
        );
    });

    // ################################## User ###########################################
    useEffect(() => {
        const subtitleUser = {
            displayName: "Jane Doe",
            email: "jane.doe@dotsub.com",
            firstname: "Jane",
            lastname: "Doe",
            systemAdmin: "",
            userId: "jane.doe"
        } as User;
        setTimeout(
            () => dispatch(updateSubtitleUser(subtitleUser)),
            500
        );
    });

    // ################################## Subtitle Specs ###########################################
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
                minCaptionDurationInMillis: MIN_DURATION_SECONDS * 1000,
                maxCaptionDurationInMillis: 8000,
                maxCharactersPerSecondPerCaption: 50,
                comments: "Media comments, please click [here](https://dotsub.com)",
                mediaNotes: "Media notes, please click [here](https://dotsub.com)"
            })),
            500
        );
    });

    const video = `https://dotsub-media-encoded.s3.amazonaws.com/sample/${LONG_VIDEO_TESTING
        ? "my-long-movie"
        : "dotsubExplainer"}`;

    return (
        <SubtitleEdit
            poster={`${video}.jpeg`}
            mp4={`${video}.mp4`}
            waveform={`${video}.json`}
            onViewTrackHistory={(): void => undefined}
            onSave={(): void => {
                setTimeout(
                    () => {
                        dispatch(setAutoSaveSuccess(true));
                    }, 500
                );
                return;
            }}
            onComplete={(): void => undefined}
            onExportSourceFile={(): void => undefined}
            onExportFile={(): void => undefined}
            onImportFile={(): void => undefined}
            spellCheckerDomain="dev-spell-checker.videotms.com"
            commentAuthor="Linguist"
        />
    );
};

ReactDOM.render(
    <Provider store={testingStore}>
        <TestApp />
    </Provider>,
    document.getElementById("root")
);
