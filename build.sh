#!/usr/bin/env bash
set -eu

yarn
yarn test
yarn build

mkdir -p ../docs
cp public/bundle.css public/bundle.js ../docs/
