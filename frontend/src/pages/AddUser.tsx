import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Loader2, User, Mail, Phone, MapPin, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

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

const AddUser = () => {
    const [formData, setFormData] = useState({
        name: '', gender: 'Male', email: '', phone: '',
        address: '', role: 'SUBADMIN', status: 'ACTIVE', password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users', formData);
            setSuccess(true);
            setTimeout(() => navigate('/users'), 1200);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

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
                        <UserPlus size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Add New User</h1>
                        <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>Create a new sub-admin account</p>
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
                            User created! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Full Name" icon={User} type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
                            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="Male" style={{ background: '#1a1035' }}>Male</option>
                                <option value="Female" style={{ background: '#1a1035' }}>Female</option>
                                <option value="Other" style={{ background: '#1a1035' }}>Other</option>
                            </SelectField>
                            <InputField label="Email Address" icon={Mail} type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="user@example.com" />
                            <InputField label="Phone Number" icon={Phone} type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                            <SelectField label="User Role" name="role" value={formData.role} onChange={handleChange}>
                                <option value="SUBADMIN" style={{ background: '#1a1035' }}>Coordinator (Sub-Admin)</option>
                                <option value="ADMIN" style={{ background: '#1a1035' }}>Admin</option>
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
                                    <textarea name="address" rows={2} value={formData.address} onChange={handleChange}
                                        placeholder="Full address..."
                                        style={{ ...inputStyle, paddingLeft: '38px', resize: 'none' }}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(255,140,0,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,120,0,0.2)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="Initial Password" icon={Lock} type="text" name="password" required value={formData.password} onChange={handleChange} placeholder="Set a strong password" />
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
                            <button type="submit" disabled={loading}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; }}>
                                {loading ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><UserPlus size={16} /> Create User</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
