const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, VerticalAlign, LevelFormat
} = require("docx");
const fs = require("fs");

const NAVY = "1B2A4A";
const ORANGE = "E87722";
const LIGHT_BLUE = "D8E8F4";
const LIGHT_GRAY = "F5F5F5";
const MID_GRAY = "DDDDDD";
const WHITE = "FFFFFF";

const border = (color = MID_GRAY) => ({ style: BorderStyle.SINGLE, size: 4, color });
const borders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: "Meiryo UI", size: 30, bold: true, color: WHITE })],
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    indent: { left: 180 },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
    children: [new TextRun({ text, font: "Meiryo UI", size: 26, bold: true, color: NAVY })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Meiryo UI", size: 20, ...opts })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Meiryo UI", size: 20 })],
  });
}

function tableHeaderCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    borders: borders(NAVY),
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Meiryo UI", size: 18, bold: true, color: WHITE })]
    })]
  });
}

function tableCell(text, w, shade = WHITE, bold = false) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    borders: borders(),
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Meiryo UI", size: 18, bold, color: NAVY })]
    })]
  });
}

function statusCell(text, w) {
  const color = text.includes("待ち") || text.includes("要") ? "C0392B" : text.includes("予定") ? "1A6B3A" : NAVY;
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade_for(text), type: ShadingType.CLEAR },
    borders: borders(),
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Meiryo UI", size: 18, bold: true, color })]
    })]
  });
}

function shade_for(text) {
  if (text.includes("待ち") || text.includes("要")) return "FDECEA";
  if (text.includes("予定")) return "E8F5E9";
  return LIGHT_GRAY;
}

