import { NotFoundException } from '@nestjs/common';
import { assertEntityPresent } from './assertEntity';

describe('assertEntityPresent', () => {
  it('should return entity when entity is present', () => {
    const entity = { id: 1, name: 'Test' };

    const result = assertEntityPresent(entity);

    expect(result).toBe(entity);
  });

  it('should throw NotFoundException when entity is null', () => {
    expect(() => assertEntityPresent(null)).toThrow(
      new NotFoundException('Entity not found'),
    );
  });

  it('should throw NotFoundException when entity is undefined', () => {
    expect(() => assertEntityPresent(undefined)).toThrow(
      new NotFoundException('Entity not found'),
    );
  });

  it('should throw NotFoundException with custom message', () => {
    const customMessage = 'Custom entity not found';

    expect(() => assertEntityPresent(null, customMessage)).toThrow(
      new NotFoundException(customMessage),
    );
  });
});
