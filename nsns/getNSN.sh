#!/bin/bash

# REQUIRES httpie

# Error on uninitialized variables, return exit code from rightmost failed
# command in a pipeline
set -uo pipefail

APIURL="https://niinja.co/api/Complex/fullniin"
NIIN=$1 # The NIIN to query about
HEADERS="Cookie:`cat niinja.cookie`"

JQSTRING="{ \"$1\": . }"

if http --check-status --ignore-stdin --timeout=10 \
      GET "$APIURL/$NIIN" "$HEADERS" | \
   jq "$JQSTRING"; then
    exit 0;
else
    EXITCODE=$?
    case $EXITCODE in
        2) echo "{ \"$1\": \"[fail]: Request timed out!\"}" ;;
        3) echo "{ \"$1\": \"[fail]: Unexpected HTTP 3xx Redirection!\"}" ;;
        4) echo "{ \"$1\": \"[fail]: HTTP 4xx Client Error!\"}" ;;
        5) echo "{ \"$1\": \"[fail]: HTTP 5xx Server Error!\"}" ;;
        6) echo "{ \"$1\": \"[fail]: Exceeded --max-redirects=<n> redirects!\"}" ;;
        *) echo "{ \"$1\": \"[fail]: Other Error!\"}" ;;
    esac

    exit $EXITCODE
fi
