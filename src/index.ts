// import { PDFConverter } from "./pdf-converter";
import fs from "fs/promises";

const NOTION_TEST_PATH = "./test/[notion]link_test.zip";

// 로컬 테스트용
async function main() {
  // try {
  //   const zipBuffer = await fs.readFile(NOTION_TEST_PATH);
  //   const result = await PDFConverter.convertToPDF(zipBuffer);
  //   if (result.success && result.data) {
  //     await fs.writeFile("output.pdf", result.data);
  //     console.log("success!");
  //   } else {
  //     throw new Error(result.error ?? "unknown error");
  //   }
  // } catch (e) {
  //   console.log("error", e);
  // }
}

main();
