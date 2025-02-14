FROM public.ecr.aws/lambda/nodejs:22

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

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD [ "dist/lambda.handler" ]

ENV AWS_LAMBDA_FUNCTION_MEMORY_SIZE=2048
ENV CHROME_PATH=/opt/chrome/chrome
ENV NODE_OPTIONS="--max-old-space-size=2048"