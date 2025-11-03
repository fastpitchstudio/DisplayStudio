import type { Metadata } from 'next';
import './globals.css';
import { ConvexClientProvider } from './ConvexClientProvider';
import { themeScript } from '@/lib/theme-script';

export const metadata: Metadata = {
  title: 'Matrix Switch Control',
  description: 'Control your 8x8 video matrix switch',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
