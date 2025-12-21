# トラブルシューティングガイド

## 拡張機能が動作しない場合の診断手順

### ステップ1: 拡張機能が読み込まれているか確認

1. **Inoreaderのページを開く**
   - https://www.inoreader.com/starred にアクセス

2. **開発者コンソールを開く**
   - F12キーを押す（MacはCmd+Option+I）
   - Consoleタブを選択

3. **コンソールに以下のメッセージが表示されているか確認**
   ```
   Inoreader Star Opener: Content script loaded
   ```

#### ✅ メッセージが表示される場合
→ ステップ2へ進む

#### ❌ メッセージが表示されない場合
→ 拡張機能が読み込まれていません

**解決方法:**

1. **URLを確認**
   - 正しいURL（https://www.inoreader.com または https://inoreader.com）にいるか確認
   - その他のURL（例: https://jp.inoreader.com）の場合は、manifest.jsonに追加が必要

2. **拡張機能をリロード**
   - `chrome://extensions/` を開く
   - 「Inoreader Star Opener」の横にある更新ボタン（🔄）をクリック
   - Inoreaderのページをリロード（F5）

3. **拡張機能が有効になっているか確認**
   - `chrome://extensions/` で拡張機能がONになっているか確認

4. **エラーログを確認**
   - `chrome://extensions/` で「エラー」ボタンがあればクリック
   - エラーメッセージを確認

### ステップ2: キー入力が検知されているか確認

1. **Inoreaderページで`w`キーを押す**

2. **コンソールに以下のメッセージが表示されるか確認**
   ```
   Inoreader Star Opener: 'w' key detected!
   Inoreader Star Opener: Opening up to X tabs
   ```

#### ✅ メッセージが表示される場合
→ ステップ3へ進む

#### ❌ "'w' key detected!" が表示されない場合

**可能性のある原因:**

1. **入力フォームにフォーカスがある**
   - 検索ボックスなどにカーソルがある場合、キーは検知されません
   - ページの別の場所をクリックしてから再度試してください

2. **修飾キーが押されている**
   - Shift、Ctrl、Alt、Cmd（Meta）キーを同時に押していないか確認
   - `w`キー単独で押してください

3. **他の拡張機能が干渉している**
   - 一時的に他の拡張機能を無効にして試してください

### ステップ3: ページ構造の診断

`w`キーは検知されるが記事が開かれない場合：

1. **コンソール出力を確認**
   ```
   Trying selector: a.article_title_link
     -> Found 0 links
   Trying selector: a.article_link
     -> Found 0 links
   ...
   ```

2. **"No articles found" 警告が表示される場合**
   → セレクターがInoreaderのページ構造と一致していません

#### 実際のページ構造を調査する

1. **開発者ツールのElementsタブを開く**

2. **記事のリンクを探す**
   - Elementsタブで、記事のタイトル部分を右クリック → 「検証」
   - または、要素選択ツール（カーソルアイコン）を使って記事をクリック

3. **記事リンクの構造を確認**
   以下の情報をメモしてください:
   - `<a>` タグのclass属性
   - 親要素の構造
   - href属性の値

例：
```html
<div class="article_container">
  <a class="article_headline_link" href="https://example.com/article">
    <span class="title">記事のタイトル</span>
  </a>
</div>
```

この場合、セレクターは `a.article_headline_link` となります。

### ステップ4: セレクターを更新する

1. **contentscripts.js を開く**
   ```
   js/contentscripts.js
   ```

2. **possibleSelectorsを見つける**（約22-27行目）
   ```javascript
   var possibleSelectors = [
       'a.article_title_link',
       'a.article_link',
       '.article_item a[href^="http"]',
       '.article a.article_title'
   ];
   ```

3. **実際のページ構造に合わせてセレクターを追加**
   例：
   ```javascript
   var possibleSelectors = [
       'a.article_headline_link',  // 新しく追加（最優先）
       'a.article_title_link',
       'a.article_link',
       '.article_item a[href^="http"]',
       '.article a.article_title'
   ];
   ```

4. **拡張機能をリロード**
   - `chrome://extensions/` で拡張機能を更新
   - Inoreaderページをリロード
   - 再度`w`キーを押してテスト

### ステップ5: デバッグ出力を確認

コンソールに表示される「Sample http(s) links」を確認：

```
Sample http(s) links (first 10):
  [0] class='some-class another-class' href='https://example.com/article1'
      text: Article Title Here
  [1] class='link-class' href='https://example.com/article2'
      text: Another Article Title
  ...
```

この出力から：
- 記事リンクのclass名を特定できます
- 適切なセレクターを作成できます

### よくある問題と解決方法

#### 問題1: 記事ではなく、別のリンクが開かれる

**原因:** セレクターが広すぎて、ナビゲーションリンクなども含まれている

**解決:** より具体的なセレクターを使用
```javascript
// 悪い例（広すぎる）
'a[href^="http"]'

// 良い例（記事のみ）
'.article-list a.article-link'
```

#### 問題2: すべてのセレクターで0件になる

**原因:** Inoreaderがシングルページアプリケーション（SPA）で、記事が動的に読み込まれている可能性

**解決:** 以下を確認：
1. ページが完全に読み込まれるまで待つ
2. スクロールして記事を表示させる
3. コンソールで手動テスト:
   ```javascript
   document.querySelectorAll('a').length  // すべてのリンク数
   ```

#### 問題3: タブは開くが、すぐに閉じられる

**原因:** ポップアップブロッカーが働いている

**解決:**
1. Chromeの設定を開く
2. プライバシーとセキュリティ → サイトの設定 → ポップアップとリダイレクト
3. Inoreaderを許可リストに追加

#### 問題4: 初回のみ動作しない

**原因:** chrome.storage.localの初期値が設定されていない

**解決:** 一度オプションページを開いて保存ボタンを押してください

### コンソールに何も表示されない場合

1. **コンソールフィルターを確認**
   - コンソールタブで「すべてのレベル」が選択されているか確認
   - フィルター入力欄が空であることを確認

2. **別のコンテキストで実行されている可能性**
   - コンソールタブの上部のドロップダウンを確認
   - 「top」が選択されているか確認

3. **拡張機能のバックグラウンドログを確認**
   - `chrome://extensions/` を開く
   - 「Inoreader Star Opener」の「バックグラウンドページ」または「Service Worker」をクリック
   - 別のコンソールが開くので、エラーがないか確認

## サポート情報の収集

問題が解決しない場合、以下の情報を収集してください：

1. **ブラウザ情報**
   - Chromeのバージョン
   - OS（Windows/Mac/Linux）

2. **InoreaderのURL**
   - 実際にアクセスしているURL全体

3. **コンソール出力**
   - `w`キーを押した後のコンソールメッセージ全体

4. **記事リンクのHTML構造**
   - Elements タブで確認した記事リンクのHTML（1つ分）

5. **拡張機能のエラーログ**
   - `chrome://extensions/` の「エラー」ボタンの内容

これらの情報があれば、より具体的なサポートが可能です。
