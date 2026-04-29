// User model - จัดการข้อมูล user ใน session
import { getToken, setToken, clearToken, apiFetch } from '../lib/api.js'

const USER_KEY = 'user'

// ดึงข้อมูล user จาก session storage
export function getUser() {
  const userStr = sessionStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// บันทึกข้อมูล user ลง session storage
export function setUser(user) {
  if (!user) {
    sessionStorage.removeItem(USER_KEY)
    return
  }
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ล้างข้อมูล user (logout)
export function clearUser() {
  sessionStorage.removeItem(USER_KEY)
}

// ดึงข้อมูล user จาก API
export async function fetchUser() {
  try {
    const { res, data } = await apiFetch('/profile')
    if (res.ok && data) {
      setUser(data)
      return data
    }
  } catch (e) {
    console.error('Failed to fetch user:', e)
  }
  return null
}

// ตรวจสอบว่า login หรือยัง
export function isLoggedIn() {
  return Boolean(getToken())
}

// Login และเก็บ session
export async function login(email, password) {
  const { res, data } = await apiFetch('/login', {
    method: 'POST',
    skipAuth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error(data?.message || 'Login failed')
  }

  if (data?.token) {
    setToken(data.token)
    // ดึงข้อมูล user หลัง login
    await fetchUser()
  }

  return data
}

// Logout
export function logout() {
  clearToken()
  clearUser()
}

// อัปเดตข้อมูล user ใน session (หลังแก้ไข profile)
export function updateUserSession(updates) {
  const currentUser = getUser()
  if (currentUser) {
    setUser({ ...currentUser, ...updates })
  }
}