import { NotFoundException } from '@nestjs/common';

/**
 * Utility function to assert that an entity is present.
 * Throws a NotFoundException if the entity is null or undefined.
 *
 * @param entity The entity to check
 * @param message Optional custom message for the exception
 * @returns The entity if it exists
 * @throws NotFoundException if the entity does not exist
 */
export function assertEntityPresent<T>(entity: T | null | undefined, message = 'Entity not found'): T {
  if (!entity) {
    throw new NotFoundException(message);
  }
  return entity;
}