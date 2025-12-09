# Базовый образ Node.js 16 (публичный из GitLab ForteBank)
FROM registry.gitlab.fortebank.com/devops/images/node:16-bullseye AS build-stage

# Установка базовых зависимостей и Python (необходимо для Carbone)
RUN apt update && apt install -y \
    wget \
    libxinerama1 \
    libfontconfig1 \
    libdbus-glib-1-2 \
    libcairo2 \
    libcups2 \
    libglu1-mesa \
    libsm6 \
    default-jre \
    python3 \
    python3-uno \
    python3-pip \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Скачивание и установка LibreOffice 7.5.1.1 (та же версия что в production document-core)
# добавили && rm -f /usr/bin/soffice /usr/bin/soffice.bin \
RUN wget https:    && tar -xzf LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz \
    && cd LibreOffice_7.5.1.1_Linux_x86-64_deb/DEBS \
    && dpkg -i *.deb \
    && cd ../.. \
    && rm -rf LibreOffice_7.5.1.1_Linux_x86-64_deb* \
    && rm -f /usr/bin/soffice /usr/bin/soffice.bin \
    && ln -s /opt/libreoffice7.5/program/soffice /usr/bin/soffice \
    && ln -s /opt/libreoffice7.5/program/soffice.bin /usr/bin/soffice.bin

# Проверка установки LibreOffice
RUN soffice --version

# Рабочая директория
ARG APP_DIR=/app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Устанавливаем пути к LibreOffice для Carbone
ENV LIBREOFFICE_BIN=/opt/libreoffice7.5/program/soffice
ENV SOFFICE_PATH=/opt/libreoffice7.5/program
ENV LD_LIBRARY_PATH=/opt/libreoffice7.5/program:$

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Создание пустой папки для шаблонов (на случай если понадобится)
RUN mkdir -p templates

# Смена пользователя на непривилегированного
USER 1000

# Открытие порта
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http:
# Запуск приложения
CMD ["node", "server.js"]