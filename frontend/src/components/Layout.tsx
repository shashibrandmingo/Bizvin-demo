import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, User, LogOut, Bell } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    // On desktop (lg+) sidebar always visible; on mobile starts closed
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

    // Keep sidebarOpen in sync when window resizes
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1035, #0f0c29)' }}>
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full min-w-0">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 flex-shrink-0"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(255, 120, 0, 0.15)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                    }}>
                    <div className="flex items-center gap-4">
                        {/* Hamburger — only on mobile */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg transition-all duration-200"
                            style={{ color: 'rgba(255,255,255,0.6)' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,120,0,0.15)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                            }}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-bold" style={{
                            background: 'linear-gradient(90deg, #FF8C00, #FFD166)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Bizvin Admin
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Role badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{
                                background: 'rgba(255, 107, 0, 0.15)',
                                border: '1px solid rgba(255, 107, 0, 0.4)',
                                color: '#FF8C00'
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FF8C00' }}></span>
                            {user?.role}
                        </div>

                        {/* Notification bell */}
                        <button className="p-2 rounded-lg transition-all duration-200 relative"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,120,0,0.12)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                            }}>
                            <Bell size={18} />
                        </button>

                        {/* User chip */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || <User size={12} />}
                            </div>
                            <span className="hidden sm:inline-block text-xs font-medium truncate max-w-[120px]">{user?.name || user?.email}</span>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, #e63946, #c9184a)',
                                boxShadow: '0 4px 12px rgba(201, 24, 74, 0.3)'
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(201, 24, 74, 0.5)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(201, 24, 74, 0.3)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                            }}
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline-block">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6"
                    style={{ background: 'transparent' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
