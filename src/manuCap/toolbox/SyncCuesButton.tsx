import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCues } from "../cues/cuesList/cuesListActions";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import { ManuCapState } from "../manuCapReducers";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

const SyncCuesButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="sbte-sync-cues-button flex items-center"
            disabled={!timecodesUnlocked}
            onClick={(event): void => {
                dispatch(syncCues());
                // unset the track's id to force creating a new version
                const track = {
                    ...editingTrack,
                    id: undefined
                } as Track;
                dispatch(updateEditingTrack(track));
                props.onClick(event);
            }}
        >
            <i className="w-7 fa-duotone fa-rotate text-blue-primary" />
            <span>Sync Cues</span>
        </button>
    );
};

export default SyncCuesButton;
