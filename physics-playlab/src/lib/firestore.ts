import { db } from './firebase'
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore'
import type { UserProgress } from './progress'

export async function loadProgress(uid: string): Promise<UserProgress | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  if (!data.islandProgress) return null
  return { userName: data.displayName || 'นักเรียน', islandProgress: data.islandProgress }
}

export const ADMIN_EMAIL = 'zenadmin67@gmail.com'

export async function syncUser(uid: string, email: string, displayName: string) {
  await setDoc(doc(db, 'users', uid), { uid, email, displayName, updatedAt: serverTimestamp() }, { merge: true })
}

export async function syncProgress(uid: string, progress: UserProgress) {
  await setDoc(doc(db, 'users', uid), { islandProgress: progress.islandProgress, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data())
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, 'users', uid))
}
