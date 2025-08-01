import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Business } from 'src/business/entities/business.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';

/**
 * Asserts that the user owns all the service offerings for a given business
 * @param businessId The ID of the business
 * @param serviceOfferings Array of service offerings to check ownership for
 * @param errorMessage Custom error message template (optional)
 * @throws ForbiddenException if any service offering doesn't belong to the business
 */
export function assertServiceOwnership(
  business: Business,
  serviceId: number,
  errorMessage?: string,
): void {
  if (!business.serviceOfferings || business.serviceOfferings.length === 0) {
    throw new NotFoundException(
      `No services belong to business ${business.id}`,
    );
  }

  // Find the specific service offering
  const serviceExists = business.serviceOfferings.some(
    (service) => service.id.toString() === serviceId.toString(),
  );

  if (!serviceExists) {
    const defaultMessage = `Service with ID ${serviceId} not found in business ${business.id}`;
    throw new ForbiddenException(errorMessage || defaultMessage);
  }
}
