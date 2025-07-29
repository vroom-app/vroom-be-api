import { DeleteResult, UpdateResult } from 'typeorm';
import { assertAffected } from './assertAffected';
import { NotFoundException } from '@nestjs/common';

describe('assertAffected', () => {
  it('should not throw when DeleteResult has affected rows', () => {
    const deleteResult: DeleteResult = { affected: 1, raw: {} };

    expect(() => assertAffected(deleteResult)).not.toThrow();
  });

  it('should not throw when UpdateResult has affected rows', () => {
    const updateResult: UpdateResult = {
      affected: 2,
      generatedMaps: [],
      raw: {},
    };

    expect(() => assertAffected(updateResult)).not.toThrow();
  });

  it('should throw NotFoundException when DeleteResult has no affected rows', () => {
    const deleteResult: DeleteResult = { affected: 0, raw: {} };

    expect(() => assertAffected(deleteResult)).toThrow(
      new NotFoundException('Entity not found'),
    );
  });

  it('should throw NotFoundException when UpdateResult has no affected rows', () => {
    const updateResult: UpdateResult = {
      affected: 0,
      generatedMaps: [],
      raw: {},
    };

    expect(() => assertAffected(updateResult)).toThrow(
      new NotFoundException('Entity not found'),
    );
  });

  it('should throw NotFoundException with custom message', () => {
    const customMessage = 'Custom not found message';
    const deleteResult: DeleteResult = { affected: 0, raw: {} };

    expect(() => assertAffected(deleteResult, customMessage)).toThrow(
      new NotFoundException(customMessage),
    );
  });

  it('should handle undefined affected property', () => {
    const result = { raw: {} } as DeleteResult;

    expect(() => assertAffected(result)).toThrow(
      new NotFoundException('Entity not found'),
    );
  });
});
