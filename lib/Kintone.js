const _ = require('lodash');
const axios = require('axios');
const parse = require('csv-parse/lib/sync');

module.exports = class Kintone {
  static async uploadCsv(config, input) {
    const records = parse(input, {
      columns: true,
      skip_empty_lines: true,
    });

    const { newRecords, updateRecords } = await Kintone.checkExistRecords(
      records,
      config
    );

    const convertedNewRecords = Kintone.convertNewRecords(newRecords, config);
    const convertedUpdateRecords = Kintone.convertUpdateRecords(
      updateRecords,
      config
    );

    await Kintone.bulkUpdate(config, 'post', convertedNewRecords);
    await Kintone.bulkUpdate(config, 'put', convertedUpdateRecords);
  }

  static async checkExistRecords(records, config) {
    let newRecords = [];
    let updateRecords = [];

    if (config.key) {
      // キーが指定されている場合は、キーの値で検索して、存在する場合は更新、
      // 存在しない場合は新規登録する
      const chunks = _.chunk(records, 500);
      for (let i = 0; i < chunks.length; i++) {
        const chunkRecords = chunks[i];
        let keys = [];

        chunkRecords.forEach((record) => {
          keys.push(`"${record[config.key]}"`);
        });
        const res = await axios.get(
          `https://${config.domain}/k/v1/records.json`,
          {
            headers: {
              'X-Cybozu-API-Token': config.token,
            },
            params: {
              app: config.appId,
              query: `${config.key} in (${keys.join(',')}) limit 500`,
            },
          }
        );

        chunkRecords.forEach((record) => {
          if (
            _.findIndex(res.data.records, (o) => {
              return o[config.key].value === record[config.key];
            }) < 0
          ) {
            newRecords.push(record);
          } else {
            updateRecords.push(record);
          }
        });
      }
    } else {
      newRecords = records;
    }

    return {
      newRecords,
      updateRecords,
    };
  }

  static convertNewRecords(newRecords, { ignores }) {
    return _.map(newRecords, (record) => {
      let converted = {};
      _.forEach(record, (value, key) => {
        if (ignores.includes(key)) {
          return;
        }
        converted[key] = {
          value,
        };
      });
      return converted;
    });
  }

  static convertUpdateRecords(newRecords, { key, ignores }) {
    return _.map(newRecords, (record) => {
      let converted = {};
      converted.updateKey = {
        field: key,
        value: record[key],
      };
      converted.record = {};
      _.forEach(record, (value, recordKey) => {
        if (key === recordKey || ignores.includes(recordKey)) {
          return;
        }
        converted.record[recordKey] = {
          value,
        };
      });
      return converted;
    });
  }

  static async bulkUpdate(config, method, records) {
    const logPrefix = method === 'post' ? '新規登録' : '更新';
    return await Promise.all(
      _.chunk(records, 100).map((chunkRecords, index) => {
        console.log(`${logPrefix}[${index}]: ${chunkRecords.length} 件 開始`);
        return axios
          .request({
            method,
            url: `https://${config.domain}/k/v1/records.json`,
            data: {
              app: config.appId,
              records: chunkRecords,
            },
            headers: {
              'X-Cybozu-API-Token': config.token,
            },
          })
          .then(() => {
            console.log(
              `${logPrefix}[${index}]: ${chunkRecords.length} 件 終了`
            );
          })
          .catch((err) => {
            console.error(JSON.stringify(err.response.data));
            throw err;
          });
      })
    );
  }
};
