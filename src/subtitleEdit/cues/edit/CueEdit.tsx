import { CueCategory, CueDto, CueDtoWithIndex, CueLineDto } from "../../model";
import { copyNonConstructorProperties, Position, positionStyles } from "../cueUtils";
import { Dispatch, ReactElement, useEffect } from "react";
import { addCue, updateCueCategory, updateVttCue } from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import CueCategoryButton from "./CueCategoryButton";
import CueTextEditor from "./CueTextEditor";
import { KeyCombination } from "../../utils/shortcutConstants";
import Mousetrap from "mousetrap";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { useDispatch, useSelector } from "react-redux";
import { playVideoSection } from "../../player/playbackSlices";
import { updateEditingCueIndex } from "./cueEditorSlices";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import { getTimeString } from "../../utils/timeUtils";
import { Tooltip } from "primereact/tooltip";

export interface CueEditProps {
    index: number;
    cue: CueDto;
    matchedCuesIndex: number;
    nextCueLine?: CueLineDto;
    glossaryTerm?: string;
    setGlossaryTerm: (glossaryTerm?: string) => void;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: CueEditProps,
                                    startTime: number, endTime: number, editUuid?: string): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateVttCue(props.index, newCue, editUuid));
};

const getCueIndexes = (cues: CueDtoWithIndex[] | undefined): number[] => cues
    ? cues.map(sourceCue => sourceCue.index)
    : [];

