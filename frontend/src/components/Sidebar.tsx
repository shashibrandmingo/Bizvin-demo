import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Mail,
    UploadCloud,
    FolderOpen,
    Users,
    UserPlus,
    ChevronDown,
    X,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [emailMenuOpen, setEmailMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Close sidebar on mobile after navigation
    const handleNav = (path: string) => {
        navigate(path);
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    const navItem = (isActive: boolean) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-white'
        }`;

    const subNavItem = (isActive: boolean) =>
        `flex items-center gap-3 px-4 py-2 pl-11 rounded-xl transition-all duration-200 text-xs font-medium cursor-pointer ${isActive
            ? 'text-orange-400'
            : 'text-slate-500 hover:text-orange-300'
        }`;

    const activeStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, rgba(255,107,0,0.25), rgba(255,140,0,0.15))',
        border: '1px solid rgba(255,120,0,0.3)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(255,107,0,0.15)'
    };

    return (
        <>
            {/* Mobile overlay — click outside to close */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-20 backdrop-blur-sm"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:relative inset-y-0 left-0 z-30 flex flex-col shrink-0 transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden'}
                    lg:translate-x-0 ${isOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
                `}
                style={{
                    background: 'rgba(15, 12, 41, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRight: isOpen ? '1px solid rgba(255,120,0,0.12)' : 'none',
                    boxShadow: isOpen ? '4px 0 30px rgba(0,0,0,0.4)' : 'none'
                }}
            >
                <div style={{ width: '16rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Logo / Header */}
                    <div className="h-16 flex items-center justify-between px-5 shrink-0"
                        style={{
                            background: 'rgba(255,107,0,0.08)',
                            borderBottom: '1px solid rgba(255,120,0,0.15)'
                        }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                                <ShieldCheck size={16} className="text-white" />
                            </div>
                            <span className="text-base font-bold" style={{
                                background: 'linear-gradient(90deg, #FF8C00, #FFD166)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Bizvin Admin
                            </span>
                        </div>
                        {/* X button — only on mobile */}
                        <button className="lg:hidden p-1 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                            onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {/* Dashboard */}
                        <NavLink
                            to="/"
                            end
                            style={({ isActive }) => isActive ? activeStyle : {}}
                            className={({ isActive }) => navItem(isActive)}
                            onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </NavLink>

                        {/* Marketing Email Dropdown */}
                        <div className="mt-1">
                            <button
                                onClick={() => setEmailMenuOpen(!emailMenuOpen)}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                                    (e.currentTarget as HTMLButtonElement).style.color = 'white';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <Mail size={18} />
                                    <span>Marketing Email</span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${emailMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`mt-1 space-y-0.5 overflow-hidden transition-all duration-300 ${emailMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <button onClick={() => handleNav('/marketing/html')} className={subNavItem(location.pathname === '/marketing/html')}>HTML Email</button>
                                <button onClick={() => handleNav('/marketing/image')} className={subNavItem(location.pathname === '/marketing/image')}>Image Email</button>
                                <button onClick={() => handleNav('/marketing/zip')} className={subNavItem(location.pathname === '/marketing/zip')}>ZIP Email</button>
                                <button onClick={() => handleNav('/email-settings')} className={subNavItem(location.pathname === '/email-settings')}>Email Settings</button>
                            </div>
                        </div>

                        {/* Upload */}
                        <NavLink
                            to="/upload"
                            style={({ isActive }) => isActive ? activeStyle : {}}
                            className={({ isActive }) => navItem(isActive)}
                            onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                        >
                            <UploadCloud size={18} />
                            <span>Upload New File</span>
                        </NavLink>

                        {/* Files */}
                        <NavLink
                            to="/files"
                            style={({ isActive }) => isActive ? activeStyle : {}}
                            className={({ isActive }) => navItem(isActive)}
                            onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }}
                        >
                            <FolderOpen size={18} />
                            <span>Files Uploaded</span>
                        </NavLink>

                        {/* Admin: User Details */}
                        {user?.role === 'ADMIN' && (
                            <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,120,0,0.1)' }}>
                                <p className="px-4 text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,140,0,0.5)' }}>
                                    Admin
                                </p>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                    style={{ color: 'rgba(255,255,255,0.5)' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                                        (e.currentTarget as HTMLButtonElement).style.color = 'white';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Users size={18} />
                                        <span>User Details</span>
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`mt-1 space-y-0.5 overflow-hidden transition-all duration-300 ${userMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <button onClick={() => handleNav('/users/add')} className={subNavItem(location.pathname === '/users/add')}>
                                        <UserPlus size={13} /> Add New User
                                    </button>
                                    <button onClick={() => handleNav('/users')} className={subNavItem(location.pathname === '/users')}>
                                        <Users size={13} /> View Users
                                    </button>
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,120,0,0.1)' }}>
                        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            © {new Date().getFullYear()} Bizvin Admin
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
