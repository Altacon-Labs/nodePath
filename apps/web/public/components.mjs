// All content uses textContent. Components return DOM nodes and have no app state.
export function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function icon(name){const img=element('img','icon');img.src='/assets/icons/'+name+'.svg';img.alt='';img.setAttribute('aria-hidden','true');return img;}
export function metricCard(label,value,hint){
  const card=element('article','card metric-card');
  card.append(element('p','metric-title',label),element('strong','metric-value',value));
  if(hint) card.append(element('p','metric-hint',hint));
  return card;
}
export function emptyState({title,description,actionLabel,onAction}){const card=element('div','card empty-state');card.append(icon('wallet'),element('h3','',title),element('p','',description));if(actionLabel){const button=element('button','',actionLabel);button.type='button';button.addEventListener('click',onAction);card.append(button);}return card;}
export function createToasts(region){return function toast(message,{error=false}={}){const node=element('div','toast');node.setAttribute('role',error?'alert':'status');const close=element('button');close.type='button';close.setAttribute('aria-label','Dismiss notification');close.append(icon('x'));close.addEventListener('click',()=>node.remove());node.append(element('p','',message),close);region.append(node);while(region.children.length>3)region.firstElementChild.remove();let timer;const start=()=>{clearTimeout(timer);timer=setTimeout(()=>node.remove(),8000);};node.addEventListener('mouseenter',()=>clearTimeout(timer));node.addEventListener('focusin',()=>clearTimeout(timer));node.addEventListener('mouseleave',start);node.addEventListener('focusout',start);start();};}

const svgNS='http://www.w3.org/2000/svg';
function svgElement(tag,attrs={},text){const node=document.createElementNS(svgNS,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);if(text!==undefined)node.textContent=text;return node;}

// Premium rounded bar chart matching ChromiaX hero visual
export function roundedBarChart(values,{height=220,highlightColor='#ffffff',dimColor='rgba(255,255,255,0.18)'}={}){
  const max=Math.max(...values,1);
  const count=values.length;
  const svg=svgElement('svg',{viewBox:'0 0 460 '+height,width:'100%',height:String(height),style:'overflow:visible;display:block'});
  
  // Defs for sleek gradient glow
  const defs=svgElement('defs');
  const grad=svgElement('linearGradient',{id:'barGrad',x1:'0',y1:'0',x2:'0',y2:'1'});
  grad.append(
    svgElement('stop',{offset:'0%','stop-color':'#ffffff','stop-opacity':'0.95'}),
    svgElement('stop',{offset:'100%','stop-color':'#ffffff','stop-opacity':'0.05'})
  );
  const gradDim=svgElement('linearGradient',{id:'barGradDim',x1:'0',y1:'0',x2:'0',y2:'1'});
  gradDim.append(
    svgElement('stop',{offset:'0%','stop-color':'#64748b','stop-opacity':'0.5'}),
    svgElement('stop',{offset:'100%','stop-color':'#64748b','stop-opacity':'0.04'})
  );
  defs.append(grad,gradDim);
  svg.append(defs);

  const barWidth=Math.max(10,Math.min(22,Math.floor(380/count)));
  const gap=Math.floor((440-count*barWidth)/(count+1));
  
  values.forEach((v,i)=>{
    const barH=Math.max(16,Math.round((v/max)*(height-30)));
    const x=gap+i*(barWidth+gap);
    const y=height-barH;
    const isHighlight=i>=count-3; // last few are brighter
    const rect=svgElement('rect',{
      x:String(x),
      y:String(y),
      width:String(barWidth),
      height:String(barH),
      rx:String(Math.floor(barWidth/2)),
      ry:String(Math.floor(barWidth/2)),
      fill:isHighlight?'url(#barGrad)':'url(#barGradDim)',
      style:'transition:height 0.4s ease'
    });
    svg.append(rect);
  });
  return svg;
}

