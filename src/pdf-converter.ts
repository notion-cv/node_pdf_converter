import puppeteer, { Browser, PDFOptions } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { HTMLModifier } from "./html-modifier";

export type PDFConverterResponse = {
  success: boolean;
  data?: Buffer;
  error?: string;
};

export class PDFConverter {
  private static readonly DEFAULT_PDF_OPTIONS: PDFOptions = {
    format: "A4",
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
    printBackground: true,
    preferCSSPageSize: true,
  };

  public static async convertToPDF(
    zipBuffer: Buffer
  ): Promise<PDFConverterResponse> {
    let browser;
    try {
      const htmlContent = await this.extractAndModifyContent(zipBuffer);

      browser = await puppeteer.launch({
        // Lambda 환경에서 필요한 특수 플래그들(sandbox 설정 등)이 포함됨
        args: [
          ...chromium.args,
          "--font-render-hinting=medium",
          "--disable-gpu-vsync",
          "--disable-software-rasterizer",
        ],
        // 브라우저 뷰포트(화면 크기) 설정
        // Lambda에 최적화된 기본값 사용
        defaultViewport: { ...chromium.defaultViewport, deviceScaleFactor: 2 },
        // Chromium 실행 파일의 경로
        // Lambda 환경의 특수한 경로 구조를 고려하여 제공됨
        executablePath:
          process.env.ENV === "local"
            ? "/opt/homebrew/bin/chromium"
            : await chromium.executablePath(),
        // GUI 없이 백그라운드에서 실행
        // true로 설정하면 화면 출력 없이 동작
        headless: true,
      });

      const pdf = await this.generatePDF(
        browser,
        htmlContent,
        this.DEFAULT_PDF_OPTIONS
      );

      return { success: true, data: pdf };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    } finally {
      browser?.close();
    }
  }

  // font 옵션 같은거 더 넣을 수도 있을 듯
  private static async extractAndModifyContent(zipBuffer: Buffer) {
    const htmlModifier = new HTMLModifier(zipBuffer);
    await htmlModifier.convertImageSrcToBase64();

    htmlModifier.resetStyleSheet();
    htmlModifier.setFontFamily();
    htmlModifier.setNotionCVStyle();
    htmlModifier.removeUnnecessaryTags();

    const modifiedHtml = htmlModifier.getModifiedHtml();
    return modifiedHtml;
  }

  private static async generatePDF(
    browser: Browser,
    html: string,
    options: PDFOptions
  ): Promise<Buffer> {
    const page = await browser.newPage();
    try {
      await page.setContent(html, {
        // 언제까지 기다릴지: https://pptr.dev/api/puppeteer.puppeteerlifecycleevent
        waitUntil: ["networkidle0", "load", "domcontentloaded"],
      });
      await page.evaluateHandle("document.fonts.ready");

      const pdf = await page.pdf(options);
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
