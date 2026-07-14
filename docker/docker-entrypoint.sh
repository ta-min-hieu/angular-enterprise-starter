#!/bin/sh
set -e

export API_BASE_URL="${API_BASE_URL:-http://localhost:8386/base/v1}"
# Origin dùng để ghép URL tuyệt đối từ path tương đối backend trả về cho file media
# (vd MediaAsset.url = "/v1/files/8") — KHÔNG gồm "/v1". Xem AppConfig.mediaBaseUrl.
export MEDIA_BASE_URL="${MEDIA_BASE_URL:-http://localhost:8386/base}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export AUTH_REDIRECT_PATH="${AUTH_REDIRECT_PATH:-/auth/login}"
export FORBIDDEN_PATH="${FORBIDDEN_PATH:-/forbidden}"

envsubst < /app/config.template.json > /app/dist/angular-enterprise-starter/browser/config.json

exec "$@"
