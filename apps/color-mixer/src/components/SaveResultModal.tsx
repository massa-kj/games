import { Modal, Draggable, DropZone } from '@core/ui';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';
import type { RGB, GameTranslations, SavedColor } from '@/types';

interface SaveResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mixedColor: RGB;
  savedColors: SavedColor[];
  translations: GameTranslations;
  onDrop: (zoneId: string, dragId?: string) => void;
}

export function SaveResultModal({
  isOpen,
  onClose,
  mixedColor,
  savedColors,
  translations,
  onDrop,
}: SaveResultModalProps) {

  const handleSaveComplete = () => {
    // Close modal after a short delay to show success animation
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Your Creation"
      size="lg"
      animationType="scale"
      speed="normal"
    >
      <div className="flex flex-col items-center space-y-8 p-6">
        {/* Header with magical effect */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-amber-700 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse-gentle">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Preserve Your Alchemy
            </h3>
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.5s' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Drag your magical creation to one of the preservation chambers below
          </p>
        </div>

        {/* Created Color - Draggable */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">Your Creation</span>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          <DropZone id="generated-slot">
            <Draggable
              id={`color-mixed-save-${Date.now()}`}
              className="inline-block"
              initial={{ x: 0, y: 0 }}
              returnToOrigin
              validDropZones={['save-slot-1', 'save-slot-2', 'save-slot-3']}
            >
              <div className="relative">
                {/* Magical aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-300/40 to-yellow-300/40 rounded-full blur-lg animate-pulse-gentle"></div>

                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-bold text-base shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-110 hover:rotate-3 border-4 border-white/70"
                  style={{
                    backgroundColor: rgbToString(mixedColor),
                    color: getTextColor(mixedColor),
                  }}
                >
                  {/* Enhanced sparkle effect overlay */}
                  <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-2 left-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                    <div className="absolute bottom-4 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                  </div>

                  {/* Success crown */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-yellow-500 animate-bounce">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center relative z-10 text-sm">
                    {/* @ts-ignore - translations.colorNames has the color name */}
                    {translations.colorNames[getColorName(mixedColor) as keyof typeof translations.colorNames] ||
                     translations.colorNames.unknown}
                  </div>
                </div>
              </div>
            </Draggable>
          </DropZone>
        </div>

        {/* Magical arrow pointing down */}
        <div className="flex justify-center">
          <div className="text-amber-400 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Save Slots - arranged in elegant layout */}
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-700 mb-2">Preservation Chambers</h4>
            <p className="text-sm text-gray-500">Choose a chamber to store your creation</p>
          </div>

          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {[0, 1, 2].map((index) => {
              const savedColor = savedColors[index];
              const slotNumber = index + 1;

              return (
                <div key={index} className="text-center space-y-2">
                  <div className="text-sm font-semibold text-gray-600">
                    Chamber {slotNumber}
                  </div>

                  <DropZone
                    id={`save-slot-${slotNumber}`}
                    onDrop={(zoneId, dragId) => {
                      onDrop(zoneId, dragId);
                      handleSaveComplete();
                    }}
                    className="group relative w-20 h-20 sm:w-24 sm:h-24 transition-all duration-500 hover:scale-110"
                  >
                    {savedColor ? (
                      <div className="relative h-full">
                        {/* Occupied slot with existing color */}
                        <div
                          className="w-full h-full rounded-2xl flex items-center justify-center font-bold text-xs shadow-lg border-3 border-white/50 relative overflow-hidden"
                          style={{
                            backgroundColor: rgbToString(savedColor.rgb),
                            color: getTextColor(savedColor.rgb),
                          }}
                        >
                          {/* Replacement indicator overlay */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-xs font-bold">
                              Replace?
                            </div>
                          </div>

                          <div className="text-center">
                            {/* @ts-ignore - translations.colorNames has the color name */}
                            {(translations.colorNames[getColorName(savedColor.rgb) as keyof typeof translations.colorNames] ||
                             translations.colorNames.unknown).slice(0, 6)}
                          </div>
                        </div>

                        {/* Occupied indicator */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full border-3 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group-hover:border-amber-500 group-hover:bg-amber-50/50 group-hover:shadow-xl group-hover:shadow-amber-300/30 bg-gradient-to-br from-white/80 to-amber-50/50">
                        {/* Empty slot design */}
                        <div className="text-amber-400 transition-all duration-300 group-hover:text-amber-600 group-hover:scale-125">
                          <div className="relative">
                            {/* Crystal/gem shape for preservation chamber */}
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9l-5.91 5.91L17.91 21L12 18.35L6.09 21l1.82-6.09L2 9l6.91-.74L12 2z"/>
                            </svg>

                            {/* Magical energy swirls */}
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                          </div>
                        </div>
                        <div className="text-amber-600 text-xs text-center mt-1 font-semibold group-hover:text-amber-700 transition-colors duration-300">
                          Empty
                        </div>
                      </div>
                    )}
                  </DropZone>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-500 leading-relaxed">
            Drag your creation to any preservation chamber above.
            If a chamber is already occupied, your new creation will replace the existing one.
          </p>
        </div>
      </div>
    </Modal>
  );
}
