import { promises as fs } from 'fs';
import path from 'path';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Journey from '../components/Journey';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

async function getPortfolioData() {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');
    const file = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(file);
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getPortfolioData();
  const profile = data?.profile || {};
  const projects = data?.projects || [];
  const skills = data?.skills || [];
  const journey = data?.journey || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar cvUrl={profile.cvUrl || '/CV.pdf'} />
      <main className="flex-1">
        <Hero profile={profile} />
        <About profile={profile} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Journey journey={journey} />
        <Contact profile={profile} />
      </main>
      <Footer />
    </div>
  );
}
