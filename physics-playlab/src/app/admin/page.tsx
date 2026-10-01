'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getAllUsers, deleteUser, ADMIN_EMAIL } from '@/lib/firestore'
import styles from './page.module.css'

type UserRow = {
  uid: string
  email: string
  displayName: string
  updatedAt?: unknown
  islandProgress?: Record<string, { learnDone: boolean; labDone: boolean; quizScore: number; flagPlanted: boolean }>
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<UserRow | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.replace('/login'); return }
      const data = await getAllUsers()
      setUsers(data.filter(u => u.email !== ADMIN_EMAIL) as UserRow[])
      setLoading(false)
    })
    return unsub
  }, [router])

  const handleDelete = async (uid: string) => {
    if (!confirm('ลบข้อมูลผู้ใช้นี้?')) return
    await deleteUser(uid)
    setUsers(u => u.filter(x => x.uid !== uid))
    if (selected?.uid === uid) setSelected(null)
  }

  const completedCount = (u: UserRow) =>
    Object.values(u.islandProgress ?? {}).filter(p => p.flagPlanted).length

  if (loading) return <div className={styles.loading}>กำลังโหลด...</div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <span className={styles.badge}>{users.length} users</span>
        <button className={styles.logoutBtn} onClick={() => signOut(auth).then(() => router.push('/login'))}>
          ออกจากระบบ
        </button>
      </header>

      <div className={styles.layout}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>Email</th>
                <th>UID</th>
                <th>เกาะสำเร็จ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.uid}
                  className={selected?.uid === u.uid ? styles.rowSelected : ''}
                  onClick={() => setSelected(u)}
                >
                  <td>{u.displayName || '—'}</td>
                  <td>{u.email}</td>
                  <td className={styles.uid}>{u.uid}</td>
                  <td className={styles.center}>{completedCount(u)} / 6</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={e => { e.stopPropagation(); handleDelete(u.uid) }}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>ยังไม่มีผู้ใช้</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className={styles.detail}>
            <h2 className={styles.detailName}>{selected.displayName}</h2>
            <p className={styles.detailEmail}>{selected.email}</p>
            <p className={styles.detailUid}>{selected.uid}</p>
            <h3 className={styles.progressTitle}>Progress</h3>
            <div className={styles.progressGrid}>
              {Object.entries(selected.islandProgress ?? {}).map(([id, p]) => (
                <div key={id} className={`${styles.progressItem} ${p.flagPlanted ? styles.done : ''}`}>
                  <span className={styles.islandId}>{id}</span>
                  <span>{p.flagPlanted ? '✓ สำเร็จ' : p.quizScore >= 0 ? `Quiz: ${p.quizScore}/10` : 'กำลังเรียน'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
