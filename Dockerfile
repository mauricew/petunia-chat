FROM node:22

COPY . /code
WORKDIR /code

RUN npm i
RUN npm run build

EXPOSE 3000

CMD [ "node", "/code/.output/server/index.mjs" ]