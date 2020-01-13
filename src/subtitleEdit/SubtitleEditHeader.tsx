import React, { ReactElement } from "react";
import { Task, Track } from "../player/model";
import { SubtitleEditState } from "../reducers/subtitleEditReducers";
import { useSelector } from "react-redux";
import { humanizer } from "humanize-duration";

const getTrackType = (track: Track): string => {
    return track.type === "CAPTION" ? "Caption" : "Translation";
};

const getLanguageDescription = (track: Track): ReactElement => {
    if (track.type === "TRANSLATION") {
        const sourceLanguage = track.sourceTrack ? <b>{track.sourceTrack.language.name}</b> : null;
        return <span>{sourceLanguage} to <b>{track.language.name}</b></span>;
    }
    return <b>{track.language.name}</b>;
};

const getTrackLength = (track: Track): ReactElement => {
    if (!track || !track.videoLength || track.videoLength <= 0) {
        return <i/>;
    }
    return <i>{humanizer({ delimiter: " " })(track.videoLength * 1000)}</i>;
}

const getTrackDescription = (task: Task, track: Track): ReactElement => {
    if (!task || !task.type || !track) {
        return <div />;
    }
    const trackDescriptions = {
        TASK_TRANSLATE: <div>Translation from {getLanguageDescription(track)} {getTrackLength(track)}</div>,
        TASK_DIRECT_TRANSLATE: <div>Direct Translation {getLanguageDescription(track)} {getTrackLength(track)}</div>,
        TASK_REVIEW: <div>Review of {getLanguageDescription(track)} {getTrackType(track)} {getTrackLength(track)}</div>,
        TASK_CAPTION: <div>Caption in: {getLanguageDescription(track)} {getTrackLength(track)}</div>
    };
    return trackDescriptions[task.type] ? trackDescriptions[task.type] : <div />;
};

const getDueDate = (task: Task): ReactElement => {
    if (!task || !task.type) {
        return <div />;
    }
    return <div>Due Date: <b>{task.dueDate}</b></div>;
};

const getProgressPercentage = (track: Track): number => {
    if (track.currentVersion && track.currentVersion.cues.length > 0) {
        const cues = track.currentVersion.cues;
        return (cues[cues.length - 1].endTime / track.videoLength) * 100;
    }
    return 0;
};

const getProgress = (track: Track): ReactElement => {
    if (track && track.videoLength) {
        return <div>Completed: <b>{getProgressPercentage(track)}%</b></div>;
    }
    return <div />;
};

const SubtitleEditHeader = (): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const stateTask = useSelector((state: SubtitleEditState) => state.task);
    const track = editingTrack ? editingTrack : {} as Track;
    const task = stateTask ? stateTask : {} as Task;
    return (
        <header style={{ display: "flex", paddingBottom: "10px" }}>
            <div style={{ display: "flex", flexFlow: "column" }}>
                <div><b>{track.videoTitle}</b> <i>{task.projectName}</i></div>
                {getTrackDescription(task, track)}
            </div>
            <div style={{ flex: "2" }} />
            <div style={{ display: "flex", flexFlow: "column" }}>
                {getDueDate(task)}
                {getProgress(track)}
            </div>
        </header>
    );
};

export default SubtitleEditHeader;
