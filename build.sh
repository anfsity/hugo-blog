#!/usr/bin/env bash
set -euo pipefail

# Fallback versions used only if GitHub latest-release redirect cannot be resolved.
DEFAULT_HUGO_VERSION="0.170.1"
DEFAULT_DART_SASS_VERSION="1.108.2"

BUILD_TOOLS_DIR=""
cleanup() {
  if [[ -n "$BUILD_TOOLS_DIR" && -d "$BUILD_TOOLS_DIR" ]]; then
    rm -rf "$BUILD_TOOLS_DIR"
  fi
}
trap cleanup EXIT

ensure_tools_dir() {
  if [[ -z "$BUILD_TOOLS_DIR" ]]; then
    BUILD_TOOLS_DIR="$(mktemp -d)"
  fi
}

resolve_latest_tag() {
  local repo="$1"
  local url
  url="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/${repo}/releases/latest" 2>/dev/null || true)"
  if [[ "$url" == *"/releases/tag/"* ]]; then
    echo "${url##*/}"
  fi
}

install_dart_sass() {
  local version="${DART_SASS_VERSION:-}"
  if [[ -z "$version" ]]; then
    version="$(resolve_latest_tag "sass/dart-sass")"
    version="${version#v}"
    version="${version:-$DEFAULT_DART_SASS_VERSION}"
  fi

  ensure_tools_dir
  echo "Installing Dart Sass ${version}..."
  curl -fsSL "https://github.com/sass/dart-sass/releases/download/${version}/dart-sass-${version}-linux-x64.tar.gz" \
    | tar -xz -C "$BUILD_TOOLS_DIR"
  export PATH="${BUILD_TOOLS_DIR}/dart-sass:${PATH}"
}

install_hugo() {
  local version="${1:-}"
  if [[ -z "$version" ]]; then
    version="$(resolve_latest_tag "gohugoio/hugo")"
    version="${version#v}"
    version="${version:-$DEFAULT_HUGO_VERSION}"
  fi

  ensure_tools_dir
  echo "Installing Hugo extended ${version}..."
  curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${version}/hugo_extended_${version}_linux-amd64.tar.gz" \
    | tar -xz -C "$BUILD_TOOLS_DIR" hugo
  export PATH="${BUILD_TOOLS_DIR}:${PATH}"
}

if [[ "${CF_PAGES:-}" == "1" ]]; then
  install_dart_sass
  # Delete HUGO_VERSION in Cloudflare Pages to auto-track latest Hugo;
  # set HUGO_VERSION to a specific version (e.g. 0.170.1) to pin it instead.
  if [[ -z "${HUGO_VERSION:-}" ]]; then
    install_hugo
  fi
elif ! command -v sass >/dev/null 2>&1; then
  install_dart_sass
fi

echo "Using $(hugo version)"
echo "Using Dart Sass $(sass --version)"
hugo --gc --minify "$@"
