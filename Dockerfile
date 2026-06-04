FROM node:20-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
# 构建阶段需要 devDependencies（如 autoprefixer / typescript）
RUN npm ci --include=dev
COPY . .
RUN pip3 install --no-cache-dir -r scripts/requirements.txt
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm","run","start"]
