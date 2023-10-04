import * as React from "react";
import Mousetrap from "mousetrap";
import { os } from "platform";
import { KeyboardEventHandler } from "react";

export enum Character {
    O_CHAR = 79,
    K_CHAR = 75,
    B_CHAR = 66,
    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,
    SLASH_CHAR = 191,
    ENTER = 13,
    ESCAPE = 27,
    SPACE = 32,
    TAB = 9
}

export enum KeyCombination {
    MOD_SHIFT_O = "mod+shift+o",
    ALT_SHIFT_O = "alt+shift+o",
    MOD_SHIFT_K = "mod+shift+k",
    ALT_SHIFT_K = "alt+shift+k",
    MOD_SHIFT_LEFT = "mod+shift+left",
    ALT_SHIFT_LEFT = "alt+shift+left",
    MOD_SHIFT_UP = "mod+shift+up",
    ALT_SHIFT_UP = "alt+shift+up",
    MOD_SHIFT_RIGHT = "mod+shift+right",
    ALT_SHIFT_RIGHT = "alt+shift+right",
    MOD_SHIFT_DOWN = "mod+shift+down",
    ALT_SHIFT_DOWN = "alt+shift+down",
    MOD_SHIFT_SLASH = "mod+shift+/",
    ALT_SHIFT_SLASH = "alt+shift+/",
    ESCAPE = "escape",
    ENTER = "enter",
    MOD_SHIFT_ESCAPE = "mod+shift+escape",
    ALT_SHIFT_ESCAPE = "alt+shift+escape"
}

export const mousetrapBindings = new Map<string, KeyCombination>();
mousetrapBindings.set("togglePlayPause", KeyCombination.MOD_SHIFT_O);
mousetrapBindings.set("togglePlayPauseCue", KeyCombination.MOD_SHIFT_K);
mousetrapBindings.set("seekBack", KeyCombination.MOD_SHIFT_LEFT);
mousetrapBindings.set("seekAhead", KeyCombination.MOD_SHIFT_RIGHT);
mousetrapBindings.set("setStartTime", KeyCombination.MOD_SHIFT_UP);
mousetrapBindings.set("setEndTime", KeyCombination.MOD_SHIFT_DOWN);
mousetrapBindings.set("toggleShortcutPopup", KeyCombination.MOD_SHIFT_SLASH);
mousetrapBindings.set("closeEditor", KeyCombination.ESCAPE);
mousetrapBindings.set("editNext", KeyCombination.ENTER);
mousetrapBindings.set("editPrevious", KeyCombination.MOD_SHIFT_ESCAPE);

export const characterBindings = new Map<Character, string>();
characterBindings.set(Character.O_CHAR, "togglePlayPause");
characterBindings.set(Character.K_CHAR, "togglePlayPauseCue");
characterBindings.set(Character.ARROW_LEFT, "seekBack");
characterBindings.set(Character.ARROW_RIGHT, "seekAhead");
characterBindings.set(Character.ARROW_UP, "setStartTime");
characterBindings.set(Character.ARROW_DOWN, "setEndTime");
characterBindings.set(Character.SLASH_CHAR, "toggleShortcutPopup");
characterBindings.set(Character.ESCAPE, "editPrevious");

export const getActionByKeyboardEvent = (e: React.KeyboardEvent<KeyboardEventHandler>): string | undefined => {
    const action = characterBindings.get(e.keyCode);
    if (e.shiftKey && (e.metaKey || e.altKey || e.ctrlKey) && action) {
        return action;
    }
    return undefined;
};

export const triggerMouseTrapAction = (e: React.KeyboardEvent<KeyboardEventHandler>): void => {
    const action = getActionByKeyboardEvent(e);
    if (action) {
        const mouseTrapAction = mousetrapBindings.get(action);
        if (mouseTrapAction != null)
            Mousetrap.trigger(mouseTrapAction);
    }
};

export const getShortcutAsText = (char: string): string => {
    const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
    return commandKey + "/Alt + Shift + " + char;
};
