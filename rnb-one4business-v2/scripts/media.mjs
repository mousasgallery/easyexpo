// Προετοιμασία media από τα πρωτότυπα Higgsfield (media-src/, δεν τροποποιούνται).
// Χωρίς upscale: ίδια ανάλυση με τα originals (720p). Μικρό GOP για ομαλό scroll-scrub, χωρίς ήχο.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const jobs = [
  { src: 'media-src/higgsfield-b7a0ea6d-desktop-1280x720.mp4', out: 'desktop' },
  { src: 'media-src/higgsfield-2245cbee-mobile-720x1280.mp4', out: 'mobile' },
];
fs.mkdirSync('public/media', { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
for (const j of jobs) {
  ff(['-i', j.src, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-g', '6', '-keyint_min', '6', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `public/media/cinema-${j.out}.mp4`]);
  ff(['-ss', '0', '-i', j.src, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '72', `public/media/cinema-${j.out}-start.webp`]);
  ff(['-sseof', '-0.1', '-i', j.src, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '72', `public/media/cinema-${j.out}-end.webp`]);
}
for (const f of fs.readdirSync('public/media')) console.log(f, fs.statSync('public/media/' + f).size);
