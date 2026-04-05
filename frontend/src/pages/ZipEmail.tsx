import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, Send, FileText, User, Mail, AtSign, MessageSquare, Archive, Calendar } from 'lucide-react';

interface FileData { _id: string; fileName: string; fileUrl: string; fileType: string; }

const inputBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,120,0,0.2)',
    borderRadius: '10px',
    color: 'white',
    padding: '9px 12px 9px 36px',
    width: '100%',
    outline: 'none',
    fontSize: '13px',
    transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '5px',
    color: 'rgba(255,200,120,0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const Field = ({ label, icon: Icon, ...props }: { label: string; icon: React.ElementType;[key: string]: any }) => (
    <div>
        <div style={labelStyle}><Icon size={12} />{label}</div>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '11px', transform: 'translateY(-50%)', color: 'rgba(255,140,0,0.55)', pointerEvents: 'none' }}>
                <Icon size={14} />
            </div>
            <input {...props} style={inputBase}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,140,0,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.1)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,120,0,0.2)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
            />
        </div>
    </div>
);

const SelectField = ({ label, icon: Icon, children, ...props }: { label: string; icon: React.ElementType; children: React.ReactNode;[key: string]: any }) => (
    <div>
        <div style={labelStyle}><Icon size={12} />{label}</div>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '11px', transform: 'translateY(-50%)', color: 'rgba(255,140,0,0.55)', pointerEvents: 'none', zIndex: 1 }}>
                <Icon size={14} />
            </div>
            <select {...props} style={{
                ...inputBase,
                appearance: 'none',
                cursor: 'pointer',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,140,0,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px', paddingRight: '32px',
            }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,140,0,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,120,0,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,120,0,0.2)'; e.target.style.boxShadow = 'none'; }}
            >{children}</select>
        </div>
    </div>
);

