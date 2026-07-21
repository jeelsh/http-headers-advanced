import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LANGUAGES_DIR = join(__dirname, '../languages');
const TEXT_DOMAIN = 'jeelsh-http-headers';
const APP_KEY = '04sewsgb';
const SCRIPT_HANDLE = `antonella-react-app-${APP_KEY}`;
const HASHED_JSON_PATTERN = new RegExp(`^${TEXT_DOMAIN}-(\\w+)-([a-f0-9]{32})\\.json$`, 'i');

function processTranslationFiles() {
  const filesByLocale = {};

  readdirSync(LANGUAGES_DIR).forEach((file) => {
    const match = file.match(HASHED_JSON_PATTERN);
    if (!match) {
      return;
    }

    const locale = match[1];
    filesByLocale[locale] ??= [];
    filesByLocale[locale].push(file);
  });

  Object.entries(filesByLocale).forEach(([locale, localeFiles]) => {
    const mergedTranslations = {};
    let baseMetadata = {};

    localeFiles.forEach((file) => {
      const filePath = join(LANGUAGES_DIR, file);
      const content = JSON.parse(readFileSync(filePath, 'utf8'));

      if (Object.keys(baseMetadata).length === 0) {
        baseMetadata = {
          'translation-revision-date': content['translation-revision-date'] ?? '',
          generator: content.generator ?? 'WP-CLI/2.0.0',
          domain: TEXT_DOMAIN,
        };
      }

      const translations = content.locale_data?.[TEXT_DOMAIN] ?? content.locale_data?.messages ?? {};
      Object.entries(translations).forEach(([key, value]) => {
        if (key !== '') {
          mergedTranslations[key] = value;
        }
      });

      unlinkSync(filePath);
    });

    const output = {
      ...baseMetadata,
      locale_data: {
        [TEXT_DOMAIN]: {
          '': {
            domain: TEXT_DOMAIN,
            lang: locale,
            'plural-forms': 'nplurals=2; plural=(n != 1);',
          },
          ...mergedTranslations,
        },
      },
    };
    const outputPath = join(LANGUAGES_DIR, `${TEXT_DOMAIN}-${locale}-${SCRIPT_HANDLE}.json`);

    writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    console.log(`Generated ${outputPath}`);
  });
}

processTranslationFiles();
