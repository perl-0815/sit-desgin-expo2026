#!/usr/bin/env bash
set -euo pipefail

# Vercel のビルド環境で Prisma の型生成が間に合わず型エラーになるため、
# 先に Prisma Client を生成してから Next.js のビルドを実行します。
npx prisma generate
next build
