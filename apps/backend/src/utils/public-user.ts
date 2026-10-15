/**
 * Stable public profile shape for /users/profile and auth hydration.
 */
export interface PublicProfileUser {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  trustLevel: string;
  profileImage: string | null;
  region: string;
  city: string;
  subcity: string;
  woreda: string;
  kebele: string;
  houseNumber: string;
  occupation: string;
  bio: string;
}

function phoneToString(phone: unknown): string {
  if (phone == null) return '';
  if (typeof phone === 'string') return phone;
  if (typeof phone === 'object' && phone !== null) {
    const o = phone as { formatted?: string; number?: string };
    return o.formatted || o.number || '';
  }
  return String(phone);
}

export function formatPublicProfileUser(user: Record<string, unknown> | null | undefined): PublicProfileUser | null {
  if (!user || typeof user !== 'object' || !user.id) return null;

  const profile = (user.profile as Record<string, unknown> | undefined) || {};

  return {
    id: String(user.id),
    phone: phoneToString(user.phone),
    email: user.email != null ? String(user.email) : null,
    firstName: String(user.firstName ?? ''),
    lastName: String(user.lastName ?? ''),
    role: String(user.role ?? 'RENTER'),
    trustLevel: String(user.trustLevel ?? 'NEW'),
    profileImage: user.profileImage != null ? String(user.profileImage) : null,
    region: String(profile.region ?? ''),
    city: String(profile.city ?? ''),
    subcity: String(profile.subcity ?? ''),
    woreda: String(profile.woreda ?? ''),
    kebele: String(profile.kebele ?? ''),
    houseNumber: String(profile.houseNumber ?? ''),
    occupation: String(profile.occupation ?? ''),
    bio: String(profile.bio ?? ''),
  };
}
