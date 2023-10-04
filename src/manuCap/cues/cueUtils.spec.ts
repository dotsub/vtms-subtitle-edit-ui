import "video.js"; // import VTTCue type
import
{
    copyNonConstructorProperties,
    findPositionIcon,
    Position,
    positionIcons,
    PositionStyle,
    positionStyles,
} from "./cueUtils";
import each from "jest-each";

// @ts-ignore
let userAgentGetter;

describe("cueUtils", () => {
    describe("copyNonConstructorProperties", () => {
        beforeEach(() => {
            userAgentGetter = jest.spyOn(window.navigator, "userAgent", "get");
        });

        it("copies non-constructor properties from old cue to new one", () => {
            // GIVEN
            const newVttCue = new VTTCue(0, 1, "new text");
            const oldVttCue = new VTTCue(1, 2, "old text");
            const region = new VTTRegion();
            region.lines = 10;
            oldVttCue.position = 10;
            oldVttCue.align = "center";
            oldVttCue.region = region;
            oldVttCue.snapToLines = true;
            oldVttCue.size = 100;
            oldVttCue.line = 5;
            oldVttCue.vertical = "lr";
            oldVttCue.id = "someId";
            oldVttCue.pauseOnExit = true;
            oldVttCue.positionAlign = "line-left";
            oldVttCue.lineAlign = "end";

            // WHEN
            copyNonConstructorProperties(newVttCue, oldVttCue);

            // THEN
            expect(newVttCue.text).toEqual("new text");
            expect(newVttCue.startTime).toEqual(0);
            expect(newVttCue.endTime).toEqual(1);

            expect(newVttCue.position).toEqual(10);
            expect(newVttCue.align).toEqual("center");
            // @ts-ignore If it would be null -> test fails
            expect(newVttCue.region.lines).toEqual(10);
            expect(newVttCue.snapToLines).toEqual(true);
            expect(newVttCue.size).toEqual(100);
            expect(newVttCue.line).toEqual(5);
            expect(newVttCue.vertical).toEqual("lr");
            expect(newVttCue.id).toEqual("someId");
            expect(newVttCue.pauseOnExit).toEqual(true);
            expect(newVttCue.positionAlign).toEqual("line-left");
            expect(newVttCue.lineAlign).toEqual("end");
        });

        it("handles missing attributes", () => {
            // GIVEN
            const newVttCue = new VTTCue(0, 1, "new text");
            const oldVttCue = new VTTCue(1, 2, "old text");
            const region = new VTTRegion();
            region.lines = 10;
            oldVttCue.region = region;

            // WHEN
            copyNonConstructorProperties(newVttCue, oldVttCue);

            // THEN
            expect(newVttCue.text).toEqual("new text");
            expect(newVttCue.startTime).toEqual(0);
            expect(newVttCue.endTime).toEqual(1);

            expect(newVttCue.position).toEqual("auto");
            expect(newVttCue.align).toEqual("center");
            // @ts-ignore If it would be null -> test fails
            expect(newVttCue.region.lines).toEqual(10);
            expect(newVttCue.snapToLines).toEqual(true);
            expect(newVttCue.size).toEqual(100);
            expect(newVttCue.line).toEqual("auto");
            expect(newVttCue.vertical).toEqual("");
            expect(newVttCue.id).toEqual("");
            expect(newVttCue.pauseOnExit).toEqual(false);
            expect(newVttCue.positionAlign).toEqual("auto");
            expect(newVttCue.lineAlign).toEqual("start");
        });

        it("copies non-constructor properties from old cue to new one (safari)", () => {
            // GIVEN
            // @ts-ignore
            userAgentGetter.mockReturnValue("Safari 13.1.1");

            const newVttCue = new VTTCue(0, 1, "new text");
            const oldVttCue = new VTTCue(1, 2, "old text");
            oldVttCue.line = "auto";

            // WHEN
            copyNonConstructorProperties(newVttCue, oldVttCue);

            // THEN
            expect(newVttCue.line).toEqual(-1);
        });

        it("handles when cue.line value is a string with numeric value", () => {
            // GIVEN
            const newVttCue = new VTTCue(0, 1, "new text");
            const oldVttCue = new VTTCue(1, 2, "old text");

            // WHEN
            // @ts-ignore We are trying to test a typing mismatch case.
            copyNonConstructorProperties(newVttCue, { ...oldVttCue, line: "0" });

            // THEN
            expect(newVttCue.line).toEqual(0);
        });
    });

    describe("positionStyles", () => {
        it("are immutable", () => {
            // WHEN
            positionStyles.set(
                Position.Row1Column1,
                { line: 16, align: "center", positionAlign: "auto", position: 51 }
            );

            // THEN
            expect(positionStyles.get(Position.Row1Column1))
                .toEqual({ line: 0, align: "start", positionAlign: "center", position: 51 });
        });

        // noinspection DuplicatedCode
        each([
            [Position.Row1Column1, { line: 0, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row1Column2, { line: 0, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row1Column3, { line: 0, align: "center", positionAlign: "auto", position: "auto"  }],
            [Position.Row1Column4, { line: 0, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row1Column5, { line: 0, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row2Column1, { line: 4, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row2Column2, { line: 4, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row2Column3, { line: 4, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row2Column4, { line: 4, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row2Column5, { line: 4, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row3Column1, { line: 8, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row3Column2, { line: 8, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row3Column3, { line: 8, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row3Column4, { line: 8, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row3Column5, { line: 8, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row4Column1, { line: 12, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row4Column2, { line: 12, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row4Column3, { line: 12, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row4Column4, { line: 12, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row4Column5, { line: 12, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row5Column1, { line: 15, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row5Column2, { line: 15, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row5Column3, { line: "auto", align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row5Column4, { line: 15, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row5Column5, { line: 15, align: "end", positionAlign: "center", position: 49 }],
        ])
            .it("are correctly initialized", (testingPosition: Position, expectedPositionStyle: PositionStyle) => {
                // WHEN
                const actualPositionStyle = positionStyles.get(testingPosition);

                // THEN
                expect(actualPositionStyle).toEqual(expectedPositionStyle);
            });
    });

    describe("positionIcons", () => {
        // noinspection DuplicatedCode
        each([
            [0, Position.Row1Column1, "↖↖", "6px" ],
            [1, Position.Row1Column2, "↖↑", "9px" ],
            [2, Position.Row1Column3, "↑↑", "13px" ],
            [3, Position.Row1Column4, "↑↗", "11px" ],
            [4, Position.Row1Column5, "↗↗", "6px" ],
            [5, Position.Row2Column1, "↖←", "6px" ],
            [6, Position.Row2Column2, "↖", "13px" ],
            [7, Position.Row2Column3, "↑", "16px" ],
            [8, Position.Row2Column4, "↗", "13px" ],
            [9, Position.Row2Column5, "→↗", "6px" ],
            [10, Position.Row3Column1, "←←", "5px" ],
            [11, Position.Row3Column2, "←", "12px" ],
            [12, Position.Row3Column3, "•", "16px" ],
            [13, Position.Row3Column4, "→", "12px" ],
            [14, Position.Row3Column5, "→→", "5px" ],
            [15, Position.Row4Column1, "↙←", "6px" ],
            [16, Position.Row4Column2, "↙", "13px" ],
            [17, Position.Row4Column3, "↓", "16px" ],
            [18, Position.Row4Column4, "↘", "13px" ],
            [19, Position.Row4Column5, "→↘", "6px" ],
            [20, Position.Row5Column1, "↙↙", "6px" ],
            [21, Position.Row5Column2, "↙↓", "9px" ],
            [22, Position.Row5Column3, "↓↓", "13px" ],
            [23, Position.Row5Column4, "↓↘", "11px" ],
            [24, Position.Row5Column5, "↘↘", "6px" ],
        ])
            .it("are correctly initialized", (
                index: number,
                expectedPosition: Position,
                expectedIconText: string,
                expectedLeftPadding: string
            ) => {
                // WHEN
                const actualPositionIcon = positionIcons[index];

                // THEN
                expect(actualPositionIcon.position).toEqual(expectedPosition);
                expect(actualPositionIcon.iconText).toEqual(expectedIconText);
                expect(actualPositionIcon.leftPadding).toEqual(expectedLeftPadding);
            });
    });

    describe("findPositionIcon", () => {
        beforeEach(() => {
            userAgentGetter = jest.spyOn(window.navigator, "userAgent", "get");
        });

        it("finds icon for Row2Column2 position", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 4;
            vttCue.align = "start";
            vttCue.positionAlign = "center";
            vttCue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↖");
        });

        it("finds icon for Row4Column3 position", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 12;
            vttCue.align = "center";
            vttCue.positionAlign = "auto";
            vttCue.position = "auto";

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓");
        });

        it("finds icon for default position (non-safari)", () => {
            // GIVEN
            // @ts-ignore
            userAgentGetter.mockReturnValue("Mozilla/5.0 (Macintosh; Intel) Chrome/83.0.4103.116 Safari/537.36");

            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = "auto";
            vttCue.align = "center";
            vttCue.positionAlign = "auto";
            vttCue.position = "auto";

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("finds icon for default position (safari)", () => {
            // GIVEN
            // @ts-ignore
            userAgentGetter.mockReturnValue("Safari 13.1.1");

            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = -1;
            vttCue.align = "center";
            vttCue.positionAlign = "auto";
            vttCue.position = "auto";

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if line parameter is not from positionStyles list", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 16;
            vttCue.align = "start";
            vttCue.positionAlign = "center";
            vttCue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if align parameter is not from positionStyles list", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 4;
            vttCue.align = "left";
            vttCue.positionAlign = "center";
            vttCue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if positionAlign parameter is not from positionStyles list", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 4;
            vttCue.align = "start";
            vttCue.positionAlign = "line-left";
            vttCue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if position parameter is not from positionStyles list", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some text");
            vttCue.line = 4;
            vttCue.align = "start";
            vttCue.positionAlign = "center";
            vttCue.position = 22;

            // WHEN
            const actualPositionIcon = findPositionIcon(vttCue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });
    });
});
