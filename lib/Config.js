const fs = require('fs');
const yargs = require('yargs')
  .usage('使い方: $0 <command> [options]')
  .describe('config', '設定ファイルのパス')
  .describe('file', 'アップロードする CSV ファイルのパス')
  .describe(
    'key',
    '更新時のキーとする重複禁止フィールドコード（指定が無い場合はすべてのレコードを新規登録する）'
  )
  .describe('encoding', 'CSV ファイルのエンコード');
const argv = yargs.argv;

class Config {
  constructor(option, config) {
    this.domain = config.domain;
    this.token = String(config.token);
    this.appId = config.app;
    this.filePath = option.file;
    this.encoding = option.encoding || 'shift-jis';
    this.key = option.key;
  }

  static parse() {
    if (!argv.config || !argv.file) {
      yargs.showHelp();
      return;
    }
    const config = JSON.parse(fs.readFileSync(argv.config));

    if (!config.domain || !config.token || !config.app) {
      console.error(
        '設定ファイルに必須キーが指定されていません。[domain, token, app]'
      );
      return;
    }

    return new Config(argv, config);
  }
}

module.exports = Config;
