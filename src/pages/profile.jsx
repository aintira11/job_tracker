import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api.js'
import { getUser, updateUserSession, fetchUser } from '../models/user.js'

export default function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  // ข้อมูลเปลี่ยนรหัสผ่าน
  // const [currentPassword, setCurrentPassword] = useState('')
  // const [newPassword, setNewPassword] = useState('')
  // const [confirmPassword, setConfirmPassword] = useState('')
  // const [changingPassword, setChangingPassword] = useState(false)

  // โหลดข้อมูล profile เมื่อเข้าหน้า
  useEffect(() => {
    const user = getUser()
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatarUrl || '')
    } else {
      // ถ้าไม่มีใน session ให้ดึงจาก API
      fetchUser().then(userData => {
        if (userData) {
          setName(userData.name || '')
          setEmail(userData.email || '')
          setAvatar(userData.avatarUrl || '')
        }
      })
    }
  }, [])

  // upload ไป Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'image_jobtracker')

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dtrqbzv6r/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await res.json()
    return data.secure_url
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)

    try {
      const url = await uploadImage(file)
      setAvatar(url)
    } catch {
      setErr('upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setErr('')
    setSuccess('')
    try {
      const { res, data } = await apiFetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          avatarUrl: avatar,
        }),
      })

      if (!res.ok) {
        setErr(data?.message || 'save failed')
        return
      }

      // อัปเดต session ทันที
      updateUserSession({ name, avatarUrl: avatar })
      setSuccess('Profile saved!')
    } catch {
      setErr('error')
    }
  }

  // const handleChangePassword = async () => {
  //   setErr('')
  //   setSuccess('')

  //   if (!currentPassword || !newPassword || !confirmPassword) {
  //     setErr('Please fill in all password fields')
  //     return
  //   }

  //   if (newPassword !== confirmPassword) {
  //     setErr('New passwords do not match')
  //     return
  //   }

  //   if (newPassword.length < 6) {
  //     setErr('New password must be at least 6 characters')
  //     return
  //   }

  //   setChangingPassword(true)
  //   try {
  //     const { res, data } = await apiFetch('/profile/password', {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         currentPassword,
  //         newPassword,
  //       }),
  //     })

  //     if (!res.ok) {
  //       setErr(data?.message || 'Failed to change password')
  //       return
  //     }

  //     setSuccess('Password changed successfully!')
  //     setCurrentPassword('')
  //     setNewPassword('')
  //     setConfirmPassword('')
  //   } catch {
  //     setErr('Failed to change password')
  //   } finally {
  //     setChangingPassword(false)
  //   }
  // }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1>Profile</h1>

      {/* รูป */}
      <div style={{ marginBottom: 12, textAlign: 'center' }}>
        <img
          src={preview || avatar || 'https://via.placeholder.com/150'}
          alt="avatar"
          width={150}
          height={150}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ marginTop: 8 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {loading && <p>Uploading...</p>}
      </div>

      {/* email (readonly) */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          style={{ width: '100%', padding: '8px', opacity: 0.7 }}
        />
      </div>

      {/* name */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Name</label>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button onClick={handleSave} disabled={loading} style={{ marginBottom: 24 }}>
        Save Profile
      </button>

      {/* เปลี่ยนรหัสผ่าน */}
      {/* <div style={{ borderTop: '1px solid #ddd', paddingTop: 16 }}>
        <h2>Change Password</h2>
        
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>New Password</label>
          <input
            type="password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div> */}

        {/* <button onClick={handleChangePassword} disabled={changingPassword}>
          {changingPassword ? 'Changing password...' : 'Change Password'}
        </button> */}
      {/* </div> */}

      {err && <p style={{ color: 'red', marginTop: 12 }}>{err}</p>}
      {success && <p style={{ color: 'green', marginTop: 12 }}>{success}</p>}
    </div>
  )
}