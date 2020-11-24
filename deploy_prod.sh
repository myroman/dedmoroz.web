#!/usr/bin/env bash
cp js/dm.settings.prod.js js/dm.settings.js
echo 'Syncing to S3...'
aws s3 sync . s3://darimchudo.ru --exclude "sync_s3.sh" --exclude ".git/*" --exclude ".gitignore" --exclude ".DS_Store" --exclude "*/.DS_Store" --exclude "scss/*" --exclude "trailer.mp4"
echo 'Done'