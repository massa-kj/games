import React, { useCallback, useMemo, useRef } from 'react';
import type {
  ClockDisplay,
  ClockEditable,
  ClockHand,
  ClockLabels,
  ClockProps,
} from './types.js';
import {
  angleToClockTime,
  formatClockTime,
  getClockParts,
  normalizeClockTime,
  snapClockTime,
  timeToClockAngles,
} from './utils.js';

const DEFAULT_EDITABLE: Required<ClockEditable> = {
  hourHand: false,
  minuteHand: false,
};

const DEFAULT_DISPLAY: Required<ClockDisplay> = {
  numbers: true,
  tickMarks: 'five-minute',
  digitalTime: false,
  centerDot: true,
};

const DEFAULT_LABELS: Required<ClockLabels> = {
  clock: 'Clock',
  hourHand: 'Hour hand',
  minuteHand: 'Minute hand',
  digitalTime: 'Time',
};

const CLOCK_CENTER = 50;
const OUTER_RADIUS = 47;
const NUMBER_RADIUS = 38;
const HOUR_HAND_LENGTH = 26;
const MINUTE_HAND_LENGTH = 36;

export function Clock({
  value,
  editable,
  display,
  labels,
  cycle = 12,
  hourDragMode = 'keepMinute',
  minuteStep = 1,
  size = 240,
  onChange,
  className = '',
  style,
  ...props
}: ClockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const normalizedValue = useMemo(() => normalizeClockTime(value, cycle), [cycle, value]);
  const displayOptions = useMemo(() => ({ ...DEFAULT_DISPLAY, ...display }), [display]);
  const editableOptions = useMemo(() => ({ ...DEFAULT_EDITABLE, ...editable }), [editable]);
  const labelOptions = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);
  const angles = timeToClockAngles(normalizedValue, cycle);
  const parts = getClockParts(normalizedValue, cycle);
  const formattedTime = formatClockTime(normalizedValue, cycle);
  const clockStyle = {
    ...style,
    '--clock-size': typeof size === 'number' ? `${size}px` : size,
  } as React.CSSProperties;

  const emitChange = useCallback((nextValue: { totalMinutes: number }) => {
    const next = snapClockTime(nextValue, minuteStep, cycle);

    if (next.totalMinutes !== normalizedValue.totalMinutes) {
      onChange?.(next);
    }
  }, [cycle, minuteStep, normalizedValue.totalMinutes, onChange]);

  const updateFromPointer = useCallback((hand: ClockHand, clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();

    if (!rect || rect.width === 0 || rect.height === 0) {
      return;
    }

    const angle = pointToClockAngle(clientX, clientY, rect);
    emitChange(angleToClockTime(angle, {
      hand,
      current: normalizedValue,
      cycle,
      minuteStep,
      hourDragMode,
    }));
  }, [cycle, emitChange, hourDragMode, minuteStep, normalizedValue]);

  const handlePointerDown = useCallback((hand: ClockHand, event: React.PointerEvent<SVGGElement>) => {
    if (!isHandEditable(hand, editableOptions, onChange)) {
      return;
    }

    event.preventDefault();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(hand, event.clientX, event.clientY);
  }, [editableOptions, onChange, updateFromPointer]);

  const handlePointerMove = useCallback((hand: ClockHand, event: React.PointerEvent<SVGGElement>) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    updateFromPointer(hand, event.clientX, event.clientY);
  }, [updateFromPointer]);

  const handlePointerUp = useCallback((event: React.PointerEvent<SVGGElement>) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    activePointerRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleHandKeyDown = useCallback((hand: ClockHand, event: React.KeyboardEvent<SVGGElement>) => {
    if (!isHandEditable(hand, editableOptions, onChange)) {
      return;
    }

    const direction = getKeyDirection(event.key);

    if (direction === 0) {
      return;
    }

    event.preventDefault();
    const minuteDelta = hand === 'minute'
      ? direction * (event.shiftKey ? 5 : 1)
      : direction * 60;

    emitChange({ totalMinutes: normalizedValue.totalMinutes + minuteDelta });
  }, [editableOptions, emitChange, normalizedValue.totalMinutes, onChange]);

  const classes = [
    'core-clock',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={clockStyle} {...props}>
      <svg
        ref={svgRef}
        className="core-clock-face"
        viewBox="0 0 100 100"
        role="img"
        aria-label={labelOptions.clock}
      >
        <circle className="core-clock-face-bg" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={OUTER_RADIUS} />
        {renderTickMarks(displayOptions.tickMarks)}
        {displayOptions.numbers && renderNumbers()}
        <ClockHandElement
          hand="hour"
          angle={angles.hourAngle}
          length={HOUR_HAND_LENGTH}
          className="core-clock-hour-hand"
          lineClassName="core-clock-hour-hand-line"
          label={labelOptions.hourHand}
          valueNow={parts.displayHour}
          valueMin={cycle === 12 ? 1 : 0}
          valueMax={cycle === 12 ? 12 : 23}
          valueText={formattedTime}
          editable={isHandEditable('hour', editableOptions, onChange)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleHandKeyDown}
        />
        <ClockHandElement
          hand="minute"
          angle={angles.minuteAngle}
          length={MINUTE_HAND_LENGTH}
          className="core-clock-minute-hand"
          lineClassName="core-clock-minute-hand-line"
          label={labelOptions.minuteHand}
          valueNow={parts.minute}
          valueMin={0}
          valueMax={59}
          valueText={formattedTime}
          editable={isHandEditable('minute', editableOptions, onChange)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleHandKeyDown}
        />
        {displayOptions.centerDot && (
          <circle className="core-clock-center-dot" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="2.6" />
        )}
      </svg>
      {displayOptions.digitalTime && (
        <output className="core-clock-digital-time" aria-label={labelOptions.digitalTime}>
          {formattedTime}
        </output>
      )}
    </div>
  );
}

