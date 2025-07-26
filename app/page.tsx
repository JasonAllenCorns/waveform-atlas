"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { SearchPanel } from "@/components/search-panel"
import { PlaylistPanel } from "@/components/playlist-panel"
import { SavePanel } from "@/components/save-panel"
import { Header } from "@/components/header"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { TrackCard } from "@/components/track-card"
import { LandingPage } from "@/components/landing-page"
import { LoadingSpinner } from "@/components/loading-spinner"

export interface Track {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms: number
  tempo?: number
  energy?: number
  preview_url?: string
  uri: string
}

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [playlistName, setPlaylistName] = useState("")
  const [activeTrack, setActiveTrack] = useState<Track | null>(null)
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <LoadingSpinner />
  }

  if (!session) {
    return <LandingPage />
  }

  const addToPlaylist = (track: Track) => {
    setPlaylist((prev) => [...prev, { ...track, id: `${track.id}-${Date.now()}` }])
  }

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId))
  }

  const reorderPlaylist = (activeId: string, overId: string) => {
    setPlaylist((prev) => {
      const activeIndex = prev.findIndex((track) => track.id === activeId)
      const overIndex = prev.findIndex((track) => track.id === overId)

      if (activeIndex === -1 || overIndex === -1) return prev

      const newPlaylist = [...prev]
      const [removed] = newPlaylist.splice(activeIndex, 1)
      newPlaylist.splice(overIndex, 0, removed)

      return newPlaylist
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const track = playlist.find((t) => t.id === event.active.id)
    setActiveTrack(track || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      reorderPlaylist(active.id as string, over.id as string)
    }

    setActiveTrack(null)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex flex-col">
        <Header />

        <main className="container mx-auto p-4 flex-1 flex" data-ref="wa.dashboard.main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" data-ref="wa.dashboard.container.layout">
            <SearchPanel onAddTrack={addToPlaylist} />

            <PlaylistPanel
              tracks={playlist}
              playlistName={playlistName}
              onPlaylistNameChange={setPlaylistName}
              onRemoveTrack={removeFromPlaylist}
            />

            <SavePanel playlist={playlist} playlistName={playlistName} />
          </div>
        </main>

        <DragOverlay>
          {activeTrack ? <TrackCard track={activeTrack} onRemove={() => {}} isDragging /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
