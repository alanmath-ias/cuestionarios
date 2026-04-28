
import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Footer } from './footer';
import { z } from 'zod';
import { MagicQuizDialog } from '../dialogs/MagicQuizDialog';
import { useState, useEffect } from 'react';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.string().transform(str => new Date(str)),
  hintCredits: z.number().default(0),
  canReport: z.boolean().optional(),
  totalReports: z.number().optional(),
});

type User = z.infer<typeof userSchema>;

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
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

  // Fetch categories for the magic quiz dialog
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: !!user,
  });

  // Fetch pending friend requests for the badge
  const { data: pendingRequests } = useQuery<any[]>({
    queryKey: ['/api/social/pending-requests'],
    enabled: !!user,
  });

  const { data: notifications } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const totalUnreadCount = (pendingRequests?.length || 0) + (notifications?.filter((n: any) => !n.read).length || 0);

  const [isMagicQuizOpen, setIsMagicQuizOpen] = useState(false);

  useEffect(() => {
    (window as any).openMagicQuiz = () => setIsMagicQuizOpen(true);
    return () => {
      delete (window as any).openMagicQuiz;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} pendingCount={totalUnreadCount} />

      <main className="flex-grow">
        {children}
      </main>

      <MagicQuizDialog 
        isOpen={isMagicQuizOpen}
        onClose={() => setIsMagicQuizOpen(false)}
        categories={categories || []}
        userId={user?.id || 0}
        credits={user?.hintCredits || 0}
        userRole={user?.role}
      />

      <Footer />
    </div>
  );
}
