import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWallet,transactionKey,retentionRate} from '../src/index.mjs';
const a='0x'+'a'.repeat(40), b='0x'+'b'.repeat(40), c='0x'+'c'.repeat(40);
test('wallet validation and normalization',()=>{assert.equal(normalizeWallet('0x'+'A'.repeat(40)),a);assert.throws(()=>normalizeWallet('0x123'));});
test('retention deduplicates and excludes wallets outside cohort',()=>{assert.equal(retentionRate([a,a,b],[a,a,c]),0.5);assert.equal(retentionRate([],[]),0);});
test('event identity separates chains and log positions',()=>{const event={chainId:1,transactionHash:'0x'+'a'.repeat(64),logIndex:0};assert.notEqual(transactionKey(event),transactionKey({...event,chainId:2}));assert.notEqual(transactionKey(event),transactionKey({...event,logIndex:1}));assert.throws(()=>transactionKey({...event,logIndex:-1}));});

