import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, CalendarClock, Trash2, Clock, XCircle } from 'lucide-react';

interface ScheduledCampaign {
    _id: string;
    subject: string;
    type: string;
    scheduledAt: string;
    recipientCount: number;
    status: string;
    senderId: { name: string; email: string };
    createdAt: string;
}

const ScheduledCampaigns = () => {
    const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/emails/scheduled');
            setCampaigns(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch scheduled campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this scheduled campaign?')) return;
        setCancellingId(id);
        try {
            await api.delete(`/emails/scheduled/${id}`);
            // Remove from list
            setCampaigns(campaigns.filter(c => c._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel campaign');
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        <CalendarClock size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Scheduled Campaigns</h1>
                        <p className="text-xs text-orange-200/60 mt-0.5">Manage and cancel your upcoming email campaigns</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl flex items-center gap-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20">
                    <XCircle size={16} />
                    {error}
                </div>
            )}

            <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.02] border border-[#FF6B00]/10 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-[#FF6B00]/[0.05] text-[#FF6B00]/70 border-b border-[#FF6B00]/10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Subject</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Scheduled For</th>
                                <th className="px-6 py-4 font-semibold">Recipients</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        Loading schedules...
                                    </td>
                                </tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                                        No pending scheduled campaigns found.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => (
                                    <tr key={campaign._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{campaign.subject}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-white/70">
                                                {campaign.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white/80">
                                                <Clock size={14} className="text-[#FF6B00]" />
                                                {new Date(campaign.scheduledAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{campaign.recipientCount} emails</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleCancel(campaign._id)}
                                                disabled={cancellingId === campaign._id}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
                                                title="Cancel Schedule"
                                            >
                                                {cancellingId === campaign._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScheduledCampaigns;