const ZipEmail = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fromName: '', fromEmail: '', emailConfigIds: [] as string[], delay: 0, replyTo: '', toName: '', toEmails: '', subject: '', disclaimer: '', fileUrl: ''
    });
    const [zipFiles, setZipFiles] = useState<FileData[]>([]);
    const [emailConfigs, setEmailConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');

    useEffect(() => {
        api.get('/upload?limit=100').then(({ data }) => {
            const uploadedFiles = Array.isArray(data) ? data : data.files || [];
            setZipFiles(uploadedFiles.filter((f: any) => f.fileType === 'ZIP'));
        }).catch(console.error);

        api.get('/email-configs').then(({ data }) => {
            setEmailConfigs(data);
        }).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailsArray = formData.toEmails.split(/[\s,]+/).filter(e => e.trim()).map(e => e.trim());
        if (!emailsArray.length) { setStatus({ type: 'error', message: 'Please provide at least one recipient email.' }); return; }
        if (formData.emailConfigIds.length === 0) { setStatus({ type: 'error', message: 'Please select at least one Sender Account.' }); return; }
        if (isScheduled && !scheduledAt) { setStatus({ type: 'error', message: 'Please provide a schedule date and time.' }); return; }
        setLoading(true); setStatus({ type: '', message: '' });
        try {
            const endpoint = isScheduled ? '/emails/schedule' : '/emails/send';
            const payload: any = { type: 'ZIP', ...formData, toEmails: emailsArray };
            if (isScheduled) payload.scheduledAt = scheduledAt;

            await api.post(endpoint, payload);
            setStatus({ type: 'success', message: isScheduled ? `✓ Campaign scheduled for ${emailsArray.length} recipient(s)!` : `✓ Campaign sent to ${emailsArray.length} recipient(s)!` });
            setFormData({ fromName: '', fromEmail: '', emailConfigIds: [], delay: 0, replyTo: '', toName: '', toEmails: '', subject: '', disclaimer: '', fileUrl: '' });
            setScheduledAt('');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send campaign' });
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10 space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                    <Archive size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-white">ZIP Template Email</h1>
                    <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>Upload a ZIP with HTML/Images to send a complete design</p>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,120,0,0.15)', backdropFilter: 'blur(12px)' }}>
                <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,140,0,0.7)' }}>Campaign Details</p>
                </div>
                <div className="p-6 space-y-4">
                    {status.message && (
                        <div className="px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                            style={status.type === 'success'
                                ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                                : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            {status.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                            {status.message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <div style={labelStyle}><Mail size={12} />Sender Accounts (Select one or more for rotation)</div>
                                <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {emailConfigs.map((c: any) => (
                                            <label key={c._id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                                                style={{
                                                    background: formData.emailConfigIds.includes(c._id) ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.03)',
                                                    border: formData.emailConfigIds.includes(c._id) ? '1px solid rgba(255,107,0,0.5)' : '1px solid rgba(255,255,255,0.05)',
                                                }}>
                                                <input type="checkbox" className="w-4 h-4 shrink-0" style={{ accentColor: '#FF6B00' }}
                                                    checked={formData.emailConfigIds.includes(c._id)}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...formData.emailConfigIds, c._id]
                                                            : formData.emailConfigIds.filter(id => id !== c._id);
                                                        setFormData({ ...formData, emailConfigIds: newIds });
                                                    }}
                                                />
                                                <span className="text-sm text-white truncate w-full">{c.name} <span className="text-xs text-slate-400 block truncate">{c.email}</span></span>
                                            </label>
                                        ))}
                                    </div>
                                    {emailConfigs.length === 0 && <p className="text-xs text-orange-400 mt-2">No accounts configured. <button onClick={() => navigate('/email-settings')} className="underline font-bold cursor-pointer">Add one here</button> first.</p>}
                                </div>
                            </div>
                            <Field label="From Name" icon={User} type="text" name="fromName" required value={formData.fromName} onChange={handleChange} placeholder="First Last" />
                            <Field label="Delay between emails (seconds)" icon={Calendar} type="number" min="0" step="1" name="delay" required value={formData.delay} onChange={handleChange} placeholder="e.g. 5" />
                            <Field label="From Email (Custom Override)" icon={Mail} type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} placeholder="custom@company.com (Optional)" />
                            <Field label="Reply To Email" icon={AtSign} type="email" name="replyTo" required value={formData.replyTo} onChange={handleChange} placeholder="reply@gmail.com" />
                            <Field label="To Name" icon={User} type="text" name="toName" value={formData.toName} onChange={handleChange} placeholder="Recipient Name" />
                            <div className="md:col-span-2">
                                <Field label="To Emails (comma or space separated)" icon={Mail} type="text" name="toEmails" required value={formData.toEmails} onChange={handleChange} placeholder="a@gmail.com, b@gmail.com" />
                            </div>
                            <div className="md:col-span-2">
                                <Field label="Subject" icon={MessageSquare} type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Subject of the email" />
                            </div>
                            <div className="md:col-span-2">
                                <Field label="Disclaimer (use ##disclaimer## in template)" icon={FileText} type="text" name="disclaimer" value={formData.disclaimer} onChange={handleChange} placeholder="Disclaimer text..." />
                            </div>
                        </div>

                        <SelectField label="Select ZIP File" icon={Archive} name="fileUrl" required value={formData.fileUrl} onChange={handleChange}>
                            <option value="" disabled style={{ background: '#1a1035' }}>— Choose ZIP (Template or Images) —</option>
                            {zipFiles.map(f => <option key={f._id} value={f.fileUrl} style={{ background: '#1a1035' }}>{f.fileName}</option>)}
                        </SelectField>
                        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            * System will automatically unzip the file. If an HTML file is found, it will be used as the body. Otherwise, images will be shown as a gallery.
                        </p>
                        {zipFiles.length === 0 && <p className="text-xs" style={{ color: '#FB8500' }}>No ZIP files found. <a href="/upload" className="underline">Upload one first.</a></p>}

                        <div className="md:col-span-2 pt-4 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex gap-6 items-center mb-4">
                                <label className="flex items-center gap-2 text-sm text-white cursor-pointer font-medium">
                                    <input type="radio" checked={!isScheduled} onChange={() => setIsScheduled(false)} className="w-4 h-4" style={{ accentColor: '#FF6B00' }} />
                                    Send Immediately
                                </label>
                                {/* <label className="flex items-center gap-2 text-sm text-white cursor-pointer font-medium">
                                    <input type="radio" checked={isScheduled} onChange={() => setIsScheduled(true)} className="w-4 h-4" style={{ accentColor: '#FF6B00' }} />
                                    Schedule for Later
                                </label> */}
                            </div>

                            {isScheduled && (
                                <div className="w-full md:w-1/2">
                                    <Field label="Scheduled Date & Time" icon={Calendar} type="datetime-local" required value={scheduledAt} onChange={(e: any) => setScheduledAt(e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="submit" disabled={loading}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; }}>
                                {loading ? <><Loader2 className="animate-spin" size={15} /> Processing...</> : <><Send size={15} /> {isScheduled ? 'Schedule Campaign' : 'Send Campaign'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ZipEmail;
