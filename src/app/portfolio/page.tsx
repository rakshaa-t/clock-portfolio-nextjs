import { BottomNav } from './components/BottomNav'
import { Footer } from './components/Footer'
import { AboutSection } from './components/AboutSection/AboutSection'
import { BooksSection } from './components/BooksSection/BooksSection'
import { WorkSection } from './components/WorkSection/WorkSection'
import { MymindSection } from './components/MymindSection/MymindSection'
import { NotesSection } from './components/NotesSection'

export default function PortfolioPage() {
  return (
    <>
      <main className="min-h-screen bg-bg" style={{ padding: '40px 0 72px' }}>
        <div className="max-w-[680px] mx-auto">
          <AboutSection />

          <WorkSection />

          <NotesSection />

          <MymindSection />

          <BooksSection />

          <Footer />
        </div>
      </main>

      <BottomNav />
    </>
  )
}
