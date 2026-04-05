import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, X, ArrowLeft, Image as ImageIcon, Archive } from 'lucide-react';

const UploadFile = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
            setSuccess(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'text/html': ['.html'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip']
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setError('Please select a file to upload'); return; }
        setLoading(true);
        setError('');
        setSuccess(false);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccess(true);
            setFile(null);
            setTimeout(() => navigate('/files'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'html') return <FileText size={32} style={{ color: '#FF8C00' }} />;
        if (ext === 'zip') return <Archive size={32} style={{ color: '#818cf8' }} />;
        if (ext === 'gif') return <ImageIcon size={32} style={{ color: '#f472b6' }} />;
        return <ImageIcon size={32} style={{ color: '#10b981' }} />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/files')}
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
                        <UploadCloud size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Upload New File</h1>
                        <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>HTML, Image or ZIP for campaigns</p>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,120,0,0.15)',
                    backdropFilter: 'blur(12px)'
                }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,140,0,0.7)' }}>
                        Select File
                    </p>
                </div>

                <div className="p-6">
                    <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Supported formats: <span style={{ color: '#FF8C00' }}>.html</span> · <span style={{ color: '#10b981' }}>.jpg / .png / .gif</span> · <span style={{ color: '#818cf8' }}>.zip</span>
                    </p>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            <AlertCircle size={16} className="shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                            <CheckCircle2 size={16} className="shrink-0" /> File uploaded successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className="cursor-pointer rounded-2xl p-10 text-center transition-all duration-200"
                            style={{
                                border: `2px dashed ${isDragActive ? '#FF8C00' : 'rgba(255,120,0,0.25)'}`,
                                background: isDragActive ? 'rgba(255,107,0,0.1)' : 'rgba(255,255,255,0.02)',
                                transform: isDragActive ? 'scale(1.01)' : 'scale(1)',
                            }}
                            onMouseEnter={e => {
                                if (!isDragActive) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,140,0,0.5)';
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,107,0,0.06)';
                            }}
                            onMouseLeave={e => {
                                if (!isDragActive) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,120,0,0.25)';
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                            }}
                        >
                            <input {...getInputProps()} />

                            {!file ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)' }}>
                                        <UploadCloud size={32} style={{ color: '#FF8C00' }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">
                                            {isDragActive ? '📂 Drop it here!' : 'Click to upload or drag & drop'}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                            HTML · ZIP · JPG · PNG · GIF
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        {getFileIcon(file.name)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white break-all">{file.name}</p>
                                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatSize(file.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                                    >
                                        <X size={13} /> Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="button" onClick={() => setFile(null)} disabled={!file || loading}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Reset
                            </button>
                            <button type="submit" disabled={loading || !file}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                                onMouseEnter={e => { if (!loading && file) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; }}>
                                {loading
                                    ? <><Loader2 className="animate-spin" size={16} /> Uploading...</>
                                    : <><UploadCloud size={16} /> Upload File</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadFile;
