import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import imageCompression from 'browser-image-compression';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function compressImage(file: File): Promise<Blob> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp'
  };

  return imageCompression(file, options);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function calculateScore(items: any[]): { total: number; passed: number; percent: number } {
  const total = items.filter((i) => i.response !== 'NA').length;
  const passed = items.filter((i) => i.response === 'YES').length;
  const percent = total > 0 ? Math.round((passed / total) * 100) : 0;

  return { total, passed, percent };
}

export function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) {
    const match = userAgent.match(/Android\s+(\d+\.\d+)/);
    return `Android ${match?.[1] || ''}`;
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS';
  }
  return 'Web';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
