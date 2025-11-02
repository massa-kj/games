import { Modal } from '@core/ui';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';
import type { ColorDefinition, GameTranslations } from '@/types';

interface ColorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColors: ColorDefinition[];
  savedColors: (ColorDefinition | null)[];
  translations: GameTranslations;
  onColorSelect: (color: ColorDefinition) => void;
  title: string;
}

export function ColorSelectionModal({
  isOpen,
  onClose,
  primaryColors,
  savedColors,
  translations,
  onColorSelect,
  title,
}: ColorSelectionModalProps) {
  const handleColorClick = (color: ColorDefinition) => {
    onColorSelect(color);
    onClose();
  };

  // Create a combined array of all available colors for circular layout
  const allColors: (ColorDefinition | null)[] = [...primaryColors, ...savedColors];
  const totalColors = allColors.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      animationType="scale"
      speed="normal"
    >
      <div className="flex flex-col items-center space-y-6 p-4">
        {/* Central title with magical effect */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 text-purple-700">
            <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-gentle">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {translations.chooseYourElement}
            </h3>
            <div className="p-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.5s' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Circular color arrangement */}
        <div className="relative w-80 h-80 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse-gentle border-4 border-purple-200/50 shadow-inner">
          {/* Circular arrangement of colors */}
          {allColors.map((color, index) => {
            if (!color) return null;

            const angle = (index * 360) / totalColors;
            const radius = 120; // Distance from center
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

            const isPrimary = primaryColors.includes(color);

            return (
              <button
                key={`${color.name}-${index}`}
                onClick={() => handleColorClick(color)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-125 hover:z-10"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div className="relative">
                  {/* Magical aura */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-amber-300/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-gentle"></div>

                  <div
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 cursor-pointer border-3 border-white/50 group-hover:shadow-2xl ${
                      isPrimary ? 'ring-2 ring-blue-400 ring-offset-2' : 'ring-2 ring-green-400 ring-offset-2'
                    }`}
                    style={{
                      backgroundColor: rgbToString(color.rgb),
                      color: getTextColor(color.rgb),
                    }}
                  >
                    {/* Category indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                      {isPrimary ? (
                        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Sparkle effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                      <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                      <div className="absolute bottom-2 left-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                    </div>

                    <span className="relative z-10 text-xs text-center leading-tight">
                      {/* @ts-ignore - translations.colorNames has the color name */}
                      {(translations.colorNames[getColorName(color.rgb) as keyof typeof translations.colorNames] ||
                       translations.colorNames.unknown).slice(0, 4)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-blue-700 font-semibold">{translations.primaryElements}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-700 font-semibold">{translations.savedCreations}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
