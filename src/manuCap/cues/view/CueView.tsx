import { ReactElement, useEffect } from "react";
import { CueDto, GlossaryMatchDto, LanguageDirection } from "../../model";
import { convertVttToHtml } from "../edit/cueTextConverter";
import { cueCategoryToPrettyName, findPositionIcon } from "../cueUtils";
import { getTimeString } from "../../utils/timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch, useSelector } from "react-redux";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import ClickCueWrapper from "./ClickCueWrapper";
import { validateVttCue } from "../cuesList/cuesListActions";
import { ManuCapState } from "../../manuCapReducers";
import { SearchReplaceMatch } from "../searchReplace/SearchReplaceMatch";
import { renderToString } from "react-dom/server";
import { SearchReplace } from "../searchReplace/model";

export interface CueViewProps {
    rowIndex: number;
    cue: CueDto;
    isTargetCue: boolean;
    targetCuesLength: number;
    showGlossaryTerms: boolean;
    sourceCuesIndexes: number[];
    nextTargetCueIndex: number;
    matchedNestedIndex?: number;
    targetCueIndex?: number;
    languageDirection?: LanguageDirection;
    className?: string;
    hideText?: boolean;
    glossaryTerm?: string;
    setGlossaryTerm?: (glossaryTerm?: string) => void;
    editDisabled?: boolean;
}

const replaceForInsensitiveMatches = (
    caseInsensitiveMatches: RegExpMatchArray | null,
    plainText: string,
    match: GlossaryMatchDto,
    sanitizedHtml: string
): string => {
    caseInsensitiveMatches?.forEach(
        (caseInsensitiveMatch: string) => {
            if (plainText.includes(caseInsensitiveMatch)) {
                const compositeValue =
                    match.replacements.reduce((left, right) => `${left}/${right}`);
                sanitizedHtml = sanitizedHtml.replace(
                    caseInsensitiveMatch,
                    `<span onClick="pickSetGlossaryTerm('${compositeValue}')" ` +
                    `class="sbte-glossary-match">${caseInsensitiveMatch}</span>`
                );
            }
        }
    );
    return sanitizedHtml;
};

const injectGlossaryTerms = (props: CueViewProps, plainText: string, sanitizedHtml: string): string => {
    if (props.cue.glossaryMatches) {
        const deduplicatedMatches = [ ...props.cue.glossaryMatches ].sort(
            (first, second) => second.source.length - first.source.length
        )
        .filter(match => !!match.source && match.source.trim().length > 0)
        .reduce((result: GlossaryMatchDto[], match: GlossaryMatchDto) => {
            return result.findIndex(ele => ele.source.includes(match.source)) !== -1 ? result : [...result, match];
        }, []);
        deduplicatedMatches.forEach(
            (match) => {
                const caseInsensitiveMatches = plainText.match(new RegExp("\\b" + match.source + "\\b","gi"));
                sanitizedHtml = replaceForInsensitiveMatches(caseInsensitiveMatches, plainText, match, sanitizedHtml);
            }
        );
    }
    return sanitizedHtml;
};

const getWordOccurrenceIndex = (text: string, word: string, occurrence: number) => {
    return text.split(word, occurrence).join(word).length;
};

const injectCurrentSearchMatch = (
    plainText: string,
    sanitizedHtml: string,
    searchReplace: SearchReplace
): string => {
    const matchLength = searchReplace.indices?.matchLength;
    const offset = searchReplace.indices?.offset;
    const offsetIndex = searchReplace.indices?.offsetIndex;
    if (matchLength && offset !== undefined) {
        const match = plainText.substring(offset, offset + matchLength);
        const htmlOffset = getWordOccurrenceIndex(sanitizedHtml, match, offsetIndex + 1);
        const partialHtml = sanitizedHtml.substring(htmlOffset);
        const replacement = renderToString(<SearchReplaceMatch><>{match}</></SearchReplaceMatch>);
        sanitizedHtml = sanitizedHtml.substring(0, htmlOffset) + partialHtml.replace(match, replacement);
    }
    return sanitizedHtml;
};

