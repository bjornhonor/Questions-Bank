// /frontend/src/components/ImageModal.jsx
import { useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, imageUrl, title = "Imagem" }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.imageContainer}>
          <img 
            src={imageUrl} 
            alt={title}
            style={styles.image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{...styles.errorMessage, display: 'none'}}>
            Erro ao carregar a imagem
          </div>
        </div>
        <div style={styles.footer}>
          <button style={styles.downloadButton} onClick={() => window.open(imageUrl, '_blank')}>
            Abrir em Nova Aba
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px',
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px 24px',
    borderBottom: '1px solid #e9ecef',
  },

  title: {
    margin: 0,
    fontSize: '1.3em',
    fontWeight: '600',
    color: '#2c3e50',
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#6c757d',
    transition: 'all 0.2s ease',
  },

  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    minHeight: '300px',
    position: 'relative',
  },

  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },

  errorMessage: {
    color: '#dc3545',
    fontSize: '1.1em',
    textAlign: 'center',
    padding: '40px',
  },

  footer: {
    padding: '16px 24px 20px 24px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'center',
  },

  downloadButton: {
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// CSS para hover effects
const modalCSS = `
.image-modal-close-button:hover {
  background-color: #f8f9fa !important;
  color: #dc3545 !important;
}

.image-modal-download-button:hover {
  background-color: #1557b0 !important;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .image-modal-modal {
    margin: 10px !important;
    max-width: calc(100vw - 20px) !important;
    max-height: calc(100vh - 20px) !important;
  }
  
  .image-modal-header {
    padding: 15px 16px 12px 16px !important;
  }
  
  .image-modal-title {
    font-size: 1.1em !important;
  }
  
  .image-modal-image-container {
    padding: 15px !important;
    min-height: 200px !important;
  }
  
  .image-modal-footer {
    padding: 12px 16px 15px 16px !important;
  }
}
`;

// Adicionar CSS no documento
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('image-modal-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'image-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
  }
}

export default ImageModal;