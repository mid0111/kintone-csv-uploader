const axios = require('axios');
const Config = require('../lib/Config');
const Kintone = require('../lib/Kintone');

const subdomain = 'example.com';
const token = '1234567890';
const appId = 309;
const filePath = '/path/to/file';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockReset();
  axios.request.mockReset();
});

test('新規登録できること', async () => {
  const config = new Config(
    {
      file: filePath,
    },
    {
      domain: subdomain,
      token: token,
      app: appId,
    }
  );

  const inputCsvStr = `"社員番号","名前"
"a00001","山田太郎"
"a00002","田中花子"`;

  axios.request.mockResolvedValue({});

  await Kintone.uploadCsv(config, inputCsvStr);
  // キーの存在チェックリクエストが呼ばれていないこと
  expect(axios.get.mock.calls).toEqual([]);
  // 新規登録リクエストが呼ばれていること
  expect(axios.request.mock.calls[0][0]).toEqual({
    method: 'post',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          名前: {
            value: '山田太郎',
          },
          社員番号: {
            value: 'a00001',
          },
        },
        {
          名前: {
            value: '田中花子',
          },
          社員番号: {
            value: 'a00002',
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
});

test('更新できること', async () => {
  const config = new Config(
    {
      file: filePath,
      key: '社員番号',
    },
    {
      domain: subdomain,
      token: token,
      app: appId,
    }
  );

  const inputCsvStr = `"社員番号","名前"
"a00001","山田二郎"
"a00002","田中二子"`;

  axios.request.mockResolvedValue({});
  axios.get.mockResolvedValue({
    data: {
      records: [
        {
          社員番号: {
            value: 'a00001',
          },
          名前: {
            value: '山田太郎',
          },
        },
        {
          社員番号: {
            value: 'a00002',
          },
          名前: {
            value: '田中花子',
          },
        },
      ],
    },
  });

  await Kintone.uploadCsv(config, inputCsvStr);
  // キーの存在チェックリクエストが呼ばれていること
  expect(axios.get.mock.calls.length).toBe(1);
  // 更新リクエストが呼ばれていること
  expect(axios.request.mock.calls[0][0]).toEqual({
    method: 'put',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          updateKey: {
            field: '社員番号',
            value: 'a00001',
          },
          record: {
            名前: {
              value: '山田二郎',
            },
          },
        },
        {
          updateKey: {
            field: '社員番号',
            value: 'a00002',
          },
          record: {
            名前: {
              value: '田中二子',
            },
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
});

test('存在しないキーが指定された場合新規登録になること', async () => {
  const config = new Config(
    {
      file: filePath,
      key: '社員番号',
    },
    {
      domain: subdomain,
      token: token,
      app: appId,
    }
  );

  const inputCsvStr = `"社員番号","名前"
"a00001","山田二郎"
"a00002","田中二子"`;

  axios.request.mockResolvedValue({});
  axios.get.mockResolvedValue({
    data: {
      records: [
        {
          社員番号: {
            value: 'a00001',
          },
          名前: {
            value: '山田太郎',
          },
        },
      ],
    },
  });

  await Kintone.uploadCsv(config, inputCsvStr);
  // キーの存在チェックリクエストが呼ばれていること
  expect(axios.get.mock.calls.length).toBe(1);
  // 新規登録リクエストが呼ばれていること
  expect(axios.request.mock.calls[0][0]).toEqual({
    method: 'post',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          社員番号: {
            value: 'a00002',
          },
          名前: {
            value: '田中二子',
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
  // 更新リクエストが呼ばれていること
  expect(axios.request.mock.calls[1][0]).toEqual({
    method: 'put',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          updateKey: {
            field: '社員番号',
            value: 'a00001',
          },
          record: {
            名前: {
              value: '山田二郎',
            },
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
});

test('リクエストでエラーが発生した場合異常終了すること', async () => {
  const config = new Config(
    {
      file: filePath,
    },
    {
      domain: subdomain,
      token: token,
      app: appId,
    }
  );

  const inputCsvStr = `"社員番号","名前"
"a00001","山田太郎"
"a00002","田中花子"`;

  axios.request.mockRejectedValue({ response: { data: 'Test error !!!' } });

  await expect(Kintone.uploadCsv(config, inputCsvStr)).rejects.toEqual({
    response: { data: 'Test error !!!' },
  });

  // キーの存在チェックリクエストが呼ばれていないこと
  expect(axios.get.mock.calls).toEqual([]);
  // 新規登録リクエストが呼ばれていること
  expect(axios.request.mock.calls[0][0]).toEqual({
    method: 'post',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          名前: {
            value: '山田太郎',
          },
          社員番号: {
            value: 'a00001',
          },
        },
        {
          名前: {
            value: '田中花子',
          },
          社員番号: {
            value: 'a00002',
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
});

test('除外指定されたカラム以外が登録されること', async () => {
  const config = new Config(
    {
      file: filePath,
      ignore: ['レコード番号', '住所'],
    },
    {
      domain: subdomain,
      token: token,
      app: appId,
    }
  );

  const inputCsvStr = `"レコード番号","社員番号","名前","住所"
1,"a00001","山田太郎","東京都練馬区１−２−３"
2,"a00002","田中花子","東京都足立区９−８−７"`;

  axios.request.mockResolvedValue({});

  await Kintone.uploadCsv(config, inputCsvStr);
  // キーの存在チェックリクエストが呼ばれていないこと
  expect(axios.get.mock.calls).toEqual([]);
  // 新規登録リクエストが呼ばれていること、除外するカラムがリクエストに指定されていないこと
  expect(axios.request.mock.calls[0][0]).toEqual({
    method: 'post',
    url: `https://${subdomain}/k/v1/records.json`,
    data: {
      app: appId,
      records: [
        {
          名前: {
            value: '山田太郎',
          },
          社員番号: {
            value: 'a00001',
          },
        },
        {
          名前: {
            value: '田中花子',
          },
          社員番号: {
            value: 'a00002',
          },
        },
      ],
    },
    headers: {
      'X-Cybozu-API-Token': token,
    },
  });
});
