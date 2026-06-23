
import type {Metadata} from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import AIFloatingConcierge from '@/components/ai-floating-concierge';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'SafeRwanda | Advanced Security Solutions',
  description: 'AI-powered safety, protection, and community surveillance solutions for a safer future.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <FirebaseClientProvider>
          <Navbar />
          {children}
          <AIFloatingConcierge />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
