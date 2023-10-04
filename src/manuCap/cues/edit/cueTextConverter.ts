import { Options, stateToHTML } from "draft-js-export-html";
import { ContentState } from "draft-js";


const spaceHtml = "&nbsp;";

const orderedVttToHtmlConversions = [
    { from: "\n", to: "<br>" }
];

export const convertVttToHtml = (vtt: string): string => {
    let html = vtt;
    orderedVttToHtmlConversions.forEach(
        vttToHtml => html = html.replace(new RegExp(vttToHtml.from, "g"), vttToHtml.to)
    );
    return html;
};

/**
 * We are removing <br> here, because converter is sometimes returning "\n<br>" and sometimes "<br>\n".
 * It can be related to this issue: https://github.com/sstur/draft-js-utils/issues/62.
 * I am not 100% sure why this is happening. I tried "\n<br> -> \n" and "<br>\n -> \n" replacements, but
 * one or the other doesn't work fully and applying both of them might cause problems where new lines are removed
 * Notice we are applying these replacement rules sequentially so if we would have "<br>\n<br>\n<br>",
 * which would probably represent "\n\n\n", applying both ("\n<br> -> \n" and "<br>\n -> \n") would end up in "\n\n".
 * Therefore I would rather avoid reducing number of line breaks type of rules (e.g. "\n<br> -> \n")
 * Update: there was some spaces returned as html ASCII code so adding replacement to normal spaces for those too
 */
const orderedHtmlToVttConversions = [
    { from: "<br>", to: "" },
    { from: "<br/>", to: "" },
    { from: spaceHtml, to: " " }
];

export const convertHtmlToVtt = (html: string): string => {
    let vtt = html;
    orderedHtmlToVttConversions.forEach(
        htmlToVtt => vtt = vtt.replace(new RegExp(htmlToVtt.from, "g"), htmlToVtt.to)
    );
    return vtt;
};

// @ts-ignore Cast to Options is needed, because "@types/draft-js-export-html" library doesn't allow null
// defaultBlockTag, but it is allowed in their docs: https://www.npmjs.com/package/draft-js-export-html#defaultblocktag
// TODO: if this would be updated in types definition, we can remove this explicit cast + ts-ignore
const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: { element: "b" },
        ITALIC: { element: "i" },
    },
    defaultBlockTag: null
} as Options;

export const getVttText = (currentContent: ContentState): string => {
    const htmlText = !currentContent.hasText() ? "" : stateToHTML(currentContent, convertToHtmlOptions);
    return convertHtmlToVtt(htmlText);
};
