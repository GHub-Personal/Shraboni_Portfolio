import { Inter, Syne } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});

export const metadata = {
  title: 'Creative Portfolio',
  description: 'Creative Portfolio & Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
