import { Track } from "@/types/track"

/**
 * Adds a track to the playlist with a unique ID
 */
export function addTrackToPlaylist(playlist: Track[], track: Track): Track[] {
  const trackWithUniqueId = { ...track, id: `${track.id}-${Date.now()}` }
  return [...playlist, trackWithUniqueId]
}

/**
 * Removes a track from the playlist by ID
 */
export function removeTrackFromPlaylist(playlist: Track[], trackId: string): Track[] {
  return playlist.filter((track) => track.id !== trackId)
}

/**
 * Reorders tracks in the playlist by moving the active track to the position of the over track
 */
export function reorderPlaylist(playlist: Track[], activeId: string, overId: string): Track[] {
  const activeIndex = playlist.findIndex((track) => track.id === activeId)
  const overIndex = playlist.findIndex((track) => track.id === overId)

  if (activeIndex === -1 || overIndex === -1) return playlist

  const newPlaylist = [...playlist]
  const [removed] = newPlaylist.splice(activeIndex, 1)
  newPlaylist.splice(overIndex, 0, removed)

  return newPlaylist
}

/**
 * Finds a track in the playlist by ID
 */
export function findTrackById(playlist: Track[], trackId: string): Track | undefined {
  return playlist.find((track) => track.id === trackId)
}

/**
 * Gets all unvalidated tracks from the playlist
 */
export function getUnvalidatedTracks(playlist: Track[]): Track[] {
  return playlist.filter(track => !track.validated && !track.validationError)
} 