import { useMemo, useState } from 'react';
import { GameHeader } from '@core/ui';
import { Clock, type ClockTime } from '@core/ui/clock';
import '@/styles.css';

type Language = 'ja' | 'en';

const COPY = {
  ja: {
    title: 'Spin the Clock',
    timeLabel: '時刻',
    hourUnit: '時',
    minuteUnit: '分',
    stepLabel: '刻み',
    hourHand: '短い針',
    minuteHand: '長い針',
    minusHour: '1時間もどす',
    plusHour: '1時間すすめる',
    minusStep: '刻み分もどす',
    plusStep: '刻み分すすめる',
    reset: '15:00に戻す',
    clock: '時計',
    hands: '針',
  },
  en: {
    title: 'Spin the Clock',
    timeLabel: 'Time',
    hourUnit: 'Hour',
    minuteUnit: 'Minute',
    stepLabel: 'Step',
    hourHand: 'Hour hand',
    minuteHand: 'Minute hand',
    minusHour: 'Back 1 hour',
    plusHour: 'Forward 1 hour',
    minusStep: 'Back by step',
    plusStep: 'Forward by step',
    reset: 'Reset to 15:00',
    clock: 'Clock',
    hands: 'Hands',
  },
} satisfies Record<Language, Record<string, string>>;

const MINUTES_PER_DAY = 24 * 60;
const INITIAL_TIME = 15 * 60;
const STEP_OPTIONS = [1, 5, 15, 30, 60] as const;

export default function App() {
  const language = getLanguage();
  const copy = COPY[language];
  const [time, setTime] = useState<ClockTime>({ totalMinutes: INITIAL_TIME });
  const [minuteStep, setMinuteStep] = useState<number>(5);
  const normalizedTime = normalizeDayMinutes(time.totalMinutes);
  const formattedTime = formatTime24(normalizedTime);
  const parts = useMemo(() => getTimeParts(normalizedTime), [normalizedTime]);

  const setMinutes = (totalMinutes: number) => {
    setTime({ totalMinutes: normalizeDayMinutes(totalMinutes) });
  };

  return (
    <div className="spin-clock-app">
      <GameHeader
        title={copy.title}
        showSettingsButton={false}
        showHomeButton={true}
        variant="compact"
      />

      <main className="spin-clock-main" aria-label={copy.title}>
        <section className="clock-workbench">
          <div className="clock-stage" aria-label={copy.clock}>
            <Clock
              value={{ totalMinutes: normalizedTime }}
              cycle={24}
              editable={{ hourHand: true, minuteHand: true }}
              hourDragMode="keepMinute"
              minuteStep={minuteStep}
              size="min(72vw, 360px)"
              labels={{
                clock: copy.clock,
                hourHand: copy.hourHand,
                minuteHand: copy.minuteHand,
                digitalTime: copy.timeLabel,
              }}
              display={{
                numbers: true,
                tickMarks: 'minute',
                digitalTime: false,
                centerDot: true,
              }}
              onChange={setTime}
            />
          </div>

          <aside className="time-console" aria-label={copy.timeLabel}>
            <div>
              <p className="console-label">{copy.timeLabel}</p>
              <output className="time-display" aria-live="polite">
                {formattedTime}
              </output>
            </div>

            <div className="time-readout-grid" aria-label={copy.hands}>
              <div className="readout-item">
                <span>{copy.hourUnit}</span>
                <strong>{parts.hour.toString().padStart(2, '0')}</strong>
              </div>
              <div className="readout-item accent">
                <span>{copy.minuteUnit}</span>
                <strong>{parts.minute.toString().padStart(2, '0')}</strong>
              </div>
            </div>

            <div className="step-controls">
              <span className="console-label">{copy.stepLabel}</span>
              <div className="step-options" role="group" aria-label={copy.stepLabel}>
                {STEP_OPTIONS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    className={step === minuteStep ? 'step-option selected' : 'step-option'}
                    aria-pressed={step === minuteStep}
                    onClick={() => setMinuteStep(step)}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            <div className="nudge-grid">
              <button
                type="button"
                className="nudge-button"
                aria-label={copy.minusHour}
                onClick={() => setMinutes(normalizedTime - 60)}
              >
                -1h
              </button>
              <button
                type="button"
                className="nudge-button"
                aria-label={copy.plusHour}
                onClick={() => setMinutes(normalizedTime + 60)}
              >
                +1h
              </button>
              <button
                type="button"
                className="nudge-button accent"
                aria-label={copy.minusStep}
                onClick={() => setMinutes(normalizedTime - minuteStep)}
              >
                -{minuteStep}m
              </button>
              <button
                type="button"
                className="nudge-button accent"
                aria-label={copy.plusStep}
                onClick={() => setMinutes(normalizedTime + minuteStep)}
              >
                +{minuteStep}m
              </button>
            </div>

            <button type="button" className="reset-button" onClick={() => setMinutes(INITIAL_TIME)}>
              {copy.reset}
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function getLanguage(): Language {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}

function formatTime24(totalMinutes: number): string {
  const { hour, minute } = getTimeParts(totalMinutes);

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function getTimeParts(totalMinutes: number): { hour: number; minute: number } {
  const normalized = normalizeDayMinutes(totalMinutes);

  return {
    hour: Math.floor(normalized / 60),
    minute: normalized % 60,
  };
}

function normalizeDayMinutes(totalMinutes: number): number {
  return ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}
