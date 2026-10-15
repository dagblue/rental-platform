import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search listings',
  description: 'Search rentals across Ethiopia by category, region, price, and more.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
