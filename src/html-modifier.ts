import AdmZip from "adm-zip";
import path from "path";
import { load } from "cheerio";
import { PRETENDARD_LINK } from "./constants/font";

export class HTMLModifier {
  private zip: AdmZip;
  private $: cheerio.Root;

  constructor(zipBuffer: Buffer) {
    this.zip = new AdmZip(zipBuffer);

    let html;
    const zipEntries = this.zip.getEntries();
    for (const entry of zipEntries) {
      if (entry.entryName.endsWith(".html")) {
        html = entry;
        break;
      }
    }
    if (!html) {
      throw new Error("no html file");
    }
    this.$ = load(html.getData().toString("utf-8"));
  }

  // image
  async convertImageSrcToBase64() {
    const images = this.$("img");

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = this.$(img).attr("src");

      if (src) {
        const decodedSrc = decodeURIComponent(src);
        if (decodedSrc.startsWith("https://")) continue;

        const imageEntry = this.zip.getEntry(decodedSrc);
        if (!imageEntry) continue;

        const imgBuffer = imageEntry.getData();
        const extension = path.extname(src).toLowerCase();
        let mimeType =
          extension === ".svg"
            ? "image/svg+xml"
            : `image/${extension.substring(1)}`;
        const base64String = `data:${mimeType};base64,${imgBuffer.toString(
          "base64"
        )}`;
        this.$(img).attr("src", base64String);
      }
    }
  }

  // style
  resetStyleSheet() {
    this.$("style").remove();
  }

  setFontFamily() {
    const head = this.$("head");
    head.append(`<link rel="stylesheet" href=${PRETENDARD_LINK} />`);
  }

  setNotionCVStyle() {
    const head = this.$("head");
    head.append(`<link rel="stylesheet" href=${process.env.CSS_PATH} />`);
  }

  // tag 조정
  removeUnnecessaryTags() {
    // strong tag 안에 불필요한 br이 두 번 들어가는 경우
    // TODO: 여러가지 경우가 생기면 분리하기
    this.$("strong").each((i, el) => {
      const strong = this.$(el);
      strong.contents().each((i, c) => {
        const child = this.$(c).get(0);
        if (child.type !== "tag") return;
        if (child.tagName !== "br") return;
        if (child.prev.tagName !== "br") return;
        this.$(c).remove();
      });
    });
  }

  // get
  getModifiedHtml() {
    return this.$.html();
  }
}
