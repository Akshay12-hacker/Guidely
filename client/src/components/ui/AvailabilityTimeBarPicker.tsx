import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  Check,
  Globe,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { AvailabilityScheduleData } from '../../../../shared/types.js';

export interface AvailabilityTimeBarPickerProps {
  value?: string;
  onChange: (formattedValue: string, details?: AvailabilityScheduleData) => void;
  label?: string;
  description?: string;
}

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' }
];

const TIME_PRESETS = [
  {
    name: '🌅 Morning',
    description: '8:00 AM – 12:00 PM',
    start: 8,
    end: 12
  },
  {
    name: '☀️ Afternoon',
    description: '12:00 PM – 5:00 PM',
    start: 12,
    end: 17
  },
  {
    name: '🌆 Evening',
    description: '5:00 PM – 9:00 PM',
    start: 17,
    end: 21
  },
  {
    name: '🎓 Post-College',
    description: '6:00 PM – 10:00 PM',
    start: 18,
    end: 22
  },
  {
    name: '🌙 Late Night',
    description: '9:00 PM – 12:00 AM',
    start: 21,
    end: 24
  }
];

const TIMEZONES = [
  { code: 'IST', label: 'IST (India Standard Time • UTC+5:30)' },
  { code: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { code: 'EST', label: 'EST (US Eastern Time • UTC-5)' },
  { code: 'PST', label: 'PST (US Pacific Time • UTC-8)' },
  { code: 'BST', label: 'BST / GMT (British Summer Time • UTC+1)' },
  { code: 'SGT', label: 'SGT (Singapore / Asia • UTC+8)' }
];

// Helper to convert float hour (e.g. 18.5) to formatted 12-hour string (e.g. 06:30 PM)
export function formatHour(hour: number): string {
  const normalized = Math.max(0, Math.min(24, hour));
  if (normalized === 24) return '12:00 AM (midnight)';
  if (normalized === 0) return '12:00 AM';

  const h = Math.floor(normalized);
  const m = Math.round((normalized - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m === 0 ? '00' : m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${period}`;
}

// Generate hour options for selects (every 30 mins from 00:00 to 24:00)
const TIME_OPTIONS: { value: number; label: string }[] = [];
for (let h = 0; h <= 24; h += 0.5) {
  TIME_OPTIONS.push({
    value: h,
    label: formatHour(h)
  });
}

interface TimelineBarProps {
  startHour: number;
  endHour: number;
  onStartChange: (val: number) => void;
  onEndChange: (val: number) => void;
  title?: string;
  badgeLabel?: string;
}

const TimelineBar: React.FC<TimelineBarProps> = ({
  startHour,
  endHour,
  onStartChange,
  onEndChange,
  title,
  badgeLabel
}) => {
  const duration = Math.max(0.5, endHour - startHour);
  const leftPct = (startHour / 24) * 100;
  const widthPct = (duration / 24) * 100;

  // Major ticks: 0, 3, 6, 9, 12, 15, 18, 21, 24
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {formatHour(startHour)} – {formatHour(endHour)} ({duration} hrs)
          </span>
        </div>
      )}

      {/* Visual Bar Track */}
      <div
        style={{
          position: 'relative',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#f1f5f9',
          border: '1.5px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none'
        }}
      >
        {/* Hour Grid Lines */}
        {ticks.map(t => (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: `${(t / 24) * 100}%`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: t % 6 === 0 ? '#cbd5e1' : '#e2e8f0',
              zIndex: 1
            }}
          />
        ))}

        {/* Highlighted Active Time Window Bar */}
        <div
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            top: '4px',
            bottom: '4px',
            background: 'linear-gradient(90deg, var(--primary) 0%, #0ea5e9 100%)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'left 0.1s ease, width 0.1s ease',
            minWidth: '60px'
          }}
        >
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              padding: '0 6px'
            }}
          >
            {badgeLabel || `${duration}h block`}
          </span>
        </div>
      </div>

      {/* Tick Labels */}
      <div style={{ position: 'relative', height: '18px', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-2px' }}>
        <span style={{ position: 'absolute', left: '0%' }}>12 AM</span>
        <span style={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)' }}>6 AM</span>
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>12 PM (Noon)</span>
        <span style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>6 PM</span>
        <span style={{ position: 'absolute', right: '0%' }}>12 AM</span>
      </div>

      {/* Precise Time Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
        <div>
          <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Start Time
          </label>
          <select
            value={startHour}
            onChange={(e) => {
              const newStart = parseFloat(e.target.value);
              if (newStart < endHour) {
                onStartChange(newStart);
              } else if (newStart < 23.5) {
                onStartChange(newStart);
                onEndChange(Math.min(24, newStart + 1));
              }
            }}
            className="guidely-input"
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.84rem', fontWeight: 600 }}
          >
            {TIME_OPTIONS.filter(o => o.value < 24).map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            End Time
          </label>
          <select
            value={endHour}
            onChange={(e) => {
              const newEnd = parseFloat(e.target.value);
              if (newEnd > startHour) {
                onEndChange(newEnd);
              } else if (newEnd > 0.5) {
                onEndChange(newEnd);
                onStartChange(Math.max(0, newEnd - 1));
              }
            }}
            className="guidely-input"
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.84rem', fontWeight: 600 }}
          >
            {TIME_OPTIONS.filter(o => o.value > 0).map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export const AvailabilityTimeBarPicker: React.FC<AvailabilityTimeBarPickerProps> = ({
  value,
  onChange,
  label = 'Preferred Meeting Times',
  description = 'Select the days and interactive time bars when you are free for 1-on-1 mentor syncs.'
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startHour, setStartHour] = useState<number>(18); // 6:00 PM
  const [endHour, setEndHour] = useState<number>(22); // 10:00 PM
  const [splitWeekends, setSplitWeekends] = useState<boolean>(true);
  const [weekendStartHour, setWeekendStartHour] = useState<number>(10); // 10:00 AM
  const [weekendEndHour, setWeekendEndHour] = useState<number>(15); // 3:00 PM
  const [timezone, setTimezone] = useState<string>('IST');
  const [customNote, setCustomNote] = useState<string>('');

  // Hydrate initial state if a preset string exists
  useEffect(() => {
    if (value && value.trim()) {
      if (!value.includes('IST') && !value.includes('UTC') && !value.includes('PM') && !value.includes('AM')) {
        setCustomNote(value);
      }
    }
  }, []);

  // Compute formatted schedule string whenever fields change
  const formattedSchedule = useMemo(() => {
    if (selectedDays.length === 0) {
      return customNote.trim() || 'Flexible / Upon request';
    }

    const weekdays = selectedDays.filter(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d));
    const weekends = selectedDays.filter(d => ['Sat', 'Sun'].includes(d));

    const parts: string[] = [];

    if (splitWeekends) {
      if (weekdays.length > 0) {
        const dayStr = weekdays.length === 5 ? 'Mon-Fri' : weekdays.join(', ');
        parts.push(`${dayStr}: ${formatHour(startHour)} - ${formatHour(endHour)} ${timezone}`);
      }
      if (weekends.length > 0) {
        const dayStr = weekends.length === 2 ? 'Sat-Sun' : weekends.join(', ');
        parts.push(`${dayStr}: ${formatHour(weekendStartHour)} - ${formatHour(weekendEndHour)} ${timezone}`);
      }
    } else {
      const dayStr = selectedDays.length === 7
        ? 'All Week (Mon-Sun)'
        : selectedDays.length === 5 && weekdays.length === 5
        ? 'Mon-Fri'
        : selectedDays.join(', ');
      parts.push(`${dayStr}: ${formatHour(startHour)} - ${formatHour(endHour)} ${timezone}`);
    }

    // Weekly hours calculation
    const weekdayHours = weekdays.length * Math.max(0, endHour - startHour);
    const weekendHours = splitWeekends
      ? weekends.length * Math.max(0, weekendEndHour - weekendStartHour)
      : weekends.length * Math.max(0, endHour - startHour);
    const totalWeeklyHours = weekdayHours + weekendHours;

    let result = parts.join(' | ');
    if (totalWeeklyHours > 0) {
      result += ` (~${totalWeeklyHours} hrs/wk)`;
    }
    if (customNote.trim()) {
      result += ` • Note: ${customNote.trim()}`;
    }

    return result;
  }, [
    selectedDays,
    startHour,
    endHour,
    splitWeekends,
    weekendStartHour,
    weekendEndHour,
    timezone,
    customNote
  ]);

  // Structured schedule details object
  const scheduleDetails = useMemo<AvailabilityScheduleData>(() => {
    const weekdays = selectedDays.filter(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d));
    const weekends = selectedDays.filter(d => ['Sat', 'Sun'].includes(d));
    const weekdayHours = weekdays.length * Math.max(0, endHour - startHour);
    const weekendHours = splitWeekends
      ? weekends.length * Math.max(0, weekendEndHour - weekendStartHour)
      : weekends.length * Math.max(0, endHour - startHour);

    return {
      days: selectedDays,
      startHour,
      endHour,
      splitWeekends,
      weekendStartHour: splitWeekends ? weekendStartHour : undefined,
      weekendEndHour: splitWeekends ? weekendEndHour : undefined,
      timezone,
      customNote: customNote.trim() || undefined,
      totalWeeklyHours: weekdayHours + weekendHours,
      formattedSchedule
    };
  }, [
    selectedDays,
    startHour,
    endHour,
    splitWeekends,
    weekendStartHour,
    weekendEndHour,
    timezone,
    customNote,
    formattedSchedule
  ]);

  // Push formatted string and structured details to parent
  useEffect(() => {
    if (formattedSchedule) {
      onChange(formattedSchedule, scheduleDetails);
    }
  }, [formattedSchedule, scheduleDetails, onChange]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectPresetDays = (type: 'weekdays' | 'weekends' | 'all') => {
    if (type === 'weekdays') setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    if (type === 'weekends') setSelectedDays(['Sat', 'Sun']);
    if (type === 'all') setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  };

  const applyTimePreset = (start: number, end: number) => {
    setStartHour(start);
    setEndHour(end);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Clock size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {label}
          </h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>

      {/* Day Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            1. Select Available Days
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => selectPresetDays('weekdays')}
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Weekdays
            </button>
            <span style={{ color: 'var(--border)' }}>•</span>
            <button
              type="button"
              onClick={() => selectPresetDays('weekends')}
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Weekends
            </button>
            <span style={{ color: 'var(--border)' }}>•</span>
            <button
              type="button"
              onClick={() => selectPresetDays('all')}
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              All 7 Days
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DAYS_OF_WEEK.map(d => {
            const isSelected = selectedDays.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDay(d.key)}
                style={{
                  flex: '1 1 50px',
                  minWidth: '46px',
                  padding: '10px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  boxShadow: isSelected ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Time Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          2. Quick Time Slots
        </span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TIME_PRESETS.map(preset => {
            const isActive = startHour === preset.start && endHour === preset.end;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyTimePreset(preset.start, preset.end)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--primary-light)' : '#FFFFFF',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.name} ({preset.description})
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Time Bar (Weekday / General) */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border)'
        }}
      >
        <TimelineBar
          startHour={startHour}
          endHour={endHour}
          onStartChange={setStartHour}
          onEndChange={setEndHour}
          title={splitWeekends ? 'Weekday Time Window (Mon – Fri)' : 'Active Time Window'}
          badgeLabel={`${formatHour(startHour)} – ${formatHour(endHour)}`}
        />

        {/* Separate Weekend Toggle */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
              Different Hours for Weekends?
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Set a daytime sprint window for Saturday & Sunday (e.g. 10:00 AM – 3:00 PM)
            </span>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={splitWeekends}
              onChange={(e) => setSplitWeekends(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </label>
        </div>

        {/* Weekend Time Bar (when enabled) */}
        {splitWeekends && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <TimelineBar
              startHour={weekendStartHour}
              endHour={weekendEndHour}
              onStartChange={setWeekendStartHour}
              onEndChange={setWeekendEndHour}
              title="Weekend Time Window (Sat – Sun)"
              badgeLabel={`${formatHour(weekendStartHour)} – ${formatHour(weekendEndHour)}`}
            />
          </div>
        )}
      </div>

      {/* Timezone Selector & Optional Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Time Zone
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="guidely-input"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.84rem', fontWeight: 600 }}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.code} value={tz.code}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Additional Flexibility / Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Flexible on Discord, alternate Thursdays exam off..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="guidely-input"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Live Formatted Summary Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--primary-light)',
          border: '1.5px solid var(--primary-border)'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Sparkles size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em', display: 'block' }}>
            Generated Availability Schedule
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>
            {formattedSchedule}
          </span>
        </div>
      </div>
    </div>
  );
};
