import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { ManuCapState } from "./manuCapReducers";
import { SaveState, TrackCues } from "./model";

interface Props {
    onComplete: (trackCues: TrackCues) => void;
    disabled?: boolean;
    saveState: SaveState;
}

const AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
const TASK_COMPLETE_MSG = "Edits are disabled, task is already completed";

const stateMessages = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ "SAVED", "All changes saved to server" ],
    [ "ERROR", "Error saving latest changes" ],
]);

const stateIconCssClasses = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", "fa-duotone fa-sync fa-spin" ],
    [ "SAVED", "fa-duotone fa-check-circle" ],
    [ "ERROR", "fa-duotone fa-exclamation-triangle" ],
]);

const stateCssClasses = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", "" ],
    [ "SAVED", "text-green-light" ],
    [ "ERROR", "text-danger" ],
]);

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const cues = useSelector((state: ManuCapState) => state.cues);
    const stateIconClass = stateIconCssClasses.get(props.saveState);
    return (
        <div className="space-x-4 flex items-center">
            <div className="font-medium">
                {
                    props.disabled && props.saveState !== "TRIGGERED" ?
                        <span className="text-green-primary">{TASK_COMPLETE_MSG}</span> :
                        <span
                            hidden={props.saveState === "NONE"}
                            className={`flex items-center ${stateCssClasses.get(props.saveState)}`}
                        >
                            <span className="leading-none">{stateMessages.get(props.saveState)}</span>
                            <i className={`ml-2${stateIconClass ? ` ${stateIconClass}` : ""}`} />
                        </span>
                }
            </div>
            <button
                type="button"
                className="sbte-btn sbte-btn-primary sbte-complete-subtitle-sbte-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}
                disabled={props.disabled || props.saveState === "TRIGGERED"}
            >
                Complete
            </button>
        </div>
    );
};

export default CompleteButton;
