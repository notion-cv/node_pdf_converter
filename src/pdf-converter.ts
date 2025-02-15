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
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    // DPI 설정을 위한 옵션
    width: "8.27in", // A4 너비
    height: "11.7in", // A4 높이
    printBackground: true,
    preferCSSPageSize: true,
    omitBackground: false,
    waitForFonts: true,
  };

  public static async convertToPDF(
    zipBuffer: Buffer
  ): Promise<PDFConverterResponse> {
    let browser;
    try {
      const htmlContent = await this.extractAndModifyContent(zipBuffer);

      console.log("before");
      console.log("Starting PDF conversion...");
      const chromiumPath = await chromium.executablePath(
        "/var/task/node_modules/@sparticuz/chromium/bin"
      );
      browser = await puppeteer.launch({
        // Lambda 환경에서 필요한 특수 플래그들(sandbox 설정 등)이 포함됨
        args: [
          ...chromium.args,
          "--font-render-hinting=full",
          "--disable-gpu-vsync",
          "--disable-software-rasterizer",
          "--lang=ko-KR,ko",
          "--no-sandbox",
          "--disable-font-subpixel-positioning", // 제거하면 자간이 엉망이 됨
        ],
        // 브라우저 뷰포트(화면 크기) 설정
        // Lambda에 최적화된 기본값 사용
        defaultViewport: { ...chromium.defaultViewport, deviceScaleFactor: 2 },
        // Chromium 실행 파일의 경로
        // Lambda 환경의 특수한 경로 구조를 고려하여 제공됨
        executablePath:
          process.env.ENV === "local"
            ? "/opt/homebrew/bin/chromium"
            : chromiumPath,
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
    console.log("html 세팅 완료");
    return modifiedHtml;
  }

  private static async generatePDF(
    browser: Browser,
    html: string,
    options: PDFOptions
  ): Promise<Buffer> {
    const page = await browser.newPage();
    try {
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 3, // DPI를 3배로 증가
      });

      await page.setContent(html, {
        // 언제까지 기다릴지: https://pptr.dev/api/puppeteer.puppeteerlifecycleevent
        waitUntil: ["networkidle0", "load", "domcontentloaded"],
      });

      // 모든 이미지가 로드될 때까지 기다림
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        );
      });

      await page.evaluateHandle("document.fonts.ready");

      const pdf = await page.pdf(options);
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
