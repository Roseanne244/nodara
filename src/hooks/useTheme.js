import { useState, useCallback, useEffect } from 'react'
import { storage } from '../lib/utils'

const STORAGE_KEY = 'nodara-theme'

/**
 * Manages dark/light theme toggle.
 * Applies data-theme attribute to document root.
 * Persists in localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => storage.get(STORAGE_KEY, 'dark')
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      storage.set(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
