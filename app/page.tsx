"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import TrackChatPanel from "@/components/track-chat-panel"
import { PlaylistPanel } from "@/components/playlist-panel"
import { SavePanel } from "@/components/save-panel"
import { Header } from "@/components/header"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { TrackCard } from "@/components/track-card"
import { LandingPage } from "@/components/landing-page"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Track } from "@/types/track"
import { addTrackToPlaylist, removeTrackFromPlaylist, reorderPlaylist as reorderPlaylistUtil, findTrackById, getUnvalidatedTracks } from "@/lib/playlist"
import { validateTrack as validateTrackUtil, updateTrackWithExactMatch, updateTrackWithMultipleMatches, updateTrackWithSelectedMatch, updateTrackWithSkippedMatch, updateTrackWithValidationError } from "@/lib/validation"
import { mapSpotifyTrackToTrack } from "@/lib/mappers"

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
    setPlaylist((prev) => addTrackToPlaylist(prev, track))
  }

  const addGptTrackToPlaylist = (spotifyTrack: any) => {    
    const track = mapSpotifyTrackToTrack(spotifyTrack)
    setPlaylist((prev) => addTrackToPlaylist(prev, track))
  }

  const validateTrack = async (track: Track) => {
    if (!track.validated && !track.validationError) {
      const result = await validateTrackUtil(track);
      
      if (!result.success) {
        setPlaylist(prev => updateTrackWithValidationError(prev, track.id, result.error || "Validation failed"));
        return;
      }
      
      if (result.exactMatch) {
        setPlaylist(prev => updateTrackWithExactMatch(prev, track.id, result.exactMatch));
      } else if (result.matches && result.matches.length > 0) {
        setPlaylist(prev => updateTrackWithMultipleMatches(prev, track.id, result.matches));
      }
    }
  };

  const handleMatchSelection = (trackId: string, selectedMatch: any) => {
    setPlaylist(prev => updateTrackWithSelectedMatch(prev, trackId, selectedMatch));
  };

  const handleSkipMatchSelection = (trackId: string) => {
    setPlaylist(prev => updateTrackWithSkippedMatch(prev, trackId));
  };

  const validateAllTracks = async () => {
    const unvalidatedTracks = getUnvalidatedTracks(playlist);
    
    if (unvalidatedTracks.length === 0) return;
    
    // For batch validation, we'll validate tracks individually to handle multiple matches properly
    for (const track of unvalidatedTracks) {
      await validateTrack(track);
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => removeTrackFromPlaylist(prev, trackId))
  }

  const reorderPlaylist = (activeId: string, overId: string) => {
    setPlaylist((prev) => reorderPlaylistUtil(prev, activeId, overId))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const track = findTrackById(playlist, event.active.id as string)
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
            <TrackChatPanel onAddTrack={addGptTrackToPlaylist} />

            <PlaylistPanel
              tracks={playlist}
              playlistName={playlistName}
              onPlaylistNameChange={setPlaylistName}
              onRemoveTrack={removeFromPlaylist}
              onValidateTrack={validateTrack}
              onValidateAllTracks={validateAllTracks}
              onMatchSelection={handleMatchSelection}
              onSkipMatchSelection={handleSkipMatchSelection}
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
