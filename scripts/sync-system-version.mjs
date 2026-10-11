#!/usr/bin/env node

/**
 * VESSEL // Automatic System Version & Deployment Sync Tool
 *
 * Invariante de Despliegue a Producción (Main):
 * Garantiza que cada versión subida a git main actualice de forma sincronizada:
 * 1. src/lib/version/systemVersion.ts (CURRENT_SYSTEM_VERSION, SYSTEM_BUILD_TIMESTAMP, SYSTEM_BUILD_FORMATTED)
 * 2. public/sw.js (VESSEL_VERSION, CACHE_NAME para provocar purga de Service Worker en clientes)
 * 3. package.json (version)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const systemVersionPath = path.join(rootDir, "src/lib/version/systemVersion.ts");
const swPath = path.join(rootDir, "public/sw.js");
const packageJsonPath = path.join(rootDir, "package.json");

// Obtener fecha actual en zona horaria de Argentina (ART, UTC-3)
function getArgentineDateInfo() {
  const now = new Date();
  const iso = now.toISOString().replace(/\.\d+Z$/, "-03:00");
  const formatted = now.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " ART";

  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeCompact = now.toISOString().slice(11, 16).replace(/:/g, "");
  const stamp = `${dateCompact}-${timeCompact}`;

  return { iso, formatted, stamp };
}

// Leer versión actual de systemVersion.ts
function readCurrentSystemVersion() {
  const content = fs.readFileSync(systemVersionPath, "utf-8");
  const match = content.match(/export const CURRENT_SYSTEM_VERSION = "([^"]+)";/);
  if (!match) {
    throw new Error("No se pudo encontrar CURRENT_SYSTEM_VERSION en " + systemVersionPath);
  }
  return match[1];
}

// Actualizar public/sw.js
function updateServiceWorker(version, stamp) {
  if (!fs.existsSync(swPath)) return;
  let content = fs.readFileSync(swPath, "utf-8");
  const swVersion = `${version}-${stamp}`;
  
  content = content.replace(
    /const VESSEL_VERSION = "[^"]+";/,
    `const VESSEL_VERSION = "${swVersion}";`
  );
  fs.writeFileSync(swPath, content, "utf-8");
  console.log(`✓ public/sw.js sincronizado con VESSEL_VERSION = "${swVersion}"`);
}

// Actualizar package.json
function updatePackageJson(version) {
  if (!fs.existsSync(packageJsonPath)) return;
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const cleanVersion = version.replace(/^v/, "");
  pkg.version = cleanVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  console.log(`✓ package.json sincronizado con version = "${cleanVersion}"`);
}

function main() {
  const args = process.argv.slice(2);
  const isBump = args.includes("--bump");
  const currentVersion = readCurrentSystemVersion();
  const { iso, formatted, stamp } = getArgentineDateInfo();

  console.log(`[VESSEL VERSION SYNC] Versión actual del sistema: ${currentVersion}`);

  if (isBump) {
    // Incrementar versión patch (ej: v2.6.0 -> v2.6.1)
    const semverMatch = currentVersion.match(/^v(\d+)\.(\d+)\.(\d+)$/);
    if (!semverMatch) {
      console.error(`Formato de versión no compatible con semver: ${currentVersion}`);
      process.exit(1);
    }
    const major = parseInt(semverMatch[1], 10);
    const minor = parseInt(semverMatch[2], 10);
    const patch = parseInt(semverMatch[3], 10) + 1;
    const nextVersion = `v${major}.${minor}.${patch}`;

    let content = fs.readFileSync(systemVersionPath, "utf-8");
    content = content.replace(
      /export const CURRENT_SYSTEM_VERSION = "[^"]+";/,
      `export const CURRENT_SYSTEM_VERSION = "${nextVersion}";`
    );
    content = content.replace(
      /export const SYSTEM_BUILD_TIMESTAMP = "[^"]+";/,
      `export const SYSTEM_BUILD_TIMESTAMP = "${iso}";`
    );
    content = content.replace(
      /export const SYSTEM_BUILD_FORMATTED = "[^"]+";/,
      `export const SYSTEM_BUILD_FORMATTED = "${formatted}";`
    );

    fs.writeFileSync(systemVersionPath, content, "utf-8");
    console.log(`✓ systemVersion.ts incrementado a ${nextVersion} (${formatted})`);

    updateServiceWorker(nextVersion, stamp);
    updatePackageJson(nextVersion);
  } else {
    // Sincronizar SW y package.json con la versión actual
    updateServiceWorker(currentVersion, stamp);
    updatePackageJson(currentVersion);
  }

  console.log(`[VESSEL VERSION SYNC] ¡Sincronización completa con éxito!`);
}

main();
