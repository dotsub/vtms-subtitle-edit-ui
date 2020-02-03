import "../testUtils/initBrowserEnvironment";
import { CueDto, Track } from "../subtitleEdit/model";
import { updateCues, updateEditingTrack } from "../subtitleEdit/trackSlices";
import EditingVideoPlayer from "./EditingVideoPlayer";
import { Provider } from "react-redux";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import testingStore from "../testUtils/testingStore";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

describe("EditingVideoPlayer", () => {
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        actualNode.update();

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("passes down correct properties", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        const expectedLanguageCuesArray = [
            {
                languageId: "en-US",
                cues: [
                    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ]
            }
        ];

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateCues(testingCues));
        actualNode.update();

        // THEN
        expect(actualNode.find(VideoPlayer).props().mp4).toEqual("dummyMp4");
        expect(actualNode.find(VideoPlayer).props().poster).toEqual("dummyPoster");
        expect(actualNode.find(VideoPlayer).props().tracks[0]).toEqual(testingTrack);
        expect(actualNode.find(VideoPlayer).props().tracks.length).toEqual(1);
        expect(actualNode.find(VideoPlayer).props().languageCuesArray).toEqual(expectedLanguageCuesArray);
    });
});
