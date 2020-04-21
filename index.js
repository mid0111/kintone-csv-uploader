#!/usr/bin/env node

const fs = require('fs');
var iconv = require('iconv-lite');

const Config = require('./lib/Config');
const Kintone = require('./lib/Kintone');

const config = Config.parse();
if (!config) {
  process.exit(-1);
}

Kintone.uploadCsv(
  config,
  iconv.decode(fs.readFileSync(config.filePath), config.encoding)
);
