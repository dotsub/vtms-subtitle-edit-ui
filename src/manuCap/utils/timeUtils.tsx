export interface TimeInUnits {
    hours: number;
    minutes: number;
    seconds: number;
    millis: number;
}

export const getTimeInUnits = (timeInSeconds: number): TimeInUnits => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor(timeInSeconds % 3600 / 60);
    const seconds = Math.floor(timeInSeconds % 3600 % 60);
    const time = timeInSeconds.toFixed(3);
    const millis = time.slice(-3);
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        millis: Number(millis)
    } as TimeInUnits;
};

const pad = (value: number, size: number): string => {
    return ("000" + value).slice(size * -1);
};

export const getTimeString = (timeInSeconds: number, hideHours?: Function): string => {
    const timeInUnits = getTimeInUnits(timeInSeconds);
    return((hideHours && hideHours(timeInUnits.hours) ? "": pad(timeInUnits.hours, 2) + ":")
        + pad(timeInUnits.minutes, 2) + ":"
        + pad(timeInUnits.seconds, 2) + "."
        + pad(timeInUnits.millis, 3));
};

export const getTimeFromString = (timeString: string): number => {
    const [firstPart, millis] = String(timeString).split(".");
    const [hours, minutes, seconds] = firstPart.split(":");
    return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds) + (Number(millis) / 1000);
};

export const formatStartOrEndTime = (value: string): string => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && value.includes(".") && value.substring(value.indexOf(".") + 1).length > 3) {
        return value.slice(0, (value.indexOf(".")) + 4);
    }
    return value;
};
