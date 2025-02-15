FROM public.ecr.aws/lambda/nodejs:22

# Build-time arguments
ARG AWS_NOTION_CV_BUCKET_NAME
ARG CSS_PATH

# Environment variables
ENV AWS_NOTION_CV_BUCKET_NAME=${AWS_NOTION_CV_BUCKET_NAME}
ENV CSS_PATH=${CSS_PATH}
ENV NODE_ENV=prd

ENV AWS_LAMBDA_FUNCTION_MEMORY_SIZE=2048
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Sparticuz Chromium 실행 경로
ENV CHROME_PATH="/tmp/chrome"
ENV CHROMIUM_PATH="/tmp/chromium"

# Install required packages
RUN dnf install -y \
    nss \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    fonts-noto-color-emoji \
    && dnf clean all

# Install dependencies
COPY package*.json ./
RUN npm install ci

COPY . .
RUN npm run build

# Verify Chromium installation
RUN node -e "const chromium = require('@sparticuz/chromium'); \
    chromium.executablePath().then(path => { \
        console.log('Chromium path:', path); \
        const fs = require('fs'); \
        console.log('Path exists:', fs.existsSync(path)); \
    }).catch(console.error)"

CMD [ "dist/lambda.handler" ]

