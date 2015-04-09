FROM node:0.10-onbuild

MAINTAINER Zoltan Kochan, zoltan.kochan@gmail.com

WORKDIR /src

# Install Prerequisites
RUN npm install -g nodemon

# Install packages
ADD package.json /src/package.json
RUN npm install

# Make everything available for start
ADD . /src

CMD ["nodemon", "app"]