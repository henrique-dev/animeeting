#!/bin/bash
set -e

npm run ca

exec "$@"
