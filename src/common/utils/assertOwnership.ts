import { ForbiddenException } from '@nestjs/common';

/**
 * Asserts that the current user is the owner of the resource.
 * Throws a ForbiddenException if the user is not the owner.
 *
 * @param resourceOwnerId The ID of the resource owner
 * @param currentUserId The ID of the current user
 * @param message Optional custom message for the exception
 */
export function assertOwnership(
  resourceOwnerId: number,
  currentUserId: number,
  message = 'You are not authorized to access this resource',
): void {
  if (resourceOwnerId !== currentUserId) {
    throw new ForbiddenException(message);
  }
}
