#!/usr/bin/env bash
echo 'Syncing to S3...'
aws s3 sync . s3://darimchudo-test.ru --exclude "sync_s3.sh" --exclude ".git/*" --exclude ".gitignore" --exclude ".DS_Store" --exclude "*/.DS_Store" --exclude "scss/*" --exclude "js/dm.settings.js"
echo 'Done'