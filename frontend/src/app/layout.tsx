import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MilestonePay AI — Autonomous Milestone Escrow Protocol',
  description: 'AI Scope-of-Work Generator & Deliverable-Verified Milestone Escrow for Software Agencies & Freelancers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0D14] text-[#F8FAFC] antialiased selection:bg-[#10B981] selection:text-white">
        {children}
      </body>
    </html>
  );
}
