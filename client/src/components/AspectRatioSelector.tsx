import {RectangleHorizontal, Square, RectangleVertical} from "lucide-react"
import { aspectRatios, type AspectRatio } from "../assets/assets"
import type React from "react"

function AspectRatioSelector({value, onChange} : {value: AspectRatio, onChange: (value: AspectRatio) => void}) {

    const iconMap = {
    '16:9': <RectangleHorizontal className="size-6"/>,
    '1:1': <Square className="size-6"/>,
    '9:16': <RectangleVertical className="size-6"/>,
    } as Record<AspectRatio, React.ReactNode> 
    
  return (
    <div>
        <label className="block text-sm font-medium text-zinc-200">Aspect Ratio</label>     
        <div className="flex flex-wrap gap-2">
            {aspectRatios.map((ratio)=>{
                const Selected = value === ratio;

                return (
                    <button 
                        key={ratio} type ="button"
                        onClick={() => onChange(ratio)} 
                        className={`flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm transition border-white/10 ${Selected ? 'bg-white/10' : 'hover:bg-white/6'}`}
                    >
                        {iconMap[ratio]}
                        <span className="text-sm text-zinc-100">{ratio}</span>
                    </button>
              )
            })}
        </div>
    </div>
  )
}

export default AspectRatioSelector