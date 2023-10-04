import "video.js/dist/video-js.css";
import { CueChange, CueDto, LanguageCues, Track, WaveformRegion } from "../model";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../utils/shortcutConstants";
import { ReactElement, RefObject } from "react";
import * as React from "react";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import { copyNonConstructorProperties, isSafari } from "../cues/cueUtils";
import { getTimeString } from "../utils/timeUtils";
import { PlayVideoAction } from "./playbackSlices";
// @ts-ignore no types for wavesurfer
import WaveSurfer from "wavesurfer.js";
// @ts-ignore no types for wavesurfer
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
// @ts-ignore no types for wavesurfer
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.js";
import moment from "moment";

const SECOND = 1000;
const ONE_MILLISECOND = 0.001;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];

const customizeLinePosition = (vttCue: VTTCue, trackFontSizePercent?: number): void => {
    if (vttCue && vttCue.line !== "auto" && trackFontSizePercent) {
        vttCue.line = Math.round(vttCue.line / trackFontSizePercent);
    }
};

const registerPlayerShortcuts = (videoPlayer: VideoPlayer): void => {
    Mousetrap.bind([KeyCombination.MOD_SHIFT_O, KeyCombination.ALT_SHIFT_O], () => {
        clearTimeout(videoPlayer.playSegmentPauseTimeout);
        videoPlayer.playPause();
        return false;
    });
    Mousetrap.bind([KeyCombination.MOD_SHIFT_LEFT, KeyCombination.ALT_SHIFT_LEFT], () => {
        clearTimeout(videoPlayer.playSegmentPauseTimeout);
        videoPlayer.shiftTime(-SECOND);
        return false;
    });
    Mousetrap.bind([KeyCombination.MOD_SHIFT_RIGHT, KeyCombination.ALT_SHIFT_RIGHT], () => {
        clearTimeout(videoPlayer.playSegmentPauseTimeout);
        videoPlayer.shiftTime(SECOND);
        return false;
    });
};

const randomColor = () =>
    "rgba(" + [~~(Math.random() * 255), ~~(Math.random() * 255), ~~(Math.random() * 255), 0.1] + ")";

export interface Props {
    mp4: string;
    poster: string;
    waveform?: string;
    mediaLength?: number;
    waveformVisible?: boolean;
    updateCueTimecodes?: (idx: number, start: number, end: number) => void;
    timecodesUnlocked?: boolean;
    cues?: CueDto[];
    tracks: Track[];
    onTimeChange?: (time: number) => void;
    languageCuesArray: LanguageCues[];
    playSection?: PlayVideoAction;
    resetPlayerTimeChange?: () => void;
    lastCueChange: CueChange | null;
    trackFontSizePercent?: number;
}

const updateCueAndCopyStyles = (videoJsTrack: TextTrack) => (vttCue: VTTCue, index: number,
                                                             trackFontSizePercent?: number): void => {
    videoJsTrack.addCue(vttCue);
    if (videoJsTrack.cues) {
        const addedCue = videoJsTrack.cues[index] as VTTCue;
        copyNonConstructorProperties(addedCue, vttCue);
        customizeLinePosition(addedCue, trackFontSizePercent);
    }
};

const updateCuesForVideoJsTrack = (props: Props, videoJsTrack: TextTrack, trackFontSizePercent?: number): void => {
    const matchTracks = (track: Track): boolean => track.language.id === videoJsTrack.language;
    const vtmsTrack = props.tracks.filter(matchTracks)[0] as Track;
    props.languageCuesArray
        .filter((languageCues: LanguageCues) => languageCues.languageId === vtmsTrack.language.id)
        .forEach((languageCues: LanguageCues) => {
            languageCues.cues.map((cue: CueDto): VTTCue => cue.vttCue)
                .forEach((cue, index) =>
                    updateCueAndCopyStyles(videoJsTrack)(cue, index, trackFontSizePercent));
        });
};

