import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Users as UsersIcon, UserPlus, Eye, EyeOff } from 'lucide-react';

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    role: string;
    status: string;
    plainPassword?: string;
}

const Users = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this sub-admin?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter((u) => u._id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const togglePassword = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getAvatar = (name: string) => name?.charAt(0)?.toUpperCase() || '?';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: '#FF8C00', borderRightColor: 'rgba(255,140,0,0.3)' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        <UsersIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">User Details</h1>
                        <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>
                            {users.length} Sub-Admin{users.length !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/users/add')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                    <UserPlus size={16} />
                    Add New User
                </button>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,120,0,0.15)',
                    backdropFilter: 'blur(12px)'
                }}>
                {/* Table Header */}
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,140,0,0.7)' }}>
                        Sub-Admin Accounts
                    </p>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(255,107,0,0.15)', color: '#FF8C00', border: '1px solid rgba(255,107,0,0.3)' }}>
                        {users.length} Total
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['User', 'Gender', 'Email', 'Password', 'Phone', 'Address', 'Type', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'rgba(255,180,80,0.5)' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, index) => (
                                <tr key={u._id}
                                    className="transition-all duration-200"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,107,0,0.05)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                >
                                    {/* User with Avatar */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{
                                                    background: `hsl(${(index * 60) + 20}, 80%, 50%)`,
                                                    boxShadow: `0 0 12px hsla(${(index * 60) + 20}, 80%, 50%, 0.4)`
                                                }}>
                                                {getAvatar(u.name)}
                                            </div>
                                            <span className="text-sm font-semibold text-white whitespace-nowrap">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{u.gender || '—'}</td>
                                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,200,120,0.8)' }}>{u.email}</td>

                                    {/* Password with toggle */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                {u.plainPassword
                                                    ? (visiblePasswords[u._id] ? u.plainPassword : '••••••••')
                                                    : <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Not set</span>
                                                }
                                            </span>
                                            {u.plainPassword && (
                                                <button onClick={() => togglePassword(u._id)}
                                                    className="p-1 rounded transition-colors"
                                                    style={{ color: 'rgba(255,140,0,0.6)' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,140,0,0.6)'; }}
                                                >
                                                    {visiblePasswords[u._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{u.phone || '—'}</td>
                                    <td className="px-4 py-3 text-sm max-w-[120px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{u.address || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                            style={{ background: 'rgba(255,107,0,0.15)', color: '#FF8C00', border: '1px solid rgba(255,107,0,0.3)' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                            style={u.status === 'ACTIVE'
                                                ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                                                : { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
                                            }>
                                            {u.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => navigate(`/users/edit/${u._id}`)}
                                                className="p-2 rounded-lg transition-all duration-200"
                                                title="Edit User"
                                                style={{ color: 'rgba(255,140,0,0.7)', background: 'rgba(255,140,0,0.08)' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,140,0,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,140,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,140,0,0.7)'; }}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            {u._id !== currentUser?._id && (
                                                <button onClick={() => handleDelete(u._id)}
                                                    className="p-2 rounded-lg transition-all duration-200"
                                                    title="Delete User"
                                                    style={{ color: 'rgba(239,68,68,0.7)', background: 'rgba(239,68,68,0.08)' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                                <UsersIcon size={26} style={{ color: 'rgba(255,140,0,0.5)' }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No sub-admins found</p>
                            <button onClick={() => navigate('/users/add')}
                                className="text-xs font-semibold px-4 py-2 rounded-xl mt-1 transition-all"
                                style={{ background: 'rgba(255,107,0,0.15)', color: '#FF8C00', border: '1px solid rgba(255,107,0,0.3)' }}>
                                + Add your first sub-admin
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
