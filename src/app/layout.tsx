import './globals.css';

export const metadata = {
  title: 'Message Pool',
  description: 'Anyone can submit a message, and anyone can draw a random one.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
