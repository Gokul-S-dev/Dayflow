export const workSchedule = {
  workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
  dailyHours: 8,
  breakMinutes: 60
};

/**
 * Parses time formatted as "09:42 AM" and date as "2026-08-22" into a Date object.
 */
export const parseTime = (timeStr, dateStr) => {
  if (!timeStr || timeStr === '—' || timeStr === null) return null;
  try {
    const cleanTime = timeStr.trim();
    const parts = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!parts) return null;
    
    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const ampm = parts[3] ? parts[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    return d;
  } catch (e) {
    return null;
  }
};

/**
 * Calculates work hours and extra/overtime hours based on check-in, check-out and config.
 */
export function calculateAttendanceHours(checkInStr, checkOutStr, dateStr, schedule = workSchedule) {
  const inTime = parseTime(checkInStr, dateStr);
  const outTime = parseTime(checkOutStr, dateStr);
  
  if (!inTime || !outTime) {
    return { hours: 0, extra: 0, hoursStr: '0.0 hrs', extraStr: '0.0 hrs' };
  }

  const diffMs = outTime - inTime;
  if (diffMs < 0) {
    return { hours: 0, extra: 0, hoursStr: '0.0 hrs', extraStr: '0.0 hrs' };
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  // Deduct standard lunch break
  const breakHrs = schedule.breakMinutes / 60;
  const workHours = Math.max(0, diffHours - breakHrs);
  
  // dailyHours standard work day, remainder is extra/overtime
  const extraHours = Math.max(0, workHours - schedule.dailyHours);

  const hoursRounded = parseFloat(workHours.toFixed(2));
  const extraRounded = parseFloat(extraHours.toFixed(2));

  return {
    hours: hoursRounded,
    extra: extraRounded,
    hoursStr: `${hoursRounded.toFixed(1)} hrs`,
    extraStr: `+${extraRounded.toFixed(1)} hrs`
  };
}
