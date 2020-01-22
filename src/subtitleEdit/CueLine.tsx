import { Position, copyNonConstructorProperties, positionStyles } from "./cueUtils";
import React, { Dispatch, ReactElement } from "react";
import { AppThunk } from "../reducers/subtitleEditReducers";
import CueTextEditor from "./CueTextEditor";
import PositionButton from "./PositionButton";
import TimeEditor from "./timeEditor/TimeEditor";
import { updateCue } from "../player/trackSlices";
import { useDispatch } from "react-redux";

interface Props {
    index: number;
    cue: VTTCue;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: Props,
                                    startTime: number, endTime: number): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.text);
    copyNonConstructorProperties(newCue, props.cue);
    dispatch(updateCue(props.index, newCue));
};

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div className="sbte-cue-line" style={{ display: "flex" }}>
            <div style={{
                flex: "1 1 25%",
                display: "flex",
                flexDirection: "column",
                paddingLeft: "20px",
                paddingTop: "15px",
                justifyContent: "space-between"
            }}
            >
                <div>
                    <TimeEditor
                        id={`time-start-${props.index}`}
                        time={props.cue.startTime}
                        onChange={(starTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, starTime, props.cue.endTime)}
                    />
                    <TimeEditor
                        id={`time-end-${props.index}`}
                        time={props.cue.endTime}
                        onChange={(endTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, props.cue.startTime, endTime)}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                        className="btn btn-outline-secondary"
                        style={{ marginBottom: "5px" }}
                    >
                        Dialogue
                    </button>
                    <PositionButton
                        cue={props.cue}
                        changePosition={(position: Position): void => {
                            const newCue = new VTTCue(props.cue.startTime, props.cue.endTime, props.cue.text);
                            copyNonConstructorProperties(newCue, props.cue);
                            const newPositionProperties = positionStyles.get(position);
                            for (const property in newPositionProperties) {
                                // noinspection JSUnfilteredForInLoop
                                newCue[property] = newPositionProperties[property];
                            }
                            dispatch(updateCue(props.index, newCue));
                        }}
                    />
                </div>
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                <CueTextEditor key={props.index} index={props.index} cue={props.cue} />
            </div>
        </div>
    );
};

export default CueLine;
