import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";
import { saveTrack, updateCues } from "../cues/cuesList/cuesListActions";
import { isPendingSaveState } from "../cues/saveSlices";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const CaptionOverlapToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    const saveState = useSelector((state: SubtitleEditState) => state.saveAction.saveState);
    return (
        <ToggleButton
            className="flex items-center justify-between"
            disabled={isPendingSaveState(saveState)}
            toggled={overlapEnabled}
            onClick={(event): void => {
                const track = {
                    ...editingTrack,
                    overlapEnabled: !overlapEnabled
                } as Track;
                dispatch(updateEditingTrack(track));
                dispatch(updateCues(cues));
                dispatch(saveTrack());
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                                <span>Overlapping</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">ALLOWED</span>
                        </>
                    ) : (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                                <span>Overlapping</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">
                                NOT ALLOWED
                            </span>
                        </>
                    )
            )}
        />
    );
};

export default CaptionOverlapToggle;
