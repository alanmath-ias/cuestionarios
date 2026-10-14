import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionInfoPath = path.join(__dirname, 'version-info.json');
let customInfo = {
  id: "default-feature",
  highlight: false,
  tag: "Optimización & Mejoras",
  title: "¡Nueva actualización disponible!",
  description: "Se han aplicado mejoras de rendimiento y estabilidad en la plataforma.",
  ctaText: "Ver Novedad",
  action: null
};

if (fs.existsSync(versionInfoPath)) {
  try {
    const raw = fs.readFileSync(versionInfoPath, 'utf-8');
    customInfo = { ...customInfo, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("⚠️ Could not read version-info.json:", e);
  }
}

const versionFilePath = path.join(__dirname, 'client', 'public', 'version.json');
const versionData = {
  id: customInfo.id || "feature-" + (customInfo.title ? customInfo.title.substring(0, 20) : "default"),
  version: Date.now().toString(),
  timestamp: new Date().toISOString(),
  highlight: Boolean(customInfo.highlight),
  tag: customInfo.tag,
  title: customInfo.title,
  description: customInfo.description,
  ctaText: customInfo.ctaText,
  action: customInfo.action
};

if (!fs.existsSync(path.join(__dirname, 'client', 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'client', 'public'), { recursive: true });
}

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

// Si ya existe la carpeta dist/client, sincronizamos también allí
const distVersionFilePath = path.join(__dirname, 'dist', 'client', 'version.json');
if (fs.existsSync(path.join(__dirname, 'dist', 'client'))) {
  fs.writeFileSync(distVersionFilePath, JSON.stringify(versionData, null, 2));
}

console.log(`✅ Build version generated: ${versionData.version} [${versionData.tag}] - "${versionData.title}" (highlight: ${versionData.highlight})`);
