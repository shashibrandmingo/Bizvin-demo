import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader2, BarChart2, FolderOpen, Zap, Eye, MousePointerClick, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StatCard = ({
    title, value, icon: Icon, gradient, glow, loading
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    gradient: string;
    glow: string;
    loading: boolean;
}) => (
    <div
        className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = glow;
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,120,0,0.3)';
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
        }}
    >
        {/* Glow blob in background */}
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: gradient }} />

        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,200,120,0.6)' }}>
                    {title}
                </p>
                {loading ? (
                    <Loader2 className="animate-spin" style={{ color: '#FF8C00' }} size={22} />
                ) : (
                    <p className="text-4xl font-extrabold text-white">{value}</p>
                )}
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: gradient, boxShadow: `0 8px 20px ${glow.replace('0 0 30px ', '').replace(', 0.5)', ', 0.4)')}` }}>
                <Icon size={22} className="text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCampaigns: 0, filesUploaded: 0, activeSubAdmins: 0,
        totalRecipients: 0, totalOpens: 0, totalClicks: 0, deliveryRate: 0,
        recentCampaigns: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/dashboard/stats');
                if (isMounted) {
                    setStats({
                        totalCampaigns: data.totalCampaigns || 0,
                        filesUploaded: data.filesUploaded || 0,
                        activeSubAdmins: data.activeSubAdmins || 0,
                        totalRecipients: data.totalRecipients || 0,
                        totalOpens: data.totalOpens || 0,
                        totalClicks: data.totalClicks || 0,
                        deliveryRate: data.deliveryRate || 0,
                        recentCampaigns: data.recentCampaigns || []
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchStats();
        return () => { isMounted = false; };
    }, []);

    const handleDeleteCampaign = async (id: string, subject: string) => {
        if (!window.confirm(`Are you sure you want to delete the campaign "${subject}"?\nThis action cannot be undone and will remove all its analytics.`)) return;

        try {
            await api.delete(`/emails/campaign/${id}`);
            // Remove the deleted campaign from the UI immediately
            setStats(prev => ({
                ...prev,
                recentCampaigns: prev.recentCampaigns.filter(c => c._id !== id)
            }));
        } catch (error: any) {
            console.error('Error deleting campaign:', error);
            alert(error.response?.data?.message || 'Failed to delete campaign');
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome banner */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,140,0,0.1))',
                    border: '1px solid rgba(255,120,0,0.25)',
                    backdropFilter: 'blur(12px)',
                }}>
                {/* Decorative blob */}
                <div className="absolute right-[-30px] top-[-30px] w-40 h-40 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #FF6B00, #FFD166)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                            <Zap size={18} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,200,120,0.8)' }}>
                        Welcome back, <span className="text-white font-bold">{user?.name}</span>! 🎉
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        You are logged in as{' '}
                        <span className="font-bold px-2 py-0.5 rounded-full text-xs"
                            style={{ background: 'rgba(255,107,0,0.2)', color: '#FF8C00', border: '1px solid rgba(255,107,0,0.4)' }}>
                            {user?.role}
                        </span>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,140,0,0.5)' }}>
                    Quick Stats
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Sent"
                        value={stats.totalRecipients}
                        icon={BarChart2}
                        gradient="linear-gradient(135deg, #FF6B00, #FF8C00)"
                        glow="0 0 30px rgba(255, 107, 0, 0.4)"
                        loading={loading}
                    />
                    <StatCard
                        title="Avg Open Rate"
                        value={stats.totalRecipients ? Math.round((stats.totalOpens / stats.totalRecipients) * 100) : 0}
                        icon={Eye}
                        gradient="linear-gradient(135deg, #10b981, #34d399)" // Emerald
                        glow="0 0 30px rgba(16, 185, 129, 0.4)"
                        loading={loading}
                    />
                    <StatCard
                        title="Avg Click Rate"
                        value={stats.totalRecipients ? Math.round((stats.totalClicks / stats.totalRecipients) * 100) : 0}
                        icon={MousePointerClick}
                        gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" // Violet
                        glow="0 0 30px rgba(139, 92, 246, 0.4)"
                        loading={loading}
                    />
                    <StatCard
                        title="Files Uploaded"
                        value={stats.filesUploaded}
                        icon={FolderOpen}
                        gradient="linear-gradient(135deg, #3b82f6, #60a5fa)" // Blue
                        glow="0 0 30px rgba(59, 130, 246, 0.4)"
                        loading={loading}
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaign Performance Chart (Fake historical trend using recent campaigns) */}
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,120,0,0.1)' }}>
                    <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart2 size={16} className="text-orange-500" /> Recent Performance Trend
                    </h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
                        ) : stats.recentCampaigns.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...stats.recentCampaigns].reverse().map(c => ({
                                    name: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                    opens: c.opens,
                                    clicks: c.clicks
                                }))}>
                                    <defs>
                                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(15,12,41,0.9)', border: '1px solid rgba(255,120,0,0.2)', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" />
                                    <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">No campaign data yet</div>
                        )}
                    </div>
                </div>

                {/* Campaign Format Breakdown */}
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,120,0,0.1)' }}>
                    <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                        <Zap size={16} className="text-orange-500" /> Recent Campaign Delivery (Recipients)
                    </h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
                        ) : stats.recentCampaigns.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...stats.recentCampaigns].reverse().map(c => ({
                                    name: c.subject.length > 15 ? c.subject.substring(0, 15) + '...' : c.subject,
                                    recipients: c.recipientCount
                                }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ background: 'rgba(15,12,41,0.9)', border: '1px solid rgba(255,120,0,0.2)', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar dataKey="recipients" fill="#FF8C00" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">No campaign data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,120,0,0.1)' }}>
                <div className="p-5 border-b" style={{ borderColor: 'rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.05)' }}>
                    <h3 className="text-sm font-semibold text-white">Recent Campaigns History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-400">Campaign Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-400">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-400">Recipients</th>
                                <th className="px-6 py-4 font-semibold text-slate-400">Open Rate</th>
                                <th className="px-6 py-4 font-semibold text-slate-400">Click Rate</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-400">Status</th>
                                {user?.role === 'ADMIN' && <th className="px-6 py-4 text-center font-semibold text-slate-400">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" size={16} /> Loading history...</td></tr>
                            ) : stats.recentCampaigns.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No campaigns launched yet.</td></tr>
                            ) : (
                                stats.recentCampaigns.map((campaign, idx) => {
                                    const openRate = campaign.recipientCount ? Math.round((campaign.opens / campaign.recipientCount) * 100) : 0;
                                    const clickRate = campaign.recipientCount ? Math.round((campaign.clicks / campaign.recipientCount) * 100) : 0;

                                    return (
                                        <tr key={idx} className="transition-colors hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{campaign.subject}</p>
                                                <p className="text-xs text-slate-500 mt-1">{campaign.type} Email</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{campaign.recipientCount}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-400 font-semibold">{openRate}%</span>
                                                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${openRate}%` }}></div></div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{campaign.opens} opens</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-violet-400 font-semibold">{clickRate}%</span>
                                                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${clickRate}%` }}></div></div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{campaign.clicks} clicks</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${campaign.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                        campaign.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                            campaign.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                campaign.status === 'CANCELLED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                                                                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            {user?.role === 'ADMIN' && (
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteCampaign(campaign._id, campaign.subject)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                        title="Delete Campaign"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick tips panel */}
            <div className="rounded-2xl p-5"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,120,0,0.1)',
                }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,140,0,0.5)' }}>
                    Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Send HTML Email', href: '/marketing/html', color: '#FF6B00' },
                        { label: 'Upload a File', href: '/upload', color: '#FB8500' },
                        ...(user?.role === 'ADMIN' ? [{ label: 'Add Sub-Admin', href: '/users/add', color: '#e63946' }] : []),
                    ].map(a => (
                        <button key={a.href} onClick={() => navigate(a.href)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = `${a.color}20`;
                                (e.currentTarget as HTMLButtonElement).style.borderColor = `${a.color}50`;
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)';
                            }}
                        >
                            <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                            {a.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
