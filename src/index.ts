import { PDFConverter } from "./pdf-converter";
import fs from "fs/promises";

const NOTION_TEST_PATH = "./test/[notion]jieun.zip";

async function main() {
  try {
    const zipBuffer = await fs.readFile(NOTION_TEST_PATH);
    const result = await PDFConverter.convertToPDF(zipBuffer);
    if (result.success && result.data) {
      await fs.writeFile("output.pdf", result.data);
      console.log("success!");
    }
  } catch (e) {
    console.log("error", e);
  }
}

main();
