# CI/CD

## Purpose

Tự động hóa kiểm tra chất lượng source code.

Mọi Pull Request phải được kiểm tra trước khi merge.

CI Platform: **GitHub Actions** (đã chốt).

---

# Pipeline

Checkout

↓

Install

↓

Lint

↓

Test

↓

Build

↓

Docker Build

↓

Artifact

---

# Install

Sử dụng:

npm ci

Không sử dụng npm install trong CI.

---

# Lint

ESLint

Prettier

EditorConfig

Nếu Lint Fail

↓

Pipeline Fail

---

# Testing

Unit Test

↓

Integration Test

↓

Coverage Report

Nếu Test Fail

↓

Pipeline Fail

---

# Build

Production Build.

Không bỏ qua lỗi TypeScript.

Không bỏ qua lỗi Build.

---

# Docker

Build Docker Image.

Chạy thử Container.

Health Check.

Nếu Docker lỗi:

↓

Pipeline Fail.

---

# Branch Strategy

main

develop

feature/*

release/*

hotfix/*

---

# Commit

Conventional Commit.

Ví dụ:

feat:

fix:

docs:

test:

refactor:

build:

ci:

---

# Checklist

✓ Build

✓ Test

✓ Lint

✓ Docker

✓ Coverage

✓ Artifact