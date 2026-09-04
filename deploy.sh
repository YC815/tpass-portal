#!/bin/sh

set -e

git pull
pnpm build
pm2 restart portal
pm2 reset portal
