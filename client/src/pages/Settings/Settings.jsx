import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useUser } from '../../contexts/UserContext';
import './Settings.css';

const Settings = () => {
  const { user: contextUser, updateUser, updateAvatar } = useUser();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: '',
    esPrivado: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/usuarios/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          esPrivado: data.esPrivado || false
        });
        setPreviewAvatar(data.avatar || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'avatar') {
      setPreviewAvatar(value);
    }
  }, []);

  const handleUploadAvatar = useCallback(async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('/api/usuarios/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          avatar: data.avatarUrl
        }));
        setPreviewAvatar(data.avatarUrl);
        setAvatarFile(null);
        
        // Actualizar avatar en el contexto inmediatamente
        updateAvatar(data.avatarUrl);
        
        setSuccess('Avatar subido correctamente');
        
        // Limpiar input de archivo
        const fileInput = document.getElementById('avatar-file');
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al subir el avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Error de conexión al subir el avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }, [avatarFile, updateAvatar]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usuarios/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        
        // Actualizar usuario completo en el contexto
        const newUserData = {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar
        };
        updateUser(newUserData);
        
        setSuccess('Perfil actualizado correctamente');
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error de conexión al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }, [formData, updateUser]);

  const handleAvatarFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      setAvatarFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const clearAvatarPreview = useCallback(() => {
    setAvatarFile(null);
    setPreviewAvatar(formData.avatar);
    const fileInput = document.getElementById('avatar-file');
    if (fileInput) fileInput.value = '';
  }, [formData.avatar]);

  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="settings-header">
          <h1>Configuración</h1>
          <p>Personaliza tu perfil y preferencias</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2>Información del perfil</h2>
            
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <label>Foto de perfil</label>
                
                {/* Preview del avatar */}
                <div className="avatar-section">
                  <div className="avatar-preview-large">
                    {previewAvatar ? (
                      <img 
                        src={previewAvatar} 
                        alt="Preview" 
                        onError={() => setPreviewAvatar('')}
                      />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {formData.username ? formData.username.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="avatar-controls">
                    {/* Subir desde archivo */}
                    <div className="upload-section">
                      <input
                        type="file"
                        id="avatar-file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="file-input"
                      />
                      <label htmlFor="avatar-file" className="file-label">
                        📁 Seleccionar archivo
                      </label>
                      
                      {avatarFile && (
                        <div className="file-actions">
                          <button
                            type="button"
                            onClick={handleUploadAvatar}
                            disabled={uploadingAvatar}
                            className="upload-btn"
                          >
                            {uploadingAvatar ? (
                              <>
                                <LoadingSpinner size="small" />
                                Subiendo...
                              </>
                            ) : (
                              '⬆️ Subir imagen'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={clearAvatarPreview}
                            className="cancel-upload-btn"
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* O usar URL */}
                    <div className="url-section">
                      <span className="divider">o</span>
                      <input
                        type="url"
                        id="avatar"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleInputChange}
                        placeholder="https://ejemplo.com/mi-avatar.jpg"
                        className="input-field"
                      />
                      <small className="form-help">
                        También puedes usar una URL de imagen externa
                      </small>
                    </div>
                  </div>
                </div>
                
                <small className="form-help">
                  Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WebP
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Tu nombre de usuario"
                  className="input-field"
                  maxLength={30}
                  minLength={3}
                  required
                />
                <small className="form-help">
                  Entre 3 y 30 caracteres. Solo letras, números y guiones bajos.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Biografía</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos sobre ti..."
                  className="textarea-field"
                  maxLength={200}
                  rows={4}
                />
                <small className="form-help">
                  Máximo 200 caracteres. {200 - formData.bio.length} restantes.
                </small>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="esPrivado"
                    name="esPrivado"
                    checked={formData.esPrivado}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <label htmlFor="esPrivado" className="checkbox-label">
                    <span className="checkbox-icon">
                      {formData.esPrivado ? '🔒' : '🌍'}
                    </span>
                    Perfil privado
                  </label>
                </div>
                <small className="form-help">
                  Si tu perfil es privado, solo tus seguidores podrán ver tus publicaciones.
                </small>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="settings-section">
            <h2>Información de la cuenta</h2>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha de registro:</span>
                <span className="info-value">
                  {user?.fechaRegistro ? 
                    new Date(user.fechaRegistro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'No disponible'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Seguidores:</span>
                <span className="info-value">{user?.seguidores?.length || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Siguiendo:</span>
                <span className="info-value">{user?.siguiendo?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
