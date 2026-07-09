import type { ValueProductVisual } from '@/data/value-products';
import { cn } from '@/lib/utils';

interface ProductVisualProps {
  type: ValueProductVisual;
  className?: string;
  color?: string;
}

export default function ProductVisual({ type, className, color = '#e5ddce' }: ProductVisualProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-[1.25rem] border-[10px] border-white bg-[#d9d4ca] shadow-[0_18px_50px_rgba(27,27,24,0.14)]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ece8df] via-[#d9d5cd] to-[#beb9ae]" />
      <div className="absolute inset-x-[12%] top-[8%] bottom-0 overflow-hidden border-x-4 border-t-4 border-[#f7f5ef] bg-[#bfc9ca] shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cbd6d5] via-[#aebbbc] to-[#89999a]" />
        <div className="absolute left-[48%] inset-y-0 w-1 bg-[#eef0ea]/85" />
        {type === 'cellular' && (
          <div className="absolute inset-x-0 top-0 h-[82%]" style={{ backgroundColor: color }}>
            {Array.from({ length: 18 }).map((_, index) => (
              <div
                key={index}
                className="absolute inset-x-0 h-px bg-black/10 shadow-[0_1px_0_rgba(255,255,255,0.7)]"
                style={{ top: `${(index + 1) * 5.3}%` }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-2 bg-[#8f8b82]/55" />
          </div>
        )}
        {type === 'roller' && (
          <>
            <div className="absolute inset-x-[-2%] top-0 h-5 rounded-b-lg bg-[#f3f0e9] shadow" />
            <div className="absolute inset-x-0 top-3 h-[75%]" style={{ backgroundColor: color }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/18 to-black/[0.04]" />
              <div className="absolute inset-x-0 bottom-0 h-2 bg-[#858178]/60" />
            </div>
          </>
        )}
        {type === 'faux-wood' && (
          <div className="absolute inset-0 pt-2">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="relative h-[6.3%] border-y border-black/10 shadow-[0_2px_2px_rgba(0,0,0,0.12)]"
                style={{ backgroundColor: color }}
              >
                <div className="absolute left-[12%] inset-y-0 w-px bg-[#8b8172]/45" />
                <div className="absolute right-[12%] inset-y-0 w-px bg-[#8b8172]/45" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute left-[7%] right-[7%] bottom-[5%] h-5 rounded-full bg-black/[0.07] blur-md" />
    </div>
  );
}

