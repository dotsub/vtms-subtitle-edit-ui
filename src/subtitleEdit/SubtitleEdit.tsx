import React, {ChangeEvent, ReactElement} from "react";
import VideoPlayer from "../player/VideoPlayer";
import {Track, TrackVersion} from "../player/model";

export interface Props {
    mp4: string;
    poster: string;
}

export default class SubtitleEdit extends React.Component<Props> {
    private videoPlayer: VideoPlayer;
    private updateLine1 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine1(event);
    private updateLine2 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine2(event);

    constructor(props: Props) {
        super(props);

        this.videoPlayer = {} as VideoPlayer;
    }

    _updateLine1(event: ChangeEvent<HTMLInputElement>): void {
        this.videoPlayer.player.textTracks()[0].cues[0].text = event.target.value;
        this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));
    }

    _updateLine2(event: ChangeEvent<HTMLInputElement>): void {
        this.videoPlayer.player.textTracks()[0].cues[1].text = event.target.value;
        this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));
    }

    render(): ReactElement {
        const tracks = [
            {
                type: "CAPTION",
                language: { id: "en-US" },
                default: true,
                currentVersion: { cues: [
                        new VTTCue(0, 1, "Caption Line 1"),
                        new VTTCue(1, 2, "Caption Line 2"),
                    ]} as TrackVersion
            } as Track,
            {
                type: "TRANSLATION",
                language: { id: "es-ES" },
                default: false,
                currentVersion: { cues: [
                        new VTTCue(0, 1, "Translation Line 1"),
                        new VTTCue(1, 2, "Translation Line 2"),
                    ]} as TrackVersion
            } as Track
        ];
        return (
            <div style={{ display: "flex", height: "100%" }}>
                <div style={{ flex: "1 1 0", padding: "10px" }}>
                    <VideoPlayer
                        mp4={this.props.mp4}
                        poster={this.props.poster}
                        ref={(node: VideoPlayer): VideoPlayer => this.videoPlayer = node}
                        tracks={tracks}
                    />
                </div>
                <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px" }}>
                    <input
                        inputMode="text"
                        onChange={this.updateLine1}
                    />
                    <input
                        inputMode="text"
                        onChange={this.updateLine2}
                    />
                </div>
            </div>
        );
    }
};
