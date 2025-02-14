import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PDFConverter } from "./pdf-converter";
import { Context } from "aws-lambda";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
});
const generateErrorResult = (statusCode: number, errorString?: string) => {
  return {
    statusCode,
    body: JSON.stringify({ error: errorString || "에러가 발생했습니다." }),
  };
};

export const handler = async (event: any, context: Context) => {
  console.log("start");
  try {
    console.log(event.requestId);

    const requestId = event.requestId;
    console.log("requestId", requestId);
    if (!requestId) return generateErrorResult(400, "requestId가 없습니다.");

    const inputKey = `temp/${requestId}/${requestId}.zip`;

    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_NOTION_CV_BUCKET_NAME,
      Key: inputKey,
    });

    const response = await s3Client.send(getCommand);
    const arrayBuffer = await response.Body?.transformToByteArray();

    if (!arrayBuffer)
      return generateErrorResult(400, "유효한 zip파일이 아닙니다.");

    console.log("S3에서 zip 파일 불러오기 완료");

    const zipBuffer = Buffer.from(arrayBuffer);
    const result = await PDFConverter.convertToPDF(zipBuffer);

    if (!result.success || !result.data) {
      throw new Error(result.error || "PDF conversion failed");
    }

    const outputKey = `temp/${requestId}/${requestId}.result.pdf`;
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_NOTION_CV_BUCKET_NAME,
      Key: outputKey,
      Body: result.data,
      ContentType: "application/pdf",
    });

    console.log("PDF 저장 완료");

    await s3Client.send(putCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({ id: requestId }),
    };
  } catch (error) {
    console.error("Error:", error);
    return generateErrorResult(
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