const handleCueEditIfNeeded = (lastCueChange: CueChange, vttCue: VTTCue, trackFontSizePercent?: number): void => {
    if (lastCueChange.vttCue && lastCueChange.changeType === "EDIT" && vttCue) {
        vttCue.text = lastCueChange.vttCue.text;
        vttCue.startTime = lastCueChange.vttCue.startTime;
        vttCue.endTime = lastCueChange.vttCue.endTime;
        copyNonConstructorProperties(vttCue, lastCueChange.vttCue);
        customizeLinePosition(vttCue, trackFontSizePercent);
    }
};

const handleCueAddIfNeeded = (lastCueChange: CueChange, videoJsTrack: TextTrack,
                              trackFontSizePercent?: number): void => {
    if (lastCueChange.vttCue && lastCueChange.changeType === "ADD" && videoJsTrack.cues) {
        const cuesTail = [];
        for (let idx = videoJsTrack.cues.length - 1; idx >= lastCueChange.index; idx--) {
            cuesTail[idx - lastCueChange.index] = videoJsTrack.cues[idx];
            videoJsTrack.removeCue(videoJsTrack.cues[idx]);
        }
        videoJsTrack.addCue(lastCueChange.vttCue);
        cuesTail.forEach(cue => videoJsTrack.addCue(cue));
        customizeLinePosition(videoJsTrack.cues[lastCueChange.index] as VTTCue, trackFontSizePercent);
    }
};

const updateVideoJsTrackIfNeeded = (
    props: Props,
    lastCueChange: CueChange,
    videoJsTrack: TextTrack,
    player: VideoJsPlayer
) => {
    if (lastCueChange.changeType === "UPDATE_ALL" || lastCueChange.changeType === "MERGE") {
        for (let trackIdx = 0; trackIdx < player.textTracks().length; trackIdx++) {
            const videoJsTrack = (player.textTracks())[trackIdx];
            if (videoJsTrack.cues) {
                for (let cueIdx = videoJsTrack.cues.length - 1; cueIdx >= 0; cueIdx--) {
                    videoJsTrack.removeCue(videoJsTrack.cues[cueIdx]);
                }
            }
        }
        updateCuesForVideoJsTrack(props, videoJsTrack);
    }
};

class VideoPlayer extends React.Component<Props> {
    public player: VideoJsPlayer;
    private readonly videoNode?: RefObject<HTMLVideoElement>;
    playSegmentPauseTimeout?: number;
    playPromise: Promise<void> | undefined;
    public wavesurfer: WaveSurfer;
    private readonly waveformRef?: RefObject<HTMLDivElement>;
    private readonly waveformTimelineRef?: RefObject<HTMLDivElement>;


    constructor(props: Props) {
        super(props);

        this.player = {} as VideoJsPlayer; // Keeps Typescript compiler quiet. Feel free to remove if you know how.
        this.videoNode = React.createRef();
        this.waveformRef = React.createRef();
        this.waveformTimelineRef = React.createRef();
    }

    public componentDidMount(): void {
        const textTrackOptions = this.props.tracks.map(convertToTextTrackOptions);
        const options = {
            playbackRates: PLAYBACK_RATES,
            sources: [{ src: this.props.mp4, type: "video/mp4" }],
            poster: this.props.poster,
            tracks: textTrackOptions,
            fluid: true,
            aspectRatio: "16:9",
            userActions: {
                hotkeys: true
            }
        } as VideoJsPlayerOptions;

        if (isSafari()) {
            options.html5 = {
                nativeTextTracks: false
            };
        }

        this.player = videojs(this.videoNode?.current as Element, options) as VideoJsPlayer;
        this.player.textTracks().addEventListener("addtrack", (event: TrackEvent) => {
            const videoJsTrack = event.track as TextTrack;
            updateCuesForVideoJsTrack(this.props, videoJsTrack, this.props.trackFontSizePercent);
        });
        this.player.on("timeupdate", (): void => {
            if (this.props.onTimeChange) {
                this.props.onTimeChange(this.player.currentTime());
            }
        });

        registerPlayerShortcuts(this);

        videojs.setFormatTime((x: number): string =>
            getTimeString(x, (hours: number): boolean => hours === 0)
        );

        if (this.props.waveformVisible) {
            this.loadWaveform();
        }
    }

