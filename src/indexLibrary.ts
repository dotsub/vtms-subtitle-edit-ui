import { updateCues } from "./subtitleEdit/cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./subtitleEdit/trackSlices";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import VideoPlayer from "./subtitleEdit/player/VideoPlayer";
import useMatchedCuesAsCsv from "./subtitleEdit/cues/cuesList/useMatchedCuesAsCsv";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
import { updateSourceCues } from "./subtitleEdit/cues/view/sourceCueSlices";
import { updateSubtitleUser } from "./subtitleEdit/userSlices";

const Actions = ({
    updateEditingTrack,
    updateCues,
    updateSourceCues,
    setAutoSaveSuccess,
    updateSubtitleUser,
});

const Hooks = ({
    useMatchedCuesAsCsv
});

export {
    VideoPlayer,
    Reducers,
    SubtitleEdit,
    Actions,
    Hooks
};

