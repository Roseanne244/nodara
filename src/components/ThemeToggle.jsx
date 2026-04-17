import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ theme, toggle }) {
  return (
    <button
      className="btn btn-outline"
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ padding: '8px 10px', borderRadius: 9 }}
    >
      {theme === 'dark'
        ? <Sun  size={15} />
        : <Moon size={15} />
      }
    </button>
  )
}
