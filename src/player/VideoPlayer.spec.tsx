// @ts-ignore I couldn't come up with syntax that would be fine for this import
import * as jsdomGlobal from "jsdom-global";
jsdomGlobal();

import { assert } from "chai";
import * as enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
// import * as proxyquire from "proxyquire";
import * as React from "react";
// import * as sinon from "sinon";
import { removeVideoPlayerDynamicValue } from "../testUtils.spec";
import VideoPlayer from "./VideoPlayer";

enzyme.configure({ adapter: new Adapter() });

// const videoJsFake = sinon.stub();
// const VideoPlayerProxy = proxyquire(
//     "./VideoPlayer", {
//         "video.js": videoJsFake,
//     },
// );

// const getVideoJSStubReturn = () => {
//     const elStub = sinon.stub();
//     elStub.returns({ parentElement: {} });
//     const widthStub = sinon.stub();
//     widthStub.returns({ height: sinon.stub() });
//     const currentSrcStub = sinon.stub();
//     currentSrcStub.returns({ });
//     const triggerStub = sinon.stub();
//     return {
//         currentSrc: currentSrcStub,
//         dotsubCaptions: sinon.stub(),
//         el: elStub,
//         on: sinon.stub(),
//         trigger: triggerStub,
//         watermark: sinon.stub,
//         width: widthStub,
//     };
// };

test("VideoPlayer renders correctly with viewportHeightPerc prop", () => {
    // GIVEN
    const expectedVideoView = enzyme.mount(
        <div>
            <VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url" />
        </div>
    );

    // WHEN
    const actualVideoView = enzyme.mount(
        <div>
            <VideoPlayer
                id="testvpid"
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                viewportHeightPerc={0.5}
            />
        </div>
    );

    // THEN
    assert.deepEqual(removeVideoPlayerDynamicValue(actualVideoView.html()),
        removeVideoPlayerDynamicValue(expectedVideoView.html()));
});

    // it("calls captions trigger on videojs player if mediaId not present when captions change", () => {
    //     // GIVEN
    //     videoJsFake.reset();
    //     const videoJsStub = getVideoJSStubReturn();
    //     videoJsFake.returns(videoJsStub);
    //
    //     const captions = [
    //         {
    //             content: "The Peach Open Move Project Presents",
    //             dialogueType: "DIALOGUE",
    //             end: 3000,
    //             horizontalPosition: "CENTER",
    //             inlineStyles: [],
    //             start: 0,
    //             startOfParagraph: false,
    //             verticalPosition: "BOTTOM"
    //         }
    //     ];
    //
    //     // WHEN
    //     const actualNode = enzyme.mount(
    //         <VideoPlayerProxy
    //             viewportHeightPerc={.5}
    //             poster="dummyPosterUrl"
    //             webm="dummyWebmUrl"
    //         />
    //     );
    //
    //     actualNode.setProps({ captions });
    //
    //     // THEN
    //     sinon.assert.calledWith(
    //         videoJsStub.trigger,
    //         "captions",
    //         captions
    //     );
    // });
    //
    // it("does not call captions trigger on videojs player if mediaId present when captions change", () => {
    //     // GIVEN
    //     videoJsFake.reset();
    //     const videoJsStub = getVideoJSStubReturn();
    //     videoJsStub.dotsubSelector = sinon.stub();
    //     videoJsFake.returns(videoJsStub);
    //
    //     const captions = [
    //         {
    //             content: "The Peach Open Move Project Presents",
    //             dialogueType: "DIALOGUE",
    //             end: 3000,
    //             horizontalPosition: "CENTER",
    //             inlineStyles: [],
    //             start: 0,
    //             startOfParagraph: false,
    //             verticalPosition: "BOTTOM"
    //         }
    //     ];
    //
    //     // WHEN
    //     const actualNode = enzyme.mount(
    //         <VideoPlayerProxy
    //             viewportHeightPerc={.5}
    //             mediaId="testMediaId"
    //             poster="dummyPosterUrl"
    //             webm="dummyWebmUrl"
    //         />,
    //     );
    //
    //     actualNode.setProps({ captions });
    //
    //     // THEN
    //     sinon.assert.notCalled(videoJsStub.trigger);
    // });
    //
    // it("initializes videoJs with correct playback rates", () => {
    //     // GIVEN
    //     videoJsFake.reset();
    //     const videoJsStub = getVideoJSStubReturn();
    //     videoJsFake.returns(videoJsStub);
    //     // WHEN
    //     enzyme.mount(
    //         <VideoPlayerProxy
    //             viewportHeightPerc={.5}
    //             poster="dummyPosterUrl"
    //             webm="dummyWebmUrl"
    //         />
    //     );
    //
    //     // THEN
    //     assert.deepEqual(videoJsFake.getCall(0).args[1].playbackRates, [ 0.5, 0.75, 1, 1.25 ]);
    // });
// });
