import { type ReactNode } from 'react'
import { thumbnailStyles, type ThumbnailStyle } from '../assets/assets'
import { ChevronDownIcon, CpuIcon, ImageIcon, PenToolIcon, SparkleIcon, SquareIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const styleNameKeys: Record<ThumbnailStyle, string> = {
  "Bold & Graphic": "selectors.styleBoldGraphic",
  "Minimalist": "selectors.styleMinimalist",
  "Photorealistic": "selectors.stylePhotorealistic",
  "Illustrated": "selectors.styleIllustrated",
  "Tech/Futuristic": "selectors.styleTechFuturistic",
};

const styleDescKeys: Record<ThumbnailStyle, string> = {
  "Bold & Graphic": "selectors.styleBoldGraphicDesc",
  "Minimalist": "selectors.styleMinimalistDesc",
  "Photorealistic": "selectors.stylePhotorealisticDesc",
  "Illustrated": "selectors.styleIllustratedDesc",
  "Tech/Futuristic": "selectors.styleTechFuturisticDesc",
};

const styleIcons: Record<ThumbnailStyle, ReactNode> = {
  "Bold & Graphic": <SparkleIcon className="w-4 h-4" />,
  "Minimalist": <SquareIcon className="w-4 h-4" />,
  "Photorealistic": <ImageIcon className="w-4 h-4" />,
  "Illustrated": <PenToolIcon className="w-4 h-4" />,
  "Tech/Futuristic": <CpuIcon className="w-4 h-4" />,
}

const StyleSelector = ({ value, onChange, isOpen, setIsOpen }: { value: ThumbnailStyle, onChange: (style: ThumbnailStyle) => void; isOpen: boolean, setIsOpen: (Open: boolean) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="relative space-y-3 dark">
      <label className='block text-sm font-medium text-zinc-200'>{t('generate.styleLabel')}</label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition bg-white/8 border-white/10 text-zinc-200 hover:bg-white/12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-medium">
            {styleIcons[value]}
            <span>{t(styleNameKeys[value])}</span>
          </div>
          <p className="text-sm text-zinc-400">{t(styleDescKeys[value])}</p>
        </div>
        <ChevronDownIcon className={['h-5 w-5 text-zinc-400 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')} />
      </button>

      {isOpen && (
        <div className="absolute bottom-0 z-50 mt-2 w-full rounded-md border border-white/12 bg-black/20 backdrop-blur-3xl shadow-lg">
          {thumbnailStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => { onChange(style); setIsOpen(false); }}
              className='flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-black/30'>
              <div className='mt-0.5'>{styleIcons[style]}</div>
              <div>
                <p className='font-medium'>{t(styleNameKeys[style])}</p>
                <p className='text-xs text-zinc-400'>{t(styleDescKeys[style])}</p>
              </div>

            </button>
          ))}
        </div>)}
    </div>
  )
}

export default StyleSelector
