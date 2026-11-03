# Development API

GET /health returns status, service and mode=demo.
GET /v1/overview returns mode=demo, projectId=demo, trackedWallets=1200, activeWallets=450 and retention30d=0.38.
GET /v1/wallets/{address} validates a 20-byte EVM address and returns a normalized address and fixed sample fields. It does not look up chain history. Invalid address: 400. Unknown path: 404. Non-GET request: 405.

No auth, project isolation or persistence is implemented. The web server proxies /v1/* to the local API; this avoids needing browser CORS for development. Do not treat this proxy as a production gateway. The shared SDK exposes overview() and wallet(address); it is a future consumer entry point and the current minimal web demo uses fetch directly.


The current guided frontend computes analytics in-browser from sample or CSV records. These demonstration endpoints are retained for backend development and do not power the local project journey.

## Project snapshot contract

GET /v1/projects/{id} is the frontend data adapter's read boundary. Respond with JSON: version=1, mode=live (or mock for the demo), project={id,name,chainId,contract,events}. chainId is a supported chain ID string; contract and wallet fields are EVM addresses. Each event is {wallet,hash,timestamp}, where hash is a 32-byte transaction hash and timestamp is UTC milliseconds. Project ID, chain and contract must match the selected personal project. A live empty events array is a valid empty dataset and must not trigger mock fallback.

GET /v1/projects/sample is implemented by the demo API with mode=mock and the shared @nodepath/mock-data generator. It proves the contract but is not live chain data. Other project IDs currently return 404 until backend repositories are connected. No writes or authentication are added by this adapter.

The web development server proxies /v1/* to the configured API. On network errors, timeouts or unavailable endpoints, the sample uses shared mock data; personal projects preserve local imports or cached backend snapshots. 401/403 and invalid snapshots show errors instead of silently replacing data. Refresh data source retries; a browser online event also retries.
