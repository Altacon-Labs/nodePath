// One shared deterministic fixture generator for browser fallback and demo API.
const DAY=86400000;
export function sampleProject(now=Date.now()){const end=Math.floor(now/DAY)*DAY,events=[];let serial=0;for(let n=1;n<=72;n++){const wallet='0x'+n.toString(16).padStart(40,'0'),first=end-(55-n%28)*DAY+43200000;for(let day=0;day<56;day++){const timestamp=first+day*DAY;if(timestamp>=end)break;if(day===0||day%(n%5+2)===0)events.push({wallet,hash:'0x'+(++serial).toString(16).padStart(64,'0'),timestamp});}}return{id:'sample',name:'Atlas Protocol · sample',chainId:'1',contract:'0x'+'1'.repeat(40),source:'sample',events:events.sort((a,b)=>a.timestamp-b.timestamp)};}

export function sampleExploreData(now=Date.now()){
  const end=Math.floor(now/DAY)*DAY;
  const days=30;
  const chains={
    '1':{
      id:'1',
      name:'Ethereum',
      symbol:'ETH',
      tokenPrice:3148.60,
      tokenPriceChange:+2.45,
      marketCap:'$378.2B',
      latestBlock:21045890,
      blockTimeSec:12,
      dataFreshness:'Live · 12s ago',
      mode:'mock',
      provenance:'Simulated indexed Ethereum mainnet node',
      avgGasGwei:18.4,
      dailyTx:1180420,
      dailyTxChange:+3.12,
      activeAddresses:421950,
      newAddresses:84210,
      tps:14.2,
      tpsChange:+1.2,
      totalStaked:'34,812,490 ETH',
      stakedUsd:'$109.6B',
      stakingApr:'3.42%',
      liveFeed:[
        {hash:'0x8ef2a491bc7d20b659fe34a0912cb89f',from:'0xb3de419e48123913',to:'0xc001ae87bc984ca3',value:'2.45 ETH',time:'3 secs ago',type:'transfer'},
        {hash:'0x94pd6814fc120934ska13498acbd1204',from:'0x4981acdf43901bca',to:'0x1f9840a85d5af5bf',value:'14.80 ETH',time:'5 secs ago',type:'swap'},
        {hash:'0x039dbca01872a08910sldnb37189abcd1',from:'0x8821fa0c38910ae2',to:'0xdac17f958d2ee523',value:'5,000 USDT',time:'8 secs ago',type:'transfer'},
        {hash:'0x045618290abfcde412039423bca01928',from:'0x7701e819bcf82910',to:'0x87870bca3f3fd633',value:'0.85 stETH',time:'12 secs ago',type:'deposit'},
        {hash:'0x7b19280fca18923058a91019bcad8129',from:'0x12039bcad7819203',to:'0x00000000000000ad',value:'1.20 ETH',time:'15 secs ago',type:'nft'}
      ],
      recentBlocks:[
        {number:21045890,miner:'Titan Builder',txs:214,reward:'0.18 ETH',time:'12 secs ago'},
        {number:21045889,miner:'Flashbots',txs:188,reward:'0.24 ETH',time:'24 secs ago'},
        {number:21045888,miner:'beaverbuild',txs:242,reward:'0.31 ETH',time:'36 secs ago'},
        {number:21045887,miner:'Titan Builder',txs:196,reward:'0.15 ETH',time:'48 secs ago'}
      ],
      geoValidators:[
        {region:'North America',count:4120,lat:38,lng:-97,active:true},
        {region:'Europe',count:3890,lat:51,lng:10,active:true},
        {region:'Asia Pacific',count:1640,lat:35,lng:139,active:true},
        {region:'Latin America',count:310,lat:-15,lng:-47,active:false},
        {region:'Oceania',count:280,lat:-25,lng:133,active:false}
      ],
      topProtocols:[
        {name:'Uniswap V3',address:'0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',category:'DEX',dailyTx:248500,share:21.0,trend:+4.2},
        {name:'Tether USD',address:'0xdac17f958d2ee523a2206206994597c13d831ec7',category:'Stablecoin',dailyTx:192400,share:16.3,trend:+1.8},
        {name:'Aave V3',address:'0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',category:'Lending',dailyTx:84100,share:7.1,trend:-0.5},
        {name:'OpenSea Seaport',address:'0x00000000000000adc04c56bf30ac9d3c0aaf14dc',category:'NFT',dailyTx:46200,share:3.9,trend:-2.1}
      ],
      history:Array.from({length:days},(_,i)=>{
        const t=end-(days-1-i)*DAY;
        return{
          timestamp:t,
          dailyTx:Math.round(1100000+Math.sin(i*0.6)*80000+((i*37)%50000)),
          activeAddresses:Math.round(390000+Math.sin(i*0.6)*30000+((i*19)%25000)),
          newAddresses:Math.round(75000+Math.cos(i*0.5)*10000+((i*13)%8000)),
          avgGasGwei:Math.round((16+Math.sin(i*0.8)*5+((i*7)%6))*10)/10
        };
      })
    },
    '8453':{
      id:'8453',
      name:'Base',
      symbol:'ETH',
      tokenPrice:3148.60,
      tokenPriceChange:+2.45,
      marketCap:'$8.4B TVL',
      latestBlock:22841094,
      blockTimeSec:2,
      dataFreshness:'Live · 2s ago',
      mode:'mock',
      provenance:'Simulated indexed Base sequencer feed',
      avgGasGwei:0.04,
      dailyTx:3450200,
      dailyTxChange:+8.94,
      activeAddresses:892400,
      newAddresses:215400,
      tps:39.8,
      tpsChange:+6.4,
      totalStaked:'320,150 ETH',
      stakedUsd:'$1.01B',
      stakingApr:'4.10%',
      liveFeed:[
        {hash:'0x56a1b827e89123019ab987201bcdaf01',from:'0x3312019abcf82012',to:'0x940181a94a35a456',value:'450 AERO',time:'1 sec ago',type:'swap'},
        {hash:'0x77019abef90123847581290348719280',from:'0x8891024bcda78192',to:'0x833589fcd6edb6e0',value:'1,200 USDC',time:'2 secs ago',type:'transfer'},
        {hash:'0x1029384756abcdef0129384756102938',from:'0x5501928374610293',to:'0x0b3e328455c4059e',value:'850 VIRTUAL',time:'3 secs ago',type:'agent'}
      ],
      recentBlocks:[
        {number:22841094,miner:'Base Sequencer',txs:84,reward:'0.002 ETH',time:'2 secs ago'},
        {number:22841093,miner:'Base Sequencer',txs:92,reward:'0.003 ETH',time:'4 secs ago'},
        {number:22841092,miner:'Base Sequencer',txs:79,reward:'0.002 ETH',time:'6 secs ago'}
      ],
      geoValidators:[
        {region:'North America',count:890,lat:38,lng:-97,active:true},
        {region:'Europe',count:720,lat:51,lng:10,active:true},
        {region:'Asia',count:450,lat:35,lng:139,active:true}
      ],
      topProtocols:[
        {name:'Aerodrome Finance',address:'0x940181a94a35a4569e4529a3cdfb74e38fd98631',category:'DEX',dailyTx:684000,share:19.8,trend:+11.4},
        {name:'USD Base Coin',address:'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',category:'Stablecoin',dailyTx:520000,share:15.1,trend:+4.5},
        {name:'Virtuals Protocol',address:'0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',category:'AI / Agent',dailyTx:310000,share:9.0,trend:+18.2},
        {name:'Friend.tech V2',address:'0xcf205808ed36593aa40a44f10c79743073f566f2',category:'Social',dailyTx:142000,share:4.1,trend:-3.4}
      ],
      history:Array.from({length:days},(_,i)=>{
        const t=end-(days-1-i)*DAY;
        return{
          timestamp:t,
          dailyTx:Math.round(3000000+Math.sin(i*0.5)*400000+((i*83)%200000)),
          activeAddresses:Math.round(780000+Math.sin(i*0.5)*90000+((i*41)%50000)),
          newAddresses:Math.round(180000+Math.cos(i*0.4)*35000+((i*23)%20000)),
          avgGasGwei:0.03+Math.round(((i*11)%20)/1000*100)/100
        };
      })
    },
    '42161':{
      id:'42161',
      name:'Arbitrum One',
      symbol:'ETH',
      tokenPrice:3148.60,
      tokenPriceChange:+2.45,
      marketCap:'$16.8B TVL',
      latestBlock:274910214,
      blockTimeSec:0.25,
      dataFreshness:'Live · subsecond',
      mode:'mock',
      provenance:'Simulated indexed Arbitrum Nitro sequencer feed',
      avgGasGwei:0.08,
      dailyTx:1820400,
      dailyTxChange:+1.45,
      activeAddresses:512000,
      newAddresses:96000,
      tps:21.4,
      tpsChange:+0.8,
      totalStaked:'1,450,000 ETH',
      stakedUsd:'$4.56B',
      stakingApr:'3.80%',
      liveFeed:[
        {hash:'0x88910248571029384756102938475610',from:'0x1928374650192837',to:'0x479e4b71170296ec',value:'10.5 GMX',time:'subsecond',type:'perp'},
        {hash:'0x33019283746510293847561029384756',from:'0x9910293847561029',to:'0xc873fAe067182075',value:'3,400 USDC',time:'1 sec ago',type:'swap'}
      ],
      recentBlocks:[
        {number:274910214,miner:'Nitro Feed',txs:64,reward:'0.001 ETH',time:'subsecond'},
        {number:274910213,miner:'Nitro Feed',txs:58,reward:'0.001 ETH',time:'1 sec ago'}
      ],
      geoValidators:[
        {region:'Global Rollup Nodes',count:1240,lat:30,lng:0,active:true}
      ],
      topProtocols:[
        {name:'GMX V2',address:'0x479e4b71170296ec53399bc2fe052aaad2e95a60',category:'Perpetuals',dailyTx:295000,share:16.2,trend:+2.3},
        {name:'Camelot DEX',address:'0xc873fAe06718207567cCd19C4b9ec1A7f12C59D9',category:'DEX',dailyTx:241000,share:13.2,trend:+0.9},
        {name:'Arbitrum Bridge',address:'0x8315177ab297ba92a06095166a18d17424237898',category:'Bridge',dailyTx:118000,share:6.5,trend:-1.2}
      ],
      history:Array.from({length:days},(_,i)=>{
        const t=end-(days-1-i)*DAY;
        return{
          timestamp:t,
          dailyTx:Math.round(1600000+Math.sin(i*0.7)*150000+((i*43)%80000)),
          activeAddresses:Math.round(460000+Math.sin(i*0.6)*40000+((i*29)%30000)),
          newAddresses:Math.round(85000+Math.cos(i*0.5)*12000+((i*17)%10000)),
          avgGasGwei:0.07+Math.round(((i*9)%15)/1000*100)/100
        };
      })
    },
    '137':{
      id:'137',
      name:'Polygon POS',
      symbol:'POL',
      tokenPrice:0.384,
      tokenPriceChange:+5.12,
      marketCap:'$3.1B',
      latestBlock:64810234,
      blockTimeSec:2,
      dataFreshness:'Live · 2s ago',
      mode:'mock',
      provenance:'Simulated indexed Bor validator client',
      avgGasGwei:42.1,
      dailyTx:2890500,
      dailyTxChange:+6.31,
      activeAddresses:624000,
      newAddresses:142000,
      tps:33.4,
      tpsChange:+3.1,
      totalStaked:'3,840,000,000 POL',
      stakedUsd:'$1.47B',
      stakingApr:'5.20%',
      liveFeed:[
        {hash:'0x44910293847561029384756102938475',from:'0x1122334455667788',to:'0x4bFb41d5B3570DeF',value:'250 POL',time:'2 secs ago',type:'prediction'},
        {hash:'0x99102938475610293847561029384756',from:'0x9988776655443322',to:'0x5757371414417b8c',value:'1,800 QUICK',time:'3 secs ago',type:'swap'}
      ],
      recentBlocks:[
        {number:64810234,miner:'Validator #42',txs:112,reward:'4.2 POL',time:'2 secs ago'},
        {number:64810233,miner:'Validator #09',txs:108,reward:'3.9 POL',time:'4 secs ago'}
      ],
      geoValidators:[
        {region:'Global PoS Validators',count:105,lat:20,lng:10,active:true}
      ],
      topProtocols:[
        {name:'QuickSwap',address:'0x5757371414417b8c6caad45baef941abc7d3ab32',category:'DEX',dailyTx:410000,share:14.2,trend:+5.4},
        {name:'Polymarket CTF',address:'0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',category:'Predictions',dailyTx:380000,share:13.1,trend:+14.8},
        {name:'USDC (PoS)',address:'0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',category:'Stablecoin',dailyTx:310000,share:10.7,trend:+2.1}
      ],
      history:Array.from({length:days},(_,i)=>{
        const t=end-(days-1-i)*DAY;
        return{
          timestamp:t,
          dailyTx:Math.round(2600000+Math.sin(i*0.4)*250000+((i*61)%120000)),
          activeAddresses:Math.round(570000+Math.sin(i*0.5)*50000+((i*31)%40000)),
          newAddresses:Math.round(125000+Math.cos(i*0.6)*18000+((i*19)%15000)),
          avgGasGwei:Math.round((35+Math.sin(i*0.7)*10+((i*11)%12))*10)/10
        };
      })
    }
  };
  return{chains,defaultChainId:'1',updatedAt:new Date(now).toISOString()};
}
