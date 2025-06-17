import {
  parseTime,
  formatMinutes,
  subtractInterval,
  getDatesBetween,
  Interval,
} from './time.utils';

describe('Time Utils', () => {
  describe('parseTime', () => {
    it('should convert "09:30" to 570', () => {
      expect(parseTime('09:30')).toBe(570);
    });

    it('should convert "00:00" to 0', () => {
      expect(parseTime('00:00')).toBe(0);
    });

    it('should convert "23:59" to 1439', () => {
      expect(parseTime('23:59')).toBe(1439);
    });
  });

  describe('formatMinutes', () => {
    it('should convert 570 to "09:30"', () => {
      expect(formatMinutes(570)).toBe('09:30');
    });

    it('should convert 0 to "00:00"', () => {
      expect(formatMinutes(0)).toBe('00:00');
    });

    it('should convert 1439 to "23:59"', () => {
      expect(formatMinutes(1439)).toBe('23:59');
    });
  });

  describe('subtractInterval', () => {
    const original: Interval[] = [
      { start: 540, end: 600 }, // 09:00 - 10:00
    ];

    it('should subtract a middle portion (09:15 - 09:45)', () => {
      const result = subtractInterval(original, { start: 555, end: 585 });
      expect(result).toEqual([
        { start: 540, end: 555 },
        { start: 585, end: 600 },
      ]);
    });

    it('should remove whole interval if fully covered (09:00 - 10:00)', () => {
      const result = subtractInterval(original, { start: 540, end: 600 });
      expect(result).toEqual([]);
    });

    it('should cut from start (09:00 - 09:30)', () => {
      const result = subtractInterval(original, { start: 540, end: 570 });
      expect(result).toEqual([{ start: 570, end: 600 }]);
    });

    it('should cut from end (09:30 - 10:00)', () => {
      const result = subtractInterval(original, { start: 570, end: 600 });
      expect(result).toEqual([{ start: 540, end: 570 }]);
    });

    it('should ignore non-overlapping intervals', () => {
      const result = subtractInterval(original, { start: 610, end: 620 });
      expect(result).toEqual(original);
    });

    it('should do nothing when the toSubtract overlaps multiple intervals', () => {
      const multi: Interval[] = [
        { start: 480, end: 540 }, // 08:00 - 09:00
        { start: 560, end: 600 }, // 09:20 - 10:00
        { start: 620, end: 660 }, // 10:20 - 11:00
      ];
      const toSubtract: Interval = { start: 530, end: 630 };
      const result = subtractInterval(multi, toSubtract);
      expect(result).toEqual(multi);
    });

    it('should subtract only from the second interval', () => {
      const multi: Interval[] = [
        { start: 480, end: 540 }, // 08:00 - 09:00
        { start: 560, end: 600 }, // 09:20 - 10:00
        { start: 620, end: 660 }, // 10:20 - 11:00
      ];
      const toSubtract: Interval = { start: 570, end: 600 };
      const result = subtractInterval(multi, toSubtract);
      expect(result).toEqual([
        { start: 480, end: 540 },
        { start: 560, end: 570 },
        { start: 620, end: 660 },
      ]);
    });

    it('should subtract and split the second interval', () => {
      const multi: Interval[] = [
        { start: 480, end: 540 },
        { start: 560, end: 600 },
        { start: 620, end: 660 },
      ];
      const toSubtract: Interval = { start: 570, end: 590 };
      const result = subtractInterval(multi, toSubtract);
      expect(result).toEqual([
        { start: 480, end: 540 },
        { start: 560, end: 570 },
        { start: 590, end: 600 },
        { start: 620, end: 660 },
      ]);
    });
  });

  describe('getDatesBetween', () => {
    it('should return 3 dates starting from 2023-01-01', () => {
      const result = getDatesBetween('2023-01-01', 3);
      expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual([
        '2023-01-01',
        '2023-01-02',
        '2023-01-03',
      ]);
    });

    it('should return an empty array when days = 0', () => {
      expect(getDatesBetween('2023-01-01', 0)).toEqual([]);
    });
  });
});
