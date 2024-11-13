import path from 'path';
import YAML from 'yaml';
import fs from 'fs';

const generateVersedbVersionFile = (): void => {
  console.log(`Generating .versedb.version from pnpm-lock version`);
  const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
  const pnpmLock = YAML.parse(fs.readFileSync(pnpmLockPath, { encoding: 'utf-8' })) as {
    importers: {
      '.': {
        dependencies: {
          'verse.db': Record<string, string>;
        };
      };
    };
  };
  const {
    importers: {
      '.': {
        dependencies: { 'verse.db': verseDb },
      },
    },
  } = pnpmLock;
  const versedbVersionFilePath = path.join(process.cwd(), '.versedb.version');
  fs.writeFileSync(versedbVersionFilePath, verseDb.version, { flag: 'w' });
};

const runScript = async (): Promise<void> => {
  generateVersedbVersionFile();
};

runScript()
  .then(() => process.exit(0))
  .catch(reason => {
    console.error(`Failed to generate support files`, reason);
    console.error((reason as { stdout: Buffer }).stdout.toString());
    process.exit(1);
  });
