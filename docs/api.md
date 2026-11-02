# Development API

GET /health returns status, service and mode=demo.
GET /v1/overview returns mode=demo, projectId=demo, trackedWallets=1200, activeWallets=450 and retention30d=0.38.
GET /v1/wallets/{address} validates a 20-byte EVM address and returns a normalized address and fixed sample fields. It does not look up chain history. Invalid address: 400. Unknown path: 404. Non-GET request: 405.

No auth, project isolation or persistence is implemented. The web server proxies /v1/* to the local API; this avoids needing browser CORS for development. Do not treat this proxy as a production gateway. The shared SDK exposes overview() and wallet(address); it is a future consumer entry point and the current minimal web demo uses fetch directly.

