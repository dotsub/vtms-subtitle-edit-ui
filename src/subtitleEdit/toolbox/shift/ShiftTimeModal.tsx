import { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTimeByPosition } from "../../cues/cuesList/cuesListActions";
import { Field, Form } from "react-final-form";
import { formatStartOrEndTime } from "../../utils/timeUtils";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";

const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeValid = (value: string, firstTrackTime: number, isMediaChunk: boolean): boolean =>
    !isMediaChunk && (parseFloat(value) + firstTrackTime) < 0;

interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const [errorMessage, setErrorMessage] = useState();
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);
    const mediaChunkStart = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaChunkStart);
    const editCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const isMediaChunk = !!mediaChunkStart || mediaChunkStart === 0;

    const handleApplyShift = (shiftPosition: string, shiftTime: string): void => {
        const shiftValue = parseFloat(shiftTime);
        try {
            dispatch(applyShiftTimeByPosition(shiftPosition, editCueIndex, shiftValue));
        } catch (e) {
            // @ts-ignore
            setErrorMessage(e.message);
            return;
        }
        props.onClose();
    };

    const handleCancelShift = (): void => {
        setErrorMessage(undefined);
        props.onClose();
    };

    return (
        <Form
            onSubmit={(values): void => handleApplyShift(values.shiftPosition, values.shiftTime)}
            render={({ handleSubmit, values }): ReactElement => (
                <Dialog
                    visible={props.show}
                    onHide={handleCancelShift}
                    className="tw-max-w-3xl"
                    appendTo={document.body.querySelector("#prime-react-dialogs") as HTMLDivElement}
                    header="Shift Track Lines Time"
                    draggable={false}
                    dismissableMask
                    resizable={false}
                    footer={() => (
                        <>
                            <button
                                type="submit"
                                disabled={
                                    isShiftTimeValid(values.shiftTime, firstTrackTime, isMediaChunk) ||
                                    values.shiftPosition === undefined
                                }
                                className="dotsub-shift-modal-apply-button tw-btn tw-btn-primary"
                                onClick={handleSubmit}
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelShift}
                                className="dotsub-shift-modal-close-button tw-btn tw-btn-secondary"
                            >
                                Close
                            </button>
                        </>
                    )}
                >
                    <form onSubmit={handleSubmit} className="tw-space-y-4">
                        <div>
                            <label>Time Shift in Seconds.Milliseconds</label>
                            <Field
                                name="shiftTime"
                                component="input"
                                parse={formatStartOrEndTime}
                                className="tw-form-control dotsub-track-line-shift margin-right-10"
                                style={{ width: "120px" }}
                                type="number"
                                placeholder="0.000"
                                step={"0.100"}
                            />
                        </div>
                        <fieldset className="tw-space-y-1">
                            <div>
                                <label>
                                    <Field
                                        name="shiftPosition"
                                        component="input"
                                        type="radio"
                                        value="all"
                                        className="form-check-input"
                                    /> Shift all
                                </label>
                            </div>
                            <div>
                                <label>
                                    <Field
                                        component="input"
                                        type="radio"
                                        name="shiftPosition"
                                        value="before"
                                        className="form-check-input"
                                    /> Shift all before editing cue
                                </label>
                            </div>
                            <div>
                                <label>
                                    <Field
                                        component="input"
                                        type="radio"
                                        name="shiftPosition"
                                        value="after"
                                        className="form-check-input"
                                    /> Shift all after editing cue
                                </label>
                            </div>
                        </fieldset>
                        {
                            errorMessage || isShiftTimeValid(values.shiftTime, firstTrackTime, isMediaChunk) ? (
                                <div>
                                    <Message
                                        severity="error"
                                        className="tw-w-full tw-justify-start"
                                        text={errorMessage || INVALID_SHIFT_MSG}
                                    />
                                </div>
                            ) : null
                        }
                    </form>
                </Dialog>
            )}
        />
    );
};

export default ShiftTimeModal;
