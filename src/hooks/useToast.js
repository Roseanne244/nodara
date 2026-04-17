import { useState, useCallback } from 'react'

let _id = 0
const DEFAULT_DURATION = 4500

export function useToast() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((msg, dur) => add(msg, 'success', dur), [add])
  const error   = useCallback((msg, dur) => add(msg, 'error', dur ?? 6000), [add])
  const info    = useCallback((msg, dur) => add(msg, 'info', dur), [add])
  const warning = useCallback((msg, dur) => add(msg, 'warning', dur), [add])

  return { toasts, add, remove, success, error, info, warning }
}
