declare module "@dotsub/manucap" {

    import ManuCap from "../manuCap/ManuCap";
    import { AppThunk, Reducers } from "../manuCap/manuCapReducers";
    import VideoPlayer, { Props as VideoPlayerProps } from "../manuCap/player/VideoPlayer";
    import { CueDto, Track, User } from "../manuCap/model";

    const Actions: {
        updateEditingTrack: (track: Track) => AppThunk;
        updateCues: (cues: CueDto[]) => AppThunk;
        updateSourceCues: (cues: CueDto[]) => AppThunk;
        updateSubtitleUser: (user: User) => AppThunk;
    };

    const Hooks: {
        useMatchedCuesAsCsv: () => Function;
    };

    export {
        VideoPlayer,
        VideoPlayerProps,
        ManuCap,
        Reducers,
        Actions,
        Hooks
    };
}

declare module "@dotsub/manucap/models" {

    import {
        CueDto,
        Track,
        Language,
        CueCategory,
        LanguageCues,
        TrackVersionDto,
        CueError,
        User,
        SaveActionParameters,
        TrackCues,
        TrackType,
        SaveTrackCue,
        SaveState
    } from "../manuCap/model";

    export {
        CueDto,
        Track,
        TrackType,
        Language,
        CueCategory,
        LanguageCues,
        TrackVersionDto,
        CueError,
        User,
        SaveActionParameters,
        TrackCues,
        SaveTrackCue,
        SaveState
    };
}
