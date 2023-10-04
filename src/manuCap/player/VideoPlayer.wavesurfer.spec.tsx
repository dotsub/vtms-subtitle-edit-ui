import "../../testUtils/initBrowserEnvironment";
import { CueDto, LanguageCues, Track, WaveformRegion } from "../model";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import React from "react";

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
] as CueDto[];

const tracks = [
    { type: "CAPTION", language: { id: "en-US" }, default: true } as Track,
    { type: "TRANSLATION", language: { id: "es-ES" }, default: false } as Track
];

// @ts-ignore we are just mocking
jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue({
        data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
    })
});

describe("VideoPlayer with waveform", () => {
    it("initializes wavesurfer with correct options", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                timecodesUnlocked
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.params.normalize).toBeFalsy();
        expect(actualComponent.wavesurfer.params.scrollParent).toBeTruthy();
        expect(actualComponent.wavesurfer.params.minimap).toBeTruthy();
        expect(actualComponent.wavesurfer.params.partialRender).toBeTruthy();
        expect(actualComponent.wavesurfer.params.cursorColor).toEqual("#007bff");
        expect(actualComponent.wavesurfer.params.cursorWidth).toBeTruthy();
        expect(actualComponent.wavesurfer.params.backend).toEqual("MediaElement");
        expect(actualComponent.wavesurfer.params.removeMediaElementOnDestroy).toBeFalsy();
        expect(actualComponent.wavesurfer.params.height).toEqual(100);
        expect(actualComponent.wavesurfer.params.pixelRatio).toEqual(1);
        expect(actualComponent.wavesurfer.params.barHeight).toEqual(0.01);
        expect(actualComponent.wavesurfer.params.plugins.length).toEqual(2);
        expect(actualComponent.wavesurfer.params.plugins[0].name).toEqual("regions");
        expect(actualComponent.wavesurfer.params.plugins[1].name).toEqual("timeline");
        expect(actualComponent.wavesurfer.initialisedPluginList).toEqual({ regions: true, timeline: true });
        expect(actualComponent.wavesurfer.regions.params).toEqual({ dragSelection: false });
        expect(actualComponent.wavesurfer.regions.list[0].drag).toBeFalsy();
        expect(actualComponent.wavesurfer.regions.list[0].loop).toBeFalsy();
        expect(actualComponent.wavesurfer.regions.list[0].resize).toBeTruthy();
        expect(actualComponent.wavesurfer.regions.list[0].formatTimeCallback(0, 2)).toEqual("00:00:000-00:02:000");
        expect(actualComponent.wavesurfer.getCurrentTime()).toEqual(0);
    });

    it("initializes wavesurfer with regions", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
    });

    it("initializes wavesurfer with regions and ignores cues out of video time", async () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(21, 23, "Caption Line 3"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[2]).toBeUndefined();
    });

    it("creates wavesurfer region when cue is added at the end", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Added Caption");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
        expect(actualComponent.wavesurfer.regions.list[2].reset).toBeFalsy();
    });

    it("creates wavesurfer region when cue is added in the middle", async () => {
        // GIVEN
        const testCues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];
        const updatedCues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Added Caption"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues: testCues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { cues: updatedCues, lastCueChange: {
                changeType: "ADD", index: 1, vttCue: new VTTCue(2, 4, "Added Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Added Caption");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
        expect(actualComponent.wavesurfer.regions.list[2].reset).toBeFalsy();
    });

    it("updates wavesurfer region when cue is edited", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 1.123, "Updated Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Updated Caption");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1.123);
        expect(actualComponent.wavesurfer.regions.list[0].reset).toBeFalsy();
        expect(actualComponent.wavesurfer.regions.list[0].formatTimeCallback(0, 1.123)).toEqual("00:00:000-00:01:123");
    });

    it("removes wavesurfer region when cue is deleted", async () => {
        // GIVEN
        const updatedCues = [
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "REMOVE", index: 0, vttCue: new VTTCue(0, 0, "") },
            cues: updatedCues }
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1]).toBeUndefined();
    });

    it("updates wavesurfer region when cue is split", async () => {
        // GIVEN
        const splitCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1, 2, ""), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "SPLIT", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") },
                cues: splitCues }
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(4);
    });

    it("updates wavesurfer region when cues are merged", async () => {
        // GIVEN
        const mergedCues = [
            { vttCue: new VTTCue(0, 4, "Caption Line 1 Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "MERGE", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") },
                cues: mergedCues }
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1 Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1]).toBeUndefined();
    });

    it("updates wavesurfer regions when cues are updated", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [] as LanguageCues[],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));
        const newCaptionCues = [
            { vttCue: new VTTCue(0, 1, "New Caption Line A"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "New Caption Line B"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "New Caption Line C"), cueCategory: "DIALOGUE" }
        ] as CueDto[];

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "UPDATE_ALL", index: -1 },
            cues: newCaptionCues,
            languageCuesArray: [{ languageId: "en-US", cues: newCaptionCues }] as LanguageCues[]
        });

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("New Caption Line A");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("New Caption Line B");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("New Caption Line C");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(3);
        expect(actualComponent.wavesurfer.regions.list[3]).toBeUndefined();
    });

    it("hides waveform if no waveform url is present", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform=""
                waveformVisible
                mediaLength={20000}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const waveformNode = actualNode.find(".sbte-waveform");

        expect(waveformNode.get(0)).toBeUndefined();
    });

    it("hides waveform if mediaLength parameter is missing", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dymmyWaveform"
                waveformVisible
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const waveformNode = actualNode.find(".sbte-waveform");

        expect(waveformNode.get(0)).toBeUndefined();
    });

    it("hides waveform if waveform visible flag is false", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible={false}
                mediaLength={20000}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const waveformNode = actualNode.find(".sbte-waveform");

        expect(waveformNode.get(0).props.hidden).toBeTruthy();
    });

    it("doesn't update regions when cue is added if waveform is hidden", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ waveformVisible: false });
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer).toBeUndefined();
    });

    it("updates regions when cue is added if waveform is enabled after being hidden", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: false,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ waveformVisible: true });
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer).toBeDefined();
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Added Caption");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
    });

    it("updates cue timecodes when modifying waveform region", async () => {
        // GIVEN
        const updateCueTimecodes = jest.fn();
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: false,
            updateCueTimecodes,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ waveformVisible: true });
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));
        // @ts-ignore can't find the correct syntax
        const videoNode = actualNode.find("VideoPlayer");
        const actualComponent = videoNode.instance() as VideoPlayer;

        // THEN
        const regionUpdate = { id: 0, start: 0, end: 2.4567 } as WaveformRegion;
        actualComponent.wavesurfer.fireEvent("region-update-end", regionUpdate);

        expect(updateCueTimecodes).toHaveBeenCalledWith(0, 0, 2.4567);
    });

    it("updates wavesurfer regions when timecodes are unlocked", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            mediaLength: 20000,
            waveformVisible: true,
            timecodesUnlocked: false,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ timecodesUnlocked: true });

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].resize).toBeTruthy();
        expect(actualComponent.wavesurfer.regions.list[1].resize).toBeTruthy();
    });
});
