import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, FileText, Image as ImageIcon, Archive, FolderOpen, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResourceData {
    _id: string;
    fileType: string;
    fileName: string;
    fileUrl: string;
    uploaderId: { _id: string; name: string; email: string; };
    createdAt: string;
}

const LIMIT = 10;

const FilesList = () => {
    const [files, setFiles] = useState<ResourceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalFiles, setTotalFiles] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchFiles = async (page: number) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/upload?page=${page}&limit=${LIMIT}`);
            setFiles(data.files);
            setTotalPages(data.totalPages);
            setTotalFiles(data.totalFiles);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFiles(1); }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this file from Cloudinary?')) {
            try {
                await api.delete(`/upload/${id}`);
                fetchFiles(currentPage);
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to delete file');
            }
        }
    };

    const getFileConfig = (type: string) => {
        switch (type) {
            case 'HTML': return { icon: <FileText size={16} />, color: '#FF8C00', bg: 'rgba(255,140,0,0.15)', border: 'rgba(255,140,0,0.3)' };
            case 'IMAGE': return { icon: <ImageIcon size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' };
            case 'ZIP': return { icon: <Archive size={16} />, color: '#818cf8', bg: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.3)' };
            default: return { icon: <FileText size={16} />, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
        }
    };

    const startEntry = (currentPage - 1) * LIMIT + 1;
    const endEntry = Math.min(currentPage * LIMIT, totalFiles);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        <FolderOpen size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Files Uploaded</h1>
                        <p className="text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>
                            {totalFiles} file{totalFiles !== 1 ? 's' : ''} stored
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/upload')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 6px 20px rgba(255,107,0,0.35)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(255,107,0,0.55)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.35)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                    <UploadCloud size={16} />
                    Upload New File
                </button>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,120,0,0.15)',
                    backdropFilter: 'blur(12px)'
                }}>
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,140,0,0.7)' }}>
                        All Uploaded Files
                    </p>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(255,107,0,0.15)', color: '#FF8C00', border: '1px solid rgba(255,107,0,0.3)' }}>
                        {totalFiles} Files
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin"
                                style={{ borderTopColor: '#FF8C00', borderRightColor: 'rgba(255,140,0,0.3)' }} />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['#', 'Type', 'File Name', 'Uploaded By', 'Date', 'Link', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: 'rgba(255,180,80,0.5)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file, index) => {
                                    const cfg = getFileConfig(file.fileType);
                                    return (
                                        <tr key={file._id}
                                            className="transition-all duration-200"
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,107,0,0.05)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                        >
                                            <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                {startEntry + index}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                    {cfg.icon} {file.fileType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-white max-w-[200px] truncate">
                                                {file.fileName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                                                        {file.uploaderId?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                        {file.uploaderId?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {new Date(file.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                                                    style={{ background: 'rgba(255,140,0,0.1)', color: '#FF8C00', border: '1px solid rgba(255,140,0,0.25)' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,140,0,0.2)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,140,0,0.1)'; }}
                                                >
                                                    View <ExternalLink size={11} />
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(user?.role === 'ADMIN' || file.uploaderId?._id === user?._id) && (
                                                    <button
                                                        onClick={() => handleDelete(file._id)}
                                                        className="p-2 rounded-lg transition-all duration-200"
                                                        title="Delete File"
                                                        style={{ color: 'rgba(239,68,68,0.7)', background: 'rgba(239,68,68,0.08)' }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {!loading && files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                                <FolderOpen size={26} style={{ color: 'rgba(255,140,0,0.5)' }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No files uploaded yet</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4"
                        style={{ borderTop: '1px solid rgba(255,120,0,0.1)', background: 'rgba(255,107,0,0.04)' }}>
                        {/* Entry info */}
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Showing <span style={{ color: '#FF8C00' }}>{startEntry}–{endEntry}</span> of <span style={{ color: '#FF8C00' }}>{totalFiles}</span> files
                        </p>

                        {/* Page numbers + Prev/Next */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchFiles(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onMouseEnter={e => { if (currentPage !== 1) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,140,0,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00'; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {/* Page number pills */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => fetchFiles(p)}
                                    className="w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200"
                                    style={p === currentPage
                                        ? { background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', color: 'white', boxShadow: '0 4px 12px rgba(255,107,0,0.4)' }
                                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
                                    }
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => fetchFiles(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onMouseEnter={e => { if (currentPage !== totalPages) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,140,0,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF8C00'; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilesList;
