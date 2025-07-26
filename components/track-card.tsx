"use client"

import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Track } from "@/app/page"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TrackCardProps {
  track: Track
  onRemove: (trackId: string) => void
  isDragging?: boolean
}

export function TrackCard({ track, onRemove, isDragging = false }: TrackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 group hover:bg-white/10 transition-colors ${
        isDragging ? "shadow-lg bg-white/20" : ""
      }`}
      data-ref={`wa.track-card.container.${track.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-white/40 hover:text-white/60 cursor-grab active:cursor-grabbing"
        data-ref={`wa.track-card.drag-handle.${track.id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0" data-ref={`wa.track-card.content.${track.id}`}>
        <p className="font-medium text-white truncate">{track.name}</p>
        <p className="text-sm text-white/60 truncate">{track.artist}</p>
      </div>

      <div className="flex items-center gap-2" data-ref={`wa.track-card.actions.${track.id}`}>
        <span className="text-xs text-white/40 font-mono">{formatDuration(track.duration_ms)}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(track.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 hover:bg-red-400/10"
          data-ref={`wa.track-card.remove.button.${track.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
