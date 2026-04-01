import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Plus, Trash2, KeyRound } from 'lucide-react';

interface EmailConfig {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
}

const EmailSettings = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [configs, setConfigs] = useState<EmailConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        appPassword: '',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
    });

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/email-configs');
            // Ensure data is an array
            const data = Array.isArray(res.data) ? res.data : [];
            setConfigs(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch configurations');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchConfigs();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Automatically strip all spaces from the App Password
            const cleanData = {
                ...formData,
                appPassword: formData.appPassword.replace(/\s+/g, '')
            };
            await api.post('/email-configs', cleanData);
            setSuccess('Email configuration added successfully!');
            setFormData({ 
                name: '', 
                email: '', 
                appPassword: '', 
                host: 'smtp.gmail.com', 
                port: 465, 
                secure: true 
            });
            fetchConfigs();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add configuration');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) return;
        
        try {
            await api.delete(`/email-configs/${id}`);
            setConfigs(configs.filter(c => c._id !== id));
            setSuccess('Configuration deleted successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete configuration');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,140,0,0.1))' }}>
                    <KeyRound size={24} style={{ color: '#FF8C00' }} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Email & SMTP Settings</h1>
                    <p className="text-slate-400 mt-1">Manage sender accounts using Google App Passwords</p>
                </div>
            </div>

            {error && <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}
            {success && <div className="p-4 mb-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="p-6 rounded-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}>
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-orange-400" />
                        Add New Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Sender Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                placeholder="e.g. Sales Team"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Gmail Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                placeholder="e.g. sales@mycompany.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">SMTP Host</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                    placeholder="e.g. mail.domain.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Port</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                    placeholder="465 or 587"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="secure"
                                checked={formData.secure}
                                onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500/20"
                            />
                            <label htmlFor="secure" className="text-sm font-medium text-slate-300 cursor-pointer">
                                Use SSL/TLS (Secure Connection)
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">SMTP Password</label>
                            <input
                                type="password"
                                required
                                value={formData.appPassword}
                                onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                placeholder="Email account password"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                For Gmail, use a 16-character App Password.
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 rounded-xl text-white font-medium transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, #FF6B00, #FF8C00)',
                                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)'
                            }}
                        >
                            Save Configuration
                        </button>
                    </form>

                    {/* Instruction Guide */}
                    <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                            <KeyRound size={14} /> How to get App Password?
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-decimal ml-4">
                            <li>Go to <a href="https://myaccount.google.com" target="_blank" className="text-orange-300 underline">Google Account</a> {'>'} Security.</li>
                            <li>Turn ON <b>2-Step Verification</b>.</li>
                            <li>Search for <b>"App Passwords"</b>.</li>
                            <li>Create one for "Other (Marketing)" and copy the <b>16-character code</b>.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-2 ml-1">Configured Accounts</h2>
                    <div className="max-h-[480px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {loading ? (
                            <p className="text-slate-400">Loading...</p>
                        ) : configs.length === 0 ? (
                            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-700">
                                <Mail size={32} className="mx-auto text-slate-600 mb-2" />
                                <p className="text-slate-400">No email accounts configured yet.</p>
                            </div>
                        ) : (
                            configs.map((config) => (
                                <div key={config._id} className="p-4 rounded-xl flex items-center justify-between group transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-orange-400">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{config.name}</h3>
                                            <p className="text-sm text-slate-400">{config.email}</p>
                                        </div>
                                    </div>
                                    {(user?.role === 'ADMIN' || user?._id === config.user._id) && (
                                        <button
                                            onClick={() => handleDelete(config._id)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailSettings;
