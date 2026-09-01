import React, { useEffect, useState } from 'react';
import axios from '../../api/client';
import { colors } from './theme';

interface DocumentPreviewModalProps {
  /** Stored document path, e.g. `/uploads/1700000000000-id.pdf` or raw filename */
  path: string;
  /** Original file name for display (optional) */
  name: string;
  onClose: () => void;
}

/**
 * Secure document preview: fetches the file with Authorization header via axios,
 * renders it in a Blob URL (no token in the URL bar/logs). Supports PDFs + images,
 * with download fallback for other types.
 */
const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ path, name, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mime, setMime] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const rawName = (path || '').replace(/\\/g, '/').split('/uploads/')[1] || (path || '').replace(/\\/g, '/');
  const ext = (name || rawName).split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem('adminToken');

    axios
      .get(`/api/admin/file/${encodeURIComponent(rawName)}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (cancelled) return;
        const contentType = res.headers['content-type'] || '';
        setMime(contentType);
        setBlobUrl(URL.createObjectURL(res.data));
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || 'Unable to load document');
      });

    return () => {
      cancelled = true;
    };
  }, [rawName]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isImage = mime.startsWith('image/');
  const isPdf = mime === 'application/pdf' || ext === 'pdf';
  const canRender = isImage || isPdf;

  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name || rawName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '14px',
          width: '100%',
          maxWidth: '940px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: colors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={name || rawName}
            >
              {name || rawName}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>Document preview</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {blobUrl && (
              <button
                onClick={download}
                style={{
                  padding: '7px 14px',
                  backgroundColor: colors.green,
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Download
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '7px 14px',
                backgroundColor: 'transparent',
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, backgroundColor: isImage ? '#1a1a1a' : '#fafafa', overflow: 'auto' }}>
          {status === 'loading' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: colors.textMuted,
                fontSize: '14px',
              }}
            >
              Loading document...
            </div>
          )}
          {status === 'error' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#b00020',
                fontSize: '14px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </div>
          )}
          {status === 'ready' && blobUrl && (
            <>
              {canRender ? (
                isPdf ? (
                  <iframe
                    title="document-preview"
                    src={blobUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                  >
                    <img
                      src={blobUrl}
                      alt={name || 'document'}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>
                )
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: colors.textMuted,
                    fontSize: '14px',
                    gap: '10px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div>Preview is not available for this file type ({mime || 'unknown'}).</div>
                  <button
                    onClick={download}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.green,
                      color: 'white',
                      border: 'none',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Download file instead
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
