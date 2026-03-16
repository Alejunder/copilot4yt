import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface PrivacyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function PrivacyWarningModal({ isOpen, onClose, onConfirm }: PrivacyWarningModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-zinc-100 text-center">
          {t('privacyModal.title')}
        </h3>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t('privacyModal.message1')}
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t('privacyModal.message2')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-zinc-100 transition-colors"
          >
            {t('privacyModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-colors"
          >
            {t('privacyModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyWarningModal;
