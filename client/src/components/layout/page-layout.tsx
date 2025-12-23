
import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Footer } from './footer';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.string().transform(str => new Date(str)),
});

type User = z.infer<typeof userSchema>;

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  // Fetch current user
  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.status === 401) {
          return null;
        }
        const data = await res.json();
        return userSchema.parse(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        return null;
      }
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}
