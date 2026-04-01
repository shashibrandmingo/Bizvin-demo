import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1035, #0f0c29)' }}>

            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Orange blob */}
                <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 animate-blob"
                    style={{ background: 'radial-gradient(circle, #FF6B00, #FF8C00)', filter: 'blur(80px)' }} />
                {/* Red-pink blob */}
                <div className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full opacity-20 animate-blob animation-delay-2000"
                    style={{ background: 'radial-gradient(circle, #e63946, #c9184a)', filter: 'blur(80px)' }} />
                {/* Amber blob */}
                <div className="absolute top-[50%] left-[50%] w-[350px] h-[350px] rounded-full opacity-15 animate-blob animation-delay-4000"
                    style={{ background: 'radial-gradient(circle, #FFBE0B, #FB8500)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />
            </div>

            {/* Main card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Top banner / logo section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Bizvin Admin
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'rgba(255,180,100,0.8)' }}>
                        Email Marketing & Management Portal
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="rounded-3xl p-8 shadow-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 120, 0, 0.2)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}>

                    <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>

                    {/* Error message */}
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#fca5a5' }}>
                            <span className="text-red-400">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,200,150,0.9)' }}>
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4" style={{ color: 'rgba(255,140,0,0.7)' }} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@bizvin.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255, 120, 0, 0.25)',
                                        boxShadow: '0 0 0 0px rgba(255, 120, 0, 0)'
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'rgba(255, 120, 0, 0.8)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 120, 0, 0.15)';
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'rgba(255, 120, 0, 0.25)';
                                        e.target.style.boxShadow = '0 0 0 0px rgba(255, 120, 0, 0)';
                                        e.target.style.background = 'rgba(255,255,255,0.07)';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,200,150,0.9)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4" style={{ color: 'rgba(255,140,0,0.7)' }} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255, 120, 0, 0.25)',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'rgba(255, 120, 0, 0.8)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 120, 0, 0.15)';
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'rgba(255, 120, 0, 0.25)';
                                        e.target.style.boxShadow = '0 0 0 0px rgba(255, 120, 0, 0)';
                                        e.target.style.background = 'rgba(255,255,255,0.07)';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs transition-colors"
                                    style={{ color: 'rgba(255,140,0,0.6)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#FF8C00')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,140,0,0.6)')}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: loading ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, #FF6B00, #FF8C00)',
                                boxShadow: loading ? 'none' : '0 8px 25px rgba(255, 107, 0, 0.4)',
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(255, 107, 0, 0.6)';
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(255, 107, 0, 0.4)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer text */}
                    <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Admin access only · Unauthorized access is prohibited
                    </p>
                </div>

                {/* Bottom copyright */}
                <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    © {new Date().getFullYear()} Bizvin Admin Panel. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
