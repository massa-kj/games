import type { ClockAngles, ClockCycle, ClockHand, ClockHourDragMode, ClockParts, ClockTime } from './types.js';

export const CLOCK_FACE_MINUTES = 12 * 60;

export function getClockCycleMinutes(cycle: ClockCycle = 12): number {
  return cycle * 60;
}

export function normalizeDegrees(degrees: number): number {
  return modulo(degrees, 360);
}

export function normalizeClockTime(value: ClockTime, cycle: ClockCycle = 12): ClockTime {
  return {
    totalMinutes: modulo(value.totalMinutes, getClockCycleMinutes(cycle)),
  };
}

export function snapClockTime(value: ClockTime, step = 1, cycle: ClockCycle = 12): ClockTime {
  const safeStep = sanitizeStep(step);
  return normalizeClockTime(
    {
      totalMinutes: Math.round(value.totalMinutes / safeStep) * safeStep,
    },
    cycle
  );
}

export function timeToClockAngles(value: ClockTime, cycle: ClockCycle = 12): ClockAngles {
  const normalized = normalizeClockTime(value, cycle).totalMinutes;
  const faceMinutes = modulo(normalized, CLOCK_FACE_MINUTES);

  return {
    hourAngle: normalizeDegrees((faceMinutes / CLOCK_FACE_MINUTES) * 360),
    minuteAngle: normalizeDegrees((modulo(faceMinutes, 60) / 60) * 360),
  };
}

export function getClockParts(value: ClockTime, cycle: ClockCycle = 12): ClockParts {
  const rounded = snapClockTime(value, 1, cycle).totalMinutes;
  const hour = Math.floor(rounded / 60);
  const minute = modulo(rounded, 60);

  return {
    totalMinutes: rounded,
    hour,
    displayHour: cycle === 12 ? hour % 12 || 12 : hour,
    minute,
  };
}

export function formatClockTime(value: ClockTime, cycle: ClockCycle = 12): string {
  const parts = getClockParts(value, cycle);
  return `${parts.displayHour}:${parts.minute.toString().padStart(2, '0')}`;
}

export interface AngleToClockTimeOptions {
  hand: ClockHand;
  current: ClockTime;
  cycle?: ClockCycle;
  minuteStep?: number;
  hourDragMode?: ClockHourDragMode;
}

export function angleToClockTime(angle: number, options: AngleToClockTimeOptions): ClockTime {
  const cycle = options.cycle ?? 12;
  const minuteStep = sanitizeStep(options.minuteStep ?? 1);
  const current = normalizeClockTime(options.current, cycle);

  if (options.hand === 'minute') {
    return setMinuteHandTime(current, angleToMinute(angle, minuteStep), cycle);
  }

  const hourDragMode = options.hourDragMode ?? 'keepMinute';

  if (hourDragMode === 'realClock') {
    const faceMinutes = snapClockTime(
      { totalMinutes: (normalizeDegrees(angle) / 360) * CLOCK_FACE_MINUTES },
      minuteStep,
      12
    ).totalMinutes;
    return closestClockTimeForFaceMinutes(current, faceMinutes, cycle);
  }

  const faceHour = angleToHour(angle);
  const currentParts = getClockParts(current, cycle);
  const faceMinutes = faceHour * 60 + (hourDragMode === 'keepMinute' ? currentParts.minute : 0);

  return closestClockTimeForFaceMinutes(current, faceMinutes, cycle);
}

export function angleToMinute(angle: number, step = 1): number {
  return modulo(
    Math.round((normalizeDegrees(angle) / 6) / sanitizeStep(step)) * sanitizeStep(step),
    60
  );
}

export function angleToHour(angle: number): number {
  return modulo(Math.round(normalizeDegrees(angle) / 30), 12);
}

function setMinuteHandTime(current: ClockTime, minute: number, cycle: ClockCycle): ClockTime {
  const normalizedCurrent = normalizeClockTime(current, cycle);
  const faceMinutes = modulo(normalizedCurrent.totalMinutes, CLOCK_FACE_MINUTES);
  const currentHour = Math.floor(faceMinutes / 60);
  const currentMinute = modulo(Math.round(faceMinutes), 60);
  let targetHour = currentHour;

  if (currentMinute >= 45 && minute <= 15) {
    targetHour += 1;
  } else if (currentMinute <= 15 && minute >= 45) {
    targetHour -= 1;
  }

  return closestClockTimeForFaceMinutes(normalizedCurrent, targetHour * 60 + minute, cycle);
}

function closestClockTimeForFaceMinutes(current: ClockTime, faceMinutes: number, cycle: ClockCycle): ClockTime {
  const cycleMinutes = getClockCycleMinutes(cycle);
  const currentMinutes = normalizeClockTime(current, cycle).totalMinutes;
  let best = normalizeClockTime({ totalMinutes: faceMinutes }, cycle);
  let bestDistance = circularDistance(currentMinutes, best.totalMinutes, cycleMinutes);
  const candidateCount = Math.ceil(cycleMinutes / CLOCK_FACE_MINUTES) + 4;

  for (let index = -2; index <= candidateCount; index += 1) {
    const candidate = normalizeClockTime(
      { totalMinutes: faceMinutes + index * CLOCK_FACE_MINUTES },
      cycle
    );
    const distance = circularDistance(currentMinutes, candidate.totalMinutes, cycleMinutes);

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function circularDistance(left: number, right: number, cycleMinutes: number): number {
  const distance = Math.abs(left - right);
  return Math.min(distance, cycleMinutes - distance);
}

function sanitizeStep(step: number): number {
  return Number.isFinite(step) && step > 0 ? step : 1;
}

function modulo(value: number, base: number): number {
  return ((value % base) + base) % base;
}
