import { ReactElement, useState } from "react";
import * as React from "react";
import { CUE_LINE_STATE_CLASSES, CueDto, CueDtoWithIndex, CueError, CueLineDto, CueLineState } from "../../model";
import CueEdit from "../edit/CueEdit";
import CueView from "../view/CueView";
import { ManuCapState } from "../../manuCapReducers";
import { useSelector } from "react-redux";
import CueLineFlap from "./CueLineFlap";
import _ from "lodash";
import InsertCueButton from "../view/InsertCueButton";
import ClickCueWrapper from "../view/ClickCueWrapper";
import CueErrorLine from "../CueErrorLine";
import CueComments from "../comments/CueComments";

export interface CueLineRowProps {
    targetCuesLength: number;
    // Following parameter is needed,
    // because empty/undefined props.data.sourceCues might indicate that there is no time match in translation mode
    withoutSourceCues: boolean;
    matchedCues: CueLineDto[];
    commentAuthor?: string;
}

export interface CueLineProps {
    rowIndex: number;
    data: CueLineDto;
    rowProps: CueLineRowProps;
    rowRef: React.RefObject<HTMLDivElement>;
    editDisabled?: boolean;
}

const hasTargetText = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => !_.isEmpty(cueWithIndex?.cue.vttCue.text))
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};

const hasCorruptedTargetCue = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => cueWithIndex?.cue.errors
                ? cueWithIndex?.cue.errors?.length > 0
                : false
            )
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};

const findCueLineState = (props: CueLineProps): CueLineState => {
    const cueLine = props.rowProps.matchedCues[props.rowIndex];
    const someCueHasText = hasTargetText(cueLine);
    const someCueCorrupted = hasCorruptedTargetCue(cueLine);
    return someCueHasText
        ? someCueCorrupted ? CueLineState.ERROR : CueLineState.GOOD
        : CueLineState.NONE;
};

const hasCuesWithEditDisabled = (cueDtos?: CueDtoWithIndex[]): boolean => {
    if (cueDtos && cueDtos.length > 0) {
        return cueDtos
            .map((cueWithIndex: CueDtoWithIndex): boolean => cueWithIndex?.cue.editDisabled === true)
            .reduce((editDisabled1: boolean, editDisabled2: boolean): boolean => editDisabled1 || editDisabled2);
    }
    return false;
};

const shouldDisableCueLine = (props: CueLineProps): boolean | undefined => {
    const cueLine = props.rowProps.matchedCues[props.rowIndex];
    return props.editDisabled || hasCuesWithEditDisabled(cueLine.sourceCues)
        || hasCuesWithEditDisabled(cueLine.targetCues);
};

const findNextTargetCueIndex = (props: CueLineProps): number => {
    let nextIndex = 0;
    let nextTargetCueIndex = -1;
    let targetCues;
    do {
        targetCues = props.rowProps.matchedCues[props.rowIndex + nextIndex].targetCues;
        nextTargetCueIndex = targetCues && targetCues.length > 0 ? targetCues[0].index : -1;
        nextIndex++;
    } while ((targetCues === undefined || targetCues.length === 0)
    && nextTargetCueIndex === -1
    && props.rowIndex + nextIndex < props.rowProps.matchedCues.length);
    return nextTargetCueIndex;
};

const getCueIndexes = (cues: CueDtoWithIndex[] | undefined): number[] => cues
    ? cues.map(sourceCue => sourceCue.index)
    : [];

interface CueErrorsListProps {
    cue: CueDto;
}

const CueErrorsList = (props: CueErrorsListProps): ReactElement | null => {
    const filteredCueErrors = props.cue.errors?.filter(error => error !== CueError.SPELLCHECK_ERROR);
    return filteredCueErrors && filteredCueErrors.length > 0
        ? (
            <div className="sbte-cues-errors">
                {
                    filteredCueErrors
                        .map((cueError: CueError, index: number): ReactElement => (
                            <CueErrorLine
                                key={`cueError-${index}`}
                                cueIndex={index}
                                cueError={cueError}
                            />
                            )
                        )
                }
            </div>
        ) : null;
};

