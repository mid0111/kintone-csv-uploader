const path = require('path');
const configFilePath = path.resolve('./config/sample.json');

const configJson = require(configFilePath);
const filePath = '/path/to/file';

beforeEach(() => {
  jest.resetModules();
});

test('オプションをパースできること', async () => {
  process.argv = [
    'node',
    './index.js',
    '--config',
    configFilePath,
    '--file',
    filePath,
    '--encoding',
    'utf-8',
  ];

  const Config = require('../lib/Config');
  const config = Config.parse();
  expect(config.domain).toBe(configJson.domain);
  expect(config.token).toBe(configJson.token);
  expect(config.appId).toBe(configJson.app);
  expect(config.filePath).toBe(filePath);
  expect(config.encoding).toBe('utf-8');
});

test('必須オプションが指定されていない場合インスタンスが生成されないこと', async () => {
  process.argv = ['node', './index.js'];

  const Config = require('../lib/Config');
  const config = Config.parse();
  expect(config).toBeFalsy();
});

test('設定ファイルに必須キーが存在しない場合インスタンスが生成されないこと', async () => {
  process.argv = [
    'node',
    './index.js',
    '--config',
    path.resolve('./test/test.config.json'),
    '--file',
    filePath,
    '--encoding',
    'utf-8',
  ];
  const Config = require('../lib/Config');
  const config = Config.parse();
  expect(config).toBeFalsy();
});

test('オプションが省略されている場合デフォルト値が設定されること', async () => {
  process.argv = [
    'node',
    './index.js',
    '--config',
    configFilePath,
    '--file',
    filePath,
  ];

  const Config = require('../lib/Config');
  const config = Config.parse();
  expect(config.domain).toBe(configJson.domain);
  expect(config.token).toBe(configJson.token);
  expect(config.appId).toBe(configJson.app);
  expect(config.filePath).toBe(filePath);
  expect(config.encoding).toBe('shift-jis');
});
