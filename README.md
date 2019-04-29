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

### ```STORAGE```

1) **PostgreSQL** | A PostgreSQL database instance stores podcast data. It contains two different tables:

    ```BASH
    podcasts=# \d+ podcasts;

    # Table `podcasts` stores the IDs to track, general information about each podcast, and an array of hosting services for the episodes of each podcast.

    Table "public.podcasts"
    |     Column     |           Type           |
    |----------------+--------------------------|
    | itunesid       | bigint                   |
    | feeddown       | boolean                  |
    | title          | text                     |
    | authorname     | text                     |
    | feedurl        | text                     |
    | releasedate    | timestamp with time zone |
    | lastupdate     | timestamp with time zone |
    | genreids       | bigint[]                 |
    | country        | text                     |
    | trackcount     | bigint                   |
    | hostingvendors | text[]                   |

    podcasts=# \d+ genres

    # Table `genres` stores the IDs for each genre identified by iTunes.

    Table "public.genres"
    | Column |  Type  |
    |--------+--------|
    | id     | bigint |
    | name   | text   |
    ```

2) **MongoDB** | A MongoDB instance stores unstructured data about each update cycle in the `run-data` collection. Each document is structured like this:

    ```JS
    {
        // the id of the document
        "_id": "5cc5dd5c7cafa62fa853b492",
        // the id of the worker that executed the last update cycle on this podcast
        "workerID": "d140f0d0-69d7-11e9-b7f5-5d6dd4b509fb",
        // the id of the batch the podcast was in
        "batchID": "6c57e43848eb9b9d53100f1597c32d0eaaaf3c702c84fb3392df514cd0c9b1bc",
        // wether the cycle was completed successfully
        "success": true,
        // wether the podcast is offline
        "isDown": false,
        // the id of the podcast in the iTunes registry
        "itunesid": 138121654,
        // title of the podcast
        "title": "Plagued By Rhythm",
        // author of the podcast
        "author": "DJ I.Z.",
        // feed of the podcast
        "feedUrl": "http://feeds.feedburner.com/PlaguedByRhyhtm",
        // this array contains metadata about the steps of the update cycle of the podcast
        "steps": [
            {
                // when was the update cycle started
                "name": "start",
                "endTime": 1556471126137,
                "status": "SUCCEDED"
            },
            {
                // lookup from the iTunes registry
                "name": "init",
                "endTime": 1556471126575,
                "status": "SUCCEDED"
            },
            {
                // feed analysis and hosting vendors extracting
                "name": "extractHostings",
                "endTime": 1556471127222,
                "status": "SUCCEDED"
            },
            {
                // psql entry update
                "name": "loadPodcast",
                "endTime": 1556471132150,
                "status": "SUCCEDED"
            }
        ]
    }
    ```

3) **Redis** | A redis instance that manages the update queue, the processing queue, and the leases for each item in the queue. More detailed information in the `update` section.

### ```APPS```

1) **Backend** | A Node.js Express server to expose data from both the `psql` and `mongo` storage instances.

2) **Filler** | A Node.js script that queries the `psql` storage instance and gets the IDs of the iTunes podcasts to update, subdivides them in batches of 100 IDs, and pushes each batch in the update queue of the `redis` instance. This script is wrapped in a Kubernetes CronJob to run everyday at 8AM.

3) **Web** | An Angular webapp to browse the scraper results. This only connects to the backend.

4) **Worker** | A Node.js script that keeps taking and analyzing one element from the update queue of the `redis` instance at a time, until the queue is empty. This script is wrapped in a Kubernetes CronJob to run everyday at 8:30AM (when the `filler` is done). This CronJob has a `parallelism: 10` property to scale the number of workers active at the same time.

### ```PACKAGES```

1) **mongo-connector** | A package published at `@itunes-scraper-sdk/mongo-connector` shared between the project packages to handle env variables and methods to connect to the `mongo` storage.

2) **podcast-tools** | A package published at `@itunes-scraper-sdk/podcast-tools` shared between the project packages to handle the upload cycle process and connect to the iTunes API.

3) **psql-connector** | A package published at `@itunes-scraper-sdk/psql-connector` shared between the project packages to handle env vatiables and methos to connect to the `psql` storage.

## ```QUICKSTART```

1) ```➜ git clone``` this repo in your dest folder.
2) ```➜ cd itunes-scraper && npm install```.
3) ```➜ lerna bootstrap```
This command install dependencies for each package inside the repo, the output you should expect is:

    ```BASH
    [...]
    lerna info Bootstrapping 10 packages
    lerna info Installing external dependencies
    lerna info Symlinking packages and binaries
    lerna success Bootstrapped 10 packages
    ```

4) ```➜ lerna run deploy``` (this is gonna take a while)

    > **N.B you have to add your own ```ids.csv``` file in ```storage/psql/``` containing the ids of the iTunes entry you wanna track! You can find a placeholder for explicative purposes**

    This is the output you should expect:

    ```BASH
    [...]
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
Everyday at 8AM the `filler` will create an update queue, and at 8:30AM many `worker`s will be created to consume that queue.
You can now connect to `localhost:4200` to acces the webapp. At first, no data should be displayed because each deploy is brand new.

### ```HEALTH CHECKS```

1) 
    ```BASH
    ➜ kubectl get services -l app=itunes-scraper

    NAME                      TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)           AGE
    itunes-scraper-analyzer   LoadBalancer   10.98.58.62     localhost     3000:31392/TCP    ***
    itunes-scraper-backend    LoadBalancer   10.103.107.85   localhost     3003:32336/TCP    ***
    itunes-scraper-mongo      LoadBalancer   10.96.16.45     localhost     27017:30813/TCP   ***
    itunes-scraper-psql       LoadBalancer   10.111.105.63   localhost     5432:31569/TCP    ***
    itunes-scraper-redis      LoadBalancer   10.99.172.171   localhost     6379:32066/TCP    ***
    itunes-scraper-web        LoadBalancer   10.109.60.26    localhost     4200:30845/TCP    ***
    ```

 2)
    ```BASH
    ➜ kubectl get pvc -l app=itunes-scraper

    NAME             STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    mongo-pv-claim   Bound     pvc-f364bca4-5301-11e9-bead-025000000001   2Gi        RWO            hostpath       ***
    psql-pv-claim    Bound     pvc-9dba158b-4fa6-11e9-8b25-025000000001   2Gi        RWO            hostpath       ***
    ```

3) 
    ```BASH
    ➜ kubectl get pods -l app=itunes-scraper

    NAME                                    READY     STATUS    RESTARTS   AGE
    itunes-scraper-backend-84f774fc-dn9nr   1/1       Running   0          ***
    itunes-scraper-mongo-c68659f7c-dxcj8    1/1       Running   0          ***
    itunes-scraper-psql-855fb9c756-vrxk7    1/1       Running   0          ***
    itunes-scraper-redis-84c44d7794-td4s8   1/1       Running   0          ***
    itunes-scraper-web-794b5b6b46-txhgm     1/1       Running   0          ***
    ```

4)
    ```BASH
    ➜ kubectl get cronjobs

    NAME                      SCHEDULE      SUSPEND   ACTIVE    LAST SCHEDULE   AGE
    itunes-scraper-filler     0 8 * * *     False     0         12h             ***
    itunes-scraper-worker     30 8 * * *    False     1         11h             ***
    ```
