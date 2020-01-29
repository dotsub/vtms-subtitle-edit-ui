import React, { ReactElement } from "react";
import { CueCategory } from "../player/model";
import { addCue } from "../player/trackSlices";
import { useDispatch } from "react-redux";

const ADD_END_TIME_INTERVAL_SECS = 3;

interface Props {
    cueIndex: number;
    cueEndTime: number;
    cueCategory?: CueCategory;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <>
            <button
                className="btn btn-outline-secondary sbte-add-cue-button"
                onClick={(): void => {
                    dispatch(addCue(props.cueIndex + 1,
                        new VTTCue(props.cueEndTime, props.cueEndTime + ADD_END_TIME_INTERVAL_SECS, ""),
                        props.cueCategory || "DIALOGUE"));
                }}
            >
                <b>+</b>
            </button>
        </>
    );
};

export default AddCueLineButton;
