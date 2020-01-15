import "video.js"; // import VTTCue type
import { copyNonConstructorProperties } from "./cueUtils";

describe("cueUtils", () => {
    describe("copyNonConstructorProperties", () => {
        it("copies non-constructor properties from old cue to new one", () => {
            // GIVEN
            const newCue = new VTTCue(0, 1, "new text");
            const oldCue = new VTTCue(1, 2, "old text");
            const region = new VTTRegion();
            region.lines = 10;
            oldCue.position = 10;
            oldCue.align = "start";
            oldCue.positionAlign = "left" as PositionAlignSetting;
            oldCue.region = region;
            oldCue.snapToLines = true;
            oldCue.size = 100;
            oldCue.lineAlign = "start";
            oldCue.line = 5;
            oldCue.vertical = "lr";
            oldCue.id = "someId";
            oldCue.pauseOnExit = true;

            // WHEN
            copyNonConstructorProperties(newCue, oldCue);

            // THEN
            expect(newCue.text).toEqual("new text");
            expect(newCue.startTime).toEqual(0);
            expect(newCue.endTime).toEqual(1);

            expect(newCue.position).toEqual(10);
            expect(newCue.align).toEqual("start");
            expect(newCue.positionAlign).toEqual("left");
            // @ts-ignore If it would be null -> test fails
            expect(newCue.region.lines).toEqual(10);
            expect(newCue.snapToLines).toEqual(true);
            expect(newCue.size).toEqual(100);
            expect(newCue.lineAlign).toEqual("start");
            expect(newCue.line).toEqual(5);
            expect(newCue.vertical).toEqual("lr");
            expect(newCue.id).toEqual("someId");
            expect(newCue.pauseOnExit).toEqual(true);
        });
    });
});
