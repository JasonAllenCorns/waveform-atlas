import { Music } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Music className="h-12 w-12 text-green-400 mx-auto mb-4 animate-pulse" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  )
}
