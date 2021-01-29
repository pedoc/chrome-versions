import SecretAgent from 'secret-agent';
import Versions from '../versions.json';
import * as Fs from 'fs';

async function checkMacVersions() {
  const agent = new SecretAgent({ showReplay: true, humanEmulatorId: 'skipper' });
  await agent.goto('https://google-chrome.en.uptodown.com/mac/versions');
  await agent.waitForAllContentLoaded();
  await agent.waitForMillis(3e3);

  console.log('Mac versions page loaded');
  const { document } = agent;
  const links = await document.querySelectorAll('#versions-items-list > div').length;

  for (let i = 0; i < links; i += 1) {
    const link = await document.querySelectorAll('#versions-items-list > div')[i];
    const date = await link.querySelector('span').textContent;
    const version = (await link.textContent).replace(date, '').trim();
    if (Versions[version]) {
      console.log('Already know about the located version', version);
      continue;
    }
    console.log('Clicking version link', { date, version, i });
    await agent.click(document.querySelectorAll('#versions-items-list > div')[i]);

    await agent.waitForLocation('change');
    const url = await agent.document.querySelector('#detail-download-button').getAttribute('href');

    Versions[version] = {
      mac: url,
      linux: `http://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_${version}-1_amd64.deb`,
    };
    Fs.writeFileSync('../versions.json', JSON.stringify(sortObj(Versions), null, 2));

    await agent.goBack();
    await agent.waitForMillis(1e3);
  }

  console.log('Extracted data');
  await agent.close();
  process.exit();
}

checkMacVersions();

function sortObj(obj) {
  return Object.keys(obj)
    .sort()
    .reverse()
    .reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
}
