export NODE_ENV=production

git pull
bun ci --production
bun start --port 52333
