"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Track } from "@/app/page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SearchPanelProps {
  onAddTrack: (track: Track) => void;
}

export function SearchPanel({ onAddTrack }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState<Track[]>([]);
  const [genre, setGenre] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchFeaturesDisabled, setSearchFeaturesDisabled] = useState(true);
  // Update showFilters whenever searchResults changes
  useEffect(() => {
    setShowFilters(searchResults.length > 0);
  }, [searchResults]);

  // disable search button if no search query
  useEffect(() => {
    setSearchFeaturesDisabled(searchQuery.length === 0 && !genre && !yearFrom && !yearTo);
  }, [searchQuery, genre, yearFrom, yearTo]);

  // Filter search results based on tempo and energy criteria
  useEffect(() => {
    // Since audio features are no longer available, show all search results
    setFilteredSearchResults(searchResults);
  }, [searchResults]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build the search query with filters included
      let builtQuery = searchQuery;
      // Add genre filter if provided
      if (genre) {
        builtQuery += ` genre:${genre}`;
      }
      
      // Add year range filter if provided
      if (yearFrom && yearTo) {
        builtQuery += ` year:${yearFrom}-${yearTo}`;
      } else if (yearFrom) {
        builtQuery += ` year:${yearFrom}`;
      } else if (yearTo) {
        builtQuery += ` year:${yearTo}`;
      }

      const params = new URLSearchParams({
        q: builtQuery,
        market: "US",
        type: "track",
        limit: "10",
      });
      
      const res = await fetch(`/api/spotify/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();
      // Map Spotify API response to Track[]
      const tracks: Track[] = (data.tracks?.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists?.map((a: any) => a.name).join(", ") ?? "",
        album: item.album?.name ?? "",
        duration_ms: item.duration_ms,
        tempo: undefined, // Audio features not available due to API deprecation
        energy: undefined, // Audio features not available due to API deprecation
        uri: item.uri,
      }));
      setSearchResults(tracks);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-brand-light/5 border-brand-light/10 backdrop-blur-sm h-full flex flex-col" data-ref="wa.search-panel.container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-light">
          <Search className="h-5 w-5" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">

        {/* Search query input */}
        <div className="space-y-2" data-ref="wa.search-panel.search.input-section">
          <Label className="text-brand-light">Search Query</Label>
          <Input
            placeholder="Search for tracks, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-brand-light/10 border-brand-light/20 text-brand-light placeholder:text-brand-light/60"
            data-ref="wa.search-panel.search.input"
          />
        </div>

        {/* Genre filter */}
        <div className="space-y-2" data-ref="wa.search-panel.genre-filter.container">
          <Label className="text-brand-light">Genre</Label>
          <Input
            placeholder="e.g., rock, jazz, electronic..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-brand-light/10 border-brand-light/20 text-brand-light placeholder:text-brand-light/60"
            data-ref="wa.search-panel.genre-filter.input"
          />
        </div>
        
        {/* Year range filter */}
        <div className="space-y-2" data-ref="wa.search-panel.year-filter.container">
          <Label className="text-brand-light">Year Range</Label>
          <div className="flex gap-2">
            <Input
              placeholder="From (e.g., 1970)"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="bg-brand-light/10 border-brand-light/20 text-brand-light placeholder:text-brand-light/60"
              data-ref="wa.search-panel.year-filter.from"
            />
            <Input
              placeholder="To (e.g., 1974)"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="bg-brand-light/10 border-brand-light/20 text-brand-light placeholder:text-brand-light/60"
              data-ref="wa.search-panel.year-filter.to"
            />
          </div>
        </div>

        {/* Search button */}
        <Button
          onClick={handleSearch}
          className="w-full bg-green-500 hover:bg-green-600"
          disabled={loading || searchFeaturesDisabled}
          data-ref="wa.search-panel.search.button"
        >
          {loading ? "Searching..." : "Search"}
        </Button>

        {showFilters && (
          <div className="space-y-4" data-ref="wa.search-panel.filters.container">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                ⚠️ Audio features filtering is no longer available. Spotify has deprecated their audio analysis endpoints. 
                We're exploring alternative solutions for advanced filtering.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto" data-ref="wa.search-panel.search-results.container">
          {error && <div className="text-red-500 text-sm" data-ref="wa.search-panel.search-results.error">{error}</div>}
          {!searchFeaturesDisabled && searchResults.length === 0 && !loading && !error && (
            <div className="text-white/60 text-center" data-ref="wa.search-panel.search-results.no-results">No results found.</div>
          )}
          {!searchFeaturesDisabled && searchResults.length > 0 && filteredSearchResults.length === 0 && !loading && !error && (
            <div className="text-white/60 text-center" data-ref="wa.search-panel.search-results.no-filtered-results">No tracks match the current filters.</div>
          )}
          <div data-ref="wa.search-panel.search-results.result-items" className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSearchResults.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-brand-light/5 rounded-lg border border-brand-light/10"
                data-ref={`wa.search-panel.search-results.result-item.${track.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-light truncate">
                    {track.name}
                  </p>
                  <p className="text-sm text-brand-light/60 truncate">
                    {track.artist}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {track.tempo && (
                    <span className="text-xs text-brand-accent font-mono">
                      {track.tempo} BPM
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onAddTrack(track)}
                    className="bg-brand-accent hover:bg-brand-accent/80 text-brand-primary font-medium"
                    data-ref={`wa.search-panel.search-results.result-item.add.${track.id}`}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
