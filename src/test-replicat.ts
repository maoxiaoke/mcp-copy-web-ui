import { downloadCompleteHTML } from './replicate.js';
import fs from 'fs';

downloadCompleteHTML('https://manus.im/').then((html: string) => {
  // const minifiedHtml = html
  //   .replace(/[\r\n\t]+/g, '') // Remove newlines, tabs
  //   .replace(/\s{2,}/g, ' ')   // Replace multiple spaces with single space
  //   .trim();    

  //   const escapedHtml = minifiedHtml
  //   .replace(/&/g, '&amp;')
  //   .replace(/</g, '&lt;')
  //   .replace(/>/g, '&gt;')
  //   .replace(/"/g, '&quot;')
  //   .replace(/'/g, '&#039;');

  fs.writeFileSync('output.html', html);
});