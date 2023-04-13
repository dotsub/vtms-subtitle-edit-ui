import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { TrackCues } from "./model";
import { isPendingSaveState, SaveState } from "./cues/saveSlices";


interface Props {
    onComplete: (trackCues: TrackCues) => void;
    disabled?: boolean;
}

const AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
const TASK_COMPLETE_MSG = "Edits are disabled, task is already completed";

const stateMessages = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.REQUEST_SENT, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.RETRY, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.SAVED, "All changes saved to server" ],
    [ SaveState.ERROR, "Error saving latest changes" ],
]);

const stateIconCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "fa-duotone fa-sync fa-spin" ],
    [ SaveState.REQUEST_SENT, "fa-duotone fa-sync fa-spin" ],
    [ SaveState.RETRY, "fa-duotone fa-sync fa-spin" ],
    [ SaveState.SAVED, "fa-duotone fa-check-circle" ],
    [ SaveState.ERROR, "fa-duotone fa-exclamation-triangle" ],
]);

const stateCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "" ],
    [ SaveState.REQUEST_SENT, "" ],
    [ SaveState.RETRY, "" ],
    [ SaveState.SAVED, "text-green-light" ],
    [ SaveState.ERROR, "text-danger" ],
]);

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const saveState = useSelector((state: SubtitleEditState) => state.saveAction.saveState);
    const stateIconClass = stateIconCssClasses.get(saveState);
    return (
        <div className="space-x-4 flex items-center">
            <div className="font-medium">
                {
                    props.disabled ?
                        <span className="text-green-primary">{TASK_COMPLETE_MSG}</span> :
                        <span
                            hidden={saveState === SaveState.NONE}
                            className={`flex items-center ${stateCssClasses.get(saveState)}`}
                        >
                            <span className="leading-none">{stateMessages.get(saveState)}</span>
                            <i className={`ml-2${stateIconClass ? ` ${stateIconClass}` : ""}`} />
                        </span>
                }
            </div>
            <button
                type="button"
                className="sbte-btn sbte-btn-primary sbte-complete-subtitle-sbte-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}
                disabled={props.disabled || isPendingSaveState(saveState)}
            >
                Complete
            </button>
        </div>
    );
};

export default CompleteButton;
