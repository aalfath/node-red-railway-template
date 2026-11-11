# Node-RED 5.0.9, pinned by digest (multi-arch index). Update both the tag and the digest together.
FROM nodered/node-red:5.0.9@sha256:2ccd38b4066648bd5e17430c50a2f8102c566a82fd4f2fc5c342e61664d6896f

# Railway mounts volumes owned by root; the image's node-red user (uid 1000) can't write to them.
USER root

COPY settings.js /usr/src/node-red/railway-settings.js

ENV PORT=1880
EXPOSE 1880

# The image's entrypoint runs: node red.js --userDir /data "$@"
CMD ["--settings", "/usr/src/node-red/railway-settings.js"]
