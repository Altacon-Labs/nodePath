import {button as btn,textLink as link,panel} from './ui.mjs';
import {readProject,readExplore,sourceLabel} from './data-source.mjs';
import {element as el,icon,emptyState,createToasts,activityChart,cohortTable,roundedBarChart,sparklineChart,tpsHistogram,worldDotMap} from './components.mjs';
import {CHAINS,DAY,projectInput,sampleProject,importCSV,mergeEvents,summary,walletRows,cohorts,csvCell,validateBackup} from './model.mjs';
import {createStore} from './store.mjs';

const store=createStore(),view=document.querySelector('#view'),picker=document.querySelector('#project-picker'),toast=createToasts(document.querySelector('#toasts'));
const dataStates=new Map();
let requestNumber=0;
let days=30,filter='All',search='',cohortFilter=null,lastProject=null;
let exploreSelectedChain='1';
let exploreMetricTab='transactions';
let exploreDays=12;
let exploreState=null;

const date=t=>new Date(t).toISOString().slice(0,10),short=a=>a.slice(0,8)+'…'+a.slice(-6),active=()=>store.state.projects.find(p=>p.id===store.state.activeId);
function save(){store.save();storageStatus();}
function storageStatus(){document.querySelector('#storage-status').textContent=store.persistent?'':'Browser storage unavailable, invalid or full. Changes are temporary; export a backup.';}
function heading(title,description){view.append(el('h1','',title),el('p','page-intro',description));}
function route(hash){if(location.hash===hash)render();else location.hash=hash;}
function download(name,text,type='text/csv'){const url=URL.createObjectURL(new Blob([text],{type})),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Download prepared.');}
function backup(){download('nodepath-workspace.json',JSON.stringify({version:1,...store.state},null,2),'application/json');}

function restorePanel(){
  const c=el('div','bento-card');
  const head=el('div','bento-card-header');
  head.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/database.svg" alt=""></div><span class="bento-card-title">Restore Workspace Backup</span></div>';
  c.append(head);
  c.append(el('p','','Upload a previously exported JSON backup to replace the current local workspace.'));
  
  const f=el('form','bento-input-group');
  const label=el('label','','Backup File (.json)'),input=el('input','bento-input');
  input.type='file';input.accept='.json,application/json';input.required=true;
  label.append(input);
  
  const checkLabel=el('label','restore-confirm'),check=el('input');
  check.type='checkbox';check.required=true;
  checkLabel.append(check,el('span','','Confirm replacing existing workspace in this browser'));
  
  const submit=el('button','track-cta-btn','Restore backup');
  submit.type='submit';
  const error=el('p','form-error');error.setAttribute('role','alert');
  f.append(label,checkLabel,submit,error);
  
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    try{
      if(input.files[0].size>10000000)throw Error('Backup exceeds 10 MB.');
      const next=validateBackup(await input.files[0].text());
      store.replace(next);
      dataStates.clear();
      requestNumber++;
      save();
      toast('Workspace restored successfully.');
      route('#overview');
    }catch(e){error.textContent=e.message;}
  });
  c.append(f);
  return c;
}

function create(){
  const shell=el('div','bento-form-shell');
  shell.innerHTML='<div class="bento-card-header"><div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/cube.svg" alt=""></div><span class="bento-card-title">Track a New Protocol</span></div><a href="#explore" class="bento-card-action">Cancel</a></div><p style="font-size:13px;color:var(--muted);margin-bottom:20px">Configure onchain tracking for your smart contract. Data stays local in your browser.</p>';

  const f=el('form','');
  function field(label,name,placeholder){
    const grp=el('div','bento-input-group');
    const l=el('label','',label),i=el('input','bento-input');
    i.name=name;i.required=true;i.placeholder=placeholder;
    grp.append(l,i);
    f.append(grp);
    return i;
  }
  const name=field('Project Name','name','Atlas Protocol');
  name.maxLength=80;

  const chainGrp=el('div','bento-input-group');
  const chainLabel=el('label','','Blockchain Network');
  const chainSelect=el('select','bento-input');
  for(const[id,title]of Object.entries(CHAINS)){
    const o=el('option','',title);o.value=id;chainSelect.append(o);
  }
  chainGrp.append(chainLabel,chainSelect);
  f.append(chainGrp);

  const contract=field('Contract Address (20-byte EVM)','contract','0x…');
  const error=el('p','form-error');error.setAttribute('role','alert');
  const submit=el('button','track-cta-btn','Continue to Data Import');
  submit.type='submit';
  f.append(error,submit);

  f.addEventListener('submit',e=>{
    e.preventDefault();
    try{
      if(store.state.projects.length>=30)throw Error('Maximum 30 local projects. Export and remove unused projects first.');
      const p={...projectInput(name.value,chainSelect.value,contract.value),id:crypto.randomUUID(),source:'empty',events:[]};
      store.state.projects.push(p);
      store.state.activeId=p.id;
      save();
      toast('Project created. Set up transaction history.');
      route('#data');
    }catch(e){error.textContent=e.message;}
  });
  shell.append(f);
  view.append(shell);
}

// -------------------------------------------------------------
// PROTOCOL HEADER BANNER (Shared across Overview, Wallets, etc.)
// -------------------------------------------------------------
function protocolBanner(p,currentPage){
  const banner=el('div','protocol-header-banner');
  const left=el('div','');
  left.innerHTML='<div class="explore-banner-badge"><img src="/assets/icons/cube.svg" width="13" height="13" alt=""> PROTOCOL INTELLIGENCE</div><h2 style="font-size:22px;color:var(--text);margin:4px 0">'+p.name+'</h2><div class="proto-banner-meta"><span class="proto-chip">Network: <strong>'+(CHAINS[p.chainId]||'Chain #'+p.chainId)+'</strong></span><span class="proto-chip">Contract: <code>'+short(p.contract)+'</code></span><span class="proto-chip">History: <strong>'+p.events.length.toLocaleString()+' records</strong></span></div>';

  const actions=el('div','proto-banner-actions');
  const select=el('select','proto-pill-select');
  select.setAttribute('aria-label','Analysis window');
  for(const n of [...new Set([7,30,60,days])].sort((a,b)=>a-b)){
    const o=el('option','',n+' days');o.value=n;o.selected=n===days;
    select.append(o);
  }
  select.addEventListener('change',()=>{
    days=+select.value;cohortFilter=null;render();
  });
  actions.append(select);

  banner.append(left,actions);
  return banner;
}

