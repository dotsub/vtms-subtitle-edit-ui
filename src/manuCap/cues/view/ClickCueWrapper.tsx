import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { addCue } from "../cuesList/cuesListActions";

export interface CueViewProps {
    targetCueIndex?: number;
    targetCuesLength: number;
    sourceCuesIndexes: number[];
    nextTargetCueIndex: number;
    className?: string;
    children?: ReactElement;
    editDisabled?: boolean;
    matchedCueIndex?: number;
}

const ClickCueWrapper = (props: CueViewProps): ReactElement => {
    const dispatch = useDispatch();
    const undefinedSafeClassName = props.className ? `${props.className} ` : "";

    return (
        <div
            style={{ display: "flex" }}
            className={`${undefinedSafeClassName}border-b border-blue-light-mostly-transparent sbte-click-cue-wrapper`}
            onClick={(): void => {
                if (props.targetCueIndex !== undefined) {
                    if (props.targetCueIndex >= props.targetCuesLength) {
                        dispatch(addCue(props.targetCuesLength, props.sourceCuesIndexes));
                    } else if (!props.editDisabled) {
                        dispatch(updateEditingCueIndex(
                            props.targetCueIndex,
                            props.matchedCueIndex !== undefined ? props.matchedCueIndex : -1
                        ));
                    }
                } else {
                    const finalTargetIndex = props.nextTargetCueIndex >= 0
                        ? props.nextTargetCueIndex
                        : props.targetCuesLength;
                    dispatch(addCue(finalTargetIndex, props.sourceCuesIndexes));
                }
            }}
        >
            { props.children ? props.children : null }
        </div>
    );
};

export default ClickCueWrapper;
