# kintone CSV Uploader

> CSV ファイルを kintone にアップロードする.
> CSV ファイルの先頭行をフィールドコードとして処理します。

## 使い方

### 新規登録する場合

`--key` オプションが指定されていない場合は、新規登録します。

```bash
curl -O https://raw.githubusercontent.com/mid0111/kintone-csv-uploader/master/config/sample.json
vi sample.json

npx kintone-csv-uploader --config sample.json --file <csv file> [options]
```

### キーフィールドを指定して更新する場合

`--key` オプションで重複禁止が設定された必須のフィールドコードを指定します。  
`--key` で指定されたフィールドの値が重複するレコードが存在する場合は、更新、存在しない場合は新規登録します。

```bash
npx kintone-csv-uploader --config sample.json --file <csv file> [options] --key <重複禁止フィールドコード>
```

### その他オプション

```bash
npx kintone-csv-uploader --help
```
