import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Swords, Sparkles, Star, Shield, Crown } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

const rarityStyles = {
  common: 'from-slate-700 to-slate-900 border-slate-700',
  rare: 'from-indigo-600 to-indigo-900 border-indigo-700',
  epic: 'from-fuchsia-600 to-purple-900 border-fuchsia-700',
  legendary: 'from-amber-500 to-orange-900 border-amber-600'
}

function Pill({ children, color = 'slate' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-${color}-900/40 border border-${color}-500/40 text-${color}-100`}>{children}</span>
  )
}

function RarityBadge({ rarity }) {
  const Icon = rarity === 'legendary' ? Crown : rarity === 'epic' ? Star : rarity === 'rare' ? Shield : Sparkles
  const label = rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : 'Common'
  return (
    <div className="flex items-center gap-1 text-xs text-white/80">
      <Icon size={14} />
      <span>{label}</span>
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('common')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const gradient = useMemo(() => {
    const style = rarityStyles[priority] || rarityStyles.common
    return style
  }, [priority])

  async function fetchTasks() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (e) {
      setError('Failed to load quests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, priority })
      })
      const data = await res.json()
      setTasks(prev => [data, ...prev])
      setTitle('')
      setDesc('')
    } catch (e) {
      setError('Could not forge the quest')
    }
  }

  async function toggleComplete(id, completed) {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      const data = await res.json()
      setTasks(prev => prev.map(t => t.id === id ? data : t))
    } catch (e) { setError('Spell fizzled: update failed') }
  }

  async function removeTask(id) {
    try {
      await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (e) { setError('Could not banish the quest') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-2 rounded-xl shadow-lg shadow-fuchsia-900/20">
            <Swords size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wide">Quest Log</h1>
            <p className="text-slate-400 text-sm">Forge tasks, complete quests, and claim glory.</p>
          </div>
        </header>

        <form onSubmit={addTask} className={`relative mb-8 rounded-2xl border p-5 bg-gradient-to-br ${gradient} shadow-xl`}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative grid md:grid-cols-5 gap-3 items-center">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Name your quest"
              className="md:col-span-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
            />
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What must be done?"
              className="md:col-span-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
            />
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none">
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
            <button className="md:col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 transition text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-fuchsia-900/30">
              <Plus size={18} /> Forge
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 text-rose-300 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-slate-400">Consulting the oracle...</div>
          ) : tasks.length === 0 ? (
            <div className="text-slate-400">No quests yet. Forge your first one above.</div>
          ) : (
            tasks.map(task => {
              const style = rarityStyles[task.priority || 'common'] || rarityStyles.common
              return (
                <div key={task.id} className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${style}`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="relative flex items-start gap-4">
                    <button onClick={() => toggleComplete(task.id, task.completed)} className={`mt-1 rounded-full p-2 border transition ${task.completed ? 'bg-emerald-600/30 border-emerald-500/50' : 'bg-black/40 border-white/10 hover:border-white/30'}`}>
                      <CheckCircle2 className={task.completed ? 'text-emerald-300' : 'text-slate-300'} size={22} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-bold ${task.completed ? 'line-through text-slate-300/60' : ''}`}>{task.title}</h3>
                        <RarityBadge rarity={task.priority || 'common'} />
                      </div>
                      {task.description && (
                        <p className={`text-sm text-slate-200/90 ${task.completed ? 'line-through opacity-60' : ''}`}>{task.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-300/70">
                        <Pill color="fuchsia"><Sparkles size={14} /> XP +10</Pill>
                        <Pill color="amber"><Star size={14} /> Loot chance</Pill>
                      </div>
                    </div>
                    <button onClick={() => removeTask(task.id)} className="ml-2 p-2 rounded-lg bg-black/40 border border-white/10 hover:border-rose-400/40 text-rose-300">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default App
