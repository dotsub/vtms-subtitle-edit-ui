import { LoadingIndicator, Track } from "../model";

export const isDirectTranslationTrack = (editingTrack: Track | null): boolean =>
    editingTrack !== null && editingTrack.type === "TRANSLATION" && !editingTrack.sourceLanguage;

export const hasDataLoaded = (editingTrack: Track | null, loadingIndicator: LoadingIndicator): boolean | null =>
    editingTrack && loadingIndicator.cuesLoaded
    && (editingTrack.type === "CAPTION" || loadingIndicator.sourceCuesLoaded || isDirectTranslationTrack(editingTrack));