const buildContent = (
    props: CueViewProps,
    searchReplaceVisible: boolean,
    searchReplace: SearchReplace
): string => {
    const plainText = sanitizeHtml(props.cue.vttCue.text, { allowedTags: []});
    let sanitizedHtml = convertVttToHtml(sanitizeHtml(props.cue.vttCue.text, { allowedTags: ["b", "i", "u"]}));

    if (props.showGlossaryTerms && !props.editDisabled) {
        // @ts-ignore We need to define function as global, because it will be used
        // in glossary decorator onClick event injected into HTML via string manipulation + dangerouslySetInnerHTML
        global.pickSetGlossaryTerm = (term: string): void => props?.setGlossaryTerm(term);
        sanitizedHtml = injectGlossaryTerms(props, plainText, sanitizedHtml);
    }
    const indices = searchReplace.indices;
    if (searchReplaceVisible
        && props.rowIndex === indices.matchedCueIndex
        && (
            !props.isTargetCue && props.matchedNestedIndex === indices.sourceCueIndex
            || props.isTargetCue && props.matchedNestedIndex === indices.targetCueIndex
        )
    ) {
        sanitizedHtml = injectCurrentSearchMatch(plainText, sanitizedHtml, searchReplace);
    }
    return sanitizedHtml;
};

const CueView = (props: CueViewProps): ReactElement => {
    const searchReplaceVisible = useSelector((state: ManuCapState) => state.searchReplaceVisible);
    const searchReplace = useSelector((state: ManuCapState) => state.searchReplace);
    const dispatch = useDispatch();

    const html = props.hideText
        ? ""
        : buildContent(props, searchReplaceVisible, searchReplace);

    useEffect(() => {
        if (props.isTargetCue
            && (props.cue.errors === undefined || props.cue.errors === null)
            && props.targetCueIndex !== undefined) {
            dispatch(validateVttCue(props.targetCueIndex));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // need to run only once on mount

    return (
        <ClickCueWrapper
            targetCueIndex={props.targetCueIndex}
            targetCuesLength={props.targetCuesLength}
            sourceCuesIndexes={props.sourceCuesIndexes}
            nextTargetCueIndex={props.nextTargetCueIndex}
            className={props.className}
            editDisabled={props.editDisabled}
            matchedCueIndex={props.rowIndex}
        >
            <>
                <div
                    className="sbte-cue-line-left-section"
                    style={{
                        flex: "1 1 300px",
                        display: "flex",
                        flexDirection: "column",
                        paddingLeft: "10px",
                        paddingTop: "5px",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div>{getTimeString(props.cue.vttCue.startTime)}</div>
                        <div>{getTimeString(props.cue.vttCue.endTime)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                        <div className="text-sm">{cueCategoryToPrettyName[props.cue.cueCategory]}</div>
                        <div className="text-sm" style={{ paddingRight: "10px" }}>
                            {findPositionIcon(props.cue.vttCue).iconText}
                        </div>
                    </div>
                </div>
                <div
                    className="border-l border-blue-light-mostly-transparent flex items-stretch"
                    style={{ flex: "1 1 70%" }}
                >
                    <div
                        className="sbte-cue-editor"
                        style={{
                            flexBasis: "auto",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            minHeight: "54px",
                            height: "100%",
                            width: "100%"
                        }}
                        dir={props.languageDirection}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                    {
                        props.targetCueIndex !== undefined && props.isTargetCue
                            ? (
                                <CueActionsPanel
                                    index={props.targetCueIndex}
                                    cue={props.cue}
                                    isEdit={false}
                                    sourceCueIndexes={props.sourceCuesIndexes}
                                />
                            )
                            : null
                    }
                </div>
            </>
        </ClickCueWrapper>
    );
};

export default CueView;
