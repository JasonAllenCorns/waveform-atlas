import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()

beforeEach(() => {
  // Reset the mock before each test
  mockMatchMedia.mockClear()
  
  // Set up the global matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  })
  
  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })
})

describe('useIsMobile hook', () => {
  it('should return false for desktop screen width', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true for mobile screen width', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return true for tablet screen width (below breakpoint)', () => {
    // Set tablet width (767px, just below 768px breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })
    
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return false for tablet screen width (at breakpoint)', () => {
    // Set tablet width (768px, at breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should add and remove event listeners', () => {
    const addEventListener = jest.fn()
    const removeEventListener = jest.fn()
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener,
    })
    
    const { unmount } = renderHook(() => useIsMobile())
    
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    
    unmount()
    
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle window resize events', () => {
    const addEventListener = jest.fn()
    const removeEventListener = jest.fn()
    let changeCallback: (() => void) | null = null
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: (event: string, callback: () => void) => {
        if (event === 'change') {
          changeCallback = callback
        }
        addEventListener(event, callback)
      },
      removeEventListener,
    })
    
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
    
    // Simulate resize to mobile
    if (changeCallback) {
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        })
        
        changeCallback!()
      })
      
      // The hook should now return true for mobile
      expect(result.current).toBe(true)
    } else {
      throw new Error('changeCallback was not set')
    }
  })

  it('should handle edge case with zero width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 0,
    })
    
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })
}) 