import { FolderOpen } from 'lucide-react'

import { CreateProjectDialog } from './create-project-dialog'
import { ProjectCard } from './project-card'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  name: string
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <FolderOpen className="h-12 w-12 opacity-40" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Noch keine Projekte</p>
          <p className="text-sm">Erstelle dein erstes Projekt, um loszulegen.</p>
        </div>
        <CreateProjectDialog
          trigger={<Button>Erstes Projekt anlegen</Button>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
