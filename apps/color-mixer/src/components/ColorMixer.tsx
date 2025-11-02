import { Card, Button } from '@core/ui';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';
import type { ColorMixerProps } from './types';

// Beaker/Flask Icon for mixing
const BeakerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281.837l1.48 2.22a2 2 0 001.664.901h9.15a2 2 0 001.664-.901l1.48-2.22A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39zM9 12l2-2m0 0l2-2m-2 2v6m-6-4h12" />
  </svg>
);

// Plus Icon for combining
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Sparkles for magic/result effect
const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM3 6a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6zM14 6a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1V6z" />
  </svg>
);

export function ColorMixer({
  selectedColors,
  mixedColor,
  isAnimating,
  translations,
  onSlotClick,
  onMixButtonClick,
  onGeneratedColorClick,
}: ColorMixerProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl border border-purple-200/50">
      {/* Header with beaker icon */}
      <div className="flex items-center justify-center gap-3 text-purple-700">
        <div className="p-3 bg-purple-100 rounded-full animate-pulse-gentle">
          <BeakerIcon className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {translations.alchemyStation}
        </h3>
        <div className="p-3 bg-purple-100 rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }}>
          <BeakerIcon className="w-6 h-6 text-purple-600 scale-x-[-1]" />
        </div>
      </div>

      {/* Mixer Slots */}
      <div className="relative bg-white/50 rounded-2xl p-6 shadow-inner">
        <div className="grid grid-cols-5 gap-4 items-center justify-items-center">
          {/* Slot 1 */}
          <div className="col-span-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">{translations.elementA}</span>
            </div>

            <button
              onClick={() => onSlotClick(0)}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 transition-all duration-500 hover:scale-110 hover:rotate-3 focus:outline-none focus:ring-4 focus:ring-purple-300/50"
            >
              {selectedColors[0] ? (
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl animate-pulse-gentle"></div>
                  <Card
                    className="relative w-full h-full transition-all duration-300 hover:shadow-xl"
                    padding="sm"
                  >
                    <div
                      className="w-full h-full rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner border-2 border-white/50"
                      style={{
                        backgroundColor: rgbToString(selectedColors[0].rgb),
                        color: getTextColor(selectedColors[0].rgb),
                      }}
                    >
                      <span className="text-center leading-tight">
                        {/* @ts-ignore - translations.colorNames has the color name */}
                        {(translations.colorNames[getColorName(selectedColors[0].rgb) as keyof typeof translations.colorNames] ||
                         translations.colorNames.unknown).slice(0, 6)}
                      </span>
                    </div>
                  </Card>

                  {/* Magical glow indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  {/* Energy rings */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/50 animate-ping"></div>
                </div>
              ) : (
                <div className="w-full h-full border-3 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group-hover:border-purple-500 group-hover:bg-purple-50/50 group-hover:shadow-xl group-hover:shadow-purple-300/50 bg-gradient-to-br from-white/80 to-purple-50/50">
                  {/* Scientific apparatus design */}
                  <div className="text-purple-400 transition-all duration-300 group-hover:text-purple-600 group-hover:scale-125">
                    <div className="relative">
                      {/* Flask body */}
                      <div className="w-8 h-6 bg-gradient-to-b from-purple-100 to-purple-200 rounded-b-full border-2 border-current"></div>
                      {/* Flask neck */}
                      <div className="w-3 h-4 bg-gradient-to-b from-purple-200 to-purple-100 border-2 border-current mx-auto -mt-1"></div>
                      {/* Bubbles */}
                      <div className="absolute bottom-1 left-1 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="absolute bottom-2 right-1.5 w-0.5 h-0.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                  <div className="text-purple-600 text-xs text-center mt-2 font-semibold group-hover:text-purple-700 transition-colors duration-300">
                    {translations.clickToChoose}
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Plus Symbol with magical effect */}
          <div className="flex items-center justify-center">
            <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-xl animate-pulse-gentle">
              <PlusIcon className="w-5 h-5 text-white" />
              {/* Magic sparkles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Slot 2 */}
          <div className="col-span-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-pink-100 rounded-full">
              <span className="text-sm font-bold text-pink-700 uppercase tracking-wide">{translations.elementB}</span>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            </div>

            <button
              onClick={() => onSlotClick(1)}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 transition-all duration-500 hover:scale-110 hover:rotate-3 focus:outline-none focus:ring-4 focus:ring-pink-300/50"
            >
              {selectedColors[1] ? (
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-2xl animate-pulse-gentle"></div>
                  <Card
                    className="relative w-full h-full transition-all duration-300 hover:shadow-xl"
                    padding="sm"
                  >
                    <div
                      className="w-full h-full rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner border-2 border-white/50"
                      style={{
                        backgroundColor: rgbToString(selectedColors[1].rgb),
                        color: getTextColor(selectedColors[1].rgb),
                      }}
                    >
                      <span className="text-center leading-tight">
                        {/* @ts-ignore - translations.colorNames has the color name */}
                        {(translations.colorNames[getColorName(selectedColors[1].rgb) as keyof typeof translations.colorNames] ||
                         translations.colorNames.unknown).slice(0, 6)}
                      </span>
                    </div>
                  </Card>

                  {/* Magical glow indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  {/* Energy rings */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-pink-300/50 animate-ping"></div>
                </div>
              ) : (
                <div className="w-full h-full border-3 border-dashed border-pink-300 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group-hover:border-pink-500 group-hover:bg-pink-50/50 group-hover:shadow-xl group-hover:shadow-pink-300/50 bg-gradient-to-br from-white/80 to-pink-50/50">
                  {/* Scientific apparatus design */}
                  <div className="text-pink-400 transition-all duration-300 group-hover:text-pink-600 group-hover:scale-125">
                    <div className="relative">
                      {/* Flask body */}
                      <div className="w-8 h-6 bg-gradient-to-b from-pink-100 to-pink-200 rounded-b-full border-2 border-current"></div>
                      {/* Flask neck */}
                      <div className="w-3 h-4 bg-gradient-to-b from-pink-200 to-pink-100 border-2 border-current mx-auto -mt-1"></div>
                      {/* Bubbles */}
                      <div className="absolute bottom-1 left-1 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="absolute bottom-2 right-1.5 w-0.5 h-0.5 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
                    </div>
                  </div>
                  <div className="text-pink-600 text-xs text-center mt-2 font-semibold group-hover:text-pink-700 transition-colors duration-300">
                    {translations.clickToChoose}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Magical energy flow lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-transparent rounded-full animate-pulse"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          {/* Energy particles */}
          <div className="absolute top-1/2 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>

      {/* Mix Button */}
      <div className="text-center">
        <Button
          onClick={onMixButtonClick}
          disabled={!selectedColors[0] || !selectedColors[1] || isAnimating}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
            !selectedColors[0] || !selectedColors[1] || isAnimating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60'
          }`}
        >
          {isAnimating ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              {translations.mixingMagic}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <BeakerIcon className="w-5 h-5" />
              {translations.mixColors}
              <SparklesIcon className="w-5 h-5" />
            </div>
          )}
        </Button>
      </div>

      {/* Arrow pointing down */}
      <div className="flex justify-center">
        <div className="text-purple-400">
          <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Generated Color */}
      <div className="text-center space-y-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-inner border border-yellow-200/50">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse-gentle">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-lg font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            {translations.alchemicalCreation}
          </h4>
          <div className="p-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.5s' }}>
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex justify-center">
          {mixedColor ? (
            <button
              onClick={onGeneratedColorClick}
              className="group transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
            >
              <div className="relative">
                {/* Magical aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-amber-300/30 rounded-3xl blur-md animate-pulse-gentle"></div>
                <Card
                  className={`relative w-32 h-32 sm:w-36 sm:h-36 transition-all duration-700 cursor-pointer hover:rotate-3 ${
                    isAnimating ? 'animate-pulse-gentle' : 'animate-bounce-in shadow-2xl hover:shadow-3xl'
                  }`}
                  padding="sm"
                >
                  <div
                    className="w-full h-full rounded-3xl flex items-center justify-center font-bold text-base shadow-inner relative overflow-hidden border-2 border-white/50"
                    style={{
                      backgroundColor: rgbToString(mixedColor),
                      color: getTextColor(mixedColor),
                    }}
                  >
                    {/* Enhanced sparkle effect overlay */}
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-3 left-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <div className="absolute top-6 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                      <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                      <div className="absolute bottom-6 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
                    </div>

                    {/* Success crown */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="text-yellow-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>

                    <div className="text-center relative z-10">
                      {/* @ts-ignore - translations.colorNames has the color name */}
                      {translations.colorNames[getColorName(mixedColor) as keyof typeof translations.colorNames] ||
                       translations.colorNames.unknown}
                    </div>

                    {/* Click to save indicator */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-xs font-bold bg-black/20 px-2 py-1 rounded-full">
                        {translations.clickToSave}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </button>
          ) : (
            <div className="w-32 h-32 sm:w-36 sm:h-36 border-3 border-dashed border-yellow-400 rounded-3xl flex flex-col items-center justify-center text-yellow-600 bg-gradient-to-br from-white/60 to-yellow-50/60 shadow-inner relative overflow-hidden">
              {isAnimating ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-yellow-400 border-t-transparent"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-yellow-300 opacity-75"></div>
                  </div>
                  <div className="text-sm font-bold animate-pulse">{translations.transmuting}</div>
                  {/* Magical particles during animation */}
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute bottom-6 left-8 w-1 h-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <SparklesIcon className="w-12 h-12 text-yellow-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div className="text-sm font-bold text-center">
                    {translations.waitingForMagicalElements}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full shadow-md">
            <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
              {mixedColor ? translations.clickColorToSave : translations.laboratoryReady}
            </span>
            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
