import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, ShieldCheck, UserCheck, Key, Building2, X, Save, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { FACULTY_LIST } from '../../context/DashboardContext';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    username: '',
    password: '',
    name: '',
    faculty_prefix: 'fkip',
    role: 'admin'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      username: '',
      password: '',
      name: '',
      faculty_prefix: 'fkip',
      role: 'admin'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      username: user.username,
      password: '', // leave empty unless changing
      name: user.name,
      faculty_prefix: user.faculty_prefix,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || (!isEditing && (!formData.username.trim() || !formData.password.trim()))) {
      Swal.fire('Perhatian', 'Nama, username, dan password wajib diisi!', 'warning');
      return;
    }

    try {
      const url = isEditing ? `/api/users/${formData.id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchUsers();
      } else {
        Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat menyimpan data.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal menghubungi server database.', 'error');
    }
  };

  const handleDelete = (user) => {
    if (user.username === 'admin') {
      Swal.fire('Dilarang', 'Akun Super Admin Utama tidak boleh dihapus!', 'warning');
      return;
    }

    Swal.fire({
      title: 'Hapus Akun Pengguna?',
      text: `Apakah Anda yakin ingin menghapus akun "${user.username}" (${user.name})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Terhapus!',
              text: 'Pengguna berhasil dihapus.',
              timer: 1500,
              showConfirmButton: false
            });
            fetchUsers();
          } else {
            Swal.fire('Gagal', data.message || 'Gagal menghapus pengguna.', 'error');
          }
        } catch (err) {
          Swal.fire('Error', 'Gagal menghubungi server.', 'error');
        }
      }
    });
  };

  const getFacultyName = (prefix) => {
    const f = FACULTY_LIST.find(item => item.prefix === prefix);
    return f ? f.name : prefix.toUpperCase();
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
                        (u.username && u.username.toLowerCase().includes(search.toLowerCase()));
    const matchFaculty = facultyFilter === 'ALL' || u.faculty_prefix === facultyFilter;
    return matchSearch && matchFaculty;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        padding: '1.75rem 2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Users size={24} />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Manajemen Pengguna & Akun Fakultas</h2>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            Buat dan kelola akun operator untuk setiap fakultas di lingkungan Universitas Riau.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            background: 'white',
            color: '#1e3a8a',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={18} /> Buat Akun Fakultas Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem 0.6rem 2.4rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Fakultas:</span>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              background: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Semua Fakultas ({users.length})</option>
            {FACULTY_LIST.map(f => (
              <option key={f.prefix} value={f.prefix}>
                {f.code} - {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Pengguna</th>
                <th style={{ padding: '1rem 1.5rem' }}>Username</th>
                <th style={{ padding: '1rem 1.5rem' }}>Fakultas / Unit</th>
                <th style={{ padding: '1rem 1.5rem' }}>Hak Akses (Role)</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    Tidak ada akun pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuper = user.role === 'superadmin' || user.username === 'admin';
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: isSuper ? '#dbeafe' : '#f1f5f9',
                            color: isSuper ? '#1d4ed8' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                          }}>
                            {isSuper ? <ShieldCheck size={20} /> : <UserCheck size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', color: '#334155', fontWeight: 600, fontSize: '0.85rem' }}>
                          {user.username}
                        </code>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
                          <Building2 size={16} color="#64748b" />
                          <span style={{ fontWeight: 500 }}>{getFacultyName(user.faculty_prefix)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isSuper ? '#eff6ff' : '#ecfdf5',
                          color: isSuper ? '#1d4ed8' : '#059669',
                          border: `1px solid ${isSuper ? '#bfdbfe' : '#a7f3d0'}`
                        }}>
                          {isSuper ? 'Super Admin' : 'Admin Fakultas'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Ubah Data Pengguna"
                            style={{
                              padding: '0.45rem',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '0.375rem',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          {user.username !== 'admin' && (
                            <button
                              onClick={() => handleDelete(user)}
                              title="Hapus Pengguna"
                              style={{
                                padding: '0.45rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.375rem',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Pengguna */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isEditing ? <Edit size={18} color="#2563eb" /> : <Plus size={18} color="#2563eb" />}
                {isEditing ? 'Ubah Akun Fakultas' : 'Buat Akun Fakultas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.4rem', borderRadius: '0.375rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Nama Lengkap Admin / Operator
                </label>
                <input
                  type="text"
                  placeholder="Misal: Operator Admin FKIP UNRI"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Misal: admin_fkip"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                  {isEditing ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder={isEditing ? 'Masukkan password baru...' : 'Misal: admin123'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  required={!isEditing}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                    Fakultas / Unit
                  </label>
                  <select
                    value={formData.faculty_prefix}
                    onChange={(e) => setFormData({ ...formData, faculty_prefix: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  >
                    {FACULTY_LIST.map(f => (
                      <option key={f.prefix} value={f.prefix}>
                        {f.code} - {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase' }}>
                    Hak Akses (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="admin">Admin Fakultas</option>
                    <option value="superadmin">Super Admin (Akses Semua)</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={16} /> Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
