declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: string;
      CSS_PATH: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_NOTION_CV_BUCKET_NAME: string;
      AWS_LAMBDA_FUNCTION_NAME: string;
      AWS_LAMBDA_CHROMIUM_LAYER: string;
      CHROMIUM_PATH: string;
    }
  }
}

export {};
