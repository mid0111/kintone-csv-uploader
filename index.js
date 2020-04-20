#!/usr/bin/env node

const fs = require('fs');
const Config = require('./lib/Config');
const Kintone = require('./lib/Kintone');

const config = Config.parse();
if (!config) {
  process.exit(-1);
}

Kintone.uploadCsv(
  config,
  fs.readFileSync(config.filePath, {
    encoding: config.encode,
  })
);
