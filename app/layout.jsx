import './globals.css';

export const metadata = {
  title: 'El Clásico | Real Madrid vs Liverpool FC',
  description: "Real Madrid va Liverpool FC jamoalari tarkibi, taktik sxemalari, 3D kartochkalari va o'yinlar statistikasi.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080b11] text-zinc-100 min-h-screen antialiased selection:bg-amber-400 selection:text-black overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        {children}
      </body>
    </html>
  );
}