function noData(p){
  const backend=p.source==='backend';
  const card=el('div','bento-card');
  card.append(
    emptyState({
      title:backend?'No activity in this project yet':'Project is ready for data',
      description:backend?'Backend connected with zero recorded transactions.':'No transactions imported for '+p.name+'. Upload a CSV dataset or explore public chains.',
      actionLabel:backend?'Refresh backend data':'Set up data source',
      onAction:()=>backend?syncProject(p):route('#data')
    })
  );
  view.append(card);
}

// -------------------------------------------------------------
// EXPLORE VIEW: Public Blockchain Overview (ChromiaX / Gnoland Bento)
// -------------------------------------------------------------
async function explore(){
  if(!exploreState){
    const loadingCard=el('div','bento-card');
    loadingCard.innerHTML='<div class="bento-card-header"><span class="bento-card-title">Connecting to ecosystem index…</span></div><p style="color:var(--muted)">Streaming telemetry across Ethereum, Base, Arbitrum &amp; Polygon.</p>';
    view.append(loadingCard);
    exploreState=await readExplore();
    render();
    return;
  }

  const data=exploreState.explore;
  const chainId=exploreSelectedChain;
  const currentChain=data.chains[chainId]||data.chains['1'];

  const container=el('div','explore-container');

  // 1. Top Sleek CTA Banner
  const banner=el('div','explore-top-banner');
  const bannerLeft=el('div','');
  bannerLeft.innerHTML='<span class="explore-banner-badge"><img src="/assets/icons/sparkle.svg" width="13" height="13" alt="" style="filter:brightness(2)"> PROTOCOL INTELLIGENCE</span><h2>'+currentChain.name+' Ecosystem Explorer</h2><p>Public chain telemetry, block feeds and validator distribution. Ready to measure your contract? Track your protocol in 30 seconds.</p>';
  const bannerBtn=el('button','track-cta-btn');
  bannerBtn.type='button';
  bannerBtn.innerHTML='<img src="/assets/icons/cube.svg" width="16" height="16" alt="" style="filter:var(--icon-filter)"> Track a project';
  bannerBtn.addEventListener('click',()=>route('#create'));
  banner.append(bannerLeft,bannerBtn);
  container.append(banner);

  // 2. Chain Selection Pills & Status Bar
  const controlsBar=el('div','explorer-controls-bar');
  const chainGroup=el('div','chain-pill-group');
  for(const[id,info]of Object.entries(data.chains)){
    const pill=el('button','chain-pill-btn'+(id===chainId?' active':''));
    pill.type='button';
    pill.innerHTML='<span>'+info.name+'</span><span class="pill-sym">'+info.symbol+'</span>';
    pill.addEventListener('click',()=>{
      exploreSelectedChain=id;
      render();
    });
    chainGroup.append(pill);
  }

  const metaPills=el('div','explore-meta-pills');
  metaPills.innerHTML='<span class="meta-tag-pill"><span class="status-dot '+(currentChain.mode==='live'?'':'mock')+'"></span><strong>#'+currentChain.latestBlock.toLocaleString()+'</strong> '+currentChain.dataFreshness+'</span><span class="meta-tag-pill">Gas: <strong>'+currentChain.avgGasGwei+' Gwei</strong></span>';
  
  controlsBar.append(chainGroup,metaPills);
  container.append(controlsBar);

  // 3. Search Bar Input
  const searchCard=el('div','explorer-search-card');
  searchCard.innerHTML='<img src="/assets/icons/magnifying-glass.svg" width="16" height="16" alt="" style="filter:brightness(1.5)"><input type="text" placeholder="Search address, transaction hash, block number or protocol contract…"><span class="explorer-search-key">/</span>';
  container.append(searchCard);

  // 4. Hero Bento Row (Rounded Bar Chart + Live Transactions Feed)
  const heroRow=el('div','bento-row bento-hero-grid');

  // Left Bento Card: Hero Analytics Card with Pills
  const heroCard=el('div','bento-card');
  const heroPills=el('div','metric-sub-pills');
  const tabs=[
    {id:'transactions',label:'Transactions'},
    {id:'blocks',label:'Block height'},
    {id:'tps',label:'TPS'},
    {id:'gas',label:'Gas price'}
  ];
  tabs.forEach(t=>{
    const p=el('button','pill-tab'+(exploreMetricTab===t.id?' active':''));
    p.type='button';
    p.textContent=t.label;
    p.addEventListener('click',()=>{
      exploreMetricTab=t.id;
      render();
    });
    heroPills.append(p);
  });

  const heroMetricWrap=el('div','hero-metric-wrap');
  let mainNumber='0',changeVal='+0.00%',chartData=[];
  const hist=currentChain.history.slice(-exploreDays);

  if(exploreMetricTab==='transactions'){
    mainNumber=currentChain.dailyTx.toLocaleString();
    changeVal=(currentChain.dailyTxChange>=0?'+':'')+currentChain.dailyTxChange+'%';
    chartData=hist.map(h=>h.dailyTx);
  }else if(exploreMetricTab==='blocks'){
    mainNumber='#'+currentChain.latestBlock.toLocaleString();
    changeVal=currentChain.blockTimeSec+'s cad.';
    chartData=hist.map(h=>h.activeAddresses);
  }else if(exploreMetricTab==='tps'){
    mainNumber=currentChain.tps+' TPS';
    changeVal=(currentChain.tpsChange>=0?'+':'')+currentChain.tpsChange+'%';
    chartData=hist.map(h=>h.dailyTx/86400);
  }else if(exploreMetricTab==='gas'){
    mainNumber=currentChain.avgGasGwei+' Gwei';
    changeVal='-1.42%';
    chartData=hist.map(h=>h.avgGasGwei*10);
  }

  const isUp=changeVal.startsWith('+');
  heroMetricWrap.innerHTML='<div class="hero-metric-val"><span>'+mainNumber+'</span><span class="metric-badge-change '+(isUp?'up':'down')+'">'+changeVal+'</span></div><div class="hero-metric-sub">Past '+exploreDays+' days on '+currentChain.name+' · Observation ends '+date(Date.now())+'</div>';

  heroCard.append(heroPills,heroMetricWrap,roundedBarChart(chartData,{height:210}));
  heroRow.append(heroCard);

  // Right Bento Card: Live Transactions Stream
  const txCard=el('div','bento-card');
  const txHeader=el('div','bento-card-header');
  txHeader.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/arrows-down-up.svg" alt=""></div><span class="bento-card-title">Latest Transactions</span></div><span class="bento-card-action">View all <img src="/assets/icons/arrow-up-right.svg" width="12" height="12" alt=""></span>';
  
  const feedList=el('div','compact-feed-list');
  const feedItems=currentChain.liveFeed||[];
  feedItems.forEach(item=>{
    const row=el('div','feed-item-row');
    row.innerHTML='<div class="feed-left"><div class="feed-circle-icon"><img src="/assets/icons/arrows-left-right.svg" alt=""></div><div><div class="feed-title"><code>'+short(item.hash)+'</code></div><div class="feed-subtitle">'+short(item.from)+' → '+short(item.to)+'</div></div></div><div class="feed-right"><div class="feed-val">'+item.value+'</div><div class="feed-time">'+item.time+'</div></div>';
    feedList.append(row);
  });
  txCard.append(txHeader,feedList);
  heroRow.append(txCard);

  container.append(heroRow);

  // 5. Middle Bento Row (Recent Blocks + Total Staked + TPS Histogram)
  const triRow=el('div','bento-row bento-tri-grid');

  // Blocks Card
  const blocksCard=el('div','bento-card');
  const blocksHeader=el('div','bento-card-header');
  blocksHeader.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/cube.svg" alt=""></div><span class="bento-card-title">Recent Blocks</span></div><span class="bento-card-action">All blocks <img src="/assets/icons/arrow-up-right.svg" width="12" height="12" alt=""></span>';
  const blockFeedList=el('div','compact-feed-list');
  const blocks=currentChain.recentBlocks||[];
  blocks.forEach(b=>{
    const row=el('div','feed-item-row');
    row.innerHTML='<div class="feed-left"><div class="feed-circle-icon"><img src="/assets/icons/cube.svg" alt=""></div><div><div class="feed-title">#'+b.number.toLocaleString()+'</div><div class="feed-subtitle">By '+b.miner+'</div></div></div><div class="feed-right"><div class="feed-val">'+b.txs+' TXs</div><div class="feed-time">'+b.time+'</div></div>';
    blockFeedList.append(row);
  });
  blocksCard.append(blocksHeader,blockFeedList);
  triRow.append(blocksCard);

  // Staked Card
  const stakedCard=el('div','bento-card');
  const stakedHeader=el('div','bento-card-header');
  stakedHeader.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/lightning.svg" alt=""></div><span class="bento-card-title">Staking &amp; Security</span></div><span class="metric-badge-change up">APR '+currentChain.stakingApr+'</span>';
  
  const stakedMetric=el('div','');
  stakedMetric.innerHTML='<div style="font-size:26px;font-weight:800;color:var(--text);margin:8px 0 2px">'+currentChain.totalStaked+'</div><div style="font-size:11px;color:var(--subtle);margin-bottom:12px">Total value locked: '+currentChain.stakedUsd+'</div>';
  
  const splineData=[28,34,31,42,39,48,45,56,52,64,59,71,68];
  const spline=sparklineChart(splineData,{height:68,width:320,lineColor:'#818cf8'});
  
  const miniStats=el('div','staked-mini-stat');
  miniStats.innerHTML='<span>Active: <strong>'+currentChain.activeAddresses.toLocaleString()+'</strong></span><span>New: <strong>'+currentChain.newAddresses.toLocaleString()+'</strong></span>';

  stakedCard.append(stakedHeader,stakedMetric,spline,miniStats);
  triRow.append(stakedCard);

  // TPS Card
  const tpsCard=el('div','bento-card');
  const tpsHeader=el('div','bento-card-header');
  tpsHeader.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/activity.svg" alt=""></div><span class="bento-card-title">Realtime Throughput</span></div><span class="metric-badge-change up">'+currentChain.tpsChange+'%</span>';

  const tpsMetric=el('div','');
  tpsMetric.innerHTML='<div style="font-size:26px;font-weight:800;color:var(--text);margin:8px 0 2px">'+currentChain.tps+' <span style="font-size:14px;color:var(--subtle);font-weight:600">TPS</span></div><div style="font-size:11px;color:var(--subtle);margin-bottom:12px">Cadence: '+currentChain.blockTimeSec+'s block time</div>';
  
  const histData=[12,18,14,22,28,19,25,31,24,35,42,38,44,39,46,50,48,54,49,58,62,59,64,61,68,72,70,78,74,82];
  const tpsHist=tpsHistogram(histData,{height:68,width:300});

  const tpsMiniStats=el('div','staked-mini-stat');
  tpsMiniStats.innerHTML='<span>Daily Tx: <strong>'+(currentChain.dailyTx/1000).toFixed(0)+'k</strong></span><span>Gas: <strong>'+currentChain.avgGasGwei+' Gwei</strong></span>';

  tpsCard.append(tpsHeader,tpsMetric,tpsHist,tpsMiniStats);
  triRow.append(tpsCard);

  container.append(triRow);

  // 6. World Map Card
  const mapCard=el('div','validator-map-card');
  const mapTop=el('div','map-top-bar');
  const totalVals=(currentChain.geoValidators||[]).reduce((s,v)=>s+v.count,0);
  mapTop.innerHTML='<div class="validator-count-display"><h3>Global Consensus &amp; Node Topology</h3><div class="val-num">'+totalVals.toLocaleString()+' <span style="font-size:14px;color:var(--subtle);font-weight:600">Nodes / Validators</span></div></div><div class="leader-tag"><span class="status-dot"></span> Current block builder: <strong>'+(currentChain.recentBlocks?.[0]?.miner||'Consensus')+'</strong></div>';
  
  mapCard.append(mapTop,worldDotMap(currentChain.geoValidators));
  container.append(mapCard);

  // 7. Protocols Matrix Card
  const protoCard=el('div','bento-card');
  const protoHeader=el('div','bento-card-header');
  protoHeader.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/chart-bar.svg" alt=""></div><span class="bento-card-title">Leading Smart Contracts &amp; Market Share</span></div><span class="hero-metric-sub">'+currentChain.name+' Mainnet</span>';
  
  const protoGrid=el('div','protocols-compact-grid');
  (currentChain.topProtocols||[]).forEach(p=>{
    const mini=el('div','protocol-mini-card');
    const trendIsUp=(p.trend||0)>=0;
    mini.innerHTML='<div class="proto-head"><strong>'+p.name+'</strong><span class="proto-cat-tag">'+p.category+'</span></div><div class="proto-tx-row"><span>Daily Tx</span><span>'+p.dailyTx.toLocaleString()+'</span></div><div class="proto-share-bar"><div class="proto-share-fill" style="width:'+Math.min(100,p.share*4)+'%"></div></div><div class="proto-tx-row"><span style="color:var(--subtle);font-family:monospace">'+short(p.address)+'</span><span class="metric-badge-change '+(trendIsUp?'up':'down')+'" style="font-size:10px;padding:1px 5px">'+(trendIsUp?'+':'')+p.trend+'%</span></div>';
    protoGrid.append(mini);
  });
  protoCard.append(protoHeader,protoGrid);
  container.append(protoCard);

  view.append(container);
}

