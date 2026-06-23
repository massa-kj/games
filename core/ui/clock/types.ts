import type React from 'react';

export interface ClockTime {
  totalMinutes: number;
}

export type ClockCycle = 12 | 24;

export type ClockHand = 'hour' | 'minute';

export type ClockTickMarks = 'none' | 'five-minute' | 'minute';

export type ClockHourDragMode = 'keepMinute' | 'snapToHour' | 'realClock';

export interface ClockEditable {
  hourHand?: boolean;
  minuteHand?: boolean;
}

export interface ClockDisplay {
  numbers?: boolean;
  tickMarks?: ClockTickMarks;
  digitalTime?: boolean;
  centerDot?: boolean;
}

export interface ClockLabels {
  clock?: string;
  hourHand?: string;
  minuteHand?: string;
  digitalTime?: string;
}

export interface ClockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: ClockTime;
  editable?: ClockEditable;
  display?: ClockDisplay;
  labels?: ClockLabels;
  cycle?: ClockCycle;
  hourDragMode?: ClockHourDragMode;
  minuteStep?: number;
  size?: number | string;
  onChange?: (value: ClockTime) => void;
}

export interface ClockAngles {
  hourAngle: number;
  minuteAngle: number;
}

export interface ClockParts {
  totalMinutes: number;
  hour: number;
  displayHour: number;
  minute: number;
}