function emptyRow() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [] });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "・", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Meiryo UI", size: 20 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Meiryo UI", color: WHITE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Meiryo UI", color: NAVY },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
          spacing: { after: 120 },
          children: [new TextRun({ text: "にこさ 公式HP 制作打ち合わせ資料", font: "Meiryo UI", size: 16, color: "888888" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "© 2026 にこさ  ／  ", font: "Meiryo UI", size: 16, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Meiryo UI", size: 16, color: "999999" }),
            new TextRun({ text: " / ", font: "Meiryo UI", size: 16, color: "999999" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Meiryo UI", size: 16, color: "999999" }),
          ]
        })]
      })
    },
    children: [

      // ===== TITLE PAGE AREA =====
      new Paragraph({
        spacing: { before: 480, after: 160 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "にこさ 公式ホームページ", font: "Meiryo UI", size: 52, bold: true, color: NAVY })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "制作打ち合わせ資料", font: "Meiryo UI", size: 36, color: ORANGE })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 480 },
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ORANGE, space: 4 } },
        children: [new TextRun({ text: "2026年4月28日　作成", font: "Meiryo UI", size: 20, color: "666666" })]
      }),

      emptyRow(),

      // ===== SECTION 1 =====
      heading1("1. 本日の確認事項と決定内容"),
      emptyRow(),
      body("本日の打ち合わせで確認した内容をまとめます。", { color: "444444" }),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [400, 3200, 2426, 1400, 1600],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("#", 400),
              tableHeaderCell("内容", 3200),
              tableHeaderCell("担当", 2426),
              tableHeaderCell("状態", 1400),
              tableHeaderCell("備考", 1600),
            ]
          }),
          new TableRow({ children: [
            tableCell("1", 400, LIGHT_GRAY),
            tableCell("LINEスタンプのリンクをHPに反映", 3200),
            tableCell("HP担当", 2426),
            statusCell("対応予定", 1400),
            tableCell("リンク受領済み", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("2", 400, LIGHT_GRAY),
            tableCell("グッズ販売プラットフォームの選定（Booth推奨）", 3200),
            tableCell("にこさ側", 2426),
            statusCell("要検討・決定待ち", 1400),
            tableCell("全国配送・手数料安め", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("3", 400, LIGHT_GRAY),
            tableCell("にこさの写真・画像の共有", 3200),
            tableCell("にこさ側", 2426),
            statusCell("随時送付", 1400),
            tableCell("多いほど助かる", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("4", 400, LIGHT_GRAY),
            tableCell("LINEスタンプ追加：鉄板フレーズの提供", 3200),
            tableCell("にこさ側", 2426),
            statusCell("フレーズ待ち", 1400),
            tableCell("イラスト＋コメント形式", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("5", 400, LIGHT_GRAY),
            tableCell("TimeTreeスケジュールのリンク連携", 3200),
            tableCell("HP担当", 2426),
            statusCell("サンプル作成予定", 1400),
            tableCell("実現可能性あり", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("6", 400, LIGHT_GRAY),
            tableCell("ドメイン・サーバーの月額契約", 3200),
            tableCell("にこさ側", 2426),
            statusCell("要検討・決定待ち", 1400),
            tableCell("今後のためにも推奨", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("7", 400, LIGHT_GRAY),
            tableCell("仕事依頼用メールアドレスの設定", 3200),
            tableCell("にこさ側→HP担当", 2426),
            statusCell("メアド送付待ち", 1400),
            tableCell("受領後すぐ設定", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("8", 400, LIGHT_GRAY),
            tableCell("公式LINEをSNS欄に追加", 3200),
            tableCell("HP担当", 2426),
            statusCell("対応予定", 1400),
            tableCell("アカウントURL受領次第", 1600),
          ]}),
        ]
      }),

      emptyRow(),
      emptyRow(),

      // ===== SECTION 2 =====
      heading1("2. HPを見て追加でやるべきこと"),
      emptyRow(),
      body("現在のHP（https://macccoto.github.io/nikosa-hp/）を確認し、対応が必要な項目を整理しました。", { color: "444444" }),
      emptyRow(),

      heading2("2-1. 素材・情報があればすぐ対応できること"),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [400, 1800, 2826, 2400, 1600],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("#", 400),
              tableHeaderCell("項目", 1800),
              tableHeaderCell("現状", 2826),
              tableHeaderCell("やること", 2400),
              tableHeaderCell("必要素材", 1600),
            ]
          }),
          new TableRow({ children: [
            tableCell("A", 400, LIGHT_GRAY),
            tableCell("プロフィール写真", 1800),
            tableCell("2人とも同じダミー画像", 2826),
            tableCell("すぐる・あたるそれぞれの写真に差し替え", 2400),
            tableCell("個人写真×2", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("B", 400, LIGHT_GRAY),
            tableCell("ギャラリー動画タイトル", 1800),
            tableCell("「おすすめ動画1〜6」のまま", 2826),
            tableCell("実際の動画タイトルに変更", 2400),
            tableCell("タイトル一覧", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("C", 400, LIGHT_GRAY),
            tableCell("スケジュール", 1800),
            tableCell("仮の日程が入ったまま", 2826),
            tableCell("実際の予定に差し替え（なければ空欄）", 2400),
            tableCell("最新スケジュール", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("D", 400, LIGHT_GRAY),
            tableCell("グッズ購入リンク", 1800),
            tableCell("ダミーURLのまま", 2826),
            tableCell("Booth等の正式URLに差し替え", 2400),
            tableCell("Booth決定後", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("E", 400, LIGHT_GRAY),
            tableCell("お問い合わせメアド", 1800),
            tableCell("your@email.comのまま", 2826),
            tableCell("仕事依頼用メアドに差し替え", 2400),
            tableCell("メアド共有待ち", 1600),
          ]}),
          new TableRow({ children: [
            tableCell("F", 400, LIGHT_GRAY),
            tableCell("サイト名・ロゴ", 1800),
            tableCell("「にこさ（仮）」のまま", 2826),
            tableCell("正式名称に変更", 2400),
            tableCell("正式名称の確認", 1600),
          ]}),
        ]
      }),

      emptyRow(),
      heading2("2-2. にこさ側からの提供が必要なもの"),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [400, 3626, 5000],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("#", 400),
              tableHeaderCell("必要なもの", 3626),
              tableHeaderCell("詳細・補足", 5000),
            ]
          }),
          new TableRow({ children: [
            tableCell("G", 400, LIGHT_GRAY),
            tableCell("公式LINEアカウントのURL", 3626),
            tableCell("SNS欄・フッターに追加します", 5000),
          ]}),
          new TableRow({ children: [
            tableCell("H", 400, LIGHT_GRAY),
            tableCell("すぐる・あたる個別の写真", 3626),
            tableCell("プロフィールセクションに使用。多いほど◎", 5000),
          ]}),
          new TableRow({ children: [
            tableCell("I", 400, LIGHT_GRAY),
            tableCell("LINEスタンプの鉄板フレーズ", 3626),
            tableCell("イラスト＋コメント形式でサンプル制作します", 5000),
          ]}),
          new TableRow({ children: [
            tableCell("J", 400, LIGHT_GRAY),
            tableCell("Booth出店の判断", 3626),
            tableCell("グッズページのリンク先が決まります", 5000),
          ]}),
          new TableRow({ children: [
            tableCell("K", 400, LIGHT_GRAY),
            tableCell("ドメイン名の希望", 3626),
            tableCell("例：nikosa.jp / nikosa.com など（早めの取得を推奨）", 5000),
          ]}),
          new TableRow({ children: [
            tableCell("L", 400, LIGHT_GRAY),
            tableCell("仕事依頼用メールアドレス", 3626),
            tableCell("お問い合わせページに設定します", 5000),
          ]}),
        ]
      }),

      emptyRow(),
      heading2("2-3. 中長期でやりたいこと"),
      emptyRow(),
      bullet("TimeTree連携でスケジュールを自動更新できる仕組みの構築"),
      bullet("プライバシーポリシーページの作成（現状リンクのみ・ページなし）"),
      bullet("OGP設定：SNSでシェアしたときにサムネ・タイトルが正しく出るように"),
      bullet("Google Analytics導入：アクセス状況を把握できるように"),
      bullet("ファビコン・サイトアイコンの作成（ブラウザタブに表示されるアイコン）"),
      emptyRow(),
      emptyRow(),

      // ===== SECTION 3 =====
      heading1("3. グッズ販売プラットフォーム比較（Booth推奨）"),
      emptyRow(),
      body("グッズ販売にはBoothの利用を推奨します。主要プラットフォームとの比較は以下の通りです。", { color: "444444" }),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2000, 2342, 2342, 2342],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("比較項目", 2000),
              tableHeaderCell("Booth（推奨）", 2342),
              tableHeaderCell("BASE", 2342),
              tableHeaderCell("SUZURI", 2342),
            ]
          }),
          new TableRow({ children: [
            tableCell("初期費用", 2000, LIGHT_GRAY, true),
            tableCell("無料", 2342, "EAF4EA"),
            tableCell("無料", 2342),
            tableCell("無料", 2342),
          ]}),
          new TableRow({ children: [
            tableCell("手数料", 2000, LIGHT_GRAY, true),
            tableCell("無料（振込手数料のみ）", 2342, "EAF4EA"),
            tableCell("3〜6.6%", 2342),
            tableCell("約40%（製造・発送込み）", 2342),
          ]}),
          new TableRow({ children: [
            tableCell("在庫管理", 2000, LIGHT_GRAY, true),
            tableCell("自分で在庫を持つ", 2342, "EAF4EA"),
            tableCell("自分で在庫を持つ", 2342),
            tableCell("在庫不要（受注生産）", 2342),
          ]}),
          new TableRow({ children: [
            tableCell("コンテンツ販売", 2000, LIGHT_GRAY, true),
            tableCell("対応（PDFなど）", 2342, "EAF4EA"),
            tableCell("一部対応", 2342),
            tableCell("グッズのみ", 2342),
          ]}),
          new TableRow({ children: [
            tableCell("ターゲット層", 2000, LIGHT_GRAY, true),
            tableCell("同人・クリエイター向け", 2342, "EAF4EA"),
            tableCell("一般EC向け", 2342),
            tableCell("グッズ制作向け", 2342),
          ]}),
          new TableRow({ children: [
            tableCell("おすすめ理由", 2000, LIGHT_GRAY, true),
            tableCell("★ ファン向け・手数料最安", 2342, "EAF4EA"),
            tableCell("汎用的なショップ向け", 2342),
            tableCell("在庫リスクなし", 2342),
          ]}),
        ]
      }),

      emptyRow(),
      emptyRow(),

      // ===== SECTION 4 =====
      heading1("4. ドメイン・サーバーについて"),
      emptyRow(),
      body("現在はGitHub Pages（無料）で公開していますが、本格運用に向けて独自ドメイン＋レンタルサーバーへの移行を推奨します。", { color: "444444" }),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2400, 3313, 3313],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("", 2400),
              tableHeaderCell("現状（GitHub Pages）", 3313),
              tableHeaderCell("移行後（独自ドメイン）", 3313),
            ]
          }),
          new TableRow({ children: [
            tableCell("費用", 2400, LIGHT_GRAY, true),
            tableCell("無料", 3313),
            tableCell("約1,000〜2,000円/月", 3313, "EAF4EA"),
          ]}),
          new TableRow({ children: [
            tableCell("URL", 2400, LIGHT_GRAY, true),
            tableCell("macccoto.github.io/nikosa-hp", 3313),
            tableCell("nikosa.jp など（希望の名前）", 3313, "EAF4EA"),
          ]}),
          new TableRow({ children: [
            tableCell("メール機能", 2400, LIGHT_GRAY, true),
            tableCell("なし", 3313),
            tableCell("独自メアド作成可能", 3313, "EAF4EA"),
          ]}),
          new TableRow({ children: [
            tableCell("信頼性・見た目", 2400, LIGHT_GRAY, true),
            tableCell("やや長くて覚えにくい", 3313),
            tableCell("プロらしい印象", 3313, "EAF4EA"),
          ]}),
          new TableRow({ children: [
            tableCell("おすすめ時期", 2400, LIGHT_GRAY, true),
            tableCell("制作・テスト段階", 3313),
            tableCell("正式公開時〜できるだけ早く", 3313, "EAF4EA"),
          ]}),
        ]
      }),

      emptyRow(),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "FFF8E1", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 16, color: ORANGE, space: 8 } },
        indent: { left: 240 },
        children: [new TextRun({
          text: "ポイント：ドメイン名は早めに取得するのがおすすめです。人気の名前は先に取られてしまうため、HPの公開前でも確保しておくと安心です。",
          font: "Meiryo UI", size: 20, color: "5D4037"
        })]
      }),

      emptyRow(),
      emptyRow(),

      // ===== SECTION 5 =====
      heading1("5. 今後のスケジュール（案）"),
      emptyRow(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [1600, 2200, 5226],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              tableHeaderCell("時期", 1600),
              tableHeaderCell("フェーズ", 2200),
              tableHeaderCell("主な作業内容", 5226),
            ]
          }),
          new TableRow({ children: [
            tableCell("〜5月上旬", 1600, LIGHT_GRAY, true),
            tableCell("素材・情報収集", 2200),
            tableCell("写真提供／メアド確定／Booth検討／ドメイン名決定", 5226),
          ]}),
          new TableRow({ children: [
            tableCell("5月中旬", 1600, LIGHT_GRAY, true),
            tableCell("コンテンツ反映", 2200),
            tableCell("プロフィール写真差し替え・スケジュール更新・SNS追加・メアド設定", 5226),
          ]}),
          new TableRow({ children: [
            tableCell("5月下旬", 1600, LIGHT_GRAY, true),
            tableCell("グッズ・スタンプ対応", 2200),
            tableCell("Boothリンク追加・LINEスタンプ新規作成", 5226),
          ]}),
          new TableRow({ children: [
            tableCell("6月〜", 1600, LIGHT_GRAY, true),
            tableCell("正式公開・運用開始", 2200),
            tableCell("独自ドメイン移行・OGP設定・アクセス解析導入", 5226),
          ]}),
        ]
      }),

      emptyRow(),
      emptyRow(),
      new Paragraph({
        spacing: { before: 160, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "以上", font: "Meiryo UI", size: 20, color: "888888" })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("nikosa_hp_proposal.docx", buf);
  console.log("Done: nikosa_hp_proposal.docx");
});
