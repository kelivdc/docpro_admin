export type LogActionTone = 'blue' | 'red' | 'emerald' | 'amber'

export const adminActionLabels: Record<string, { label: string; tone: LogActionTone }> = {
  'admin.create': { label: 'Membuat Admin', tone: 'blue' },
  'admin.delete': { label: 'Menghapus Admin', tone: 'red' },
  'admin.block': { label: 'Memblokir Admin', tone: 'red' },
  'admin.unblock': { label: 'Membuka Blokir Admin', tone: 'emerald' },
  'admin.update_status': { label: 'Ubah Status Admin', tone: 'amber' },
  'admin.update_level': { label: 'Ubah Level Admin', tone: 'amber' },
  'admin.update_profile': { label: 'Ubah Profil Admin', tone: 'blue' },
  'admin.update_permissions': { label: 'Ubah Permission Admin', tone: 'blue' },
  'admin.change_password': { label: 'Ganti Password Admin', tone: 'amber' },
  'user.delete': { label: 'Menghapus User', tone: 'red' },
  'user.update_status': { label: 'Ubah Status User', tone: 'amber' },
  'user.change_password': { label: 'Ganti Password User', tone: 'amber' },
}

export const logActionToneClass: Record<LogActionTone, string> = {
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
}
