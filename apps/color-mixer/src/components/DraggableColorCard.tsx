import { Card, Draggable } from '@core/ui';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';
import type { DraggableColorCardProps } from './types';

export function DraggableColorCard({
  color,
  t,
  initialPosition,
  size = 'md',
  idPrefix,
  returnToOrigin,
  validDropZones
}: DraggableColorCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-24 h-24 sm:w-28 sm:h-28'
  };

  return (
    <Draggable
      id={`${idPrefix || 'color'}-${color.name}`}
      className="inline-block"
      initial={initialPosition}
      returnToOrigin={returnToOrigin}
      validDropZones={validDropZones}
    >
      <Card
        className={`${sizeClasses[size]} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-grab active:cursor-grabbing`}
        padding="sm"
      >
        <div
          className="w-full h-full rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
          style={{
            backgroundColor: rgbToString(color.rgb),
            color: getTextColor(color.rgb),
          }}
        >
          {/* @ts-ignore - t() function supports dynamic color names */}
          {t(`colorNames.${getColorName(color.rgb)}` as any) ||
           t('colorNames.unknown')}
        </div>
      </Card>
    </Draggable>
  );
}
