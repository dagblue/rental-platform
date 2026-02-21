import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <h1 className="text-5xl font-bold mb-6 text-center">
        Ethiopian Rental Platform
      </h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl">
        Rent anything, anywhere in Ethiopia. From cameras to cars, find what you need from trusted owners.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg" className="text-lg px-8">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="outline" className="text-lg px-8">
            Register
          </Button>
        </Link>
      </div>
    </div>
  );
}