interface RenderHandOptions {
  hand: ClockHand;
  angle: number;
  length: number;
  className: string;
  lineClassName: string;
  label: string;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  valueText: string;
  editable: boolean;
  onPointerDown: (hand: ClockHand, event: React.PointerEvent<SVGGElement>) => void;
  onPointerMove: (hand: ClockHand, event: React.PointerEvent<SVGGElement>) => void;
  onPointerUp: (event: React.PointerEvent<SVGGElement>) => void;
  onKeyDown: (hand: ClockHand, event: React.KeyboardEvent<SVGGElement>) => void;
}

function ClockHandElement({
  hand,
  angle,
  length,
  className,
  lineClassName,
  label,
  valueNow,
  valueMin,
  valueMax,
  valueText,
  editable,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
}: RenderHandOptions) {
  const end = polarToPoint(angle, length);
  const classNames = [
    'core-clock-hand',
    className,
    editable ? 'editable' : '',
  ].filter(Boolean).join(' ');
  const ariaProps = editable
    ? {
        role: 'slider',
        tabIndex: 0,
        'aria-label': label,
        'aria-valuenow': valueNow,
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuetext': valueText,
      }
    : {
        'aria-hidden': true,
      };

  return (
    <g
      className={classNames}
      onPointerDown={(event) => onPointerDown(hand, event)}
      onPointerMove={(event) => onPointerMove(hand, event)}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => onKeyDown(hand, event)}
      {...ariaProps}
    >
      <line
        className={lineClassName}
        x1={CLOCK_CENTER}
        y1={CLOCK_CENTER}
        x2={end.x}
        y2={end.y}
      />
      <line
        className="core-clock-hand-hit-target"
        x1={CLOCK_CENTER}
        y1={CLOCK_CENTER}
        x2={end.x}
        y2={end.y}
        pointerEvents={editable ? 'stroke' : 'none'}
      />
    </g>
  );
}

function renderNumbers() {
  return Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const angle = number === 12 ? 0 : number * 30;
    const point = polarToPoint(angle, NUMBER_RADIUS);

    return (
      <text
        key={number}
        className="core-clock-number"
        x={point.x}
        y={point.y}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {number}
      </text>
    );
  });
}

function renderTickMarks(tickMarks: Required<ClockDisplay>['tickMarks']) {
  if (tickMarks === 'none') {
    return null;
  }

  const count = tickMarks === 'minute' ? 60 : 12;

  return Array.from({ length: count }, (_, index) => {
    const minuteIndex = tickMarks === 'minute' ? index : index * 5;
    const angle = minuteIndex * 6;
    const isMajor = minuteIndex % 5 === 0;
    const outer = polarToPoint(angle, OUTER_RADIUS - 2);
    const inner = polarToPoint(angle, isMajor ? OUTER_RADIUS - 8 : OUTER_RADIUS - 5);

    return (
      <line
        key={minuteIndex}
        className={isMajor ? 'core-clock-tick major' : 'core-clock-tick'}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
      />
    );
  });
}

function polarToPoint(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;

  return {
    x: CLOCK_CENTER + Math.sin(radians) * radius,
    y: CLOCK_CENTER - Math.cos(radians) * radius,
  };
}

function pointToClockAngle(clientX: number, clientY: number, rect: DOMRect): number {
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;

  return ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
}

function isHandEditable(hand: ClockHand, editable: Required<ClockEditable>, onChange?: ClockProps['onChange']): boolean {
  return Boolean(onChange && (hand === 'hour' ? editable.hourHand : editable.minuteHand));
}

function getKeyDirection(key: string): -1 | 0 | 1 {
  if (key === 'ArrowRight' || key === 'ArrowUp') {
    return 1;
  }

  if (key === 'ArrowLeft' || key === 'ArrowDown') {
    return -1;
  }

  return 0;
}
