import { createRef, ReactElement, RefObject, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isDirectTranslationTrack } from "../../utils/subtitleEditUtils";
import AddCueLineButton from "../edit/AddCueLineButton";
import { TrackCues, CueLineDto, ScrollPosition, Track } from "../../model";
import CueLine from "../cueLine/CueLine";
import { addCue } from "./cuesListActions";
import { SubtitleEditState } from "../../subtitleEditReducers";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../../utils/shortcutConstants";
import {
    changeScrollPosition,
    scrollToFirstUnlockChunk,
    DEFAULT_PAGE_SIZE
} from "./cuesListScrollSlice";
import CueListToolbar from "../../CueListToolbar";

interface Props {
    editingTrack: Track | null;
    commentAuthor?: string;
    editDisabled?: boolean;
    onViewTrackHistory: () => void;
    onComplete: (completeAction: TrackCues) => void;
}

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const targetCuesArray = useSelector((state: SubtitleEditState) => state.cues);
    const matchedCues = useSelector((state: SubtitleEditState) => state.matchedCues);
    const previousNonNullFocusedCueIndex = useRef(-1);
    const startAt = useSelector((state: SubtitleEditState) => state.focusedCueIndex);
    const isMediaChunked = props.editingTrack?.mediaChunkStart !== undefined;
    if (startAt !== null) {
        previousNonNullFocusedCueIndex.current = startAt;
    }
    const scrollRef = useRef(null as HTMLDivElement | null);
    const preventScroll = useRef(false);

    const withoutSourceCues = props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack);
    const showStartCaptioning = matchedCues.matchedCues.length === 0;
    const pageIndex = previousNonNullFocusedCueIndex.current > 0
        ? Math.floor(previousNonNullFocusedCueIndex.current / DEFAULT_PAGE_SIZE)
        : 0;
    const lastPageIndex = Math.floor(matchedCues.matchedCues.length / DEFAULT_PAGE_SIZE);
    const startIndex = pageIndex === 0
        ? 0
        : pageIndex * DEFAULT_PAGE_SIZE - 5;
    const endIndex = pageIndex === lastPageIndex
        ? (pageIndex + 1) * DEFAULT_PAGE_SIZE
        : (pageIndex + 1) * DEFAULT_PAGE_SIZE + 5;
    const [refs, setRefs] = useState([] as RefObject<HTMLDivElement>[]);

    useEffect(
        () => {
            if (showStartCaptioning) {
                Mousetrap.bind([KeyCombination.ENTER], () => dispatch(addCue(0, [])));
            }
        },
        [dispatch, showStartCaptioning]
    );

    useEffect(
        () => {
            setRefs(
                Array(matchedCues.matchedCues.length)
                    .fill(undefined)
                    .map(() => createRef())
            );
        },
        [dispatch, matchedCues.matchedCues.length]
    );

    useEffect(
        () => {
            if (startAt !== null
                && refs[startAt] !== undefined
                && refs[startAt].current !== null
            ) {
                const ref = refs[startAt];
                preventScroll.current = true;
                ref?.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        }
    );

    useEffect(
        () => {
            const cuesList = scrollRef.current;
            if (cuesList) {
                const onScroll = (): void => {
                    if (preventScroll.current) {
                        preventScroll.current = false;
                    } else {
                        dispatch(changeScrollPosition(ScrollPosition.NONE));
                    }
                };
                cuesList.addEventListener("scroll", onScroll);
            }
        },
        [dispatch, scrollRef]
    );

    useEffect(() => {
        if (isMediaChunked) {
            dispatch((scrollToFirstUnlockChunk()));
        }
    }, [dispatch, isMediaChunked]);

    return (
        <div
            style={{
                flex: "1 1 60%",
                height: "90%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            {
                showStartCaptioning
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                    : null
            }
            <div ref={scrollRef} style={{ overflow: "auto" }} className="sbte-cue-list">
                {
                    startIndex > 0
                        ? (
                            <button
                                style={{ marginBottom: 5 }}
                                className="sbte-btn sbte-btn-primary sbte-previous-button w-full"
                                onClick={(): void => {
                                    dispatch(changeScrollPosition(
                                        ScrollPosition.PREVIOUS_PAGE,
                                        previousNonNullFocusedCueIndex.current
                                    ));
                                }}
                            >
                                Load Previous Cues
                            </button>
                        )
                        : null
                }
                {
                    matchedCues.matchedCues.slice(startIndex, endIndex)
                        .map((item: CueLineDto, i) => {
                            return (
                                <CueLine
                                    key={startIndex + i}
                                    data={item}
                                    rowIndex={startIndex + i}
                                    rowProps={{
                                        targetCuesLength: targetCuesArray.length,
                                        withoutSourceCues,
                                        matchedCues: matchedCues.matchedCues,
                                        commentAuthor: props.commentAuthor
                                    }}
                                    rowRef={refs[startIndex + i]}
                                    editDisabled={props.editDisabled}
                                />
                            );
                        })
                }
                {
                    endIndex < matchedCues.matchedCues.length
                        ? (
                            <button
                                className="sbte-btn sbte-btn-primary sbte-next-button w-full"
                                onClick={(): void => {
                                    dispatch(changeScrollPosition(
                                        ScrollPosition.NEXT_PAGE,
                                        previousNonNullFocusedCueIndex.current
                                    ));
                                }}
                            >
                                Load Next Cues
                            </button>
                        )
                        : null
                }
            </div>
            <CueListToolbar
                onViewTrackHistory={props.onViewTrackHistory}
                editingTrack={props.editingTrack}
                onComplete={props.onComplete}
                editDisabled={props.editDisabled}
            />
        </div>
    );
};

export default CuesList;
