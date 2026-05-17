import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

const assets = [
  // Background images
  { src: 'https://www.hkengage.gov.hk/assets/images/bg-n-mask.png', dest: 'images/bg-n-mask.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/landing/visa-application.png', dest: 'images/landing/visa-application.png' },
  { src: 'https://www.hkengage.gov.hk/build/assets/landing-arrow-CRdqUqmr.png', dest: 'images/landing-arrow.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/bottom-banner-0.png', dest: 'images/visa/bottom-banner-0.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/bottom-banner-1.png', dest: 'images/visa/bottom-banner-1.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/bottom-banner-2.png', dest: 'images/visa/bottom-banner-2.png' },
  // Hero banner
  { src: 'https://www.hkengage.gov.hk/assets/images/hero-banner.jpg', dest: 'images/hero-banner.jpg' },
  // Social media icons
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/linkedin.svg', dest: 'images/social-media/linkedin.svg' },
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/facebook.svg', dest: 'images/social-media/facebook.svg' },
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/instagram.svg', dest: 'images/social-media/instagram.svg' },
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/youtube.svg', dest: 'images/social-media/youtube.svg' },
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/wechat.svg', dest: 'images/social-media/wechat.svg' },
  { src: 'https://www.hkengage.gov.hk/assets/images/social-media/xiaohongshu.svg', dest: 'images/social-media/xiaohongshu.svg' },
  // Footer images
  { src: 'https://www.hkengage.gov.hk/assets/images/footer/web-accessibility-conformance-tc.png', dest: 'images/footer/web-accessibility-conformance-tc.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/footer/wcag2.1AA-v.png', dest: 'images/footer/wcag2.1AA-v.png' },
  // Chatbot icon
  { src: 'https://www.hkengage.gov.hk/assets/images/chatbot-icon.png', dest: 'images/chatbot-icon.png' },
  // Bottom banner images
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/visa-handbook.png', dest: 'images/visa/visa-handbook.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/visa-faq.png', dest: 'images/visa/visa-faq.png' },
  { src: 'https://www.hkengage.gov.hk/assets/images/visa/visa-extension.png', dest: 'images/visa/visa-extension.png' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const destPath = path.join(PUBLIC_DIR, dest);
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        console.log(`  SKIP ${url} (status ${res.statusCode})`);
        resolve();
        return;
      }

      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  OK ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      console.log(`  FAIL ${url}: ${err.message}`);
      resolve(); // Don't fail the whole script
    });
  });
}

async function main() {
  console.log('Downloading assets...');
  const concurrency = 4;
  let i = 0;

  async function worker() {
    while (i < assets.length) {
      const idx = i++;
      const asset = assets[idx];
      if (!asset) continue;
      console.log(`[${idx + 1}/${assets.length}] ${asset.src}`);
      await downloadFile(asset.src, asset.dest);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  console.log('\nDone!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
