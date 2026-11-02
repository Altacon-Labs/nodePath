import {transactionKey} from '@nodepath/domain';
// One-shot fixture processing only; never connects to an RPC or writes a checkpoint.
const event={chainId:1,transactionHash:'0x'+'a'.repeat(64),logIndex:0};
console.log(JSON.stringify({mode:'dry-run',eventKey:transactionKey(event),message:'Fixture validated. Implement the provider and persistence adapters before live indexing.'}));

