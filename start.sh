#!/bin/sh

set -e

git pull
pnpm build
pm2 restart tpass-portal
pm2 reset tpass-portal
