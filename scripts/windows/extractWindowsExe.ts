import * as Fs from 'fs';
import { mkTempDir } from '../dirUtils';
import { execSync } from 'child_process';
import { createTarGz } from '../createTarGz';

// This function simply pulls the core executable out of the installer and moves it into a fixed version file.
// This breaks the updater (possibly also stops parts of it from installing)
export default async function extractWindowsExe(
  downloadExecutable: string,
  extractToPath: string,
  chromeVersion: string,
  needDecompress: boolean,
): Promise<void> {
  const tmp = mkTempDir();

  console.log('Modifying Chrome@%s', chromeVersion, downloadExecutable, tmp);

  // extract executable
  execSync(`7z.exe ${needDecompress ? 'e' : 'x'} -y "${downloadExecutable}" -o"${tmp}\\"`);
  console.log(`After extraction, files are`, Fs.readdirSync(tmp));
  if (needDecompress) {
    execSync(`7z.exe x -y "${tmp}\\chrome.7z" -o"${tmp}"`);
  } else {
    console.log('Skip decompress chrome.7z');
  }

  console.log('Unzipped Chrome installer %s', Fs.readdirSync(`${tmp}/Chrome-bin`));

  // move chrome.exe into "version folder"
  Fs.renameSync(`${tmp}/Chrome-bin/chrome.exe`, `${tmp}/Chrome-bin/${chromeVersion}/chrome.exe`);

  await createTarGz(extractToPath, `${tmp}/Chrome-bin/`, [chromeVersion]);
  console.log('Finished extracting windows exe', extractToPath);
}
