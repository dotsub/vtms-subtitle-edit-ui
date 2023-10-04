import { updateCues } from "./manuCap/cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./manuCap/trackSlices";
import { Reducers } from "./manuCap/manuCapReducers";
import ManuCap from "./manuCap/ManuCap";
import VideoPlayer from "./manuCap/player/VideoPlayer";
import useMatchedCuesAsCsv from "./manuCap/cues/cuesList/useMatchedCuesAsCsv";
import { updateSourceCues } from "./manuCap/cues/view/sourceCueSlices";
import { updateSubtitleUser } from "./manuCap/userSlices";

const Actions = ({
    updateEditingTrack,
    updateCues,
    updateSourceCues,
    updateSubtitleUser,
});

const Hooks = ({
    useMatchedCuesAsCsv
});

export {
    VideoPlayer,
    Reducers,
    ManuCap,
    Actions,
    Hooks
};

