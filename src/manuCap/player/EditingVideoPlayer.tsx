import { AppThunk, ManuCapState } from "../manuCapReducers";
import { ReactElement, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { clearLastCueChange } from "../cues/edit/cueEditorSlices";
import { copyNonConstructorProperties } from "../cues/cueUtils";
import { updateVttCue } from "../cues/cuesList/cuesListActions";

interface Props {
    mp4: string;
    poster: string;
    waveform?: string;
    mediaLength?: number
    onTimeChange?: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);

    /**
     * This expects that EditingVideoPlayer would be rendered with cues initialized in Redux.
     * It uses shallowEqual as the equalityFn because replacing all the cues was not performant.
     */
    const editingCues = useSelector((state: ManuCapState) => state.cues, shallowEqual);
    const lastCueChange = useSelector((state: ManuCapState) => state.lastCueChange);
    const videoSectionToPlay = useSelector((state: ManuCapState) => state.videoSectionToPlay);
    const waveformVisible = useSelector((state: ManuCapState) => state.waveformVisible);
    const languageCuesArray = editingTrack ? [{ languageId: editingTrack.language.id, cues: editingCues }] : [];
    const tracks = editingTrack ? [editingTrack] : [];

    const updateCueTimecodes = (cueIndex: number, startTime: number, endTime: number): void => {
        const existingCue = editingCues[cueIndex];
        const newCue = new VTTCue(startTime, endTime, existingCue.vttCue.text);
        copyNonConstructorProperties(newCue, existingCue.vttCue);
        dispatch(updateVttCue(cueIndex, newCue, existingCue.editUuid));
    };

    useEffect(() => {
        if (lastCueChange !== null) {
            dispatch(clearLastCueChange());
        }
    }, [dispatch, lastCueChange]);

    return editingTrack
        ? (
            <VideoPlayer
                mp4={props.mp4}
                poster={props.poster}
                waveform={props.waveform}
                mediaLength={props.mediaLength}
                waveformVisible={waveformVisible}
                updateCueTimecodes={updateCueTimecodes}
                timecodesUnlocked={editingTrack.timecodesUnlocked}
                cues={editingCues}
                tracks={tracks}
                onTimeChange={props.onTimeChange}
                languageCuesArray={languageCuesArray}
                playSection={videoSectionToPlay}
                lastCueChange={lastCueChange}
                resetPlayerTimeChange={(): AppThunk => dispatch(playVideoSection(-1))}
                trackFontSizePercent={1.25}
            />
        )
        : <p>Editing track not available!</p>;
};

export default EditingVideoPlayer;