    componentDidUpdate(prevProps: Props): void {
        const lastCueChange = this.props.lastCueChange;
        const videoJsTrack = (this.player.textTracks())[0];
        if (lastCueChange && videoJsTrack && videoJsTrack.cues) {
            handleCueEditIfNeeded(lastCueChange, videoJsTrack.cues[lastCueChange.index] as VTTCue,
                prevProps.trackFontSizePercent);
            handleCueAddIfNeeded(lastCueChange, videoJsTrack, prevProps.trackFontSizePercent);
            updateVideoJsTrackIfNeeded(this.props, lastCueChange, videoJsTrack, this.player);
            if (lastCueChange.changeType === "REMOVE") {
                videoJsTrack.removeCue(videoJsTrack.cues[lastCueChange.index]);
            }
            videoJsTrack.dispatchEvent(new Event("cuechange"));
        }

        if (this.props.waveformVisible && !prevProps.waveformVisible && !this.wavesurfer) {
            this.loadWaveform();
        }
        if (!this.props.waveformVisible && prevProps.waveformVisible && this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = undefined;
        }
        if (this.props.timecodesUnlocked !== prevProps.timecodesUnlocked && this.wavesurfer) {
            this.reloadRegions();
        }

        if (lastCueChange && this.wavesurfer) {
            if (lastCueChange.vttCue && lastCueChange.changeType === "EDIT") {
                this.updateRegion(lastCueChange.index, lastCueChange.vttCue.startTime, lastCueChange.vttCue.endTime,
                    lastCueChange.vttCue.text);
            } else if (lastCueChange.changeType === "ADD") {
                // if adding at the end we can just add, else we need to remove all then add
                if (lastCueChange.vttCue && lastCueChange.index >= (this.props.cues?.length || 0) - 1) {
                    this.addRegion(lastCueChange.index, lastCueChange.vttCue.startTime, lastCueChange.vttCue.endTime,
                        lastCueChange.vttCue.text, randomColor());
                } else {
                    this.reloadRegions();
                }
            // TODO: Enhance this condition somehow
            } else if (
                lastCueChange.changeType === "REMOVE"
                || lastCueChange.changeType === "SPLIT"
                || lastCueChange.changeType === "MERGE"
                || lastCueChange.changeType === "UPDATE_ALL"
            ) {
                this.reloadRegions();
            }
        }

        if (this.props.playSection !== undefined
            && this.props.resetPlayerTimeChange
            && this.props.playSection.startTime >= 0
            && prevProps.playSection !== this.props.playSection) {
            // avoid showing 2 captions lines at the same time
            const startTime = this.props.playSection.startTime + ONE_MILLISECOND;
            const endTime = this.props.playSection.endTime;
            this.player.currentTime(startTime);
            this.playPromise = this.player.play();
            if (endTime) {
                // for some reason it was stopping around 100ms short
                const waitTime = ((endTime - startTime) * 1000) + 100;
                this.playSegmentPauseTimeout = window.setTimeout(() => {
                    this.pauseVideo();
                    // avoid showing 2 captions lines at the same time
                    this.player.currentTime(endTime - ONE_MILLISECOND);
                }, waitTime);
            }
            this.props.resetPlayerTimeChange();
        }
    }

