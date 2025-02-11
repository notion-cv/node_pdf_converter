import AdmZip from "adm-zip";
import { HTMLModifier } from "./html-modifier";

export class PDFConverter {
  public static async convertToPDF(zipBuffer: Buffer) {
    const htmlModifier = new HTMLModifier(zipBuffer);
    await htmlModifier.convertImageSrcToBase64();
    const modifiedHtml = htmlModifier.getModifiedHtml();

    console.log(modifiedHtml);
  }
}
