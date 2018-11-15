#!/usr/bin/env sh

pushd src >/dev/null
rm build.zip
7z a ../build.zip ./*
popd >/dev/null
