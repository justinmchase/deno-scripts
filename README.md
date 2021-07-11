# Deno Scripts 🦕

Automated installation and execution of locally scoped scripts

# Installation

```sh
deno install \
  --unstable --allow-read --allow-env --allow-run \
  -n script \
  https://deno.land/x/scripts/install.ts
```

# Usage

Create a scripts.json file in your root directory

```json
{
  "scripts": {
    "hello": "https://deno.land/x/scripts/examples/hello.ts"
  }
}
```

Install the scripts

```sh
script install
```

Run a script

```sh
script run hello
```

## Local Development

```sh
deno run --unstable -A --watch install.ts install
deno run --unstable -A --watch install.ts run hello
```

Increment version

```sh
deno run -A https://deno.land/x/version/index.ts patch
```
