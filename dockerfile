FROM public.ecr.aws/lambda/nodejs:22

# Build-time arguments
ARG AWS_NOTION_CV_BUCKET_NAME
ARG CSS_PATH

# Environment variables
ENV AWS_NOTION_CV_BUCKET_NAME=${AWS_NOTION_CV_BUCKET_NAME}
ENV CSS_PATH=${CSS_PATH}
ENV NODE_ENV=prd

# Install Chromium dependencies
RUN dnf install -y \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    && dnf clean all

# Install Chromium using @sparticuz/chromium (자동 다운로드 사용)
RUN mkdir -p /opt/chromium

COPY package*.json ./
RUN npm ci  # 패키지 일관성을 유지하기 위해 npm ci 사용

COPY . .
RUN npm run build

# Execute permission for Chromium
RUN chmod +x /opt/chromium/chrome

CMD [ "dist/lambda.handler" ]

# 환경 변수 설정 (Chromium 실행 경로 수정)
ENV AWS_LAMBDA_FUNCTION_MEMORY_SIZE=2048
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Sparticuz Chromium 실행 경로
ENV CHROME_PATH="/opt/chromium/chrome"
ENV CHROMIUM_PATH="/opt/chromium/chrome"