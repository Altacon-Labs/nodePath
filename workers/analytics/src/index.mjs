import {retentionRate} from '@nodepath/domain';
const wallet='0x'+'a'.repeat(40);
console.log(JSON.stringify({mode:'dry-run',fixtureRetention:retentionRate([wallet],[wallet]),message:'Fixture only. Connect tenant-scoped event storage and cohort windows before scheduling.'}));

