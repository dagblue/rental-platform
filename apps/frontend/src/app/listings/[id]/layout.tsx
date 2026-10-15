import type { Metadata } from 'next';

const internalApi =
  process.env.INTERNAL_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:3001';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${internalApi}/api/v1/listings/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return { title: 'Listing' };
    }
    const json = (await res.json()) as { data?: { title?: string; description?: string } };
    const title = json.data?.title;
    const description = json.data?.description?.slice(0, 160);
    return {
      title: title || 'Listing',
      description: description || 'View this rental on Ethiopian Rental Platform.',
    };
  } catch {
    return { title: 'Listing' };
  }
}

export default function ListingDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
