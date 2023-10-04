import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { mount } from "enzyme";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { CueDto, Track, WaveformRegion } from "../model";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateCues } from "../cues/cuesList/cuesListActions";
import { updateEditingTrack } from "../trackSlices";
import { act } from "react-dom/test-utils";
import { waveformVisibleSlice } from "./waveformSlices";
import { saveCueUpdateSlice } from "../cues/saveCueUpdateSlices";

let testingStore = createTestingStore();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    timecodesUnlocked: true
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

// @ts-ignore we are just mocking
jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue({
        data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
    })
});

const updateCueMock = jest.fn();

describe("EditingVideoPlayer", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
    });

    it("renders without player if track is not defined", () => {
        // GIVEN
        const expectedNode = mount(<p>Editing track not available!</p>);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with player if track is defined", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget
        const expectedNode = mount(
            <video
                id="video-player_html5_api"
                style={{ margin: "auto" }}
                className="vjs-tech"
                poster="dummyPoster"
                preload="none"
                data-setup="{}"
                tabIndex={-1}
            />
        );
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.update();
        const videoNode = actualNode.find("video");

        // THEN
        expect(videoNode.html()).toEqual(expectedNode.html());
    });

    it("passes down cues array with correct language when first rendered", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const expectedLanguageCuesArray = [
            {
                languageId: "en-US",
                cues: [
                    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
                    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
                ]
            }
        ];

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // THEN
        const languageCuesArray = actualNode.find(VideoPlayer).props().languageCuesArray;
        expect(languageCuesArray[0].cues[0].vttCue).toEqual(expectedLanguageCuesArray[0].cues[0].vttCue);
        expect(languageCuesArray[0].cues[1].vttCue).toEqual(expectedLanguageCuesArray[0].cues[1].vttCue);
    });

    it("passes down correct properties when updated", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(actualNode.find(VideoPlayer).props().mp4).toEqual("dummyMp4");
        expect(actualNode.find(VideoPlayer).props().poster).toEqual("dummyPoster");
        expect(actualNode.find(VideoPlayer).props().tracks[0]).toEqual(testingTrack);
        expect(actualNode.find(VideoPlayer).props().tracks.length).toEqual(1);
        expect(actualNode.find(VideoPlayer).props().onTimeChange).toEqual(handleTimeChange);
    });

    it("adjust new player time to negative value so that it can be changed to same value again", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(playVideoSection(2) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(actualNode.find(VideoPlayer).props().playSection).toEqual({ startTime: -1 });
    });

    it("enable waveform by default", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    waveform="dummyWaveform"
                    mediaLength={1801000}
                    onTimeChange={handleTimeChange}
                />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(testingStore.getState().waveformVisible).toBeTruthy();
    });

    it("updates cues timecodes when waveform regions are manually updated", async () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(waveformVisibleSlice.actions.setWaveformVisible(true));
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" waveform="dummyWaveform" mediaLength={120000} />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        const videoPlayer = actualNode.find(VideoPlayer);
        const actualComponent = videoPlayer.instance() as VideoPlayer;
        const regionUpdate = { id: 1, start: 1, end: 3.4567 } as WaveformRegion;
        actualComponent.wavesurfer.fireEvent("region-update-end", regionUpdate);

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.4567);
    });
});
