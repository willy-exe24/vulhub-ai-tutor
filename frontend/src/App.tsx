import { Route, Routes } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { Dashboard } from './pages/Dashboard'
import { LabBrowser } from './pages/LabBrowser'
import { LabDetail } from './pages/LabDetail'
import { Progress } from './pages/Progress'
import { Settings } from './pages/Settings'
import { StudyNotesHome } from './pages/StudyNotesHome'
import { TutorHome } from './pages/TutorHome'

export default function App() {
  return (
    <div className="app-root flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/labs" element={<LabBrowser />} />
            <Route path="/labs/:id" element={<LabDetail />} />
            <Route path="/tutor" element={<TutorHome />} />
            <Route path="/notes" element={<StudyNotesHome />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
