import { PDFConverter } from "./pdf-converter";
import fs from "fs/promises";

const NOTION_TEST_PATH = "./test/[notion]jieun.zip";

async function main() {
  try {
    const zipBuffer = await fs.readFile(NOTION_TEST_PATH);
    const result = await PDFConverter.convertToPDF(zipBuffer);
  } catch (e) {
    console.log("error", e);
  }
}

main();
