# kintone CSV Uploader

![Node.js CI](https://github.com/mid0111/kintone-csv-uploader/workflows/Node.js%20CI/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/mid0111/kintone-csv-uploader/branch/master/graph/badge.svg)](https://codecov.io/gh/mid0111/kintone-csv-uploader)

> CSV ファイルを利用して kintone にレコードを登録します。
> コマンドラインで CSV ファイルの中身を登録したい場合に利用します。

## 使い方

### CSV ファイルの形式

- CSV ファイルの先頭行をフィールドコードとして処理します。
- 既存のレコードを更新する場合は、`--key` オプションにキーとなるフィールドコードを指定します。

### インストール

```bash
curl -O https://raw.githubusercontent.com/mid0111/kintone-csv-uploader/master/config/sample.json
vi sample.json

npm i -g kintone-csv-uploader
```

### 新規登録する場合

`--key` オプションが指定されていない場合は、新規登録します。

```bash
kintone-csv-uploader --config sample.json --file <csv file> [options]
```

### キーフィールドを指定して更新する場合

`--key` オプションに重複禁止の必須のフィールドコードを指定します。  
キーが重複するレコードが存在する場合は、更新、存在しない場合は新規登録します。

```bash
kintone-csv-uploader --config sample.json --file <csv file> [options] --key <重複禁止フィールドコード> --ignore <除外するフィールドコード>
```

### その他オプション

```bash
kintone-csv-uploader --help
```
