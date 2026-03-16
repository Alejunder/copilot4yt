import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AI_MODELS, type ThumbnailStyle } from '../assets/assets';
import { ChevronDownIcon, ZapIcon, CpuIcon, SparklesIcon, LockIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  currentPlan: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Highlight models best suited for the currently selected style */
  currentStyle?: ThumbnailStyle;
}

// Mirrors the backend isPlanAllowed logic in server/configs/ai.ts
const FREE_MODEL_IDS  = new Set(["gemini-2.5-flash-image"]);
const BASIC_MODEL_IDS = new Set(["gemini-3.1-flash-image-preview"]);

function isPlanAllowed(modelId: string, plan: string): boolean {
  if (FREE_MODEL_IDS.has(modelId))  return true;
  if (BASIC_MODEL_IDS.has(modelId)) return plan === "basic" || plan === "pro" || plan === "enterprise";
  // PRO_MODELS (gemini-3-pro-image-preview): pro and enterprise only
  return plan === "pro" || plan === "enterprise";
}

const modelIcons: Record<string, ReactNode> = {
  "gemini-2.5-flash-image":           <ZapIcon className="w-4 h-4" />,
  "gemini-3.1-flash-image-preview":   <CpuIcon className="w-4 h-4" />,
  "gemini-3-pro-image-preview":       <SparklesIcon className="w-4 h-4" />,
  // FLUX models — commented out pending Replicate migration
  // "black-forest-labs/flux-schnell": <ZapIcon className="w-4 h-4" />,
  // "black-forest-labs/flux-pro":     <SparklesIcon className="w-4 h-4" />,
};

const modelDescKeys: Record<string, string> = {
  'gemini-2.5-flash-image':         'selectors.modelGeminiFlashDesc',
  'gemini-3.1-flash-image-preview': 'selectors.modelGeminiFlash31Desc',
  'gemini-3-pro-image-preview':     'selectors.modelGeminiProDesc',
};

const providerLabelKeys: Record<string, string> = {
  gemini: 'selectors.modelProviderGemini',
  flux:   'selectors.modelProviderFlux',
};

const ModelSelector = ({ value, onChange, currentPlan, isOpen, setIsOpen, currentStyle }: ModelSelectorProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const selectedModel = AI_MODELS.find(m => m.id === value) ?? AI_MODELS[0];

  return (
    <div className="relative space-y-3 dark">
      <label className="block text-sm font-medium text-zinc-200">{t('selectors.modelLabel')}</label>

      {/* Trigger — mirrors StyleSelector's trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition bg-white/8 border-white/10 text-zinc-200 hover:bg-white/12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-medium">
            {modelIcons[selectedModel.id]}
            <span>{selectedModel.name}</span>
            {selectedModel.paidOnly && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">Pro</span>
            )}
          </div>
          <p className="text-sm text-zinc-400">{t(modelDescKeys[selectedModel.id] ?? selectedModel.description)}</p>
        </div>
        <ChevronDownIcon className={['h-5 w-5 text-zinc-400 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')} />
      </button>

      {/* Dropdown — same structure as StyleSelector's dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-white/12 bg-black/20 backdrop-blur-3xl shadow-lg">
          {(['gemini', 'flux'] as const).map((provider) => {
            const providerModels = AI_MODELS.filter(m => m.provider === provider);
            // Skip providers that have no active models (e.g. flux while Replicate is disabled)
            if (providerModels.length === 0) return null;
            return (
              <div key={provider}>
                <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-white/6">
                  {t(providerLabelKeys[provider] ?? provider)}
                </p>
                {providerModels.map((model) => {
                  const isLocked = !isPlanAllowed(model.id, currentPlan);
                  const isBestFor = currentStyle ? model.bestFor.includes(currentStyle) : false;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) { navigate('/pricing'); return; }
                        onChange(model.id);
                        setIsOpen(false);
                      }}
                      className={[
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition',
                        isLocked ? 'opacity-50 hover:bg-black/20' : 'hover:bg-black/30',
                      ].join(' ')}
                    >
                      <div className={['mt-0.5', isLocked ? 'text-zinc-500' : 'text-zinc-400'].join(' ')}>
                        {modelIcons[model.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-zinc-200">{model.name}</p>
                          {model.paidOnly && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">Pro</span>
                          )}
                          {isBestFor && !isLocked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                              {t('selectors.modelBestFor')} {currentStyle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{t(modelDescKeys[model.id] ?? model.description)}</p>
                      </div>
                      {isLocked && <LockIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {currentPlan !== 'pro' && currentPlan !== 'enterprise' && (
            <div className="px-4 py-2.5 border-t border-white/6 text-center">
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                {t('selectors.modelUpgrade')} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