// Sparkline spline with glowing dots matching total staked card
export function sparklineChart(values,{height=70,width=280,lineColor='#818cf8',glowColor='rgba(129,140,248,0.2)'}={}){
  const min=Math.min(...values);
  const max=Math.max(...values,min+1);
  const count=values.length;
  const svg=svgElement('svg',{viewBox:'0 0 '+width+' '+height,width:'100%',height:String(height),style:'overflow:visible;display:block'});
  
  const stepX=width/(count-1);
  const points=values.map((v,i)=>{
    const x=i*stepX;
    const y=height-14-((v-min)/(max-min))*(height-28);
    return [x,y];
  });

  // Bezier curve smoothing
  let d='M '+points[0][0].toFixed(1)+','+points[0][1].toFixed(1);
  for(let i=0;i<points.length-1;i++){
    const curr=points[i];
    const next=points[i+1];
    const mx=(curr[0]+next[0])/2;
    d+=' C '+mx.toFixed(1)+','+curr[1].toFixed(1)+' '+mx.toFixed(1)+','+next[1].toFixed(1)+' '+next[0].toFixed(1)+','+next[1].toFixed(1);
  }

  // Soft fill under curve
  const fillPath=d+' L '+width+','+height+' L 0,'+height+' Z';
  const defs=svgElement('defs');
  const fillGrad=svgElement('linearGradient',{id:'sparkFill',x1:'0',y1:'0',x2:'0',y2:'1'});
  fillGrad.append(
    svgElement('stop',{offset:'0%','stop-color':lineColor,'stop-opacity':'0.25'}),
    svgElement('stop',{offset:'100%','stop-color':lineColor,'stop-opacity':'0.0'})
  );
  defs.append(fillGrad);
  svg.append(defs);

  svg.append(svgElement('path',{d:fillPath,fill:'url(#sparkFill)'}));
  svg.append(svgElement('path',{d,fill:'none',stroke:lineColor,'stroke-width':'2','stroke-linecap':'round'}));

  // Dots with glowing ring on points
  points.forEach(([x,y],idx)=>{
    if(idx%2===0||idx===points.length-1){
      svg.append(svgElement('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:'3.5',fill:lineColor,stroke:'#0b0e14','stroke-width':'1.5'}));
    }
  });

  return svg;
}

// Needle/needle histogram for TPS
export function tpsHistogram(values,{height=70,width=300,barColor='rgba(255,255,255,0.45)'}={}){
  const max=Math.max(...values,1);
  const count=values.length;
  const svg=svgElement('svg',{viewBox:'0 0 '+width+' '+height,width:'100%',height:String(height),style:'overflow:visible;display:block'});
  const barW=2;
  const gap=(width-count*barW)/(count-1);
  values.forEach((v,i)=>{
    const h=Math.max(4,Math.round((v/max)*(height-12)));
    const x=i*(barW+gap);
    const y=height-h;
    const isLast=i>=count-5;
    svg.append(svgElement('rect',{
      x:x.toFixed(1),
      y:y.toFixed(1),
      width:String(barW),
      height:String(h),
      rx:'1',
      fill:isLast?'#38bdf8':barColor,
      opacity:isLast?'1':'0.5'
    }));
  });
  return svg;
}

// Validator world dot map
export function worldDotMap(validators=[]){
  const wrap=element('div','world-map-wrap');
  const svg=svgElement('svg',{viewBox:'0 0 760 280',width:'100%',height:'100%',style:'display:block'});
  
  // Matrix dot grid
  const cols=46,rows=18;
  const dotGapX=760/cols;
  const dotGapY=280/rows;

  // Approximate land shape filter
  const isLand=(c,r)=>{
    if(r<2||r>15) return false;
    // Americas
    if(c>=6&&c<=16&&r>=3&&r<=8) return true; // NA
    if(c>=11&&c<=17&&r>=9&&r<=14) return true; // SA
    // Europe & Africa
    if(c>=20&&c<=27&&r>=3&&r<=6) return true; // EU
    if(c>=20&&c<=28&&r>=7&&r<=13) return true; // AF
    // Asia & Oceania
    if(c>=27&&c<=40&&r>=3&&r<=9) return true; // ASIA
    if(c>=35&&c<=42&&r>=11&&r<=14) return true; // AUS
    return (c%4===0 && r%3===0 && c>4 && c<42); // ambient outer dots
  };

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const land=isLand(c,r);
      svg.append(svgElement('circle',{
        cx:(c*dotGapX+dotGapX/2).toFixed(1),
        cy:(r*dotGapY+dotGapY/2).toFixed(1),
        r:land?'2':'1.2',
        fill:land?'#2a3649':'#131c28',
        opacity:land?'0.85':'0.4'
      }));
    }
  }

  // Plot validator node clusters
  const clusters=[
    {x:180,y:90,name:'North America',count:validators[0]?.count||4120,color:'#38bdf8'},
    {x:410,y:80,name:'Europe',count:validators[1]?.count||3890,color:'#4ade80'},
    {x:610,y:115,name:'Asia Pacific',count:validators[2]?.count||1640,color:'#a78bfa'},
    {x:240,y:200,name:'South America',count:validators[3]?.count||310,color:'#f59e0b'},
    {x:635,y:210,name:'Oceania',count:validators[4]?.count||280,color:'#38bdf8'}
  ];

  clusters.forEach(cl=>{
    // Pulsing outer ripple
    svg.append(svgElement('circle',{
      cx:String(cl.x),
      cy:String(cl.y),
      r:'18',
      fill:cl.color,
      opacity:'0.12'
    }));
    // Glow ring
    svg.append(svgElement('circle',{
      cx:String(cl.x),
      cy:String(cl.y),
      r:'11',
      fill:cl.color,
      opacity:'0.25',
      stroke:cl.color,
      'stroke-width':'1'
    }));
    // Badge pill background
    const bgRect=svgElement('rect',{
      x:String(cl.x-16),
      y:String(cl.y-10),
      width:'32',
      height:'20',
      rx:'10',
      fill:'#0d1420',
      stroke:cl.color,
      'stroke-width':'1.5'
    });
    const text=svgElement('text',{
      x:String(cl.x),
      y:String(cl.y+4),
      fill:'#ffffff',
      'font-size':'9',
      'font-weight':'700',
      'text-anchor':'middle',
      'font-family':'Manrope'
    },cl.count>=1000?(cl.count/1000).toFixed(1)+'k':String(cl.count));
    svg.append(bgRect,text);
  });

  wrap.append(svg);
  return wrap;
}

