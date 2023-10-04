import { Track } from "../model";
import videojs from "video.js";

export const convertToTextTrackOptions = (track: Track): videojs.TextTrackOptions => (
    {
        kind: track.type === "CAPTION" ? "captions" : "subtitles",
        mode: "showing",
        srclang: track.language.id,
        default: track.default,
    } as videojs.TextTrackOptions
);
