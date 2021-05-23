FROM node:14-alpine

WORKDIR /app/

ENV PORT=8777
ENV NODE_ENV=production
ENV POLLING_RATE=100

EXPOSE ${PORT}

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install

COPY dist /app/

USER nobody

CMD [ "node", "stream-server" ]