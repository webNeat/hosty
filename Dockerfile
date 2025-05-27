FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg lsb-release && \
    mkdir -p -m 0755 /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Nixpacks
RUN curl -sSL https://nixpacks.com/install.sh | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Hosty test dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends \
        nodejs \
        python3 \
        python3-pip \
        ansible \
        git \
        sudo \
        openssh-client && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -e' \
  '# start daemon in background, redirecting logs' \
  'dockerd --host=unix:///var/run/docker.sock --data-root=/var/lib/docker > /var/log/dockerd.log 2>&1 &' \
  '# wait until it is ready' \
  'until docker info >/dev/null 2>&1; do' \
  '  echo "Waiting for Docker daemon to start... (logs in /var/log/dockerd.log)"' \
  '  sleep 0.2' \
  'done' \
  'exec "$@"' \
  > /usr/local/bin/dind-entrypoint && chmod +x /usr/local/bin/dind-entrypoint

VOLUME /var/lib/docker
ENTRYPOINT ["/usr/local/bin/dind-entrypoint"]
CMD ["bash"]
