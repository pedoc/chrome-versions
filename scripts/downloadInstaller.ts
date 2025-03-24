import * as Fs from "fs";
import Axios from "axios";
import { getDownloadPath } from "./dirUtils";

export async function downloadInstaller(
  url: string,
  chromeOs: string,
  chromeVersion: string,
  headers?: { [key: string]: string },
) {
  const destinationPath = getDownloadPath(chromeOs, chromeVersion);

  if (Fs.existsSync(destinationPath)) return destinationPath;

  console.log('Downloading Chrome@%s on %s at url: %s', chromeVersion, chromeOs, url, headers);

  try {
    const response = await Axios.get(url, {
      responseType: 'stream',
      maxRedirects: 5,
      method: 'GET',
      headers,
    });

    // if (response.status === 404) throw new Error('Not found');
    if (response.status === 404) return null;

    const file = Fs.createWriteStream(destinationPath);
    response.data.pipe(file);
    await new Promise<void>((resolve, reject) => {
      file.on('finish', resolve);
      file.on('error', reject);
    });
    console.log('Finished download at %s', destinationPath);
    return destinationPath;
  }
  catch (e) {
    console.log('Error downloading: ', e);
    return null;
  }
}
