import "../../../testUtils/initBrowserEnvironment";

import { Provider } from "react-redux";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import testingStore from "../../../testUtils/testingStore";
import { render } from "@testing-library/react";

describe("SubtitleSpecificationsForm", () => {
    it("renders disabled", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "",
            projectId: "",
            enabled: false,
            audioDescription: false,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "",
            dialogueStyle: "",
            maxLinesPerCaption: 0,
            maxCharactersPerLine: 0,
            minCaptionDurationInMillis: 0,
            maxCaptionDurationInMillis: 0,
            maxCharactersPerSecondPerCaption: 0,
            comments: "",
            mediaNotes: ""
        };

        const expectedNode = render(
            <Provider store={testingStore}>
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>No</label>
                <hr className="my-4" />
                <div style={{ marginTop: "10px" }}>
                    <label><strong>Media Notes:&nbsp;</strong></label>
                    <div className="sbte-subspec-freeform-text sbte-media-notes" />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled with media notes", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "",
            projectId: "",
            enabled: false,
            audioDescription: false,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "",
            dialogueStyle: "",
            maxLinesPerCaption: 0,
            maxCharactersPerLine: 0,
            minCaptionDurationInMillis: 0,
            maxCaptionDurationInMillis: 0,
            maxCharactersPerSecondPerCaption: 0,
            comments: "",
            mediaNotes: "test notes"
        };

        const expectedNode = render(
            <Provider store={testingStore}>
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>No</label>
                <hr className="my-4" />
                <div style={{ marginTop: "10px" }}>
                    <label><strong>Media Notes:&nbsp;</strong></label>
                    <div className="sbte-subspec-freeform-text sbte-media-notes"><p>test notes</p></div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders enabled", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: true,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "GENDER",
            dialogueStyle: "LINE_BREAKS",
            maxLinesPerCaption: 1,
            maxCharactersPerLine: 40,
            minCaptionDurationInMillis: 1000,
            maxCaptionDurationInMillis: 3000,
            maxCharactersPerSecondPerCaption: 60,
            comments: "sample **comment** ~~test~~",
            mediaNotes: "media **notes** ~~test~~"
        };

        const expectedNode = render(
            <Provider store={testingStore}>
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>Yes</label>
                <hr className="my-4" />
                <div style={{ display: "flex", marginRight: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong> Audio Tags:&nbsp;</strong></label>
                            <label>Yes</label>
                        </div>
                        <div>
                            <label><strong>On-Screen Text:&nbsp;</strong></label>
                            <label>No</label>
                        </div>
                        <div>
                            <label><strong>Spoken Audio:&nbsp;</strong></label>
                            <label>No</label>
                        </div>
                        <div>
                            <label><strong>Speaker Identification:&nbsp;</strong></label>
                            <label>Gender</label>
                        </div>
                        <div>
                            <label><strong>Dialogue Style:&nbsp;</strong></label>
                            <label>Line Breaks</label>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                            <label>1</label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Caption Line:&nbsp;</strong></label>
                            <label>40</label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Second Per Caption:&nbsp;</strong></label>
                            <label>60</label>
                        </div>
                        <div>
                            <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>1</label>
                        </div>
                        <div>
                            <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>3</label>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <label><strong>Comments:&nbsp;</strong></label>
                <div className="sbte-subspec-freeform-text sbte-subspec-comments">
                    <p>sample <strong>comment</strong> <del>test</del></p>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <label><strong>Media Notes:&nbsp;</strong></label>
                    <div className="sbte-subspec-freeform-text sbte-media-notes">
                        <p>media <strong>notes</strong> <del>test</del></p>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML)
            .toEqual(expectedNode.container.outerHTML);
    });

    it("renders null character and length limitation values", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: true,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "GENDER",
            dialogueStyle: "LINE_BREAKS",
            maxLinesPerCaption: null,
            maxCharactersPerLine: null,
            minCaptionDurationInMillis: null,
            maxCaptionDurationInMillis: null,
            maxCharactersPerSecondPerCaption: null,
            comments: "sample **comment** ~~test~~",
            mediaNotes: "media **notes** ~~test~~"
        };

        const expectedNode = render(
            <Provider store={testingStore}>
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>Yes</label>
                <hr className="my-4" />
                <div style={{ display: "flex", marginRight: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong> Audio Tags:&nbsp;</strong></label>
                            <label>Yes</label>
                        </div>
                        <div>
                            <label><strong>On-Screen Text:&nbsp;</strong></label>
                            <label>No</label>
                        </div>
                        <div>
                            <label><strong>Spoken Audio:&nbsp;</strong></label>
                            <label>No</label>
                        </div>
                        <div>
                            <label><strong>Speaker Identification:&nbsp;</strong></label>
                            <label>Gender</label>
                        </div>
                        <div>
                            <label><strong>Dialogue Style:&nbsp;</strong></label>
                            <label>Line Breaks</label>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                            <label>n/a</label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Caption Line:&nbsp;</strong></label>
                            <label>n/a</label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Second Per Caption:&nbsp;</strong></label>
                            <label>n/a</label>
                        </div>
                        <div>
                            <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>n/a</label>
                        </div>
                        <div>
                            <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>n/a</label>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <label><strong>Comments:&nbsp;</strong></label>
                <div className="sbte-subspec-freeform-text sbte-subspec-comments">
                    <p>sample <strong>comment</strong> <del>test</del></p>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <label><strong>Media Notes:&nbsp;</strong></label>
                    <div className="sbte-subspec-freeform-text sbte-media-notes">
                        <p>media <strong>notes</strong> <del>test</del></p>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML)
            .toEqual(expectedNode.container.outerHTML);
    });

    describe("renders media notes markdown links", () => {
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: true,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "GENDER",
            dialogueStyle: "LINE_BREAKS",
            maxLinesPerCaption: 1,
            maxCharactersPerLine: 40,
            minCaptionDurationInMillis: 1000,
            maxCaptionDurationInMillis: 3000,
            maxCharactersPerSecondPerCaption: 60,
            comments: "This is a sample comment"
        };

        it("enforce links to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com\" rel=\"noopener noreferrer\"" +
                " target=\"_blank\">here</a>";

            subTitleSpecifications.mediaNotes = "Please click [here](https://google.com)";


            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-media-notes a")?.outerHTML).toEqual(expectedMediaNotes);
        });

        it("enforce link references to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com\" rel=\"noopener noreferrer\"" +
                " target=\"_blank\">google</a>";
            subTitleSpecifications.mediaNotes = "This is [google][1], and that means subtitles.\n" +
                    "\n" +
                    "[1]: <https://google.com> \"Google\"";

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-media-notes a")?.outerHTML).toEqual(expectedMediaNotes);
        });

        it("enforce img links to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com/images/bootstrap/logo.png\"" +
                " rel=\"noopener noreferrer\" target=\"_blank\">" +
                "<img src=\"https://google.com/images/bootstrap/logo.png\" alt=\"test\"></a>";
            subTitleSpecifications.mediaNotes = "[![test](https://google.com/images/bootstrap/logo.png)]" +
                    "(https://google.com/images/bootstrap/logo.png)";


            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-media-notes a")?.outerHTML).toEqual(expectedMediaNotes);
        });
    });

    describe("renders subtitle specs comments markdown links", () => {
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: true,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "GENDER",
            dialogueStyle: "LINE_BREAKS",
            maxLinesPerCaption: 1,
            maxCharactersPerLine: 40,
            minCaptionDurationInMillis: 1000,
            maxCaptionDurationInMillis: 3000,
            maxCharactersPerSecondPerCaption: 60,
            comments: "This is a sample media node"
        };

        it("enforce links to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com\" rel=\"noopener noreferrer\"" +
                " target=\"_blank\">here</a>";

            subTitleSpecifications.comments = "Please click [here](https://google.com)";


            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-subspec-comments a")?.outerHTML)
                .toEqual(expectedMediaNotes);
        });

        it("enforce link references to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com\" rel=\"noopener noreferrer\"" +
                " target=\"_blank\">google</a>";
            subTitleSpecifications.comments = "This is [google][1], and that means subtitles.\n" +
                    "\n" +
                    "[1]: <https://google.com> \"Google\"";

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-subspec-comments a")?.outerHTML)
                .toEqual(expectedMediaNotes);
        });

        it("enforce img links to open in a new tab", () => {
            // GIVEN
            const expectedMediaNotes = "<a href=\"https://google.com/images/bootstrap/logo.png\"" +
                " rel=\"noopener noreferrer\" target=\"_blank\">" +
                "<img src=\"https://google.com/images/bootstrap/logo.png\" alt=\"test\"></a>";
            subTitleSpecifications.comments = "[![test](https://google.com/images/bootstrap/logo.png)]" +
                    "(https://google.com/images/bootstrap/logo.png)";


            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications} />
                </Provider>
            );

            // THEN

            expect(actualNode.container.querySelector(".sbte-subspec-comments a")?.outerHTML)
                .toEqual(expectedMediaNotes);
        });
    });
});
