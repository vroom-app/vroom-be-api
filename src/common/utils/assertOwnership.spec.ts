import { ForbiddenException } from '@nestjs/common';
import { assertOwnership } from './assertOwnership';

describe('assertOwnership', () => {
  it('should not throw when user owns the resource', () => {
    const resourceOwnerId = 1;
    const currentUserId = 1;

    expect(() => assertOwnership(resourceOwnerId, currentUserId)).not.toThrow();
  });

  it('should throw ForbiddenException when user does not own the resource', () => {
    const resourceOwnerId = 1;
    const currentUserId = 2;

    expect(() => assertOwnership(resourceOwnerId, currentUserId)).toThrow(
      new ForbiddenException('You are not authorized to access this resource'),
    );
  });

  it('should throw ForbiddenException with custom message', () => {
    const resourceOwnerId = 1;
    const currentUserId = 2;
    const customMessage = 'Custom unauthorized message';

    expect(() =>
      assertOwnership(resourceOwnerId, currentUserId, customMessage),
    ).toThrow(new ForbiddenException(customMessage));
  });

  it('should handle string user IDs', () => {
    expect(() => assertOwnership(1, 1)).not.toThrow();
    expect(() => assertOwnership(1, 2)).toThrow(ForbiddenException);
  });

  it('should handle zero as valid user ID', () => {
    expect(() => assertOwnership(0, 0)).not.toThrow();
    expect(() => assertOwnership(0, 1)).toThrow(ForbiddenException);
  });
});
