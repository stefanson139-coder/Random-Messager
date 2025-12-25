import './globals.css';

export const metadata = {
  title: '訊息池',
  description: '任何人可投入訊息，並隨機抽取一則觀看',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
