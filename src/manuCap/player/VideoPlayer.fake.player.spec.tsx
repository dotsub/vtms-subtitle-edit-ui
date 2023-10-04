import "../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { CueDto, LanguageCues, Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import videojs from "video.js";
import React from "react";

jest.useFakeTimers();
jest.mock("video.js");

const O_CHAR = 79;
const LEFT = 37;
const RIGHT = 39;

interface FakeTextTrack {
    cues: VTTCue[];
}

interface FakeTextTrackList {
    addEventListener(type: string, listener: (this: TextTrackList, event: TrackEvent) => void): void;
}

const initialTestingTracks = [
    { type: "CAPTION", language: { id: "en-US" }, default: true },
    { type: "TRANSLATION", language: { id: "es-ES" }, default: false }
] as Track[];

const initialTestingLanguageCuesArray = [
    {
        languageId: "en-US",
        cues: [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ]
    },
    {
        languageId: "es-ES",
        cues: [
            { vttCue: new VTTCue(0, 1, "Translation Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Translation Line 2"), cueCategory: "DIALOGUE" },
        ]
    },
] as LanguageCues[];

describe("VideoPlayer tested with fake player", () => {
    it("executes play via keyboard shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const playerMock = {
            paused: (): boolean => true,
            play,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(play).toBeCalled();
    });

    it("executes pause via keyboard shortcut", () => {
        // GIVEN
        const pause = jest.fn();
        const playerMock = {
            pause,
            paused: (): boolean => false,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(pause).toBeCalled();
    });

    it("executes pause via keyboard shortcut with playPromise present", async () => {
        // GIVEN
        const pause = jest.fn();
        const playerMock = {
            pause,
            paused: (): boolean => false,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        actualComponent.playPromise = Promise.resolve();

        // WHEN
        await simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(pause).toBeCalled();
    });

    it("shifts playback forward via keyboard shortcut", () => {
        // GIVEN
        const currentTime = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: RIGHT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(6);
    });

    it("shifts playback backwards via keyboard shortcut", () => {
        // GIVEN
        const currentTime = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: LEFT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(4);
    });

    it("returns currentTime", () => {
        // GIVEN
        const playerMock = {
            currentTime: (): number => 5,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const component = videoNode.instance() as VideoPlayer;

        // WHEN
        const actualTime = component.getTime();

        // THEN
        expect(actualTime).toEqual(5000);
    });

    it("plays video section from cue start time", () => {
        // GIVEN
        const play = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            paused: (): boolean => true,
            play,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1 }, resetPlayerTimeChange });

        // THEN
        expect(currentTime).toBeCalledTimes(1);
        expect(play).toBeCalled();
        expect(resetPlayerTimeChange).toBeCalled();
    });

    it("plays video section from cue start time and pauses at end time", () => {
        // GIVEN
        const play = jest.fn();
        const pause = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            paused: (): boolean => true,
            play,
            pause,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1, endTime: 1.2 }, resetPlayerTimeChange });
        jest.runAllTimers();

        // THEN
        expect(currentTime).toBeCalledWith(1.001);
        expect(currentTime).toBeCalledWith(1.199);
        expect(play).toBeCalled();
        expect(pause).toBeCalled();
        expect(resetPlayerTimeChange).toBeCalled();
    });

    it("plays video section from cue start time and does not pause again if paused shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const pause = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            paused: (): boolean => false,
            play,
            pause,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );


        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1, endTime: 1.2 }, resetPlayerTimeChange });
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });
        jest.runAllTimers();

        // THEN
        expect(play).toBeCalled();
        expect(currentTime).toBeCalledWith(1.001);
        expect(currentTime).not.toBeCalledWith(1.199);
        expect(pause).toBeCalled();
        expect(pause).toBeCalledTimes(1);
        expect(resetPlayerTimeChange).toBeCalled();
    });

    it("plays video section from cue start time and does not pause again if shift forward shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const pause = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        currentTime.mockReturnValueOnce(2);
        const playerMock = {
            paused: (): boolean => false,
            play,
            pause,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );


        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1, endTime: 3.2 }, resetPlayerTimeChange });
        simulant.fire(document.documentElement, "keydown", { keyCode: RIGHT, shiftKey: true, altKey: true });
        jest.runAllTimers();

        // THEN
        expect(play).toBeCalled();
        expect(currentTime).toBeCalledWith(1.001);
        expect(currentTime).toBeCalledWith(3);
        expect(currentTime).not.toBeCalledWith(3.199);
        expect(pause).not.toBeCalled();
        expect(resetPlayerTimeChange).toBeCalled();
    });

    it("plays video section from cue start time and does not pause again if shift backward shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const pause = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        currentTime.mockReturnValueOnce(2);
        const playerMock = {
            paused: (): boolean => false,
            play,
            pause,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );


        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1, endTime: 3.2 }, resetPlayerTimeChange });
        simulant.fire(document.documentElement, "keydown", { keyCode: LEFT, shiftKey: true, altKey: true });
        jest.runAllTimers();

        // THEN
        expect(play).toBeCalled();
        expect(currentTime).toBeCalledWith(1.001);
        expect(currentTime).toBeCalledWith(1);
        expect(currentTime).not.toBeCalledWith(3.199);
        expect(pause).not.toBeCalled();
        expect(resetPlayerTimeChange).toBeCalled();
    });

    it("doesn't play video section if start time is less than 0", () => {
        // GIVEN
        const play = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            paused: (): boolean => true,
            play,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );


        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: -1 }, resetPlayerTimeChange });

        // THEN
        expect(currentTime).not.toBeCalled();
        expect(play).not.toBeCalled();
        expect(resetPlayerTimeChange).not.toBeCalled();
    });

    it("doesn't play video section if resetPlayerTimeChange callback is not defined", () => {
        // GIVEN
        const play = jest.fn();
        const currentTime = jest.fn();
        const resetPlayerTimeChange = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            paused: (): boolean => true,
            play,
            currentTime,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: [],
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );


        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({ playSection: { startTime: 1 }});

        // THEN
        expect(currentTime).not.toBeCalled();
        expect(play).not.toBeCalled();
        expect(resetPlayerTimeChange).not.toBeCalled();
    });

    it("update track content when cue is edited", () => {
        // GIVEN
        const captionCues = [new VTTCue(0, 1, "Caption Line 1"), new VTTCue(1, 2, "Caption Line 2")];
        const textTracks = [
            {
                language: "en-US",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 2,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 1, "Updated Caption") }}
        );

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Updated Caption");
    });

    it("update track content when cue is added to the middle of cues array", () => {
        // GIVEN
        const captionCues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
            new VTTCue(2, 3, "Caption Line 3"),
            new VTTCue(3, 4, "Caption Line 4")
        ];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 4,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "ADD", index: 1, vttCue: new VTTCue(0, 1, "Updated Caption") }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Caption Line 1");
        expect(textTracks[0].cues[1].text).toEqual("Updated Caption");
        expect(textTracks[0].cues[2].text).toEqual("Caption Line 2");
        expect(textTracks[0].cues[3].text).toEqual("Caption Line 3");
        expect(textTracks[0].cues[4].text).toEqual("Caption Line 4");
    });

    it("update track content when cue is added to the end of cues array", () => {
        // GIVEN
        const captionCues = [new VTTCue(0, 1, "Caption Line 1"), new VTTCue(1, 2, "Caption Line 2")];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 2,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "ADD", index: 2, vttCue: new VTTCue(0, 1, "Updated Caption") }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Caption Line 1");
        expect(textTracks[0].cues[1].text).toEqual("Caption Line 2");
        expect(textTracks[0].cues[2].text).toEqual("Updated Caption");
    });

    it("update track content when cue is added to the start of cues array", () => {
        // GIVEN
        const captionCues = [new VTTCue(0, 1, "Caption Line 1"), new VTTCue(1, 2, "Caption Line 2")];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 2,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "ADD", index: 0, vttCue: new VTTCue(0, 1, "Updated Caption") }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Updated Caption");
        expect(textTracks[0].cues[1].text).toEqual("Caption Line 1");
        expect(textTracks[0].cues[2].text).toEqual("Caption Line 2");
    });

    it("update track content when cue is deleted", () => {
        // GIVEN
        const captionCues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
            new VTTCue(2, 3, "Caption Line 3"),
            new VTTCue(3, 4, "Caption Line 4")
        ];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 4,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "REMOVE", index: 1, vttCue: new VTTCue(0, 0, "") }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Caption Line 1");
        expect(textTracks[0].cues[1].text).toEqual("Caption Line 3");
        expect(textTracks[0].cues[2].text).toEqual("Caption Line 4");
    });

    it("does not edit cue if not doesn't exist in track already", () => {
        // GIVEN
        const captionCues = [new VTTCue(0, 1, "Caption Line 1"), new VTTCue(1, 2, "Caption Line 2")];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 2,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "EDIT", index: 3, vttCue: new VTTCue(0, 1, "Updated Caption") }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Caption Line 1");
        expect(textTracks[0].cues[1].text).toEqual("Caption Line 2");
        expect(textTracks[0].cues).toHaveLength(2);
    });

    it("replaces track content when all cues are updated", () => {
        // GIVEN
        const captionCues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
            new VTTCue(2, 3, "Caption Line 3"),
            new VTTCue(3, 4, "Caption Line 4")
        ];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 4,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        const newCaptionCues = [
            { vttCue: new VTTCue(0, 1, "New Caption Line A"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "New Caption Line B"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "New Caption Line C"), cueCategory: "DIALOGUE" }
        ];

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "UPDATE_ALL", index: -1 },
            cues: newCaptionCues,
            languageCuesArray: [{ languageId: "en-US", cues: newCaptionCues }] as LanguageCues[]
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("New Caption Line A");
        expect(textTracks[0].cues[1].text).toEqual("New Caption Line B");
        expect(textTracks[0].cues[2].text).toEqual("New Caption Line C");
        expect(textTracks[0].cues).toHaveLength(3);
    });

    it("replaces track content when cues are merged", () => {
        // GIVEN
        const captionCues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
            new VTTCue(2, 3, "Caption Line 3"),
            new VTTCue(3, 4, "Caption Line 4")
        ];
        const textTracks = [
            {
                language: "en-US",
                addCue: (cue: VTTCue): number => captionCues.push(cue),
                removeCue: (cue: VTTCue): VTTCue[] => captionCues.splice(captionCues.indexOf(cue), 1),
                length: 4,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );
        const newCaptionCues = [
            { vttCue: new VTTCue(0, 4, "Caption Line 1 Caption Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 3"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Caption Line 4"), cueCategory: "DIALOGUE" }
        ] as CueDto[];

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "MERGE", index: 2, vttCue: new VTTCue(0, 2, "Caption Line 1") },
            cues: newCaptionCues,
            languageCuesArray: [{ languageId: "en-US", cues: newCaptionCues }] as LanguageCues[]
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Caption Line 1 Caption Line 2");
        expect(textTracks[0].cues[1].text).toEqual("Caption Line 3");
        expect(textTracks[0].cues[2].text).toEqual("Caption Line 4");
        expect(textTracks[0].cues).toHaveLength(3);
    });

    it("maintains cue styles when cue is updated", () => {
        // GIVEN
        const textTracks = [
            {
                language: "en-US",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 1,
                cues: [new VTTCue(0, 1, "Caption Line 1")],
                dispatchEvent: jest.fn()
            }
        ];
        textTracks["addEventListener"] = jest.fn();
        const updatedVttCue = new VTTCue(0, 1, "Updated Caption");
        updatedVttCue.position = 60;
        updatedVttCue.align = "start";

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        actualNode.setProps({
            // @ts-ignore I only need to update these props
            lastCueChange: { changeType: "EDIT", index: 0, vttCue: updatedVttCue }
        });

        // THEN
        expect(textTracks[0].cues[0].text).toEqual("Updated Caption");
        expect(textTracks[0].cues[0].align).toEqual("start");
        expect(textTracks[0].cues[0].position).toEqual(60);
    });

    it("Ensures set format time is called", () => {
        // GIVEN
        const textTracks = [
            {
                language: "en-US",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 4000,
                cues: [new VTTCue(0, 1, "Caption Line 1")],
                dispatchEvent: jest.fn()
            }
        ];
        textTracks["addEventListener"] = jest.fn();

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const properties = {
            poster: "http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg",
            mp4: "http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4",
            tracks: initialTestingTracks,
            languageCuesArray: initialTestingLanguageCuesArray,
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (<VideoPlayer {...props} />), properties)
        );

        // WHEN
        // @ts-ignore I only need to update these props
        actualNode.setProps({});


        // THEN
        expect(videojs.setFormatTime).toBeCalled();
    });

    describe("customize track position", () => {
        it("does not customize track position if passed an auto position", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "Caption Line 1");
            const testingLine = "auto";
            const captionCues = [vttCue];
            const textTracks = [
                {
                    language: "en-US",
                    addCue: jest.fn(),
                    removeCue: jest.fn(),
                    length: 1,
                    cues: captionCues,
                    dispatchEvent: jest.fn()
                },
            ];
            textTracks["addEventListener"] = jest.fn();

            const playerMock = {
                textTracks: (): FakeTextTrack[] => textTracks,
                on: jest.fn()
            };

            // @ts-ignore - we are mocking the module
            videojs.mockImplementationOnce(() => playerMock);
            const properties = {
                poster: "dummyPosterUrl",
                mp4: "dummyMp4Url",
                tracks: initialTestingTracks,
                languageCuesArray: initialTestingLanguageCuesArray,
                lastCueChange: null,
                trackFontSizePercent: 0.5
            };
            const actualNode = mount(
                React.createElement(props => (<VideoPlayer {...props} />), properties)
            );

            // WHEN
            vttCue.line = testingLine;
            actualNode.setProps(
                // @ts-ignore I only need to update these props
                { lastCueChange: { changeType: "EDIT", index: 0, vttCue: vttCue }}
            );

            // THEN
            expect(textTracks[0].cues[0].line).toEqual("auto");
        });

        it("customize track position depending on font percent value passed when editing cue", () => {
            // GIVEN
            const fontPercent = 1.25;
            const vttCue = new VTTCue(0, 1, "Caption Line 1");
            const captionCues = [vttCue];
            const textTracks = [
                {
                    language: "en-US",
                    addCue: jest.fn(),
                    removeCue: jest.fn(),
                    length: 1,
                    cues: captionCues,
                    dispatchEvent: jest.fn()
                },
            ];
            textTracks["addEventListener"] = jest.fn();

            const playerMock = {
                textTracks: (): FakeTextTrack[] => textTracks,
                on: jest.fn()
            };

            // @ts-ignore - we are mocking the module
            videojs.mockImplementationOnce(() => playerMock);
            const properties = {
                poster: "dummyPosterUrl",
                mp4: "dummyMp4Url",
                tracks: initialTestingTracks,
                languageCuesArray: initialTestingLanguageCuesArray,
                lastCueChange: null,
                trackFontSizePercent: fontPercent
            };
            const actualNode = mount(
                React.createElement(props => (<VideoPlayer {...props} />), properties)
            );

            // WHEN
            const editingCue = new VTTCue(1, 2, "");
            editingCue.line = 12;
            const lastCueChange = { changeType: "EDIT", index: 0, vttCue: editingCue };
            // @ts-ignore I only need to update these props
            actualNode.setProps({ lastCueChange: lastCueChange });

            // THEN
            expect(textTracks[0].cues[0].line).toEqual(10);
            expect(lastCueChange.vttCue.line).toEqual(12);
        });

        it("customize track position depending on font percent value passed when add cue", () => {
            // GIVEN
            const fontPercent = 1.25;
            const vttCue = new VTTCue(0, 1, "Caption Line 1");
            vttCue.line = 4;
            const captionCues = [vttCue];
            const textTracks = [
                {
                    language: "en-US",
                    addCue: jest.fn(),
                    removeCue: jest.fn(),
                    length: 1,
                    cues: captionCues,
                    dispatchEvent: jest.fn()
                },
            ];
            textTracks["addEventListener"] = jest.fn();

            const playerMock = {
                textTracks: (): FakeTextTrack[] => textTracks,
                on: jest.fn()
            };

            // @ts-ignore - we are mocking the module
            videojs.mockImplementationOnce(() => playerMock);
            const properties = {
                poster: "dummyPosterUrl",
                mp4: "dummyMp4Url",
                tracks: initialTestingTracks,
                languageCuesArray: initialTestingLanguageCuesArray,
                lastCueChange: null,
                trackFontSizePercent: fontPercent
            };
            const actualNode = mount(
                React.createElement(props => (<VideoPlayer {...props} />), properties)
            );

            // WHEN
            const addedCue = new VTTCue(1, 2, "");
            const lastCueChange = { changeType: "ADD", index: 0, vttCue: addedCue };
            addedCue.line = 12;
            actualNode.setProps(
                // @ts-ignore I only need to update these props
                { lastCueChange: { changeType: "ADD", index: 0, vttCue: lastCueChange }}
            );

            // THEN
            expect(textTracks[0].cues[0].line).toEqual(3);
            expect(lastCueChange.vttCue.line).toEqual(12);
        });

    });

});
