import { colorSchemes } from "../assets/assets"
import { useTranslation } from '../hooks/useTranslation';

const colorNameKeys: Record<string, string> = {
  vibrant: 'selectors.colorVibrant',
  sunset: 'selectors.colorSunset',
  ocean: 'selectors.colorOcean',
  forest: 'selectors.colorForest',
  purple: 'selectors.colorPurpleDream',
  monochrome: 'selectors.colorMonochrome',
  neon: 'selectors.colorNeon',
  pastel: 'selectors.colorPastel',
};

const ColorSchemeSelector = ({value, onChange}: {value: string, onChange: (color: string) => void}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-200">{t('generate.colorSchemeLabel')}</label>
        <div className="grid grid-cols-6 gap-3">
           {colorSchemes.map((scheme) => (
                <button 
                    key={scheme.id}
                    onClick={()=>onChange(scheme.id)}
                    className={ `relative rounded-lg transition-all ${value === scheme.id && 'ring-2 ring-red-500'}`}
                    title={t(colorNameKeys[scheme.id] ?? scheme.name)}>
                    <div className="flex h-10 rounded-lg overflow-hidden">
                        {scheme .colors.map((color, i) => (
                            <div 
                                key={i}
                                className="flex-1"
                                style ={{backgroundColor: color}}/>
                        ))}
                  </div>      
                    </button>
            ))}
        </div>
        <p className="text-xs text-zinc-400">{t('selectors.colorSelected')}: {t(colorNameKeys[colorSchemes.find((s) => s.id === value)?.id ?? ''] ?? colorSchemes.find((s) => s.id === value)?.name ?? '')}</p>
    </div>
  )
}

export default ColorSchemeSelector