/**
 * Maps Prisma listing rows to the public API shape expected by the web app.
 */
export function toPublicListing(listing: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!listing || typeof listing !== 'object' || !listing.id) return null;

  const images = (listing.listingImages as Array<Record<string, unknown>> | undefined) || [];
  const ownerRaw = listing.owner as Record<string, unknown> | undefined;
  const count = ownerRaw?._count as { reviewsReceived?: number } | undefined;

  let owner: Record<string, unknown> | undefined;
  if (ownerRaw) {
    owner = {
      id: ownerRaw.id,
      firstName: ownerRaw.firstName,
      lastName: ownerRaw.lastName,
      trustLevel: ownerRaw.trustLevel,
      phone: ownerRaw.phone,
      averageRating: typeof ownerRaw.averageRating === 'number' ? ownerRaw.averageRating : 0,
      reviewCount: count?.reviewsReceived ?? 0,
    };
  }

  return {
    id: listing.id,
    ownerId: listing.ownerId,
    categoryId: listing.categoryId,
    title: listing.title,
    description: listing.description,
    pricePerDay: listing.pricePerDay,
    pricePerWeek: listing.pricePerWeek,
    pricePerMonth: listing.pricePerMonth,
    currency: listing.currency ?? 'ETB',
    minimumRentalDays: listing.minimumRentalDays,
    maximumRentalDays: listing.maximumRentalDays,
    region: listing.locationRegion,
    city: listing.locationCity,
    subcity: listing.locationSubcity,
    woreda: listing.locationWoreda ?? '',
    kebele: listing.locationKebele,
    condition: listing.condition,
    brand: listing.brand,
    model: listing.model,
    yearOfManufacture: listing.yearOfManufacture,
    rules: listing.rules ?? [],
    cancellationPolicy:
      typeof listing.cancellationPolicy === 'string'
        ? listing.cancellationPolicy
        : JSON.stringify(listing.cancellationPolicy ?? {}),
    minTrustLevel: listing.minTrustLevel,
    requiresGuarantor: (listing.requiresGuarantors as number) > 0,
    requiresGuarantors: listing.requiresGuarantors,
    requiresIdVerification: listing.requiresIdVerification,
    requiresDeposit: listing.requiresDeposit,
    deliveryAvailable: listing.deliveryAvailable,
    deliveryFee: listing.deliveryFee,
    pickupRequired: listing.pickupRequired,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    images: images.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: Boolean(img.isPrimary),
    })),
    owner,
  };
}
