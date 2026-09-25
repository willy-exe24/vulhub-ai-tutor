import { CurrentLab } from '@/components/dashboard/current-lab'
import { EnvironmentStatus } from '@/components/dashboard/environment-status'
import { ProgressSection } from '@/components/dashboard/progress-section'
import { RecentLabs } from '@/components/dashboard/recent-labs'

export function Dashboard() {
  return (
    <div className="space-y-8 p-6">
      <EnvironmentStatus />
      <CurrentLab />
      <ProgressSection />
      <RecentLabs />
    </div>
  )
}
