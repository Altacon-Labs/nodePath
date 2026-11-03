# Transaction CSV contract

UTF-8 CSV, optionally with a BOM. Exact header order:

~~~csv
chain_id,contract_address,wallet_address,transaction_hash,timestamp
1,0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222,0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,2025-01-01T12:00:00Z
~~~

This example is illustrative; replace it with verified records from your provider. Each row means that wallet interacted with the project's contract in that transaction.

- Supported chain IDs: Ethereum 1, Base 8453, Arbitrum 42161, Polygon 137.
- Contract and wallet: 20-byte EVM addresses. Lookup keys are normalized to lowercase.
- Hash: 32-byte hexadecimal transaction hash.
- Timestamp: ISO datetime with explicit Z or UTC offset; future dates rejected.
- Max 1 MB and 5,000 rows per import; 20,000 merged records per project; 30 local projects.
- Header names/order are strict. Quoted fields, escaped quotes and CRLF/LF line endings are supported.
- Atomic validation: a bad row prevents the entire file from being applied.
- Identity: wallet + transaction hash inside the project's fixed chain/contract. Identical reimports are skipped. A different timestamp for the same identity is rejected.

No credentials are required. CSV files are read in the browser and not uploaded to the demo API. Structural validation does not verify chain inclusion, confirmations or contract participation. Finality and completeness are responsibilities of your upstream export until live indexing is implemented.

