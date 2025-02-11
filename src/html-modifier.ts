import AdmZip from "adm-zip";
import * as cheerio from "cheerio";
import path from "path";

export class HTMLModifier {
  private zip: AdmZip;
  private $: cheerio.CheerioAPI;

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
    this.$ = cheerio.load(html.getData().toString("utf-8"));
  }

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
        const extension = path.extname(src).substring(1);
        const base64String = `data:image/${extension};base64,${imgBuffer.toString(
          "base64"
        )}`;
        this.$(img).attr("src", base64String);
      }
    }
  }

  getModifiedHtml() {
    return this.$.html();
  }
}
