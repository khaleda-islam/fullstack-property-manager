import { useState } from 'react';

const LeaseDownload = ({ assignmentId, leaseDocument }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!leaseDocument?.url) {
      setError('No lease document available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Open the lease document URL in a new tab to download
      const link = document.createElement('a');
      link.href = leaseDocument.url;
      link.download = leaseDocument.fileName || 'lease.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Alternative: Open in new window
      // window.open(leaseDocument.url, '_blank');
      
    } catch (err) {
      setError('Failed to download lease document');
      console.error('Download error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lease-download">
      <button
        onClick={handleDownload}
        disabled={isLoading || !leaseDocument?.url}
        className="btn btn-outline-primary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px'
        }}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <i className="bi bi-download" />
            <span>Download Lease</span>
          </>
        )}
      </button>
      
      {error && (
        <p className="text-danger small mt-1 mb-0">
          <i className="bi bi-exclamation-triangle me-1" />
          {error}
        </p>
      )}
      
      {leaseDocument?.fileName && !error && (
        <p className="text-muted small mt-1 mb-0">
          <i className="bi bi-file-pdf me-1" />
          {leaseDocument.fileName}
        </p>
      )}
    </div>
  );
};

export default LeaseDownload;