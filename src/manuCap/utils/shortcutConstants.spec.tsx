import {
    Character,
    characterBindings,
    getActionByKeyboardEvent, getShortcutAsText,
    KeyCombination,
    mousetrapBindings,
    triggerMouseTrapAction
} from "./shortcutConstants";
import Mousetrap from "mousetrap";
import { os } from "platform";
import * as React from "react";
import { KeyboardEventHandler } from "react";


describe("shortcutConstants.spec", () => {

    it("fills characterBindings with Character as keys", () => {
        //THEN
        Array.from(characterBindings.keys()).forEach((key: Character) => {
            expect(Object.values(Character).includes(key));
        });
    });

    it("fills mousetrapBindings with KeyCombination as values", () => {
        //THEN
        Array.from(mousetrapBindings.values()).forEach((value: KeyCombination) => {
            expect(Object.values(KeyCombination).includes(value));
        });
    });

    describe("getActionByKeyboardEvent", () => {

        test.each(Object.values(Character))(
            "gets action from getActionByKeyboardEvent when the input is %s",
            (char: Character | string) => {
                //GIVEN
                const event =
                    { shiftKey: true, metaKey: true, keyCode: char } as React.KeyboardEvent<KeyboardEventHandler>;

                //WHEN
                const action = getActionByKeyboardEvent(event);

                //THEN
                //@ts-ignore since char can be string because we use object.values as iteration over the enum Character
                expect(action).toEqual(characterBindings.get(char));
            });

        it("returns undefined if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true,
                keyCode: Character.O_CHAR } as React.KeyboardEvent<KeyboardEventHandler>;

            //WHEN
            event.shiftKey = false;
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

        it("returns undefined if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true,
                keyCode: Character.O_CHAR } as React.KeyboardEvent<KeyboardEventHandler>;

            //WHEN
            event.keyCode = 33;
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

    });

    describe("triggerMouseTrapAction", () => {
        const mouseTrapTriggerSpy = jest.spyOn(Mousetrap, "trigger");
        beforeEach(() => {
            mouseTrapTriggerSpy.mockReset();
        });

        test.each([
            [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, true, true, false, false],
            [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, true, false],
            [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, false, true],
            [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, true, true, false, false],
            [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, true, false],
            [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, false, true],
            [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, true, true, false, false],
            [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, true, false],
            [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, false, true],
            [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, true, true, false, false],
            [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, true, false],
            [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, false, true],
            [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, true, true, false, false],
            [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, true, false],
            [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, false, true],
            [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, true, true, false, false],
            [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, true, false],
            [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, false, true],
            [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, true, true, false, false],
            [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, true, false],
            [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, false, true],
        ])(
            "triggers mousetrap action with combination %s",
            (expectedKeyCombination: string, char: Character | string,
             metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean ) => {
                //GIVEN
                const event = { shiftKey, metaKey, ctrlKey, altKey,
                    keyCode: char } as React.KeyboardEvent<KeyboardEventHandler>;

                //WHEN
                triggerMouseTrapAction(event);

                //THEN
                expect(mouseTrapTriggerSpy).toBeCalledWith(expectedKeyCombination);
            },
        );

        it("does not trigger mousetrap action if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true,
                keyCode: Character.O_CHAR } as React.KeyboardEvent<KeyboardEventHandler>;

            //WHEN
            event.shiftKey = false;
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

        it("does not trigger mousetrap action if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true,
                keyCode: Character.O_CHAR } as React.KeyboardEvent<KeyboardEventHandler>;

            //WHEN
            event.keyCode = 33;
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

    });

    describe("getShortcutAsText", () => {
        it("Returns shortcut as a text for the given char", () => {
            //GIVEN
            const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";

            // WHEN
            const shortcutAsText = getShortcutAsText("o");

            //THEN
            expect(shortcutAsText).toEqual(commandKey + "/Alt + Shift + o");
        });
    });


});
