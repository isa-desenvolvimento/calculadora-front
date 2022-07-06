FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-prod

FROM nginx:1.17.6

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 gunicorn

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

COPY --from=build /app/dist/calculadora-juridica /usr/share/nginx/html

## add permissions
RUN chown -R nginx:nginx /app && chmod -R 755 /app && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

## switch to non-root user
USER nginx

## add Python app
COPY . .

## set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_ENV production
ENV SECRET_KEY $SECRET_KEY

## run server
CMD gunicorn -b 0.0.0.0:5000 manage:app --daemon && \
    sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'

# CMD ["nginx", "-g", "daemon off;"]