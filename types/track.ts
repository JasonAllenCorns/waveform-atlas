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
  spotifyImage?: SpotifyImage
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

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: SpotifyAlbum
  duration_ms: number
  external_urls: { spotify: string }
  preview_url?: string
  uri: string
  popularity: number
  images?: Array<{ url: string }>
  // GPT-specific fields
  notes?: string
  genre?: string
  mood?: string
  allowVocals?: boolean
  energyRange?: string
  genrePreference?: string
}

export interface SpotifyArtist {
  name: string
  external_urls: { spotify: string }
  href: string
  id: string
  images: Array<{ url: string }>
  type: string
  uri: string
}

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export interface SpotifyAlbum {
  name: string
  artists: Array<{ name: string }>
  album_type: string
  available_markets: Array<string>
  external_urls: { spotify: string }
  href: string
  id: string
  images: Array<{ url: string }>
  is_playable: boolean
  release_date: string
  release_date_precision: string
  total_tracks: number
  type: string
  uri: string
} 