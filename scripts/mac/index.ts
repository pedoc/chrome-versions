import GithubReleases from '../GithubReleases';
import { getAssetPath } from '../dirUtils';
import { downloadInstaller } from '../downloadInstaller';
import convertMacDmg from './convertMacDmg';
import Versions from '../Versions';

export async function process(os: string, version: string, releases: GithubReleases) {
  const assetPath = getAssetPath(os, version);
  const downloadPage = Versions.get(version)[os];

  const downloadedPath = await downloadInstaller(downloadPage, os, version);
  if(!downloadedPath) {
    console.log('Skipping %s for %s,reason: can not download', version, os);
    return;
  }
  await convertMacDmg(downloadedPath, assetPath, version, os === 'mac_arm64');

  const release = await releases.get(version);
  await releases.uploadAsset(release, assetPath);
}
