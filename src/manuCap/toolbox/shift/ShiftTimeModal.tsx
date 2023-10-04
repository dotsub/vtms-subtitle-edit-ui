import { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { applyShiftTimeByPosition } from "../../cues/cuesList/cuesListActions";
import { useForm } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ShiftPosition } from "../../cues/cuesList/cuesListSlices";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import JoiError from "../../common/JoiError";

const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeInvalid = (value: string, position: ShiftPosition, firstCueTime: number, isMediaChunk: boolean)
    : boolean =>
    !isMediaChunk && position != ShiftPosition.AFTER ? (parseFloat(value) + firstCueTime) < 0 : false;

interface ShiftTimeValues {
    shiftTime: string;
    shiftPosition: ShiftPosition;
}

interface Props {
    show: boolean;
    onClose: () => void;
}

const validationMessage = {
    "number.base": " Required field",
    "invalid": INVALID_SHIFT_MSG
};

const ShiftTimeModal = (props: Props): ReactElement => {
    const [errorMessage, setErrorMessage] = useState();
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: ManuCapState) => state.cues[0]?.vttCue.startTime);
    const mediaChunkStart = useSelector((state: ManuCapState) => state.editingTrack?.mediaChunkStart);
    const editCueIndex = useSelector((state: ManuCapState) => state.editingCueIndex);
    const isMediaChunk = !!mediaChunkStart || mediaChunkStart === 0;

    const validationSchema = Joi.object({
        shiftTime: Joi.number()
            .required()
            .custom((value, helpers) => {
                const { state: { ancestors: [{ shiftPosition }] }} = helpers;
                if (isShiftTimeInvalid(value, parseInt(shiftPosition), firstTrackTime, isMediaChunk)) {
                    return helpers.error("invalid");
                }
                return value;
            }),
        shiftPosition: Joi.number()
            .required()
    }).messages(validationMessage);

    const { errors, handleSubmit, register } = useForm({ resolver: joiResolver(validationSchema) });

    const onSubmit = (values: ShiftTimeValues): void => {
        const shiftValue = parseFloat(values.shiftTime);
        try {
            dispatch(applyShiftTimeByPosition(values.shiftPosition, editCueIndex, shiftValue));
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
        <Dialog
            visible={props.show}
            onHide={handleCancelShift}
            className="max-w-3xl"
            appendTo={document.body.querySelector("#prime-react-dialogs") as HTMLDivElement}
            header="Shift Track Lines Time"
            draggable={false}
            dismissableMask
            resizable={false}
            footer={() => (
                <>
                    <button
                        type="submit"
                        className="mc-shift-modal-apply-button sbte-btn sbte-btn-primary"
                        onClick={handleSubmit(onSubmit)}
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelShift}
                        className="mc-shift-modal-close-button sbte-btn sbte-btn-light"
                    >
                        Close
                    </button>
                </>
            )}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label>Time Shift in Seconds.Milliseconds</label>
                    <input
                        name="shiftTime"
                        type="number"
                        className="sbte-form-control mc-track-line-shift mt-2"
                        style={{ width: "120px" }}
                        placeholder="0.000"
                        step={"0.100"}
                        ref={register}
                    />
                    <JoiError errors={errors} field="shiftTime" />
                </div>
                <fieldset className="space-y-2">
                    <div className="form-check">
                        <label>
                            <input
                                name="shiftPosition"
                                type="radio"
                                value={ShiftPosition.ALL}
                                ref={register}
                            /> Shift all
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input
                                name="shiftPosition"
                                type="radio"
                                value={ShiftPosition.BEFORE}
                                ref={register}
                            /> Shift all before editing cue
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input
                                name="shiftPosition"
                                type="radio"
                                value={ShiftPosition.AFTER}
                                ref={register}
                            /> Shift all after editing cue
                        </label>
                    </div>
                    <JoiError errors={errors} field="shiftPosition" />
                </fieldset>
                {
                    errorMessage
                        ? <Message severity="error" className="w-full justify-start" text={errorMessage} />
                        : null
                }
            </form>
        </Dialog>
    );
};

export default ShiftTimeModal;
