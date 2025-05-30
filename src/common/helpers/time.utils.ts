export interface Interval {
    start: number;
    end: number;
}

export function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function subtractInterval(intervals: Interval[], toSubtract: Interval): Interval[] {
    const overlapping = intervals.filter(
        interval => interval.start < toSubtract.end && interval.end > toSubtract.start
    );

    if (overlapping.length !== 1) {
        return intervals;
    }

    const intervalToDivide = overlapping[0];
    const result: Interval[] = [];

    for (const currentInterval of intervals) {
        if (currentInterval !== intervalToDivide) {
            result.push(currentInterval);
        } else {
            if (intervalToDivide.start < toSubtract.start) {
                result.push({ start: intervalToDivide.start, end: Math.min(intervalToDivide.end, toSubtract.start) });
            }
            if (intervalToDivide.end > toSubtract.end) {
                result.push({ start: Math.max(intervalToDivide.start, toSubtract.end), end: intervalToDivide.end });
            }
        }
    }

    return result;
}

export function getDatesBetween(startDate: string, days: number): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }
    return dates;
}