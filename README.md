# public-holiday-api

## 概要

- 日本の祝日を返すAPI
- 日本の祝日は内閣府の[国民の祝日について](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)を参照
  - refs. https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv

## 使い方

### deploy

```sh
(cd layer/nodejs; npm install)
sls deploy
```

デプロイパラメータ

|パラメータ|概要|必須(初期値)|
|--|--|--|
|--stage|環境|_false_ (dev)|
|--bucket-expiration-in-days|キャッシュの有効期間(day)|_false_ (1)|

### API

- holiday
  - リクエストした日の祝日(`publicHoliday`)を返す
  - _response_
    ```json
    {
      "statusCode":200,
      "date":"2019-05-05",
      "publicHoliday":"こどもの日"
    }
    ```

    ```json
    {
      "statusCode":200,
      "date":"2019-05-20",
      "publicHoliday":""
    }
    ```

- holiday/{date}
  - {date}で指定した日の祝日(`publicHoliday`)を返す
  - _response_
    holiday に同じ
