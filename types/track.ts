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
  // GPT track fields
  notes?: string
  spotifyUrl?: string
  spotifyId?: string
  genre?: string
  mood?: string
  allowVocals?: boolean
  energyRange?: string
  genrePreference?: string
  spotifyImage?: string
  spotifyPopularity?: number
  spotifyAlbum?: string
  // Validation fields
  validated?: boolean
  spotifyMatch?: {
    id: string
    uri: string
    externalUrl: string
    previewUrl?: string
  }
  spotifyMatches?: Array<{
    id: string
    uri: string
    externalUrl: string
    previewUrl?: string
    name: string
    artist: string
    album: string
    duration_ms: number
    popularity: number
  }>
  validationError?: string
  showMatchSelection?: boolean
}

export interface SpotifyMatch {
  id: string
  uri: string
  externalUrl: string
  previewUrl?: string
  name: string
  artist: string
  album: string
  duration_ms: number
  popularity: number
} 