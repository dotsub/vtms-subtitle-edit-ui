declare module "@dotsub/vtms-subtitle-edit-ui" {

    import SubtitleEdit from "../subtitleEdit/SubtitleEdit";
    import { AppThunk, Reducers } from "../subtitleEdit/subtitleEditReducers";
    import VideoPlayer, { Props as VideoPlayerProps } from "../subtitleEdit/player/VideoPlayer";
    import { CueDto, Track, User } from "../subtitleEdit/model";

    const Actions: {
        updateEditingTrack: (track: Track) => AppThunk;
        updateCues: (cues: CueDto[]) => AppThunk;
        updateSourceCues: (cues: CueDto[]) => AppThunk;
        setAutoSaveSuccess: (success: boolean) => AppThunk;
        updateSubtitleUser: (user: User) => AppThunk;
    };

    const Hooks: {
        useMatchedCuesAsCsv: () => Function;
    };

    export {
        VideoPlayer,
        VideoPlayerProps,
        SubtitleEdit,
        Reducers,
        Actions,
        Hooks
    };
}

declare module "@dotsub/vtms-subtitle-edit-ui/models" {

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
        TrackType
    } from "../subtitleEdit/model";

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
        TrackCues
    };
}
