import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle, Pencil, Lock, ArrowLeft } from 'lucide-react';

const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,120,0,0.2)',
    borderRadius: '12px',
    color: 'white',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    fontSize: '14px',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
    color: 'rgba(255,200,120,0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const InputField = ({ label, icon: Icon, ...props }: { label: string; icon: React.ElementType;[key: string]: any }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
            {Icon && (
                <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'rgba(255,140,0,0.6)', pointerEvents: 'none' }}>
                    <Icon size={16} />
                </div>
            )}
            <input
                {...props}
                style={{ ...inputStyle, paddingLeft: Icon ? '38px' : '14px' }}
                onFocus={e => {
                    e.target.style.borderColor = 'rgba(255,140,0,0.7)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.09)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,120,0,0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
            />
        </div>
    </div>
);

const SelectField = ({ label, children, ...props }: { label: string; children: React.ReactNode;[key: string]: any }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <select
            {...props}
            style={{
                ...inputStyle,
                appearance: 'none',
                cursor: 'pointer',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,140,0,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '36px',
            }}
            onFocus={e => {
                e.target.style.borderColor = 'rgba(255,140,0,0.7)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.12)';
            }}
            onBlur={e => {
                e.target.style.borderColor = 'rgba(255,120,0,0.2)';
                e.target.style.boxShadow = 'none';
            }}
        >
            {children}
        </select>
    </div>
);

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', userId: '', email: '', phone: '',
        address: '', gender: '', role: '', status: '', password: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get(`/users/${id}`);
                if (data) {
                    setFormData({
                        name: data.name || '',
                        userId: data.userId || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        gender: data.gender || '',
                        role: data.role || 'SUBADMIN',
                        status: data.status || 'ACTIVE',
                        password: ''
                    });
                } else {
                    setError('User not found');
                }
            } catch {
                setError('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await api.put(`/users/${id}`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/users'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: '#FF8C00', borderRightColor: 'rgba(255,140,0,0.3)' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading user...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/users')}
                    className="p-2 rounded-xl transition-all duration-200"
                    style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,140,0,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        <Pencil size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Edit Sub-Admin</h1>
                        <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>Update user account details</p>
                    </div>
                </div>
            </div>

            {/* Form card */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,120,0,0.15)',
                    backdropFilter: 'blur(12px)'
                }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,140,0,0.7)' }}>
                        Account Information
                    </p>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                            <CheckCircle2 size={16} />
                            User updated! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Full Name" icon={User} type="text" name="name" required value={formData.name} onChange={handleChange} />
                            <InputField label="Email Address" icon={Mail} type="email" name="email" required value={formData.email} onChange={handleChange} />
                            <InputField
                                label="New Password (leave blank to keep)"
                                icon={Lock}
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Type new password..."
                            />
                            <InputField label="Phone Number" icon={Phone} type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="" style={{ background: '#1a1035' }}>Select Gender</option>
                                <option value="Male" style={{ background: '#1a1035' }}>Male</option>
                                <option value="Female" style={{ background: '#1a1035' }}>Female</option>
                                <option value="Other" style={{ background: '#1a1035' }}>Other</option>
                            </SelectField>
                            <SelectField label="Account Status" name="status" value={formData.status} onChange={handleChange}>
                                <option value="ACTIVE" style={{ background: '#1a1035' }}>● Active</option>
                                <option value="INACTIVE" style={{ background: '#1a1035' }}>● Inactive</option>
                            </SelectField>
                            <div className="md:col-span-2">
                                <label style={labelStyle}>Address</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'rgba(255,140,0,0.6)', pointerEvents: 'none' }}>
                                        <MapPin size={16} />
                                    </div>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange as any}
                                        placeholder="Full address..."
                                        style={{ ...inputStyle, paddingLeft: '38px' }}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(255,140,0,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,120,0,0.2)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="button" onClick={() => navigate('/users')}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; }}>
                                {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><CheckCircle2 size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
