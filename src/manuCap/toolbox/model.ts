export interface SubtitleSpecification {
    subtitleSpecificationId: string;
    projectId: string;
    enabled: boolean;
    audioDescription: boolean;
    onScreenText: boolean;
    spokenAudio: boolean;
    speakerIdentification: string;
    dialogueStyle: string;
    maxLinesPerCaption: number | null;
    maxCharactersPerLine: number | null;
    minCaptionDurationInMillis: number | null;
    maxCaptionDurationInMillis: number | null;
    maxCharactersPerSecondPerCaption: number | null;
    comments: string;
    mediaNotes?: string;
}