// -------------------------------------------------------------
// 1. OVERVIEW (ChromiaX Bento Style)
// -------------------------------------------------------------
function overview(p){
  if(!p.events.length){
    view.append(protocolBanner(p,'overview'));
    view.append(el('div','section-top-spacer'));
    noData(p);
    return;
  }
  view.append(protocolBanner(p,'overview'));
  view.append(el('div','section-top-spacer'));

  const m=summary(p.events,days);
  const container=el('div','explore-container');

  // Bento Row 1: Key Metrics Tri-Grid
  const triGrid=el('div','bento-row bento-tri-grid');

  // Card 1: Active Wallets
  const c1=el('div','bento-card');
  const h1=el('div','bento-card-header');
  h1.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/wallet.svg" alt=""></div><span class="bento-card-title">Active Wallets</span></div><button class="pill-tab" type="button">Inspect</button>';
  h1.querySelector('button').addEventListener('click',()=>{filter='All';search='';cohortFilter=null;route('#wallets');});
  const v1=el('div','hero-metric-wrap');
  const delta=m.active-m.previous;
  const deltaPct=m.previous>0?Math.round((delta/m.previous)*100):0;
  v1.innerHTML='<div class="hero-metric-val"><span>'+m.active.toLocaleString()+'</span><span class="metric-badge-change '+(delta>=0?'up':'down')+'">'+(delta>=0?'+':'')+deltaPct+'%</span></div><div class="hero-metric-sub">'+m.transactions.toLocaleString()+' transactions in '+days+'d UTC window</div>';
  c1.append(h1,v1,sparklineChart(m.series.slice(-14),{height:60,width:260,lineColor:'#22c55e'}));
  triGrid.append(c1);

  // Card 2: New Wallets
  const c2=el('div','bento-card');
  const h2=el('div','bento-card-header');
  h2.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/sparkle.svg" alt=""></div><span class="bento-card-title">New Wallets</span></div><button class="pill-tab" type="button">Inspect</button>';
  h2.querySelector('button').addEventListener('click',()=>{filter='New';search='';cohortFilter=null;route('#wallets');});
  const v2=el('div','hero-metric-wrap');
  v2.innerHTML='<div class="hero-metric-val"><span>'+m.newWallets.toLocaleString()+'</span><span class="metric-badge-change up">'+Math.round((m.newWallets/Math.max(1,m.active))*100)+'% share</span></div><div class="hero-metric-sub">First observed interaction with contract</div>';
  c2.append(h2,v2,sparklineChart(m.series.map(v=>Math.round(v*0.2)).slice(-14),{height:60,width:260,lineColor:'#38bdf8'}));
  triGrid.append(c2);

  // Card 3: Returning Wallets
  const c3=el('div','bento-card');
  const h3=el('div','bento-card-header');
  h3.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/chart-line-up.svg" alt=""></div><span class="bento-card-title">Returning Wallets</span></div><button class="pill-tab" type="button">Cohort</button>';
  h3.querySelector('button').addEventListener('click',()=>{route('#retention');});
  const v3=el('div','hero-metric-wrap');
  v3.innerHTML='<div class="hero-metric-val"><span>'+m.returning.toLocaleString()+'</span><span class="metric-badge-change '+(m.returning>0?'up':'down')+'">'+Math.round((m.returning/Math.max(1,m.active))*100)+'% rate</span></div><div class="hero-metric-sub">Observed earlier and recurring in this window</div>';
  c3.append(h3,v3,sparklineChart(m.series.map(v=>Math.round(v*0.8)).slice(-14),{height:60,width:260,lineColor:'#a855f7'}));
  triGrid.append(c3);

  container.append(triGrid);

  // Bento Row 2: Daily Active Wallets Chart
  const chartCard=el('div','bento-card');
  const chartHead=el('div','bento-card-header');
  chartHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/chart-bar.svg" alt=""></div><span class="bento-card-title">Daily Active Wallets Progression</span></div><div class="explore-meta-pills"><span class="meta-tag-pill">Peak: <strong>'+Math.max(...m.series)+'</strong></span><span class="meta-tag-pill">Avg: <strong>'+Math.round(m.series.reduce((a,b)=>a+b,0)/m.series.length)+'</strong></span><span class="meta-tag-pill">Low: <strong>'+Math.min(...m.series)+'</strong></span></div>';
  const chartWrap=el('div','activity-chart-wrap');
  chartWrap.append(activityChart(m.series,{
    title:'Daily Active Wallets over '+days+' days',
    ariaLabel:'Daily active wallets progression chart',
    startLabel:new Date(m.start).toISOString().slice(0,10),
    midLabel:new Date((m.start+m.end)/2).toISOString().slice(0,10),
    endLabel:new Date(m.end).toISOString().slice(0,10)
  }));
  chartCard.append(chartHead,chartWrap);
  container.append(chartCard);

  // Bento Row 3: Actionable Next Steps Card
  const nextCard=el('div','bento-card');
  const nextHead=el('div','bento-card-header');
  nextHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/activity.svg" alt=""></div><span class="bento-card-title">Adoption &amp; Retention Insights</span></div>';
  const nextContent=el('div','');
  nextContent.innerHTML='<p style="font-size:13px;color:var(--muted);margin-bottom:14px">'+(m.returning?'Returning wallets represent '+Math.round((m.returning/m.active)*100)+'% of overall activity. Dive into weekly retention cohorts to see follow-up resilience.':'No returning wallets detected in this window. Import more historical records or test a wider analysis period.')+'</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a href="#retention" class="track-cta-btn" style="text-decoration:none">Explore Retention Cohorts</a><button class="pill-tab" type="button" id="overview-drilldown-btn">Inspect All '+m.active+' Wallets</button></div>';
  nextContent.querySelector('#overview-drilldown-btn').addEventListener('click',()=>{filter='All';search='';cohortFilter=null;route('#wallets');});
  nextCard.append(nextHead,nextContent);
  container.append(nextCard);

  view.append(container);
}