    private loadWaveform() {
        const mediaLength = this.props.mediaLength;
        if (this.props.waveform && mediaLength !== undefined) {
            fetch(this.props.waveform,
                { headers: { "Content-Type": "application/json", "Accept": "application/json" }})
                .then((response) => response.json())
                .then((peaksData) => {
                    if (this.waveformRef?.current) {
                        this.wavesurfer = WaveSurfer.create({
                            container: this.waveformRef.current,
                            // normalize by the maximum peak when true,
                            // which overrides barHeight
                            normalize: false,
                            scrollParent: true,
                            minimap: true,
                            partialRender: true,
                            cursorColor: "#007bff",
                            cursorWidth: 2,
                            backend: "MediaElement",
                            removeMediaElementOnDestroy: false,
                            height: 100,
                            pixelRatio: 1,
                            barHeight: 0.01, // set height of the waveform bars
                            plugins: [
                                RegionsPlugin.create({
                                    dragSelection: false
                                }),
                                TimelinePlugin.create({
                                    container: this.waveformTimelineRef?.current
                                })
                            ]
                        });

                        this.wavesurfer.zoom(80);

                        this.wavesurfer.load(
                            this.videoNode?.current,
                            peaksData.data,
                            "auto",
                            mediaLength * ONE_MILLISECOND
                        );

                        this.wavesurfer.seekTo(0);

                        this.wavesurfer.on("region-update-end", (updatedRegion: WaveformRegion) => {
                            if (this.props.updateCueTimecodes) {
                                this.props.updateCueTimecodes(updatedRegion.id, updatedRegion.start, updatedRegion.end);
                            }
                        });

                        this.props.cues?.forEach((cue: CueDto, cueIndex: number) => {
                            this.addRegion(cueIndex, cue.vttCue.startTime, cue.vttCue.endTime, cue.vttCue.text,
                                randomColor());
                        });
                    }
                });
        }
    }

    private formatRegionTime = (start: number, end: number) =>
        (start == end ? [start] : [start, end]).map((time: number) =>
            moment(parseFloat(time.toFixed(3)) * 1000).format("mm:ss:SSS")).join("-");

    private addRegion(index: number, start: number, end: number, text: string, color: string) {
        if (this.props.mediaLength && start <= this.props.mediaLength * ONE_MILLISECOND) {
            this.wavesurfer?.addRegion({
                id: index,
                start,
                end,
                color,
                attributes: { label: text.replace(/<[^>]*>/g, "") },
                loop: false,
                drag: false,
                resize: this.props.timecodesUnlocked || false,
                formatTimeCallback: this.formatRegionTime
            });
        }
    }

    private updateRegion(index: number, start: number, end: number, text: string): void {
        const region = this.wavesurfer.regions.list[index];
        if (region) {
            region.remove();
            this.addRegion(index, start, end, text, region.color);
        }
    }

    private removeAllRegions(): void {
        this.wavesurfer.regions.clear();
    }

    private reloadRegions(): void {
        this.removeAllRegions();
        this.props.cues?.forEach((cue: CueDto, cueIndex: number) => {
            this.addRegion(cueIndex, cue.vttCue.startTime, cue.vttCue.endTime, cue.vttCue.text,
                randomColor());
        });
    }

    public getTime(): number {
        return this.player.currentTime() * SECOND;
    }

    public shiftTime(delta: number): void {
        const deltaInSeconds = delta / SECOND;
        const newTimeInSeconds = this.player.currentTime() + deltaInSeconds;
        this.player.currentTime(newTimeInSeconds);
    }

    public playPause(): void {
        if (this.player.paused()) {
            this.playPromise = this.player.play();
        } else {
            this.pauseVideo();
        }
    }

    private pauseVideo(): void {
        if (this.playPromise !== undefined) {
            this.playPromise.then(() => {
                this.player.pause();
            });
        } else {
            this.player.pause();
        }
    }

    public render(): ReactElement {
        return (
            <div>
                <video
                    id="video-player"
                    ref={this.videoNode}
                    style={{ margin: "auto" }}
                    className="video-js vjs-default-skin vjs-big-play-centered"
                    poster={this.props.poster}
                    controls
                    preload="none"
                    data-setup="{}"
                />
                {
                     this.props.waveform && this.props.mediaLength ?
                         <div
                             className="sbte-waveform overflow-hidden"
                             hidden={!this.props.waveformVisible}
                         >
                             <div ref={this.waveformRef} />
                             <div ref={this.waveformTimelineRef} />
                         </div>
                        : null
                }
            </div>
        );
    }
}

export default VideoPlayer;
