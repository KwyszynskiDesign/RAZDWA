// upload-kalkulator.js – standalone kalkulator plików CAD (upload-kalkulator.html)
// This page is a full standalone HTML (not a SPA partial), so init() just guards the DOM.
import { init as initCadUpload } from './cad-upload.js';

export function init() {
  initCadUpload();
}

export function destroy() {}
