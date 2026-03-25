import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Authentication/AuthContext';
import { API_BASE_URL } from '../App/config';
import { FaUserCircle, FaCamera, FaKey, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import './Settings.css';

function Settings() {
  const { token } = useAuth();

  // --- Profile Info ---
  const [userInfo, setUserInfo] = useState({ username: '', email: '', avatar_url: '' });

  // --- Avatar ---
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ text: '', type: '' });
  const fileInputRef = useRef();

  // --- Username ---
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState({ text: '', type: '' });

  // --- Password ---
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/info`, { headers: authHeaders });
        const data = await res.json();
        setUserInfo(data);
        setNewUsername(data.username);
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      } catch (e) {
        console.error('Failed to fetch user info', e);
      }
    };
    fetchInfo();
  }, [token]);

  // --- Avatar Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg({ text: 'Image must be under 2MB.', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarPreview || avatarPreview === userInfo.avatar_url) return;
    setAvatarLoading(true);
    setAvatarMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ avatarBase64: avatarPreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserInfo(prev => ({ ...prev, avatar_url: avatarPreview }));
      setAvatarMsg({ text: 'Profile photo updated!', type: 'success' });
    } catch (err) {
      setAvatarMsg({ text: err.message || 'Failed to update photo.', type: 'error' });
    } finally {
      setAvatarLoading(false);
    }
  };

  // --- Username Handler ---
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim() === userInfo.username) return;
    setUsernameLoading(true);
    setUsernameMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/user/username`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ newUsername: newUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserInfo(prev => ({ ...prev, username: data.username }));
      setUsernameMsg({ text: 'Username updated successfully!', type: 'success' });
    } catch (err) {
      setUsernameMsg({ text: err.message || 'Failed to update username.', type: 'error' });
    } finally {
      setUsernameLoading(false);
    }
  };

  // --- Password Handler ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-grid">

        {/* --- Avatar Card --- */}
        <div className="settings-card avatar-card">
          <div className="card-header">
            <FaCamera className="card-icon" />
            <h2>Profile Photo</h2>
          </div>
          <div className="avatar-section">
            <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="avatar-img" />
                : <FaUserCircle className="avatar-placeholder" />}
              <div className="avatar-overlay">
                <FaCamera className="overlay-icon" />
                <span>Change Photo</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <p className="avatar-hint">Click to upload · Max 2MB</p>
            {avatarMsg.text && (
              <div className={`settings-alert ${avatarMsg.type}`}>
                {avatarMsg.type === 'success' ? <FaCheck /> : <FaTimes />}
                {avatarMsg.text}
              </div>
            )}
            <button
              className="settings-btn primary"
              onClick={handleAvatarSave}
              disabled={avatarLoading || !avatarPreview || avatarPreview === userInfo.avatar_url}
            >
              {avatarLoading ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>

        {/* --- Username Card --- */}
        <div className="settings-card">
          <div className="card-header">
            <FaUser className="card-icon" />
            <h2>Change Username</h2>
          </div>
          <form onSubmit={handleUsernameSubmit} className="settings-form">
            <div className="form-group">
              <label>Current Username</label>
              <div className="current-value">{userInfo.username}</div>
            </div>
            <div className="form-group">
              <label htmlFor="new-username">New Username</label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                minLength={3}
                className="settings-input"
              />
            </div>
            {usernameMsg.text && (
              <div className={`settings-alert ${usernameMsg.type}`}>
                {usernameMsg.type === 'success' ? <FaCheck /> : <FaTimes />}
                {usernameMsg.text}
              </div>
            )}
            <button
              type="submit"
              className="settings-btn primary"
              disabled={usernameLoading || !newUsername.trim() || newUsername.trim() === userInfo.username}
            >
              {usernameLoading ? 'Updating...' : 'Update Username'}
            </button>
          </form>
        </div>

        {/* --- Password Card --- */}
        <div className="settings-card password-card">
          <div className="card-header">
            <FaKey className="card-icon" />
            <h2>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="current-pass">Current Password</label>
              <input
                id="current-pass"
                type="password"
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                placeholder="Enter current password"
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-pass">New Password</label>
              <input
                id="new-pass"
                type="password"
                value={passwords.newPass}
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Enter new password"
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pass">Confirm New Password</label>
              <input
                id="confirm-pass"
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Confirm new password"
                className={`settings-input ${passwords.confirm && passwords.newPass !== passwords.confirm ? 'input-error' : ''}`}
              />
              {passwords.confirm && passwords.newPass !== passwords.confirm && (
                <span className="mismatch-msg">Passwords don't match</span>
              )}
            </div>
            {passwordMsg.text && (
              <div className={`settings-alert ${passwordMsg.type}`}>
                {passwordMsg.type === 'success' ? <FaCheck /> : <FaTimes />}
                {passwordMsg.text}
              </div>
            )}
            <button
              type="submit"
              className="settings-btn primary"
              disabled={passwordLoading || !passwords.current || !passwords.newPass || !passwords.confirm}
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>

      {/* Account Info footer */}
      <div className="settings-card info-card">
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value">{userInfo.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Member since</span>
          <span className="info-value">
            {userInfo.joined_at ? new Date(userInfo.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Settings;
