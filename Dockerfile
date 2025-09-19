# Base image: Ruby with necessary dependencies for Jekyll
FROM ruby:3.2

# Install dependencies
RUN apt-get update \
    && apt-get install -y \
    build-essential \
    nodejs \
    git \
    && rm -rf /var/lib/apt/lists/*


# Create a non-root user with UID 1000
RUN groupadd -g 1000 vscode \
    && useradd -m -u 1000 -g vscode vscode


# Make sure the bundler dir is writable by vscode
RUN mkdir -p /usr/local/bundle && chown -R vscode:vscode /usr/local/bundle

# Set the working directory
WORKDIR /usr/src/app
# Set permissions for the working directory
RUN chown -R vscode:vscode /usr/src/app
# Switch to the non-root user
USER vscode

# Copy Gemfile into the container (necessary for `bundle install`)
COPY Gemfile ./


# Install all Ruby gems according to the lockfile
RUN gem install bundler \
    && bundle install --jobs 4 --retry 3
# # OR Install bundler and dependencies
# RUN gem install connection_pool:2.5.0
# RUN gem install bundler:2.3.26
# RUN bundle install

# # Command to serve the Jekyll site
# CMD ["jekyll", "serve", "-H", "0.0.0.0", "-w"]
