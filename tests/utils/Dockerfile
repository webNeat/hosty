FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y sudo
RUN useradd -m -s /bin/bash foo && echo 'foo:foo' | chpasswd
RUN usermod -aG sudo foo
RUN echo 'foo ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/foo && chmod 0440 /etc/sudoers.d/foo

USER foo
RUN sudo apt update && sudo DEBIAN_FRONTEND=noninteractive apt install -y wget git
RUN wget https://get.docker.com -O /tmp/get-docker.sh && chmod +x /tmp/get-docker.sh && /tmp/get-docker.sh
RUN sudo usermod -aG docker foo
ENV PATH="/home/foo/.local/bin:$PATH"

WORKDIR /home/foo

CMD ["tail", "-f", "/dev/null"]
