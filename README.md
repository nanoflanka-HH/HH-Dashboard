# 人力趨勢 Dashboard

此 repo 放置「A事業群人力趨勢 Dashboard」HTML 範本，包含兩個功能區塊：

1. **A事業群【全員、IDL、DL+派遣】人力趨勢圖總覽**
   - 對應圖片：`assets/全員.png`、`assets/IDL.png`、`assets/DL+派遣.png`
   - 右側可填寫期初、期末、淨變動與補充說明。
   - 說明存檔資料夾：`notes/overview/`

2. **季度人數變化｜正職（IDL+DL） vs 派遣**
   - 可匯入 Excel / CSV。
   - 支援欄位格式：`季度, IDL, DL, 派遣`。
   - 系統自動計算：`正職 = IDL + DL`。
   - 說明存檔資料夾：`notes/quarterly/`

## 檔案結構

```text
HH-Dashboard/
├─ index.html
├─ assets/
│  ├─ README.md
│  ├─ 全員.png
│  ├─ IDL.png
│  └─ DL+派遣.png
├─ data/
│  └─ sample-quarterly.csv
├─ notes/
│  ├─ overview/
│  │  └─ .gitkeep
│  └─ quarterly/
│     └─ .gitkeep
├─ netlify/
│  └─ functions/
│     ├─ save-note.js
│     └─ get-notes.js
└─ netlify.toml
```

## 部署建議

建議用 **Netlify 連接此 GitHub repo**，因為 GitHub Pages 只能展示靜態網頁；若要讓「存檔說明」真正寫回 GitHub repo，需要 Netlify Functions 這類後端 API。

## Netlify 環境變數

請在 Netlify Site settings → Environment variables 加入：

```bash
GITHUB_OWNER=nanoflanka-HH
GITHUB_REPO=HH-Dashboard
GITHUB_BRANCH=main
GITHUB_TOKEN=你的 GitHub fine-grained token
```

`GITHUB_TOKEN` 建議只授權此 repo 的 **Contents: Read and write**。

## Excel 支援格式

### 寬表格式

```csv
季度,IDL,DL,派遣
2026 Q1,4820,9000,4280
2026 Q2,4910,9200,3910
```

### 長表格式

```csv
季度,類型,人數
2026 Q1,IDL,4820
2026 Q1,DL,9000
2026 Q1,派遣,4280
```

若暫時沒有部署 Netlify Functions，頁面仍可本機預覽；按「存檔說明」時會先暫存在瀏覽器 localStorage。