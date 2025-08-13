import { renderHook, act, waitFor } from '@testing-library/react'
import { useToast, toast, reducer } from '../use-toast'

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

describe('useToast hook and related functions', () => {
  beforeEach(() => {
    // Clear all timers before each test
    jest.clearAllTimers()
  })

  describe('reducer', () => {
    const initialState = { toasts: [] }

    it('should add a toast', () => {
      const toast = {
        id: '1',
        title: 'Test Toast',
        open: true,
      }

      const action = {
        type: 'ADD_TOAST' as const,
        toast,
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toEqual(toast)
    })

    it('should update a toast', () => {
      const existingToast = {
        id: '1',
        title: 'Original Title',
        open: true,
      }

      const state = { toasts: [existingToast] }
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated Title' },
      }

      const newState = reducer(state, action)

      expect(newState.toasts[0].title).toBe('Updated Title')
      expect(newState.toasts[0].open).toBe(true) // Should preserve existing properties
    })

    it('should dismiss a specific toast', () => {
      const existingToast = {
        id: '1',
        title: 'Test Toast',
        open: true,
      }

      const state = { toasts: [existingToast] }
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1',
      }

      const newState = reducer(state, action)

      expect(newState.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no toastId provided', () => {
      const toasts = [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ]

      const state = { toasts }
      const action = {
        type: 'DISMISS_TOAST' as const,
      }

      const newState = reducer(state, action)

      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(false)
    })

    it('should remove a toast', () => {
      const toasts = [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ]

      const state = { toasts }
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1',
      }

      const newState = reducer(state, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].id).toBe('2')
    })

    it('should remove all toasts when no toastId provided', () => {
      const toasts = [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ]

      const state = { toasts }
      const action = {
        type: 'REMOVE_TOAST' as const,
      }

      const newState = reducer(state, action)

      expect(newState.toasts).toHaveLength(0)
    })

    it('should limit toasts to TOAST_LIMIT', () => {
      const toasts = Array.from({ length: 5 }, (_, i) => ({
        id: i.toString(),
        title: `Toast ${i}`,
        open: true,
      }))

      const state = { toasts }
      const newToast = {
        id: '5',
        title: 'New Toast',
        open: true,
      }

      const action = {
        type: 'ADD_TOAST' as const,
        toast: newToast,
      }

      const newState = reducer(state, action)

      // Should only keep 1 toast (TOAST_LIMIT is 1)
      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].id).toBe('5')
    })
  })

  describe('toast function', () => {
    it('should create a toast with correct properties', () => {
      const toastProps = {
        title: 'Test Toast',
        description: 'Test Description',
      }

      const result = toast(toastProps)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('dismiss')
      expect(result).toHaveProperty('update')
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')
    })

    it('should generate unique IDs for different toasts', () => {
      const toast1 = toast({ title: 'Toast 1' })
      const toast2 = toast({ title: 'Toast 2' })

      expect(toast1.id).not.toBe(toast2.id)
    })

    it('should provide update function that works', () => {
      const toastInstance = toast({ title: 'Original Title' })
      
      act(() => {
        toastInstance.update({ title: 'Updated Title' })
      })

      // The update function should work without throwing errors
      expect(typeof toastInstance.update).toBe('function')
    })

    it('should provide dismiss function that works', () => {
      const toastInstance = toast({ title: 'Test Toast' })
      
      act(() => {
        toastInstance.dismiss()
      })

      // The dismiss function should work without throwing errors
      expect(typeof toastInstance.dismiss).toBe('function')
    })
  })

  describe('useToast hook', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.toast).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
    })

    it('should add toast when toast function is called', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test Description',
        })
      })

      // Wait for the state to update
      await waitFor(() => {
        expect(result.current.toasts).toHaveLength(1)
      })

      expect(result.current.toasts[0].title).toBe('Test Toast')
      expect(result.current.toasts[0].description).toBe('Test Description')
      expect(result.current.toasts[0].open).toBe(true)
    })

    it('should dismiss toast when dismiss function is called', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
        })
      })

      // Wait for toast to be added
      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(true)
      })

      act(() => {
        result.current.dismiss(result.current.toasts[0].id)
      })

      // Wait for toast to be dismissed
      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(false)
      })
    })

    it('should dismiss all toasts when dismiss is called without id', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })

      // Wait for toasts to be added
      await waitFor(() => {
        expect(result.current.toasts.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.dismiss()
      })

      // Wait for all toasts to be dismissed
      await waitFor(() => {
        result.current.toasts.forEach(toast => {
          expect(toast.open).toBe(false)
        })
      })
    })

    it('should handle toast auto-dismiss via onOpenChange', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
        })
      })

      // Wait for toast to be added
      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(true)
      })

      const toast = result.current.toasts[0]

      // Simulate the onOpenChange callback
      act(() => {
        if (toast.onOpenChange) {
          toast.onOpenChange(false)
        }
      })

      // Wait for toast to be dismissed
      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(false)
      })
    })
  })
}) 