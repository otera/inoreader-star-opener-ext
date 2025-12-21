# Testing Guide

このドキュメントでは、Inoreader Star Opener拡張機能のテスト方法を説明します。

## 初回インストールとテスト

### 1. 拡張機能のインストール

1. Google Chromeを開く
2. アドレスバーに `chrome://extensions/` と入力
3. 右上の「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. このプロジェクトのルートディレクトリを選択
6. 拡張機能が読み込まれたことを確認

### 2. オプション設定のテスト

1. `chrome://extensions/` で「Inoreader Star Opener」を見つける
2. 「詳細」をクリック
3. 「拡張機能のオプション」をクリック
4. 開くタブ数を変更してみる（例: 5）
5. 「Save Settings」をクリック
6. 成功メッセージが表示されることを確認
7. ページをリロードして、設定が保存されているか確認

### 3. 基本機能のテスト

#### 前提条件
- Inoreaderアカウントにログインしている
- いくつかの記事をスター（あとで見る）に追加している

#### テスト手順

1. **Starredページに移動**
   - https://www.inoreader.com/starred にアクセス
   - スターした記事が表示されることを確認

2. **デバッグモードを有効化（初回のみ）**
   - `js/contentscripts.js` を開く
   - 2行目の `var DEBUG = false;` を `var DEBUG = true;` に変更
   - `chrome://extensions/` で拡張機能をリロード

3. **開発者コンソールを開く**
   - F12キーを押す（またはCmd+Option+I on Mac）
   - Consoleタブを選択

4. **`w`キーを押す**
   - Inoreader Starredページで `w` キーを押す
   - コンソールに以下のようなメッセージが表示される:
     ```
     Inoreader Star Opener: Content script loaded
     Inoreader Star Opener: Opening up to X tabs
     Found Y articles using selector: ...
     Opening Y articles
     ```

5. **結果を確認**
   - 設定した数のタブがバックグラウンドで開かれる
   - 開かれたタブがスターした記事のURLであることを確認

## トラブルシューティング

### 記事が開かれない場合

1. **コンソールエラーを確認**
   - エラーメッセージがないか確認
   - 特にCORS関連のエラーに注意

2. **デバッグ出力を確認**
   - "Found X articles" のメッセージが表示されているか
   - Xが0の場合、セレクターが機能していない

3. **ページ構造を確認**
   - Inoreaderのページ構造が変更されている可能性
   - Elements タブで記事リンクのHTML構造を確認
   - リンクのclass名やセレクターを確認

### セレクターの更新方法

もし記事が見つからない場合（"No articles found" メッセージが表示される場合）:

1. **現在のページ構造を調査**
   - 開発者ツールでElementsタブを開く
   - 記事のリンク要素を探す
   - class名や構造をメモする

2. **セレクターを更新**
   - `js/contentscripts.js` を開く
   - `possibleSelectors` 配列を見つける（約25行目付近）
   - 新しいセレクターを配列の先頭に追加
   - 例:
     ```javascript
     var possibleSelectors = [
         'a.new-class-name',  // 新しいセレクター
         'a.article_title_link',
         'a.article_link',
         // ... 既存のセレクター
     ];
     ```

3. **拡張機能をリロード**
   - `chrome://extensions/` で拡張機能をリロード
   - Inoreaderページをリロード
   - 再度 `w` キーを押してテスト

## 実際のInoreaderページ構造の調査

初回テスト時に、実際のInoreaderのページ構造を確認することをお勧めします:

### 調査手順

1. https://www.inoreader.com/starred にアクセス
2. F12で開発者ツールを開く
3. Elementsタブで記事のリンク要素を探す
4. 以下の情報をメモ:
   - リンクのタグ名（通常は `<a>`）
   - リンクのclass名
   - 親要素の構造
   - 記事タイトルのテキストが含まれる要素

5. この情報を基に `possibleSelectors` を更新

### サンプル構造の例

もしInoreaderの構造が以下のようになっている場合:
```html
<article class="article-item">
  <a class="article-link" href="https://example.com/article">
    <span class="article-title">記事のタイトル</span>
  </a>
</article>
```

セレクターは以下のようになります:
```javascript
var possibleSelectors = [
    'a.article-link',
    '.article-item a[href^="http"]',
];
```

## テストチェックリスト

- [x] 拡張機能が正常にインストールされる
- [x] オプションページが開ける
- [x] 設定を保存できる
- [x] 保存した設定が読み込まれる
- [x] `w` キーでタブが開かれる
- [x] 設定した数のタブが開かれる
- [x] 開かれたタブが正しい記事のURLである
- [x] 入力フォームにフォーカスがある時は動作しない
- [x] Ctrl/Cmd + w などの組み合わせでは動作しない

## 次のステップ

テストが成功したら:

1. デバッグモードをOFFにする（`DEBUG = false;` に戻す）
2. 実際のワークフローで使ってみる
3. 必要に応じてセレクターを調整
4. アイコンを追加（`img/` ディレクトリ）
5. より多くの記事でテスト

## 既知の問題

現在のところ、以下の点に注意:

- Inoreaderのページ構造は変更される可能性があります
- セレクターが機能しない場合は更新が必要です
- 初回使用時は必ずデバッグモードで動作確認することをお勧めします
