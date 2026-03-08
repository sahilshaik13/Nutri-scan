'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ChevronLeft, Leaf, User, Mail, Calendar,
  AlertTriangle, Heart, Activity, Utensils,
  Pencil, Check, X, LogOut,
} from 'lucide-react'

const neu = {
  raised:  '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff',
  sm:      '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff',
  inset:   'inset 3px 3px 8px #c4ccc5, inset -3px -3px 8px #ffffff',
  pressed: 'inset 2px 2px 5px #c0c8c1, inset -2px -2px 5px #f4faf5',
}

interface HealthProfile {
  full_name: string | null
  age: number | null
  allergies: string[]
  intolerances: string[]
  medical_conditions: string[]
  dietary_lifestyles: string[]
}

const ALLERGY_OPTIONS = ['Gluten','Dairy','Eggs','Peanuts','Tree Nuts','Soy','Fish','Shellfish','Wheat','Sesame','Mustard','Celery','Lupin','Molluscs']
const INTOLERANCE_OPTIONS = ['Lactose','Fructose','Histamine','Sulfites','Salicylates','FODMAPs','Caffeine','Alcohol','Artificial Sweeteners','MSG']
const CONDITION_OPTIONS = ['Diabetes Type 1','Diabetes Type 2','Hypertension','High Cholesterol','Heart Disease','Kidney Disease','IBS','Crohn\'s Disease','Celiac Disease','GERD','Gout','Anemia','Thyroid Disorder','PCOS']
const LIFESTYLE_OPTIONS = ['Vegetarian','Vegan','Pescatarian','Keto','Paleo','Mediterranean','Low Carb','Low Fat','Low Sodium','Halal','Kosher','Gluten Free','Dairy Free','Organic Only','No Processed Foods']

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<HealthProfile>({ full_name: null, age: null, allergies: [], intolerances: [], medical_conditions: [], dietary_lifestyles: [] })
  const [editMode, setEditMode] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string | number | string[]>('')

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      const { data } = await supabase.from('health_profiles').select('*').eq('user_id', user.id).single()
      if (data) setProfile({ full_name: data.full_name, age: data.age, allergies: data.allergies || [], intolerances: data.intolerances || [], medical_conditions: data.medical_conditions || [], dietary_lifestyles: data.dietary_lifestyles || [] })
      setIsLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleSave = async (field: string, value: string | number | string[]) => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('health_profiles').update({ [field]: value }).eq('user_id', user.id)
    if (!error) setProfile(prev => ({ ...prev, [field]: value }))
    setEditMode(null); setIsSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const startEdit = (field: string, currentValue: any) => {
    setEditMode(field)
    setTempValue(currentValue || (typeof currentValue === 'number' ? 0 : ''))
  }

  const toggleArrayItem = (item: string) => {
    const arr = tempValue as string[]
    setTempValue(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item])
  }

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#eaf0eb' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
          <Leaf className="h-8 w-8 animate-pulse text-[#3ecf66]" />
        </div>
        <p className="text-sm font-medium text-[#6b7e6d]">Loading profile…</p>
      </div>
    </div>
  )

  const EditableField = ({ field, label, icon, value, type = 'text' }: { field: string; label: string; icon: React.ReactNode; value: string | number | null; type?: string }) => (
    <div className="rounded-2xl p-4 transition-all" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3ecf66]" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7e6d]">{label}</p>
            {editMode === field ? (
              <input
                type={type} autoFocus
                value={tempValue as string | number}
                onChange={e => setTempValue(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                className="mt-1 w-44 rounded-xl px-3 py-1.5 text-sm font-medium text-[#1a231b] outline-none"
                style={{ background: '#eaf0eb', boxShadow: neu.pressed }}
              />
            ) : (
              <p className="mt-0.5 text-sm font-bold text-[#1a231b]">{value || 'Not set'}</p>
            )}
          </div>
        </div>
        {editMode === field ? (
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3ecf66] transition-all hover:scale-110"
              style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              onClick={() => handleSave(field, tempValue as string | number)} disabled={isSaving}>
              <Check className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7e6d] transition-all hover:scale-110"
              style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              onClick={() => setEditMode(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7e6d] transition-all hover:scale-110 hover:text-[#3ecf66]"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}
            onClick={() => startEdit(field, value)}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )

  const ArrayField = ({ field, label, icon, value, options }: { field: string; label: string; icon: React.ReactNode; value: string[]; options: string[] }) => (
    <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3ecf66]" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7e6d]">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-[#1a231b]">{value.length > 0 ? `${value.length} selected` : 'None'}</p>
          </div>
        </div>
        {editMode === field ? (
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3ecf66]"
              style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              onClick={() => handleSave(field, tempValue as string[])} disabled={isSaving}>
              <Check className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7e6d]"
              style={{ background: '#eaf0eb', boxShadow: neu.sm }}
              onClick={() => setEditMode(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7e6d] hover:text-[#3ecf66]"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}
            onClick={() => startEdit(field, value)}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editMode === field ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => toggleArrayItem(opt)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={(tempValue as string[]).includes(opt)
                ? { background: 'linear-gradient(135deg, #3ecf66 0%, #2bb554 100%)', color: '#fff', boxShadow: '3px 3px 7px #becea5' }
                : { background: '#eaf0eb', color: '#6b7e6d', boxShadow: neu.sm }
              }>
              {opt}
            </button>
          ))}
        </div>
      ) : value.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map(item => (
            <span key={item} className="rounded-full px-3 py-1 text-xs font-semibold text-[#3ecf66]"
              style={{ background: 'rgba(62,207,102,0.1)', border: '1px solid rgba(62,207,102,0.2)' }}>
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="min-h-screen pb-28" style={{ background: '#eaf0eb' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 pt-3 pb-2" style={{ background: '#eaf0eb' }}>
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between rounded-2xl px-3" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
          <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <ChevronLeft className="h-5 w-5 text-[#6b7e6d]" />
          </Link>
          <h1 className="text-base font-black text-[#1a231b]">Profile</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <User className="h-10 w-10 text-[#3ecf66]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {profile.full_name || 'User'}
            </h2>
            <p className="mt-0.5 text-sm text-[#6b7e6d]">{email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6">
          <h3 className="mb-3 ml-1 text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">Personal Information</h3>
          <div className="space-y-3">
            <EditableField field="full_name" label="Full Name" icon={<User className="h-4 w-4" />} value={profile.full_name} />
            <div className="rounded-2xl p-4" style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3ecf66]" style={{ background: '#eaf0eb', boxShadow: neu.inset }}>
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7e6d]">Email</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a231b]">{email}</p>
                </div>
              </div>
            </div>
            <EditableField field="age" label="Age" icon={<Calendar className="h-4 w-4" />} value={profile.age} type="number" />
          </div>
        </div>

        {/* Health Preferences */}
        <div className="mb-6">
          <h3 className="mb-3 ml-1 text-[10px] font-black uppercase tracking-widest text-[#6b7e6d]">Health Preferences</h3>
          <div className="space-y-3">
            <ArrayField field="allergies" label="Food Allergies" icon={<AlertTriangle className="h-4 w-4" />} value={profile.allergies} options={ALLERGY_OPTIONS} />
            <ArrayField field="intolerances" label="Food Intolerances" icon={<Heart className="h-4 w-4" />} value={profile.intolerances} options={INTOLERANCE_OPTIONS} />
            <ArrayField field="medical_conditions" label="Medical Conditions" icon={<Activity className="h-4 w-4" />} value={profile.medical_conditions} options={CONDITION_OPTIONS} />
            <ArrayField field="dietary_lifestyles" label="Dietary Lifestyle" icon={<Utensils className="h-4 w-4" />} value={profile.dietary_lifestyles} options={LIFESTYLE_OPTIONS} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-[#e05555] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: '#eaf0eb', boxShadow: neu.sm, border: '1px solid rgba(224,85,85,0.2)' }}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </main>
    </div>
  )
}
