import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getAuthSession()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = "track" 
  const limit = searchParams.get("limit") || "20"
  const genre = searchParams.get("genre")
  const yearFrom = searchParams.get("yearFrom")
  const yearTo = searchParams.get("yearTo")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Build the search query with filters
    let searchQuery = query
    
    // Add genre filter if provided
    if (genre) {
      searchQuery += ` genre:${genre}`
    }
    
    // Add year range filter if provided
    if (yearFrom && yearTo) {
      searchQuery += ` year:${yearFrom}-${yearTo}`
    } else if (yearFrom) {
      searchQuery += ` year:${yearFrom}`
    } else if (yearTo) {
      searchQuery += ` year:${yearTo}`
    }

    // Properly encode the search query for Spotify API
    const encodedQuery = encodeURIComponent(searchQuery)

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedQuery}&type=${type}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Spotify API error:", response.status, errorData)
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching tracks:", error)
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
  }
}
