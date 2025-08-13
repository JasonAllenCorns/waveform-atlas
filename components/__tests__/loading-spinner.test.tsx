import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../loading-spinner'

describe('LoadingSpinner component', () => {
  it('should render the loading spinner', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render the Music icon', () => {
    render(<LoadingSpinner />)
    
    // The Music icon should be present (lucide-react icons render as SVGs)
    const musicIcon = document.querySelector('svg')
    expect(musicIcon).toBeInTheDocument()
  })

  it('should have the correct CSS classes for styling', () => {
    render(<LoadingSpinner />)
    
    const container = screen.getByText('Loading...').closest('div')?.parentElement
    expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-slate-900', 'via-blue-900', 'to-slate-900', 'flex', 'items-center', 'justify-center')
  })

  it('should have the correct text styling', () => {
    render(<LoadingSpinner />)
    
    const loadingText = screen.getByText('Loading...')
    expect(loadingText).toHaveClass('text-white/70')
  })

  it('should have the correct icon styling', () => {
    render(<LoadingSpinner />)
    
    const musicIcon = document.querySelector('svg')
    expect(musicIcon).toHaveClass('h-12', 'w-12', 'text-green-400', 'mx-auto', 'mb-4', 'animate-pulse')
  })

  it('should have proper accessibility', () => {
    render(<LoadingSpinner />)
    
    // The loading text should be visible to screen readers
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render consistently', () => {
    const { rerender } = render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Re-render and ensure consistency
    rerender(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should have the correct structure', () => {
    render(<LoadingSpinner />)
    
    // Should have a main container div
    const mainContainer = screen.getByText('Loading...').closest('div')
    expect(mainContainer).toBeInTheDocument()
    
    // Should have a text-center div inside
    const textCenterDiv = screen.getByText('Loading...').parentElement
    expect(textCenterDiv).toHaveClass('text-center')
  })
}) 