// -------------------------------------------------------------
// 2. WALLETS (ChromiaX Dark Table & Detail Flyout)
// -------------------------------------------------------------
function walletTable(rows,onOpen,page=0){
  const wrap=el('div','dark-bento-table-wrap');
  const table=el('table','dark-bento-table');
  table.innerHTML='<thead><tr><th>Wallet Address</th><th>Segment</th><th>Transactions</th><th>First Observed</th><th>Last Observed</th><th>Action</th></tr></thead>';
  const tbody=el('tbody');
  const pageRows=rows.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  for(const row of pageRows){
    const tr=el('tr');
    tr.innerHTML='<td><code>'+row.wallet+'</code></td><td><span class="segment-tag '+(row.segment==='New'?'new':'returning')+'">'+row.segment+'</span></td><td><strong>'+row.transactions+'</strong></td><td>'+date(row.first)+'</td><td>'+date(row.last)+'</td><td><button class="wallet-pill-btn" type="button">Inspect</button></td>';
    tr.querySelector('button').addEventListener('click',()=>onOpen(row.wallet));
    tbody.append(tr);
  }
  table.append(tbody);
  wrap.append(table);
  return wrap;
}

// Pagination helper
const PAGE_SIZE=25;
let walletsPage=0;

function makePagination(total,page,setPage){
  const bar=el('div','pagination-bar');
  const info=el('span','','Showing '+(Math.min(page*PAGE_SIZE+1,total))+'–'+Math.min((page+1)*PAGE_SIZE,total)+' of '+total.toLocaleString()+' wallets');
  const controls=el('div','pagination-controls');
  const prevBtn=el('button','page-btn','← Prev');
  prevBtn.type='button';prevBtn.disabled=page===0;
  prevBtn.addEventListener('click',()=>setPage(page-1));
  const totalPages=Math.ceil(total/PAGE_SIZE);
  const nextBtn=el('button','page-btn','Next →');
  nextBtn.type='button';nextBtn.disabled=page>=totalPages-1;
  nextBtn.addEventListener('click',()=>setPage(page+1));
  const pageNum=el('span','','Page '+(page+1)+' / '+totalPages);
  controls.append(prevBtn,pageNum,nextBtn);
  bar.append(info,controls);
  return bar;
}

