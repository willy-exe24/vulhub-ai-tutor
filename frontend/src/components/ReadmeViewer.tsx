import ReactMarkdown from 'react-markdown'

export function ReadmeViewer({ content }: { content: string | null }) {
  if (!content) {
    return <p className="text-sm text-slate-500">No README found for this lab.</p>
  }
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-slate-900 prose-a:text-emerald-400">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