export function activityChart(values,options={}){
  const svg=svgElement('svg',{viewBox:'0 0 640 264',role:'img','aria-label':(options.ariaLabel||'Daily activity chart')+'. Values range from '+Math.min(...values)+' to '+Math.max(...values)+'.'});
  svg.append(svgElement('title',{},options.title||'Daily active wallets'));
  const maxVal=Math.max(1,...values);
  const ceiling=options.ceiling||Math.ceil(maxVal/4)*4||4;
  const left=50,top=16,width=570,height=200;
  for(const step of [0,ceiling/4,ceiling/2,ceiling*3/4,ceiling]){
    const y=top+height-step/ceiling*height;
    svg.append(
      svgElement('line',{x1:left,x2:624,y1:y,y2:y,stroke:'var(--chart-grid)','stroke-width':1}),
      svgElement('text',{x:4,y:y+4,fill:'var(--muted)','font-size':10},options.formatValue?options.formatValue(step):step.toLocaleString())
    );
  }
  const points=values.map((value,index)=>[left+index/Math.max(1,values.length-1)*width,top+height-Math.min(ceiling,value)/ceiling*height]);
  const line=points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' ');
  const lineColor=options.color||'var(--chart-line)';
  const fillColor=options.fillColor||'var(--chart-fill)';
  svg.append(svgElement('path',{d:line+' L624,216 L'+left+',216 Z',fill:fillColor}));
  svg.append(svgElement('path',{d:line,fill:'none',stroke:lineColor,'stroke-width':2,'stroke-linejoin':'round'}));
  for(const [x,label] of [[left,options.startLabel||'Day 1'],[left+width/2,options.midLabel||'Day '+Math.ceil(values.length/2)],[left+width-30,options.endLabel||'Day '+values.length]]){
    svg.append(svgElement('text',{x,y:248,fill:'var(--muted)','font-size':10},label));
  }
  return svg;
}

export function cohortTable(rows){const table=element('table');const caption=element('caption','','Cohort retention percentages');caption.className='sr-only';table.append(caption);const head=element('thead'),headers=element('tr');for(const label of ['Cohort','Wallets','Week 0','Week 1','Week 2','Week 3','Week 4']){const th=element('th','',label);th.scope='col';headers.append(th);}head.append(headers);table.append(head);const body=element('tbody');for(const row of rows){const tr=element('tr');const name=element('th','cohort-name',row.label);name.scope='row';tr.append(name,element('td','',String(row.wallets)));for(const value of row.retention){const cell=element('td','heat',value===null?'Not available':value+'%');if(value!==null)cell.style.setProperty('--heat-opacity',String(0.12+value/150));tr.append(cell);}body.append(tr);}table.append(body);return table;}