const CueEdit = (props: CueEditProps): ReactElement => {
    const dispatch = useDispatch();
    const currentPlayerTime = useSelector((state: SubtitleEditState) => state.currentPlayerTime);
    const focusedInput = useSelector((state: SubtitleEditState) => state.focusedInput);
    const nextSourceCuesIndexes = props.nextCueLine
        ? getCueIndexes(props.nextCueLine.sourceCues)
        : [];

    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);

    const unbindCueViewModeKeyboardShortcut =(): void => {
        Mousetrap.unbind([KeyCombination.ESCAPE, KeyCombination.ENTER]);
    };

    const bindCueViewModeKeyboardShortcut =(): void => {
        Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1, -1)));
        Mousetrap.bind([KeyCombination.ENTER], () => {
            return props.index === cuesCount - 1
                || !props.nextCueLine
                || !props.nextCueLine.targetCues
                || props.nextCueLine.targetCues.length === 0
                || props.nextCueLine.targetCues[0].cue.editDisabled
                    ? dispatch(addCue(props.index + 1, nextSourceCuesIndexes))
                    : dispatch(updateEditingCueIndex(
                        props.index + 1,
                        props.matchedCuesIndex > -1 ? props.matchedCuesIndex + 1 : -1
                    ));
        });
    };

    useEffect(() => {
        bindCueViewModeKeyboardShortcut();
        Mousetrap.bind([KeyCombination.MOD_SHIFT_ESCAPE, KeyCombination.ALT_SHIFT_ESCAPE],
            () => dispatch(updateEditingCueIndex(
                props.index - 1,
                props.matchedCuesIndex > -1 ? props.matchedCuesIndex - 1 : -1
            ))
        );

        // no need for dependencies here since binding kb shortcuts should be done once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        Mousetrap.bind([KeyCombination.MOD_SHIFT_UP, KeyCombination.ALT_SHIFT_UP], () => {
            const endTime = props.index === (cuesCount - 1)
                ? currentPlayerTime + 3
                : props.cue.vttCue.endTime;
            updateCueAndCopyProperties(
                dispatch,
                props,
                currentPlayerTime,
                endTime,
                props.cue.editUuid
            );
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_DOWN, KeyCombination.ALT_SHIFT_DOWN], () => {
            updateCueAndCopyProperties(
                dispatch, props, props.cue.vttCue.startTime, currentPlayerTime, props.cue.editUuid
            );
        });

    }, [ dispatch, props, currentPlayerTime, cuesCount ]);

    useEffect(() => {
        Mousetrap.bind([ KeyCombination.MOD_SHIFT_K, KeyCombination.ALT_SHIFT_K ], () => {
            dispatch(playVideoSection(props.cue.vttCue.startTime, props.cue.vttCue.endTime));
        });
    }, [ dispatch, props.cue.vttCue.startTime, props.cue.vttCue.endTime ]);

    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    const cueLineId = `cueEditLine-${props.index}`;

    return (
        <div style={{ display: "flex" }} className="border-b border-blue-light-mostly-transparent bg-white z-10">
            <div
                style={{
                    flex: "1 1 300px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "5px 10px",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", flexDirection:"column", paddingBottom: "15px" }}>
                    <div className="sbte-time-editors">
                        {
                            isTranslation && !timecodesUnlocked
                            ? (
                                <>
                                    <div
                                        id={`${cueLineId}-startTime`}
                                        className="sbte-form-control text-center !border-blue-light-mostly-transparent
                                            !text-gray-700 disabled"
                                        data-pr-tooltip="Timecodes are locked"
                                        data-pr-position="right"
                                        data-pr-at="right top+18"
                                    >
                                        {getTimeString(props.cue.vttCue.startTime)}
                                    </div>
                                    <div
                                        id={`${cueLineId}-endTime`}
                                        className="sbte-form-control text-center !border-blue-light-mostly-transparent
                                            !text-gray-700 disabled"
                                        data-pr-tooltip="Timecodes are locked"
                                        data-pr-position="right"
                                        data-pr-at="right top+18"
                                    >
                                        {getTimeString(props.cue.vttCue.endTime)}
                                    </div>
                                    <Tooltip
                                        id={cueLineId + "StartTime-Tooltip"}
                                        target={`#${cueLineId}-startTime`}
                                    />
                                    <Tooltip
                                        id={cueLineId + "EndTime-Tooltip"}
                                        target={`#${cueLineId}-endTime`}
                                    />
                                </>
                            )
                            : (
                                <>
                                    <TimeEditor
                                        time={props.cue.vttCue.startTime}
                                        onChange={(startTime: number): void =>
                                            updateCueAndCopyProperties(
                                                dispatch, props, startTime, props.cue.vttCue.endTime, props.cue.editUuid
                                            )}
                                        autoFocus={focusedInput === "START_TIME"}
                                    />
                                    <TimeEditor
                                        time={props.cue.vttCue.endTime}
                                        onChange={(endTime: number): void =>
                                            updateCueAndCopyProperties(
                                                dispatch, props, props.cue.vttCue.startTime, endTime, props.cue.editUuid
                                            )}
                                    />
                                </>
                            )
                        }
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <CueCategoryButton
                        onChange={(cueCategory: CueCategory): AppThunk =>
                            dispatch(updateCueCategory(props.index, cueCategory))}
                        category={props.cue.cueCategory}
                    />
                    <PositionButton
                        vttCue={props.cue.vttCue}
                        changePosition={(position: Position): void => {
                            const newCue =
                                new VTTCue(props.cue.vttCue.startTime, props.cue.vttCue.endTime, props.cue.vttCue.text);
                            copyNonConstructorProperties(newCue, props.cue.vttCue);
                            const newPositionProperties = positionStyles.get(position);
                            for (const property in newPositionProperties) {
                                // noinspection JSUnfilteredForInLoop
                                newCue[property] = newPositionProperties[property];
                            }
                            dispatch(updateVttCue(props.index, newCue, props.cue.editUuid));
                        }}
                    />
                </div>
            </div>
            <div
                className="border-l border-blue-light-mostly-transparent flex items-center"
                data-testid="sbte-cue-editor-container"
                style={{ flex: "1 1 70%" }}
            >
                <CueTextEditor
                    key={props.index}
                    index={props.index}
                    vttCue={props.cue.vttCue}
                    editUuid={props.cue.editUuid}
                    spellCheck={props.cue.spellCheck}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcut}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcut}
                    glossaryTerm={props.glossaryTerm}
                    setGlossaryTerm={props.setGlossaryTerm}
                    autoFocus={focusedInput !== "START_TIME"}
                />
                <CueActionsPanel
                    index={props.index}
                    cue={props.cue}
                    isEdit
                    sourceCueIndexes={nextSourceCuesIndexes}
                />
            </div>
        </div>
    );
};

export default CueEdit;
