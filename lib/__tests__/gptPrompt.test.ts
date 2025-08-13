import { createPrompt } from '../gptPrompt'

describe('createPrompt function', () => {
  const baseInput = {
    targetBPM: 120,
    mood: 'energetic',
    allowVocals: true,
  }

  it('should create a basic prompt with minimal input', () => {
    const result = createPrompt(baseInput)
    
    expect(result).toHaveProperty('systemPrompt')
    expect(result).toHaveProperty('userPrompt')
    expect(result.systemPrompt).toContain('music discovery assistant')
    expect(result.userPrompt).toContain('120 BPM')
    expect(result.userPrompt).toContain('energetic')
  })

  it('should handle instrumental tracks', () => {
    const input = { ...baseInput, allowVocals: false }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('instrumental songs')
  })

  it('should include energy range when provided', () => {
    const input = { ...baseInput, energyRange: 'high' }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('high energy')
  })

  it('should include genre preference when provided', () => {
    const input = { ...baseInput, genrePreference: 'rock' }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('Favor the rock genre')
  })

  it('should handle seed track only', () => {
    const input = { ...baseInput, seedTrack: 'Bohemian Rhapsody' }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('Recommend songs similar to "Bohemian Rhapsody."')
  })

  it('should handle seed artist only', () => {
    const input = { ...baseInput, seedArtist: 'Queen' }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('Recommend songs by "Queen."')
  })

  it('should handle seed album only', () => {
    const input = { ...baseInput, seedAlbum: 'A Night at the Opera' }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('Recommend songs from the album "A Night at the Opera."')
  })

  it('should handle all seed parameters', () => {
    const input = {
      ...baseInput,
      seedTrack: 'Bohemian Rhapsody',
      seedArtist: 'Queen',
      seedAlbum: 'A Night at the Opera',
    }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain(
      'Recommend songs similar to "Bohemian Rhapsody" by "Queen" from the album "A Night at the Opera."'
    )
  })

  it('should handle complex input with all optional parameters', () => {
    const input = {
      targetBPM: 140,
      mood: 'melancholic',
      allowVocals: false,
      energyRange: 'low',
      genrePreference: 'ambient',
    }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('instrumental songs around 140 BPM')
    expect(result.userPrompt).toContain('melancholic')
    expect(result.userPrompt).toContain('low energy')
    expect(result.userPrompt).toContain('Favor the ambient genre')
  })

  it('should ensure system prompt contains required JSON structure', () => {
    const result = createPrompt(baseInput)
    
    expect(result.systemPrompt).toContain('JSON array')
    expect(result.systemPrompt).toContain('title')
    expect(result.systemPrompt).toContain('artist')
    expect(result.systemPrompt).toContain('tempo')
    expect(result.systemPrompt).toContain('energy')
    expect(result.systemPrompt).toContain('genre')
    expect(result.systemPrompt).toContain('mood')
  })

  it('should ensure user prompt requests JSON format', () => {
    const result = createPrompt(baseInput)
    
    expect(result.userPrompt).toContain('Respond in properly formatted JSON only')
  })

  it('should handle edge case with zero BPM', () => {
    const input = { ...baseInput, targetBPM: 0 }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('0 BPM')
  })

  it('should handle very high BPM', () => {
    const input = { ...baseInput, targetBPM: 200 }
    const result = createPrompt(input)
    
    expect(result.userPrompt).toContain('200 BPM')
  })
}) 