const CueLine = (props: CueLineProps): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const editingCueIndex = useSelector((state: ManuCapState) => state.editingCueIndex);
    const captionClassName = "bg-gray-0";
    const translationCueClassName = props.data.targetCues?.length === 0 ? captionClassName : "bg-gray-0";

    const cueLineState = findCueLineState(props);
    const dividerClass = CUE_LINE_STATE_CLASSES.get(cueLineState)?.dividerClass;
    const hasMultipleCues = (props.data.targetCues?.length && props.data.targetCues?.length > 1)
        || (props.data.sourceCues?.length && props.data.sourceCues?.length > 1);

    const firstTargetCueIndex = props.data.targetCues?.length ? props.data.targetCues[0].index : undefined;
    const sourceCuesIndexes = getCueIndexes(props.data.sourceCues);
    const nextTargetCueIndex = findNextTargetCueIndex(props);
    const cueLineEditDisabled = shouldDisableCueLine(props);

    const [glossaryTerm, setGlossaryTerm] = useState<string | undefined>(undefined);
    const showGlossaryTermsAndErrors = props.data.targetCues !== undefined &&
        props.data.targetCues.some(cueWithIndex => cueWithIndex.index === editingCueIndex);

    const cuesErrors = [] as CueError[];
    props.data.targetCues?.forEach((targetCue: CueDtoWithIndex) => {
        if (targetCue.cue.errors && targetCue.cue.errors.length > 0) {
            cuesErrors.push(...targetCue.cue.errors);
        }
    });

    const commentsVisible = useSelector((state: ManuCapState) => state.commentsVisible);
    let cueCommentsCount = 0;
    props.data.targetCues?.forEach((targetCue: CueDtoWithIndex) => {
        if (targetCue.cue.comments) {
            cueCommentsCount += targetCue.cue.comments.length;
        }
    });

    return (
        <div
            className="sbte-cue-line"
            ref={props.rowRef}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineFlap
                rowIndex={props.rowIndex}
                cueLineState={cueLineState}
                cuesErrors={cuesErrors}
                showErrors={showGlossaryTermsAndErrors}
                editDisabled={cueLineEditDisabled}
                cues={props.data.targetCues}
                cueCommentsCount={cueCommentsCount}
            />
            <div
                className={"border-t border-r border-blue-light-mostly-transparent rounded-r" +
                    (cueLineEditDisabled ? " sbte-edit-disabled" : "")}
                style={{ display: "grid", width: "100%" }}
            >
                {
                    props.data.sourceCues && props.data.sourceCues.length > 0
                        ? props.data.sourceCues.map((sourceCue, sourceCueIndex) => {
                            return (
                                <CueView
                                    key={`sourceCueView-${sourceCue.index}`}
                                    rowIndex={props.rowIndex}
                                    isTargetCue={false}
                                    matchedNestedIndex={sourceCueIndex}
                                    targetCueIndex={firstTargetCueIndex}
                                    cue={sourceCue.cue}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    className={`${captionClassName} sbte-source-cue`}
                                    showGlossaryTerms={showGlossaryTermsAndErrors}
                                    languageDirection={editingTrack?.sourceLanguage?.direction}
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
                                    glossaryTerm={glossaryTerm}
                                    setGlossaryTerm={setGlossaryTerm}
                                    editDisabled={cueLineEditDisabled}
                                />
                            );
                        })
                        : (
                            props.rowProps.withoutSourceCues
                            ? null
                            : (
                                <ClickCueWrapper
                                    targetCueIndex={firstTargetCueIndex}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    className={translationCueClassName}
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
                                    editDisabled={cueLineEditDisabled}
                                >
                                    <div style={{ width: "100%", minHeight: "78px" }} />
                                </ClickCueWrapper>
                            )
                        )
                }
                {hasMultipleCues ? <div className={dividerClass} /> : null}
                {
                    props.data.targetCues && props.data.targetCues.length > 0
                        ? props.data.targetCues.map((targetCue, targetCueIndex) => {
                            return editingCueIndex === targetCue.index && !cueLineEditDisabled
                                ? (
                                    <>
                                        <CueEdit
                                            key={`targetCueEdit-${targetCue.index}`}
                                            index={targetCue.index}
                                            cue={targetCue.cue}
                                            nextCueLine={props.rowProps.matchedCues[props.rowIndex + 1]}
                                            matchedCuesIndex={props.rowIndex}
                                            glossaryTerm={glossaryTerm}
                                            setGlossaryTerm={setGlossaryTerm}
                                        />
                                        {
                                            commentsVisible ?
                                                <CueComments
                                                    key={`cueComments-${targetCue.index}`}
                                                    index={targetCue.index}
                                                    cue={targetCue.cue}
                                                    commentAuthor={props.rowProps.commentAuthor}
                                                />
                                                : null
                                        }
                                        <CueErrorsList key={targetCue.index} cue={targetCue.cue} />
                                    </>
                                )
                                : (
                                    <>
                                        <CueView
                                            rowIndex={props.rowIndex}
                                            key={`targetCueView-${targetCue.index}`}
                                            isTargetCue
                                            matchedNestedIndex={targetCueIndex}
                                            targetCueIndex={targetCue.index}
                                            cue={targetCue.cue}
                                            targetCuesLength={props.rowProps.targetCuesLength}
                                            className={`${captionClassName} sbte-target-cue`}
                                            showGlossaryTerms={false}
                                            languageDirection={editingTrack?.language.direction}
                                            sourceCuesIndexes={sourceCuesIndexes}
                                            nextTargetCueIndex={nextTargetCueIndex}
                                            editDisabled={cueLineEditDisabled}
                                        />
                                        {
                                            commentsVisible ?
                                                <CueComments
                                                    key={`cueComments-${targetCue.index}`}
                                                    index={targetCue.index}
                                                    cue={targetCue.cue}
                                                    commentAuthor={props.rowProps.commentAuthor}
                                                />
                                                : null
                                        }
                                    </>
                                );
                        })
                        : cueLineEditDisabled
                            ? null
                            : (
                                <ClickCueWrapper
                                    targetCueIndex={firstTargetCueIndex}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    className="bg-gray-0"
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
                                    editDisabled={cueLineEditDisabled}
                                >
                                    <InsertCueButton />
                                </ClickCueWrapper>
                            )
                }
            </div>
        </div>
    );
};

export default React.memo(CueLine);
