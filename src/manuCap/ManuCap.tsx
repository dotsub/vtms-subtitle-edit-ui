import "../colors.css";
import "../global.css";

import { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import { AppThunk, ManuCapState } from "./manuCapReducers";
import Toolbox from "./toolbox/Toolbox";
import { enableMapSet } from "immer";
import { hasDataLoaded } from "./utils/manuCapUtils";
import CuesList from "./cues/cuesList/CuesList";
import { setSaveTrack } from "./cues/saveSlices";
import { resetEditingTrack } from "./trackSlices";
import { changeScrollPosition, setCurrentPlayerTime } from "./cues/cuesList/cuesListScrollSlice";
import {
    ScrollPosition,
    SaveActionParameters,
    TrackCues,
    Track,
    SaveTrackCue,
    SaveState
} from "./model";
import SearchReplaceEditor from "./cues/searchReplace/SearchReplaceEditor";
import { setSpellCheckDomain } from "./spellcheckerSettingsSlice";
import CueErrorAlert from "./cues/CueErrorAlert";
import MergeEditor from "./cues/merge/MergeEditor";
import { saveCueUpdateSlice } from "./cues/saveCueUpdateSlices";
import { saveCueDeleteSlice } from "./cues/saveCueDeleteSlices";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();

export interface ManuCapProps {
    mp4: string;
    poster: string;
    waveform?: string;
    onViewTrackHistory: () => void;
    onSave: (saveAction: SaveActionParameters) => void;
    onUpdateCue: (trackCue: SaveTrackCue) => void;
    onDeleteCue: (trackCue: SaveTrackCue) => void;
    onComplete: (completeAction: TrackCues) => void;
    onExportFile: (trackVersionExport: Track | null) => void;
    onExportSourceFile: () => void;
    onImportFile: () => void;
    spellCheckerDomain?: string;
    commentAuthor?: string;
    editDisabled?: boolean;
    saveState: SaveState;
}

const ManuCap = (props: ManuCapProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: ManuCapState) => state.loadingIndicator);
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const handleTimeChange = (time: number): AppThunk => dispatch(setCurrentPlayerTime(time));

    useEffect(
        () => (): void => { // nested arrow function is needed, because React will call it as callback when unmounted
            dispatch(resetEditingTrack());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    useEffect(
        (): void => {
            dispatch(setSaveTrack(props.onSave));
            dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(props.onUpdateCue));
            dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(props.onDeleteCue));
            dispatch(setSpellCheckDomain(props.spellCheckerDomain));
            dispatch(changeScrollPosition(ScrollPosition.FIRST));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%", overflow: "hidden" }}
        >
            <CueErrorAlert />
            {
                !hasDataLoaded(editingTrack, loadingIndicator) ?
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%"
                        }}
                    >
                        <div className="text-center space-y-4">
                            <div className="sbte-spinner-icon" />
                            <p className="font-medium text-blue-light m-0">
                                Hang in there, we&apos;re loading the track...
                            </p>
                        </div>
                    </div>
                    :
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <EditingVideoPlayer
                                    mp4={props.mp4}
                                    poster={props.poster}
                                    waveform={props.waveform}
                                    mediaLength={editingTrack?.mediaLength}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                            <Toolbox
                                editDisabled={props.editDisabled}
                                handleExportSourceFile={props.onExportSourceFile}
                                handleExportFile={props.onExportFile}
                                handleImportFile={props.onImportFile}
                                saveState={props.saveState}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <SearchReplaceEditor />
                            <MergeEditor />
                            <CuesList
                                editDisabled={props.editDisabled}
                                editingTrack={editingTrack}
                                commentAuthor={props.commentAuthor}
                                onViewTrackHistory={props.onViewTrackHistory}
                                onComplete={props.onComplete}
                                saveState={props.saveState}
                            />
                        </div>
                    </div>
            }
        </div>
    );
};

export default ManuCap;
