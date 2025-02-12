declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_NOTION_CV_BUCKET_NAME: string;
      LAMBDA_FUNCTION_NAME: string;
      CSS_PATH: string;
    }
  }
}

export {};
