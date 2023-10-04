import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { CUE_LINE_STATE_CLASSES, CueDtoWithIndex, CueError, CueLineState, CuesWithRowIndex } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { addCuesToMergeList, removeCuesToMergeList } from "../cuesList/cuesListActions";
import { Tooltip } from "primereact/tooltip";

interface Props {
    rowIndex: number;
    cueLineState: CueLineState;
    cues: CueDtoWithIndex[] | undefined;
    cuesErrors?: CueError[];
    showErrors?: boolean;
    editDisabled?: boolean;
    cueCommentsCount?: number;
}

const getCommentIcon = (index: number): ReactElement => {
    const commentIconId = `cuelineComment-${index}`;
    return (
        <div key={index}>
            <i
                id={commentIconId}
                className="fa-duotone fa-comments"
                data-pr-tooltip="Subtitle(s) has comments"
                data-pr-position="right"
                data-pr-at="right+10 top+10"
            />
            <Tooltip
                id={commentIconId + "-Tooltip"}
                target={`#${commentIconId}`}
            />
        </div>
    );
};

const getIconStyle = (bottom: string): CSSProperties => {
    return {
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: "0",
        right: "0",
        bottom: bottom,
        fontSize: "14px"
    };
};

const CueLineFlap = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const mergeVisible = useSelector((state: ManuCapState) => state.mergeVisible);
    const rowsToMerge = useSelector((state: ManuCapState) => state.rowsToMerge);
    const [checked, setChecked] = useState(false);
    const showCommentsIcon = props.cueCommentsCount && props.cueCommentsCount > 0;

    useEffect(() => {
        setChecked(rowsToMerge.find(row => row.index === props.rowIndex) !== undefined);
    }, [props.rowIndex, rowsToMerge]);

    const isContiguousToSelected = (): boolean => {
        if (rowsToMerge && rowsToMerge.length > 0) {
            const validIndices = [props.rowIndex - 1, props.rowIndex, props.rowIndex + 1];
            return rowsToMerge
                .map((selectedRow: CuesWithRowIndex): boolean => validIndices.indexOf(selectedRow.index) > -1)
                .reduce((selectedRow1: boolean, selectedRow2: boolean): boolean => selectedRow1 || selectedRow2);
        }
        return true;
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {
                    mergeVisible
                        ? <input
                                type="checkbox"
                                className="sbte-cue-line-flap-checkbox"
                                disabled={props.editDisabled || !isContiguousToSelected()}
                                checked={checked}
                                onChange={(): void => {
                                const cuesWithIndex = {
                                    index: props.rowIndex,
                                    cues: props.cues
                                };
                                dispatch(checked
                                    ? removeCuesToMergeList(cuesWithIndex)
                                    : addCuesToMergeList(cuesWithIndex));
                                setChecked(!checked);
                            }}
                          />
                        : null
                }
            </div>
            <div
                className={CUE_LINE_STATE_CLASSES.get(props.cueLineState)?.flapClass}
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: props.editDisabled && showCommentsIcon ? "100px" : "80px"
                }}
            >
                <div style={{ paddingTop: "10px", fontSize: "11px", fontWeight: "bold" }}>
                    {props.rowIndex + 1}
                </div>
                <div style={getIconStyle(showCommentsIcon ? "55px" : "30px")}>
                    {
                        props.editDisabled
                            ? <i className="fa-duotone fa-lock" />
                            : null
                    }
                </div>
                <div style={getIconStyle("30px")}>
                    {
                        showCommentsIcon
                            ? getCommentIcon(props.rowIndex)
                            : null
                    }
                </div>
                <div style={getIconStyle("10px")}>
                    {
                        props.cueLineState === CueLineState.ERROR
                            ? <i className="fa-duotone fa-exclamation-triangle" />
                            : null
                    }
                    {
                        props.cueLineState === CueLineState.GOOD
                            ? <i className="fa-duotone fa-check" />
                            : null
                    }
                </div>
            </div>
        </div>
    );
};

export default CueLineFlap;
