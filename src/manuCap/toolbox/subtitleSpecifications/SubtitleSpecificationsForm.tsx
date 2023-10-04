import { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SubtitleSpecification } from "../model";

export interface Props {
    subTitleSpecifications: SubtitleSpecification;
}

const speakerIdentificationValues = {
    NONE: "None",
    FIRST_NAME: "First Name",
    FULLNAME: "Full Name",
    NUMBERED: "Numbered",
    GENDER: "Gender",
    GENRE: "Genre",
    SEE_COMMENTS: "See Comments"
};
const dialogueStyleValues = {
    LINE_BREAKS: "Line Breaks",
    DOUBLE_CHEVRON: "Double Chevron",
    NO_DASHES: "No Dashes",
    SEE_COMMENTS: "See Comments"
};

const millisToSeconds = (millis: number | null): string => millis ? "" + (millis / 1000) : "n/a";

// Disable following rule because if returned HtmlAnchorElement it requires to initialize all element props
/* eslint-disable @typescript-eslint/no-explicit-any */
const LinkNewTabRenderer = (props: HTMLLinkElement): any =>
    <a href={props.href} rel="noopener noreferrer" target="_blank">{props.children}</a>;

const SubtitleSpecificationsForm = (props: Props): ReactElement => (
    <>
        <label><strong>Enabled:&nbsp;</strong></label>
        <label>{props.subTitleSpecifications.enabled ? "Yes" : "No"}</label>
        <hr className="my-4" />
        {props.subTitleSpecifications.enabled ? (
            <>
                <div style={{ display: "flex", marginRight: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong> Audio Tags:&nbsp;</strong></label>
                            <label>{props.subTitleSpecifications.audioDescription ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>On-Screen Text:&nbsp;</strong></label>
                            <label>{props.subTitleSpecifications.onScreenText ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>Spoken Audio:&nbsp;</strong></label>
                            <label>{props.subTitleSpecifications.spokenAudio ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>Speaker Identification:&nbsp;</strong></label>
                            <label>
                                {speakerIdentificationValues[props.subTitleSpecifications.speakerIdentification]}
                            </label>
                        </div>
                        <div>
                            <label><strong>Dialogue Style:&nbsp;</strong></label>
                            <label>
                                {dialogueStyleValues[props.subTitleSpecifications.dialogueStyle]}
                            </label>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                            <label>
                                {
                                    props.subTitleSpecifications.maxLinesPerCaption
                                        ? props.subTitleSpecifications.maxLinesPerCaption
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Caption Line:&nbsp;</strong></label>
                            <label>
                                {
                                    props.subTitleSpecifications.maxCharactersPerLine
                                        ? props.subTitleSpecifications.maxCharactersPerLine
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Second Per Caption:&nbsp;</strong></label>
                            <label>
                                {
                                    props.subTitleSpecifications.maxCharactersPerSecondPerCaption
                                        ? props.subTitleSpecifications.maxCharactersPerSecondPerCaption
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>
                                {millisToSeconds(props.subTitleSpecifications.minCaptionDurationInMillis)}
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>
                                {millisToSeconds(props.subTitleSpecifications.maxCaptionDurationInMillis)}
                            </label>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <label><strong>Comments:&nbsp;</strong></label>
                <ReactMarkdown
                    renderers={{ link: LinkNewTabRenderer, linkReference: LinkNewTabRenderer }}
                    source={props.subTitleSpecifications.comments}
                    disallowedTypes={["html"]}
                    plugins={[remarkGfm]}
                    className="sbte-subspec-freeform-text sbte-subspec-comments"
                />
            </>
        ) : null}
        <div style={{ marginTop: "10px" }}>
            <label><strong>Media Notes:&nbsp;</strong></label>
            <ReactMarkdown
                renderers={{ link: LinkNewTabRenderer, linkReference: LinkNewTabRenderer }}
                source={props.subTitleSpecifications.mediaNotes ? props.subTitleSpecifications.mediaNotes : ""}
                disallowedTypes={["html"]}
                plugins={[remarkGfm]}
                className="sbte-subspec-freeform-text sbte-media-notes"
            />
        </div>
    </>
);

export default SubtitleSpecificationsForm;