function wallets(p){
  if(!p.events.length){
    view.append(protocolBanner(p,'wallets'));
    view.append(el('div','section-top-spacer'));
    noData(p);
    return;
  }
  view.append(protocolBanner(p,'wallets'));
  view.append(el('div','section-top-spacer'));

  const container=el('div','explore-container');

  // Search & Filter Omnibar
  const searchRow=el('div','explorer-controls-bar');
  const searchInputCard=el('div','explorer-search-card');
  searchInputCard.style.flex='1';
  searchInputCard.innerHTML='<img src="/assets/icons/magnifying-glass.svg" width="16" height="16" alt="" style="filter:brightness(1.5)"><input type="text" placeholder="Filter by address (0x…)" value="'+search+'">';
  const sInput=searchInputCard.querySelector('input');
  
  const filterPills=el('div','chain-pill-group');
  for(const name of ['All','New','Returning']){
    const pill=el('button','chain-pill-btn'+(filter===name?' active':''));
    pill.type='button';
    pill.textContent=name;
    pill.addEventListener('click',()=>{
      filter=name;draw(0);
      for(const b of filterPills.querySelectorAll('button'))b.classList.remove('active');
      pill.classList.add('active');
    });
    filterPills.append(pill);
  }

  const exportBtn=el('button','track-cta-btn','Export CSV');
  exportBtn.type='button';
  exportBtn.addEventListener('click',()=>download('nodepath-wallets.csv',['wallet,segment,transactions,first_observed,last_observed',...matched().map(w=>[w.wallet,w.segment,w.transactions,new Date(w.first).toISOString(),new Date(w.last).toISOString()].map(csvCell).join(','))].join('\r\n')));

  searchRow.append(searchInputCard,filterPills,exportBtn);
  container.append(searchRow);

  const tableCard=el('div','bento-card');
  const tableHead=el('div','bento-card-header');
  const countBadge=el('span','bento-card-title','Matching Wallets');
  tableHead.append(countBadge);
  const tableHolder=el('div','');
  tableCard.append(tableHead,tableHolder);

  const detailCard=el('div','bento-card');
  detailCard.hidden=true;
  container.append(tableCard,detailCard);

  function matched(){
    const m=summary(p.events,days);
    return walletRows(p.events,m.start,m.end).filter(w=>(filter==='All'||w.segment===filter)&&w.wallet.includes(search.toLowerCase())&&(!cohortFilter||cohortFilter.includes(w.wallet)));
  }

  function open(wallet){
    detailCard.hidden=false;
    const events=p.events.filter(e=>e.wallet===wallet).sort((a,b)=>b.timestamp-a.timestamp);
    detailCard.innerHTML='<div class="bento-card-header"><div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/user-circle.svg" alt=""></div><span class="bento-card-title">Wallet Activity Details</span></div><button class="pill-tab" id="close-detail-btn" type="button">Close</button></div><div style="font-family:monospace;font-size:13px;color:var(--accent-sky);margin-bottom:14px">'+wallet+'</div><p style="font-size:12px;color:var(--muted);margin-bottom:12px">'+events.length+' observed interactions across history. Latest 20 transactions shown.</p><div class="compact-feed-list" id="tx-feed-box"></div>';
    
    detailCard.querySelector('#close-detail-btn').addEventListener('click',()=>detailCard.hidden=true);
    const feedBox=detailCard.querySelector('#tx-feed-box');
    for(const e of events.slice(0,20)){
      const row=el('div','feed-item-row');
      row.innerHTML='<div class="feed-left"><div class="feed-circle-icon"><img src="/assets/icons/arrows-left-right.svg" alt=""></div><div><div class="feed-title"><code>'+short(e.hash)+'</code></div><div class="feed-subtitle">'+new Date(e.timestamp).toISOString()+'</div></div></div><div class="feed-right"><span class="badge-tag live">Confirmed</span></div>';
      feedBox.append(row);
    }
    detailCard.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function draw(pg=0){
    walletsPage=pg;
    const rows=matched();
    countBadge.textContent=rows.length.toLocaleString()+' Matching Wallets';
    tableHolder.replaceChildren();
    if(rows.length){
      tableHolder.append(walletTable(rows,open,pg));
      if(rows.length>PAGE_SIZE) tableHolder.append(makePagination(rows.length,pg,draw));
    }else{
      tableHolder.append(emptyState({title:'No matching wallets',description:'Adjust search filter or select another segment.',actionLabel:'Reset filters',onAction:()=>{filter='All';search='';cohortFilter=null;render();}}));
    }
  }

  sInput.addEventListener('input',()=>{search=sInput.value;draw(0);});
  draw();
  view.append(container);
}

// -------------------------------------------------------------
// 3. RETENTION (ChromiaX Cohort Grid & Heatmap)
// -------------------------------------------------------------
function retention(p){
  if(!p.events.length){
    view.append(protocolBanner(p,'retention'));
    view.append(el('div','section-top-spacer'));
    noData(p);
    return;
  }
  view.append(protocolBanner(p,'retention'));
  view.append(el('div','section-top-spacer'));

  const container=el('div','explore-container');
  const rows=cohorts(p.events);

  // --- Summary stat cards row ---
  if(rows.length){
    const week1rates=rows.map(r=>r.retention[1]).filter(v=>v!==null);
    const avgW1=week1rates.length?Math.round(week1rates.reduce((a,b)=>a+b,0)/week1rates.length):0;
    const week4rates=rows.map(r=>r.retention[4]).filter(v=>v!==null);
    const avgW4=week4rates.length?Math.round(week4rates.reduce((a,b)=>a+b,0)/week4rates.length):0;
    const totalCohortWallets=rows.reduce((s,r)=>s+r.wallets,0);

    const statGrid=el('div','bento-row bento-tri-grid');
    function retStatCard(title,value,sub,color){
      const c=el('div','bento-card');
      c.innerHTML='<div class="proto-metric-hero"><div class="proto-metric-title">'+title+'</div><div class="proto-metric-value" style="color:'+color+';font-size:32px">'+value+'</div><div class="proto-metric-caption">'+sub+'</div></div>';
      return c;
    }
    statGrid.append(
      retStatCard('Total Cohort Wallets',totalCohortWallets.toLocaleString(),'Unique first-timers across all cohorts','#f1f5f9'),
      retStatCard('Avg Week 1 Retention',avgW1+'%','% returning in week after first interaction',avgW1>=40?'#4ade80':avgW1>=20?'#fbbf24':'#f87171'),
      retStatCard('Avg Week 4 Retention',avgW4+'%','Long-term retention signal at 28 days',avgW4>=20?'#4ade80':avgW4>=10?'#fbbf24':'#f87171')
    );
    container.append(statGrid);
  }

  // Hero Retention Card
  const heroCard=el('div','bento-card');
  const heroHead=el('div','bento-card-header');
  heroHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/chart-line-up.svg" alt=""></div><span class="bento-card-title">Weekly Retention Cohorts</span></div><button class="track-cta-btn" id="export-retention-btn" type="button">Export CSV</button>';
  heroHead.querySelector('#export-retention-btn').addEventListener('click',()=>download('nodepath-retention.csv',['cohort_start_utc,wallets,week_0,week_1,week_2,week_3,week_4',...rows.map(r=>[r.label,r.wallets,...r.retention.map(v=>v===null?'':v)].map(csvCell).join(','))].join('\r\n')));
  
  heroCard.append(heroHead);
  heroCard.append(el('p','','Cohorts group first-time wallets into 7-day UTC buckets. Percentages show how many returned in subsequent weeks.'));

  // Clean text-based cohort table — no heavy green fill, just subtle color-coded text
  const tableWrap=el('div','dark-bento-table-wrap');
  const table=el('table','dark-bento-table cohort-grid-table');
  table.innerHTML='<thead><tr><th>Cohort Week</th><th>Wallets</th><th style="text-align:center">Wk 0</th><th style="text-align:center">Wk 1</th><th style="text-align:center">Wk 2</th><th style="text-align:center">Wk 3</th><th style="text-align:center">Wk 4</th><th>Drilldown</th></tr></thead>';
  const tbody=el('tbody');
  
  for(const row of rows){
    const tr=el('tr');
    tr.innerHTML='<td><strong>'+row.label+'</strong></td><td><strong>'+row.wallets+'</strong></td>';
    for(const val of row.retention){
      const td=el('td','ret-val-cell');
      if(val===null){
        td.innerHTML='<span class="ret-na">–</span>';
      }else{
        // Color text: green >=40%, yellow >=20%, red <20%
        const color=val>=40?'#4ade80':val>=20?'#fbbf24':'#f87171';
        td.innerHTML='<span class="ret-pct" style="color:'+color+'">'+val+'%</span><div class="ret-bar-wrap"><div class="ret-bar-fill" style="width:'+Math.min(100,val)+'%;background:'+color+'"></div></div>';
      }
      tr.append(td);
    }
    const tdAction=el('td','');
    const b=el('button','wallet-pill-btn','Inspect');
    b.type='button';
    b.addEventListener('click',()=>{
      cohortFilter=row.members;
      days=Math.max(60,Math.ceil((summary(p.events,1).end-Math.min(...p.events.map(e=>e.timestamp)))/DAY));
      filter='All';search='';route('#wallets');
    });
    tdAction.append(b);
    tr.append(tdAction);
    tbody.append(tr);
  }
  table.append(tbody);
  tableWrap.append(table);
  heroCard.append(tableWrap);
  container.append(heroCard);

  view.append(container);
}

// -------------------------------------------------------------
// 4. DATA SOURCES (ChromiaX Setup Card)
// -------------------------------------------------------------
function data(p){
  view.append(protocolBanner(p,'data'));
  view.append(el('div','section-top-spacer'));
  const container=el('div','explore-container');

  const bentoGrid=el('div','bento-row bento-hero-grid');

  // Left Bento Card: Current Ingestion Telemetry
  const statusCard=el('div','bento-card');
  const statusHead=el('div','bento-card-header');
  statusHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/database.svg" alt=""></div><span class="bento-card-title">Data Ingestion Status</span></div><span class="badge-tag '+(p.source==='backend'?'live':'mock')+'">'+(p.source==='backend'?'Live Indexed':'Local CSV')+'</span>';
  
  const statusBody=el('div','');
  statusBody.innerHTML='<div class="hero-metric-val"><span>'+p.events.length.toLocaleString()+'</span><span class="hero-metric-sub" style="font-size:14px">confirmed records</span></div><div class="staked-mini-stat"><span>Network: <strong>'+(CHAINS[p.chainId]||p.chainId)+'</strong></span><span>Contract: <strong>'+short(p.contract)+'</strong></span></div>';
  statusCard.append(statusHead,statusBody);
  bentoGrid.append(statusCard);

  // Right Bento Card: CSV Import Action
  const importCard=el('div','bento-card');
  const importHead=el('div','bento-card-header');
  importHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/arrows-down-up.svg" alt=""></div><span class="bento-card-title">Import Historical CSV</span></div><button class="pill-tab" id="download-tpl-btn" type="button">Template</button>';
  importHead.querySelector('#download-tpl-btn').addEventListener('click',()=>download('nodepath-template.csv','chain_id,contract_address,wallet_address,transaction_hash,timestamp\r\n'+p.chainId+','+p.contract+',0x'+'2'.repeat(40)+',0x'+'a'.repeat(64)+','+new Date(Date.now()-DAY).toISOString()+'\r\n'));
  
  const f=el('form','bento-input-group');
  const label=el('label','','Select CSV File (Max 5,000 rows / 1 MB)'),input=el('input','bento-input');
  input.type='file';input.accept='.csv,text/csv';input.required=true;
  label.append(input);
  const submit=el('button','track-cta-btn','Upload & Ingest Transactions');
  submit.type='submit';
  const error=el('p','form-error');error.setAttribute('role','alert');
  f.append(label,submit,error);
  
  f.addEventListener('submit',async e=>{
    e.preventDefault();submit.disabled=true;error.textContent='';
    try{
      const file=input.files[0];if(file.size>1000000)throw Error('File exceeds 1 MB.');
      const incoming=importCSV(await file.text(),p),merged=mergeEvents(p.events,incoming);
      if(merged.length>20000)throw Error('Project exceeds 20,000 records.');
      const added=merged.length-p.events.length;
      p.events=merged;p.source='csv';
      dataStates.set(p.id,{origin:'local',mode:'local',reason:'CSV imported in this browser'});
      save();toast(added+' transactions added successfully.');
      route('#overview');
    }catch(e){error.textContent=e.message;toast('Import failed.',{error:true});}
    finally{submit.disabled=false;}
  });

  importCard.append(importHead,f);
  bentoGrid.append(importCard);
  container.append(bentoGrid);

  view.append(container);
}

// -------------------------------------------------------------
// 5. SETTINGS: Standard Clean Settings Grid & Hierarchy
// -------------------------------------------------------------
function settings(p){
  const container=el('div','explore-container');

  // Header Banner
  const headerCard=el('div','protocol-header-banner');
  headerCard.innerHTML='<div><div class="explore-banner-badge"><img src="/assets/icons/gear.svg" width="13" height="13" alt="" style="filter:brightness(2)"> PREFERENCES &amp; STORAGE</div><h2 style="font-size:22px;color:var(--text);margin:4px 0">Workspace Settings</h2><p style="font-size:12px;color:var(--muted)">Manage tracked protocol configuration, export portable backups, or restore local data.</p></div>';
  container.append(headerCard);

  // 2-Column Settings Layout
  const grid=el('div','bento-row bento-hero-grid');

  // Left Column: Active Project Configuration
  const projCard=el('div','bento-card');
  const projHead=el('div','bento-card-header');
  projHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/cube.svg" alt=""></div><span class="bento-card-title">Protocol Details</span></div>';
  projCard.append(projHead);

  if(p){
    const f=el('form','bento-input-group');
    const label=el('label','','Project Name'),input=el('input','bento-input');
    input.required=true;input.maxLength=80;input.value=p.name;
    label.append(input);

    const metaRow=el('div','staked-mini-stat');
    metaRow.innerHTML='<span>Network: <strong>'+(CHAINS[p.chainId]||p.chainId)+'</strong></span><span>Contract: <code>'+short(p.contract)+'</code></span>';

    const submit=el('button','track-cta-btn','Save Changes');
    submit.type='submit';
    f.append(label,metaRow,submit);
    f.addEventListener('submit',e=>{
      e.preventDefault();if(!input.value.trim())return;
      p.name=input.value.trim();save();render();toast('Project name updated.');
    });
    projCard.append(f);

    // Delete Zone inside project card
    const delSection=el('div','');
    delSection.style.paddingTop='16px';
    delSection.style.borderTop='1px solid rgba(255,255,255,0.04)';
    delSection.style.marginTop='20px';
    delSection.innerHTML='<div style="font-size:12px;font-weight:700;color:#f87171;margin-bottom:6px">Danger Zone</div><p style="font-size:11px;color:var(--muted);margin-bottom:12px">Remove '+p.name+' and its local transactions from this browser.</p>';
    const delBtn=el('button','pill-tab','Delete Project');
    delBtn.style.color='#f87171';
    delBtn.type='button';
    delBtn.addEventListener('click',()=>{
      if(confirm('Delete '+p.name+' from local workspace?')){
        store.state.projects=store.state.projects.filter(x=>x.id!==p.id);
        store.state.activeId=store.state.projects[0]?.id||null;
        save();toast('Project deleted.');route('#explore');
      }
    });
    delSection.append(delBtn);
    projCard.append(delSection);
  }else{
    projCard.append(el('p','','No active protocol tracked. Select or create one from the sidebar.'));
  }
  grid.append(projCard);

  // Right Column: Backup & Data Management
  const backupCard=el('div','bento-card');
  const bHead=el('div','bento-card-header');
  bHead.innerHTML='<div class="card-header-left"><div class="card-icon-badge"><img src="/assets/icons/database.svg" alt=""></div><span class="bento-card-title">Data Backup &amp; Portability</span></div>';
  backupCard.append(bHead);
  backupCard.append(el('p','','NodePath stores all imported protocol datasets locally in your browser storage. Export JSON files regularly to prevent data loss.'));
  
  const expBtn=el('button','track-cta-btn','Export Workspace Backup (.json)');
  expBtn.type='button';
  expBtn.style.margin='16px 0 20px';
  expBtn.addEventListener('click',backup);
  backupCard.append(expBtn);

  // Inlined Restore Section
  const restoreBox=el('div','');
  restoreBox.style.paddingTop='16px';
  restoreBox.style.borderTop='1px solid rgba(255,255,255,0.04)';
  restoreBox.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px">Restore Backup</div><p style="font-size:11px;color:var(--muted);margin-bottom:12px">Select a previously saved NodePath JSON backup file to overwrite current workspace.</p>';
  
  const rForm=el('form','bento-input-group');
  const rFile=el('input','bento-input');
  rFile.type='file';rFile.accept='.json,application/json';rFile.required=true;
  const rSubmit=el('button','pill-tab','Upload & Restore');
  rSubmit.type='submit';
  rForm.append(rFile,rSubmit);

  rForm.addEventListener('submit',async e=>{
    e.preventDefault();
    try{
      if(rFile.files[0].size>10000000)throw Error('Backup exceeds 10 MB.');
      const next=validateBackup(await rFile.files[0].text());
      store.replace(next);
      dataStates.clear();
      requestNumber++;
      save();
      toast('Workspace successfully restored.');
      route('#overview');
    }catch(err){toast(err.message,{error:true});}
  });
  restoreBox.append(rForm);
  backupCard.append(restoreBox);

  grid.append(backupCard);
  container.append(grid);
  view.append(container);
}

function connectionPanel(p){
  const state=dataStates.get(p.id),c=panel('Data source',state?.loading?'Checking backend · current data stays visible':state?.error||sourceLabel(state));
  c.id='connection-panel';c.className+=' connection-status';
  if(state?.error)c.setAttribute('role','alert');
  if(!state?.loading)c.append(el('p','',state?.reason||'No successful backend response yet.'),btn('Refresh data source',()=>syncProject(p),true));
  return c;
}

function updateSource(p){
  if(active()?.id!==p.id)return;
  const state=dataStates.get(p.id);
  document.querySelector('#source-status').textContent=state?.loading?'Checking backend · current data shown':sourceLabel(state);
  const holder=document.querySelector('#connection-panel');
  if(holder){
    const fresh=connectionPanel(p);
    holder.replaceChildren(...fresh.children);
    if(state?.error)holder.setAttribute('role','alert');else holder.removeAttribute('role');
  }
}

function finishSync(p){
  if(active()?.id!==p.id)return;
  const page=location.hash.slice(1);
  if(['overview','wallets','retention'].includes(page))render();else updateSource(p);
}

async function syncProject(project){
  const token=++requestNumber;
  dataStates.set(project.id,{loading:true,token});
  updateSource(project);
  try{
    const result=await readProject(project);
    if(dataStates.get(project.id)?.token!==token||!store.state.projects.includes(project))return;
    const state={...result,checkedAt:new Date().toISOString()};
    dataStates.set(project.id,state);
    if(result.origin==='backend'||result.origin==='mock'){
      Object.assign(project,result.project);
      save();
    }
    finishSync(project);
  }catch(error){
    if(dataStates.get(project.id)?.token!==token)return;
    dataStates.set(project.id,{error:error.message});
    updateSource(project);
    toast(error.message,{error:true});
  }
}

function render(){
  view.replaceChildren();

  // If projects list has entries but activeId is null, pick the first
  if(!store.state.activeId && store.state.projects.length){
    store.state.activeId=store.state.projects[0].id;
    save();
  }

  const p=active();
  if(p?.id!==lastProject){search='';filter='All';cohortFilter=null;days=30;lastProject=p?.id;}
  if(p&&!dataStates.has(p.id)){dataStates.set(p.id,{loading:true});queueMicrotask(()=>syncProject(p));}

  // Populate project picker
  picker.replaceChildren();
  if(!store.state.projects.length){
    picker.append(el('option','','No tracked projects'));
  }else{
    for(const project of store.state.projects){
      const o=el('option','',project.name);
      o.value=project.id;
      o.selected=project.id===p?.id;
      picker.append(o);
    }
  }

  // Hash routing defaulting: default to #explore
  let hash=location.hash;
  if(!hash || hash==='#' || hash==='#start'){
    hash='#explore';
  }
  const page=hash.slice(1);

  // Topbar and Breadcrumb
  const connection=p?dataStates.get(p.id):null;
  const sourceStatusEl=document.querySelector('#source-status');
  if(sourceStatusEl){
    if(page==='explore') sourceStatusEl.textContent='Public network feed';
    else sourceStatusEl.textContent=p?(connection?.loading?'Checking backend · saved data shown':sourceLabel(connection)):'Local workspace';
  }
  const breadcrumb=document.querySelector('#breadcrumb');
  if(breadcrumb){
    if(page==='explore') breadcrumb.textContent='Ecosystem Explore';
    else breadcrumb.textContent=p?p.name:'My Projects';
  }
  storageStatus();

  // Navigation link visibility & current highlights
  const isExplorePage=page==='explore';
  for(const a of document.querySelectorAll('nav a')){
    const href=a.getAttribute('href');
    if(href==='#explore'){
      if(isExplorePage) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    }else{
      a.hidden=!p;
      if(href===hash) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    }
  }

  // Render view content
  if(page==='explore'){
    explore();
    document.title='Explore Ecosystem · NodePath';
  }else if(page==='create'){
    create();
    document.title='Track a project · NodePath';
  }else if(page==='settings'){
    settings(p);
    document.title=(p?p.name+' · ':'')+'Settings · NodePath';
  }else if(!p){
    explore();
    document.title='Explore Ecosystem · NodePath';
  }else{
    ({overview,wallets,retention,data,settings}[page]||overview)(p);
    document.title=(p?p.name+' · ':'')+'NodePath';
  }
  view.focus({preventScroll:true});
}

picker.addEventListener('change',()=>{
  store.state.activeId=picker.value;
  search='';filter='All';cohortFilter=null;
  save();
  route('#overview');
});

document.querySelector('#new-project')?.addEventListener('click',e=>{
  e.preventDefault();
  route('#create');
});

const workspaceEl=document.querySelector('#app-workspace');
const sidebarToggleBtn=document.querySelector('#sidebar-toggle');
const sidebarMobileBtn=document.querySelector('#sidebar-mobile-toggle');
const sidebarEl=document.querySelector('#app-sidebar');

if(localStorage.getItem('nodepath-sidebar-collapsed')==='true'){
  workspaceEl?.classList.add('sidebar-collapsed');
}

sidebarToggleBtn?.addEventListener('click',()=>{
  const isCollapsed=workspaceEl?.classList.toggle('sidebar-collapsed');
  localStorage.setItem('nodepath-sidebar-collapsed',String(!!isCollapsed));
});

sidebarMobileBtn?.addEventListener('click',()=>{
  sidebarEl?.classList.toggle('mobile-open');
});

window.addEventListener('online',()=>{const p=active();if(p)syncProject(p);});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});

try{
  render();
}catch(err){
  console.error('[NodePath] render() crashed:',err);
  view.innerHTML='<div style="color:#f87171;padding:32px;font-family:monospace;font-size:13px;line-height:1.6"><strong>NodePath failed to start.</strong><br><br>'+err.message+'<br><pre style=\'white-space:pre-wrap;font-size:11px\'>'+err.stack+'</pre><br><button onclick="localStorage.removeItem(\'nodepath-workspace-v1\');location.reload()" style="margin-top:16px;padding:12px 20px;background:var(--cta-bg);color:var(--cta-text);border:0;border-radius:8px;cursor:pointer;font-size:13px">Clear workspace &amp; reload</button></div>';
}
