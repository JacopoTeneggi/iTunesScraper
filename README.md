# `ITUNES-SCRAPER`

> Typescript-based iTunes data scraper for podcast hostings rating

## `BEFORE YOU START`

This project was built on:

* Node.js >= 10.15.0
* npm >= 6.9.0
* Typescript + tsc >= 3.2.2
* Docker >= 18.09.2
* Kubernetes >= 1.10.0

> This repo was tested on a ```Docker for Mac``` Kubernetes node, Minikube implementation with NGINX Ingress is on its way!

## `STRUCTURE`

This monorepo project uses the [Lerna](https://github.com/lerna/lerna) tool for managing multi-package projects.

Project tree:

```BASH
apps/
├── backend
│   └── ...
├── filler
│   └── ..
├── web
│   └── ...
└── worker
    └── ...
packages/
├── mongo-connector
│   └── ...
├── podcast-tools
│   └── ...
└── psql-connector
    └── ...
storage/
├── mongo
│   └── ...
├── psql
│   └── ...
└── redis
    └── ...
package.json
lerna.json
```

## ```QUICKSTART```

1) ```➜ git clone``` this repo in your dest folder.
2) ```➜ cd itunes-scraper && npm install```.
3) ```➜ lerna bootstrap```
This command install dependencies for each package inside the repo, the output you should expect is:

    ```BASH
    ...

    lerna info Bootstrapping 10 packages
    lerna info Installing external dependencies
    lerna info Symlinking packages and binaries
    lerna success Bootstrapped 10 packages
    ```

4) ```➜ lerna run deploy``` (this is gonna take a while)

    > **N.B you have to add your own ```ids.csv``` file in ```storage/psql/``` containing the ids of the iTunes entry you wanna track**

    This is the output you should expect:

    ```BASH
    lerna success run Ran npm script 'deploy' in 7 packages in 22.0s:
    lerna success - backend
    lerna success - filler
    lerna success - web
    lerna success - worker
    lerna success - mongo
    lerna success - psql
    lerna success - redis
    ```

Done!