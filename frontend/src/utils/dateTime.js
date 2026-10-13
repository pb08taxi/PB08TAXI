/**
 * Global Indian Standard Time (IST) & DD-MM-YYYY Date/Time Formatting Suite
 * Timezone: Asia/Kolkata (IST = UTC+5:30)
 * Date format: DD-MM-YYYY (e.g. 13-10-2026)
 * Time format: 12-hour AM/PM (e.g. 07:14 PM or 07:14:34 PM)
 */

/**
 * Parses any incoming date string/number/Date object.
 * Naive ISO strings from backend (e.g. "2026-10-13T13:44:34") are guaranteed
 * to be treated as UTC, preventing timezone loss.
 */
export function parseServerDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  let s = String(dateInput).trim();
  // If ISO string like 2026-10-13T13:44:34 without timezone offset or Z
  if (s.includes('T') && !s.endsWith('Z') && !s.includes('+') && !s.slice(10).includes('-')) {
    s += 'Z';
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
    // SQL format "YYYY-MM-DD HH:MM:SS" -> treat as UTC
    s = s.replace(' ', 'T') + 'Z';
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(dateInput) : d;
}

/**
 * Formats a date into DD-MM-YYYY in Indian Standard Time (IST).
 * Example: "13-10-2026"
 */
export function formatISTDate(dateInput) {
  if (!dateInput) return '—';

  // Already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(String(dateInput).trim())) {
    return String(dateInput).trim();
  }

  // Pure date string YYYY-MM-DD (e.g. pickup_date "2026-10-13")
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateInput).trim())) {
    const [y, m, d] = String(dateInput).trim().split('-');
    return `${d}-${m}-${y}`;
  }

  const d = parseServerDate(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  try {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).formatToParts(d);

    const day = parts.find(p => p.type === 'day')?.value || '01';
    const month = parts.find(p => p.type === 'month')?.value || '01';
    const year = parts.find(p => p.type === 'year')?.value || '2026';
    return `${day}-${month}-${year}`;
  } catch (e) {
    // Fallback manual offset (+330 min)
    const istTime = new Date(d.getTime() + (5.5 * 60 + d.getTimezoneOffset()) * 60000);
    const day = String(istTime.getDate()).padStart(2, '0');
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const year = istTime.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

/**
 * Formats time with 12-hour AM/PM in Indian Standard Time (IST).
 * Example: "07:14 PM" or "07:14:34 PM"
 */
export function formatISTTime(dateInput, includeSeconds = false) {
  if (!dateInput) return '—';

  // If already a simple time string like "19:15" or "07:30"
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(String(dateInput).trim())) {
    const raw = String(dateInput).trim();
    const parts = raw.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const s = parts[2] ? parts[2] : null;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const hh = String(h).padStart(2, '0');
    if (includeSeconds && s) {
      return `${hh}:${m}:${s} ${ampm}`;
    }
    return `${hh}:${m} ${ampm}`;
  }

  const d = parseServerDate(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  try {
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(d);

    return formatted.toUpperCase();
  } catch (e) {
    return d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true 
    }).toUpperCase();
  }
}

/**
 * Formats combined Date & Time in IST: "DD-MM-YYYY, hh:mm:ss AM/PM" or "DD-MM-YYYY, hh:mm AM/PM"
 * Example: "13-10-2026, 07:14:34 PM"
 */
export function formatISTDateTime(dateInput, includeSeconds = false) {
  if (!dateInput) return '—';
  const dateStr = formatISTDate(dateInput);
  const timeStr = formatISTTime(dateInput, includeSeconds);
  if (dateStr === '—') return '—';
  return `${dateStr}, ${timeStr}`;
}

/**
 * Formats relative time elapsed (e.g. Just now, 2m ago, 1h ago, 2d ago)
 */
export function formatISTTimeAgo(dateInput) {
  if (!dateInput) return '';
  const d = parseServerDate(dateInput);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
