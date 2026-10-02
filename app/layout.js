import './globals.css';

export const metadata = {
  title: 'Tewodros Endalamaw — Full-Stack & Frontend Engineer',
  description: '4th Year Computer Science Senior at Hope Enterprise University College. Building performant, responsive web apps with React, Next.js, and Node.js.',
  keywords: ['Tewodros Endalamaw', 'Software Engineer', 'React', 'Next.js', 'Node.js', 'Frontend Developer', 'Addis Ababa', 'Ethiopia', 'Portfolio'],
  authors: [{ name: 'Tewodros Endalamaw' }],
  metadataBase: new URL('https://teddyet.github.io/Portfolio/'),
  openGraph: {
    title: 'Tewodros Endalamaw — Portfolio & Projects',
    description: '4th Year CS Senior. React, Next.js, Node.js, PHP, C++ — explore projects, technical skills, and resume.',
    url: 'https://teddyet.github.io/Portfolio/',
    siteName: 'Tewodros Endalamaw Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tewodros Endalamaw — Full-Stack & Frontend Engineer',
    description: '4th Year Computer Science Senior building with React, Next.js, and Node.js.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
