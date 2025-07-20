import { NotFoundException } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';

/**
 * Utility function to assert that an operation affected at least one row.
 * Throws a NotFoundException if no rows were affected.
 *
 * @param result The result of the delete or update operation
 * @param message Optional custom message for the exception
 * @throws NotFoundException if no rows were affected
 */
export function assertAffected(
  result: DeleteResult | UpdateResult,
  message = 'Entity not found'
): void {
  if (result.affected === 0) {
    throw new NotFoundException(message);
  }
}