(() => {
  'use strict';
  const {projects,themes} = window.VKFData;
  const icon = window.VKFIcons;
  const config = window.VKFPayments;
  const main = document.querySelector('#main');
  const e = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
  const lakh = value => `₹${Number((value/100000).toFixed(2))} lakh`;
  const code = p => `VKF-${String(p.id).padStart(2,'0')}`;
  const projectPath = p => `#project/${p.id}`;
  const photo = p => `assets/projects/project-${String(p.id).padStart(2,'0')}.webp`;
  const themeFor = p => themes.find(t=>t.id===p.theme);
  let state={theme:'all',search:'',sort:'recommended'};
  let amounts={};
  let previousRoute='';
  let toastTimer;
  const splitAllocation = value => {
    const cents=Math.round(Number(value)*100);
    const coord=Math.round(cents*.1),ops=Math.round(cents*.1);
    return [(cents-coord-ops)/100,coord/100,ops/100];
  };
  const validAmount = value => Number.isFinite(Number(value)) && Number(value)>=1 && Number(value)<=100000000 && Math.abs(Number(value)*100-Math.round(Number(value)*100))<.00001;
  const plannedSplit = () => '<div class="allocation-bar" aria-label="80% project delivery, 10% coordination, 10% VKF shared operations"><span></span><span></span><span></span></div>';
  const allocationRows = amount => {
    const a=splitAllocation(amount);
    return `<div class="mini-allocation"><span>Project delivery · 80%</span><strong>${money(a[0])}</strong></div><div class="mini-allocation"><span>Coordination · 10%</span><strong>${money(a[1])}</strong></div><div class="mini-allocation"><span>VKF shared operations · 10%</span><strong>${money(a[2])}</strong></div>`;
  };
  const mail = (subject,body) => `mailto:contact@vkfoundations.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  function toast(text){
    const t=document.querySelector('#toast');t.textContent=text;t.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2600);
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);toast('Copied to clipboard');}
    catch{const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const copied=document.execCommand('copy');input.remove();toast(copied?'Copied to clipboard':`Please copy: ${text}`);}
  }
  function journey(current){return `<div class="journey" aria-label="Partnership steps"><span class="${current===1?'active':''}">01 Choose a project</span><b>›</b><span class="${current===2?'active':''}">02 Review the plan</span><b>›</b><span class="${current===3?'active':''}">03 Payment</span></div>`;}
  function renderHome(){
    document.title='VKF | Project Partnerships';
    main.innerHTML=`
      <div class="wrap hero" id="home">
        <div class="hero-copy">
          <div class="eyebrow">Karnataka · Project partnerships</div>
          <h1>Build opportunity.<br><em>Back a project.</em></h1>
          <p class="hero-intro">Put your contribution behind a practical plan. Explore projects that equip women, growers, artisans and young people to create lasting local opportunity.</p>
          <div class="hero-actions"><a class="button" href="#projects">Explore projects ${icon('arrow')}</a><a class="text-link" href="#approach">How it works <span aria-hidden="true">${icon('external')}</span></a></div>
          <div class="hero-facts"><div><strong>50</strong><span>Project options</span></div><div><strong>5</strong><span>Areas of opportunity</span></div><div><strong>6 months</strong><span>Proposed pilot period</span></div></div>
        </div>
        <div class="hero-visual" aria-label="Illustrative project opportunities">
          <div class="visual-stamp">${icon('leaf')}LOCAL ROOTS<br>LASTING VALUE</div>
          <a class="visual-main" href="#project/1"><img src="assets/projects/project-01.webp" alt="Jute bags and products" fetchpriority="high"><div class="visual-caption"><small>Enterprise in the making</small><strong>Skills. Products.<br>New possibilities.</strong></div></a>
          <a class="visual-tile visual-tile-top" href="#project/3"><img src="assets/projects/project-03.webp" alt="Computer learning in a shared digital lab"><span class="visual-label">Digital opportunity ${icon('external')}</span></a>
          <a class="visual-tile visual-tile-bottom" href="#project/8"><img src="assets/projects/project-08.webp" alt="Areca leaf plates and bowls"><span class="visual-label">Local enterprise ${icon('external')}</span></a>
        </div>
      </div>
      <section class="promise-strip" aria-label="Partnership principles"><div class="wrap promise-inner"><p class="promise-title">A clear purpose.<br>A practical route to delivery.</p><div class="promise-item">${icon('box')}Defined project scope</div><div class="promise-item">${icon('chart')}Transparent fund allocation</div><div class="promise-item">${icon('people')}VKF-led coordination</div></div></section>
      <section class="wrap portfolio" id="projects" aria-labelledby="projects-title">
        <div class="section-heading"><div><div class="eyebrow">The project portfolio</div><h2 id="projects-title" tabindex="-1">Find a project you believe in.</h2></div><p>Choose your area of interest. Open any project to see its proposed scope, pilot budget, fund utilisation and planned results.</p></div>
        <div class="catalogue-controls"><div class="search-sort"><label class="search-box">${icon('search')}<input id="project-search" type="search" placeholder="Search projects, skills or communities…" aria-label="Search projects" value="${e(state.search)}"></label><label class="sort-wrap">Sort projects<select id="project-sort"><option value="recommended">Portfolio order</option><option value="budget-low">Pilot budget: low to high</option><option value="budget-high">Pilot budget: high to low</option><option value="name">Project name: A–Z</option></select></label></div><div class="theme-filters" aria-label="Filter by project theme"><button class="filter" data-theme="all" aria-pressed="${state.theme==='all'}">All projects <span>50</span></button>${themes.map(t=>`<button class="filter" data-theme="${t.id}" aria-pressed="${state.theme===t.id}">${icon(t.icon)}${e(t.label)} <span>${projects.filter(p=>p.theme===t.id).length}</span></button>`).join('')}</div></div>
        <div class="results-line"><span id="result-count" role="status" aria-live="polite"></span><span>Proposed pilot budgets · INR</span><button id="reset-filters" hidden>Clear filters</button></div>
        <div class="project-grid" id="project-grid"></div>
        <p class="catalogue-note">These are proposed pilot opportunities. Budgets and participant numbers are planning estimates; the final location, delivery arrangements and itemised costs will be agreed before commitment. Existing premises and basic utilities are assumed. Images illustrate project concepts.</p>
      </section>
      <section class="approach" id="approach" aria-labelledby="approach-title"><div class="wrap"><div class="section-heading"><div><div class="eyebrow">How partnership works</div><h2 id="approach-title" tabindex="-1">Your purpose. A plan. A next step.</h2></div><p>A project partnership brings the contribution, local delivery and progress review into one agreed plan.</p></div><div class="steps"><article class="step"><span class="step-num">01 / CHOOSE</span><h3>Start with a project.</h3><p>Pick the opportunity that fits your interests. Review the intended participants, funded inputs and proposed results.</p></article><article class="step"><span class="step-num">02 / ALIGN & SUPPORT</span><h3>Make the plan concrete.</h3><p>Confirm the project scope with VKF, choose your contribution and use VKF’s confirmed payment instructions when available.</p></article><article class="step"><span class="step-num">03 / REVIEW & REPEAT</span><h3>Build on what works.</h3><p>Agree progress reporting and review pilot evidence. Expand or renew support when delivery and continued demand justify the next cycle.</p></article></div></div></section>
      <section class="wrap allocation-band" aria-labelledby="allocation-title"><div><div class="eyebrow">Every contribution has a job</div><h2 id="allocation-title">Fund delivery.<br>Enable the work behind it.</h2><p>The proposed pilot allocation supports project inputs as well as the coordination and shared operations needed to deliver them.</p></div><div>${plannedSplit()}<div class="allocation-row"><span><i></i>Project delivery</span><strong>80%</strong></div><div class="allocation-row"><span><i></i>Coordination & monitoring</span><strong>10%</strong></div><div class="allocation-row"><span><i></i>VKF shared operations</span><strong>10%</strong></div><p class="allocation-help">A proposed planning allocation, subject to the final agreed project budget. Each project page shows the rupee amounts.</p></div></section>
      <section class="wrap contact-section" id="contact"><div><div class="eyebrow">Let’s build the next opportunity</div><h2 tabindex="-1">Have a project or a place in mind?</h2><p>Talk with VKF about the scope, location and reporting you would like to support, or explore a portfolio partnership across several projects.</p></div><div class="contact-actions"><a class="button" href="mailto:contact@vkfoundations.org?subject=VKF%20project%20partnership">Connect with VKF <span aria-hidden="true">${icon('external')}</span></a><a class="button button-light" href="tel:+918041685705">Call 080 41685705</a></div></section>`;
    document.querySelector('#project-sort').value=state.sort;
    document.querySelector('#project-search').addEventListener('input',ev=>{state.search=ev.target.value;renderCards();});
    document.querySelector('#project-sort').addEventListener('change',ev=>{state.sort=ev.target.value;renderCards();});
    document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{state.theme=button.dataset.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===state.theme));renderCards();}));
    document.querySelector('#reset-filters').addEventListener('click',resetFilters);
    renderCards();
  }
  function resetFilters(){state={theme:'all',search:'',sort:'recommended'};document.querySelector('#project-search').value='';document.querySelector('#project-sort').value='recommended';document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme==='all'));renderCards();}
  function renderCards(){
    const terms=state.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let matches=projects.filter(p=>(state.theme==='all'||p.theme===state.theme)&&terms.every(term=>`${p.project} ${p.title} ${p.cause} ${p.unit} ${p.funds} ${themeFor(p).label} ${code(p)}`.toLowerCase().includes(term)));
    if(state.sort==='budget-low')matches.sort((a,b)=>a.ask-b.ask||a.id-b.id);
    if(state.sort==='budget-high')matches.sort((a,b)=>b.ask-a.ask||a.id-b.id);
    if(state.sort==='name')matches.sort((a,b)=>a.title.localeCompare(b.title));
    document.querySelector('#result-count').innerHTML=`<strong>${matches.length}</strong> of 50 projects${state.theme!=='all'?` · ${e(themes.find(t=>t.id===state.theme).label)}`:''}`;
    document.querySelector('#reset-filters').hidden=state.theme==='all'&&!state.search&&state.sort==='recommended';
    document.querySelector('#project-grid').innerHTML=matches.length?matches.map(p=>`<a class="project-card" href="${projectPath(p)}" aria-label="View ${e(p.project)}, proposed pilot budget ${e(lakh(p.ask))}"><div class="card-media"><img src="${photo(p)}" alt="${e(p.imageAlt)}" loading="lazy" width="320" height="200"><span class="card-tag">${e(themeFor(p).label)}</span></div><div class="card-content"><div class="card-heading"><div class="card-icon">${icon(p.icon)}</div><div><h3>${e(p.title)}</h3><p class="card-id">PROJECT ${String(p.id).padStart(2,'0')}</p></div></div><p class="card-cause">${e(p.cause)}</p><div class="card-bottom"><div><small>Proposed pilot budget</small><strong>${lakh(p.ask)}</strong></div><span class="card-action">View project ${icon('arrow')}</span></div></div></a>`).join(''):`<div class="empty-state"><h3>No projects found.</h3><p>Try a different keyword or explore all five themes.</p><button class="button button-light" id="empty-reset">Show all projects</button></div>`;
    document.querySelector('#empty-reset')?.addEventListener('click',resetFilters);
  }
  function renderProject(p){
    document.title=`${p.title} | VKF Project Partnerships`;
    const theme=themeFor(p),amount=amounts[p.id]||5000;
    const next=projects[(p.id)%projects.length];
    main.innerHTML=`<div class="wrap"><div class="page-top"><a class="back-link" href="#projects">${icon('back')}All projects</a>${journey(2)}</div><div class="detail-layout"><article class="detail-content"><div class="detail-topline"><span class="tag">${icon(theme.icon)}${e(theme.label)}</span><span class="project-code">${code(p)} · PROPOSED PILOT</span></div><h1 tabindex="-1">${e(p.project)}</h1><p class="detail-lede">${e(p.cause)}.</p><figure class="detail-visual"><img src="${photo(p)}" alt="${e(p.imageAlt)}" width="760" height="450"><figcaption>Illustrative project image</figcaption></figure><div class="detail-facts"><div><div class="detail-fact-label">${icon('people')}Planned pilot reach</div><p>${e(p.unit)}</p></div><div><div class="detail-fact-label">${icon('clock')}Pilot period & location</div><p>${p.months} months · Karnataka<br>Local site to be agreed with VKF</p></div></div><section class="detail-section"><h2>What your contribution enables</h2><p>${e(p.funds)}.</p><ul class="funds-list"><li>${icon('check')}Shared assets, training or access for the agreed group</li><li>${icon('check')}Delivery coordination and monitoring</li><li>${icon('check')}A defined pilot and documented progress</li><li>${icon('check')}A review before renewal or expansion</li></ul></section><section class="detail-section"><h2>How the pilot budget will be used</h2><p>The proposed full-pilot budget is ${lakh(p.ask)}. Contributions support this agreed project allocation.</p><div class="project-budget">${plannedSplit()}<div class="budget-line"><div>Project delivery<small>Project-specific equipment, inputs, training and delivery activities.</small></div><b>80%</b><strong>${money(p.direct)}</strong></div><div class="budget-line"><div>Coordination & monitoring<small>Participant mobilisation, implementation coordination and progress tracking.</small></div><b>10%</b><strong>${money(p.coordination)}</strong></div><div class="budget-line"><div>VKF shared operations<small>Shared programme staff, administration, finance and organisational support.</small></div><b>10%</b><strong>${money(p.opex)}</strong></div><div class="budget-line budget-total"><div>Total proposed pilot budget</div><b>100%</b><strong>${money(p.ask)}</strong></div></div></section><section class="detail-section"><h2>Planned results & reporting</h2><div class="result-box">${e(p.results)}.</div><p style="margin-top:13px">These are proposed pilot targets. Reporting milestones and evidence will be agreed in the final project plan.</p></section><section class="detail-section"><h2>Preparing for delivery</h2><p>${e(p.launch)}.</p></section><section class="detail-section"><h2>How the next cycle can work</h2><p>${e(p.renewal)}.</p><p style="margin-top:11px">The next cycle depends on actual utilisation, operating costs and demand. Any reinvestment or recovery arrangement will be agreed before launch; donations do not carry a financial return.</p></section><p class="catalogue-note">This is a proposed pilot, with estimated costs and participant targets. Final itemised costs, site arrangements and required approvals will be confirmed before commitment. The budget assumes existing premises and basic utilities.</p><div class="detail-bottom-links"><a href="#projects">${icon('back')}Explore the portfolio</a><a href="${projectPath(next)}">Next project ${icon('arrow')}</a></div></article><aside class="details-summary" aria-label="Choose your contribution"><div class="summary-inner"><p class="summary-kicker">Total proposed pilot budget</p><div class="summary-budget">${lakh(p.ask)}</div><p class="summary-description">Support a share of this pilot or discuss the full project with VKF.</p><div class="summary-divider"></div><form id="contribution-form" novalidate><label class="amount-label" for="contribution-amount">Choose your contribution</label><div class="amount-presets">${[1000,5000,10000,25000].map(v=>`<button type="button" class="amount-button" data-amount="${v}" aria-pressed="${amount===v}">${money(v)}</button>`).join('')}</div><div class="amount-input"><span aria-hidden="true">₹</span><input id="contribution-amount" name="amount" type="number" inputmode="decimal" min="1" max="100000000" step="0.01" value="${amount}" aria-describedby="amount-help amount-error" autocomplete="off"></div><p class="input-help" id="amount-help">Enter any amount in INR, from ₹1.</p><button type="button" class="full-pilot" id="full-pilot">Choose the full pilot budget · ${lakh(p.ask)}</button><div class="your-allocation"><h3>Proposed use of your contribution</h3><div id="live-allocation">${allocationRows(amount)}</div></div><p class="input-error" id="amount-error" aria-live="polite"></p><button class="button button-wide" type="submit">Proceed to payment ${icon('arrow')}</button><p class="summary-note">Project scope and payment instructions must be confirmed with VKF before transfer.</p></form></div><div class="summary-foot">Planning a larger partnership?<br><a href="${mail(`Partnership discussion: ${code(p)} — ${p.project}`,`Hello VKF,\n\nI would like to discuss ${code(p)}: ${p.project}.\n\nPlease share the final scope, itemised budget and next steps.\n\nName / organisation:\nContact number:\nPreferred location:\n`)}">Discuss this project with VKF ${icon('external')}</a></div></aside></div></div>`;
    const input=document.querySelector('#contribution-amount');
    const update=()=>{
      const value=Number(input.value),valid=input.value.trim()!==''&&validAmount(value);
      if(valid)amounts[p.id]=value;
      document.querySelectorAll('[data-amount]').forEach(b=>b.setAttribute('aria-pressed',valid&&Number(b.dataset.amount)===value));
      document.querySelector('#live-allocation').innerHTML=valid?allocationRows(value):'<p class="input-help">Enter an amount to see its proposed allocation.</p>';
      input.removeAttribute('aria-invalid');document.querySelector('#amount-error').textContent='';
    };
    input.addEventListener('input',update);
    document.querySelectorAll('[data-amount]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.amount;update();}));
    document.querySelector('#full-pilot').addEventListener('click',()=>{input.value=p.ask;update();});
    document.querySelector('#contribution-form').addEventListener('submit',ev=>{ev.preventDefault();const value=Number(input.value);if(!input.value.trim()||!validAmount(value)){input.setAttribute('aria-invalid','true');document.querySelector('#amount-error').textContent='Enter an amount from ₹1 to ₹10 crore, with up to two decimal places.';input.focus();return;}amounts[p.id]=value;location.hash=`payment/${p.id}?amount=${encodeURIComponent(value)}`;});
  }
  function paymentStatus(){
    const bank=config.bank;
    const bankReady=!!(config.verified===true&&bank&&['beneficiary','bankName','accountNumber','ifsc'].every(key=>typeof bank[key]==='string'&&bank[key].trim()));
    const qrReady=!!(config.verified===true&&config.qrImage&&config.qrPayeeName&&/^(assets\/|https:\/\/)/.test(config.qrImage));
    return {bankReady,qrReady,ready:bankReady||qrReady};
  }
  function renderPayment(p,query){
    const params=new URLSearchParams(query),raw=params.get('amount');
    if(raw===null||!validAmount(raw)){location.replace(`${location.pathname}${location.search}${projectPath(p)}`);return;}
    const amount=Number(raw);amounts[p.id]=amount;
    const status=paymentStatus();
    document.title=`Support ${p.title} | VKF Payment`;
    const requestMail=mail(`Payment instructions requested: ${code(p)}`,`Hello VKF,\n\nI would like to support the following proposed project:\n${code(p)}: ${p.project}\nIntended contribution: ${money(amount)}\n\nPlease confirm the project scope and send VKF's institutional QR or bank details.\n\nName / organisation:\nContact number:\n`);
    const acknowledgementMail=mail(`Transfer reference: ${code(p)}`,`Hello VKF,\n\nProject: ${code(p)} — ${p.project}\nTransfer amount: ${money(amount)}\n\nBank / UPI transfer reference (UTR):\nTransfer date:\nName / organisation:\nReceipt email:\n\nPlease reconcile this transfer and confirm the project allocation.\n`);
    const pendingQR=`<div class="payment-awaiting"><div class="awaiting-symbol">${icon('clock')}</div><span class="tag">Payment instructions pending</span><h2>VKF’s payment QR will appear here.</h2><p>The QR code will be published once VKF confirms its receiving details. Contact the team to confirm the project and request payment instructions.</p><a class="button button-light" href="${requestMail}">Request payment instructions <span aria-hidden="true">${icon('external')}</span></a></div>`;
    const qr=status.qrReady?`<div class="payment-awaiting"><h2>Scan with your UPI app</h2><img class="qr-image" src="${e(config.qrImage)}" alt="VKF payment QR code"><p class="qr-payee">Payee: ${e(config.qrPayeeName)}</p><p>Contribution: <strong>${money(amount)}</strong><br>Project reference: <strong>${code(p)}</strong><br>Check the payee name and amount in your payment app before confirming.</p></div>`:pendingQR;
    const fields=[['Beneficiary name','beneficiary'],['Bank','bankName'],['Account number','accountNumber'],['IFSC','ifsc'],['Branch','branch']];
    const bank=`<h2 style="font-size:18px;margin-bottom:9px">Bank transfer details</h2><p class="summary-description">${status.bankReady?'Use NEFT, RTGS or IMPS through your bank. Include the project reference where your bank supports a transfer note.':'VKF’s confirmed institutional account will be published here.'}</p><div class="bank-fields">${fields.map(([label,key])=>`<div class="bank-field"><div><small>${label}</small><strong>${status.bankReady?e(config.bank[key]||'—'):'Not yet published'}</strong></div>${status.bankReady&&config.bank[key]?`<button class="copy-bank" data-field="${key}" aria-label="Copy ${label.toLowerCase()}">${icon('copy')}</button>`:''}</div>`).join('')}</div>${!status.bankReady?`<div class="pending-note">Payment details are pending confirmation. <a class="text-link" href="${requestMail}">Request instructions from VKF ${icon('external')}</a></div>`:''}`;
    main.innerHTML=`<div class="wrap"><div class="page-top"><a class="back-link" href="${projectPath(p)}">${icon('back')}Back to project</a>${journey(3)}</div><div class="payment-heading"><div class="eyebrow">A contribution with a clear purpose</div><h1 tabindex="-1">Support your chosen project.</h1><p>Review the project and amount, then use VKF’s confirmed payment instructions.</p></div><div class="payment-layout"><div><div class="payment-main"><div class="payment-tabs" role="tablist" aria-label="Payment method"><button class="payment-tab" role="tab" id="qr-tab" aria-selected="true" aria-controls="qr-panel" tabindex="0">${icon('qr')}UPI / QR code</button><button class="payment-tab" role="tab" id="bank-tab" aria-selected="false" aria-controls="bank-panel" tabindex="-1">${icon('bank')}Bank transfer</button></div><div class="payment-panel" id="qr-panel" role="tabpanel" aria-labelledby="qr-tab">${qr}</div><div class="payment-panel" id="bank-panel" role="tabpanel" aria-labelledby="bank-tab" hidden>${bank}</div><div class="payment-followup"><h3>${status.ready?'After you make a transfer':'Your next step'}</h3><p>${status.ready?`<a href="${acknowledgementMail}">Email VKF your transfer reference ${icon('external')}</a> with the project code, amount and receipt details. Receipt and allocation can be confirmed after VKF reconciles the transfer.`:`Confirm this project’s final scope with VKF and request its official payment instructions. No payment has been taken through this page.`}</p></div></div><p class="payment-privacy">${icon('shield')}This website does not collect card details or banking credentials. Transfers are made through your own bank or payment app. Payment status is confirmed by VKF after reconciliation.</p></div><aside class="payment-summary" aria-label="Your project and contribution"><h2>Your project partnership</h2><div class="payment-project"><img src="${photo(p)}" alt="${e(p.imageAlt)}" width="64" height="64"><div><small>PROJECT ${String(p.id).padStart(2,'0')}</small><h3>${e(p.title)}</h3></div></div><div class="payment-total"><span>Selected contribution</span><strong>${money(amount)}</strong></div>${plannedSplit()}${allocationRows(amount)}<div class="project-ref"><small>Project reference · include with your transfer</small><div class="ref-code">${code(p)}<button class="copy-button" id="copy-reference" aria-label="Copy project reference">${icon('copy')}</button></div></div><a href="${projectPath(p)}">Change contribution or review project</a><p class="input-help" style="margin-top:14px">Proposed planning allocation. Final project scope and budget to be agreed with VKF.</p></aside></div></div>`;
    const tabs=Array.from(document.querySelectorAll('[role=tab]'));
    const activate=tab=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;document.querySelector(`#${t.getAttribute('aria-controls')}`).hidden=!selected;});};
    tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',ev=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const next=ev.key==='Home'?tabs[0]:ev.key==='End'?tabs.at(-1):tabs[(index+1)%tabs.length];activate(next);next.focus();}});});
    document.querySelector('#copy-reference').addEventListener('click',()=>copyText(code(p)));
    document.querySelectorAll('.copy-bank').forEach(b=>b.addEventListener('click',()=>copyText(config.bank[b.dataset.field])));
    if(!status.qrReady&&status.bankReady)activate(tabs[1]);
  }
  function route(){
    const hash=location.hash.slice(1)||'home';
    const [path,query='']=hash.split('?');
    const match=path.match(/^(project|payment)\/(\d+)$/);
    const home=['home','projects','approach','contact','main'].includes(path);
    document.querySelector('#site-nav').classList.remove('open');
    document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
    if(home){if(!['home','projects','approach','contact','main'].includes(previousRoute))renderHome();
      requestAnimationFrame(()=>{const target=document.getElementById(path==='main'?'home':path);target?.scrollIntoView({behavior:'instant',block:'start'});if(path!=='home')target?.querySelector('h2')?.focus({preventScroll:true});});
    }else if(match){
      const p=projects.find(p=>p.id===Number(match[2]));
      if(!p){notFound();}else if(match[1]==='project'){renderProject(p);}else{renderPayment(p,query);}
      window.scrollTo({top:0,behavior:'instant'});main.querySelector('h1')?.focus({preventScroll:true});
    }else{notFound();}
    previousRoute=path;
  }
  function notFound(){document.title='Project not found | VKF';main.innerHTML='<section class="wrap not-found"><h1 tabindex="-1">Let’s find your project.</h1><p>This project link is unavailable. Explore the current portfolio.</p><a class="button" href="#projects">Explore all projects</a></section>';window.scrollTo(0,0);main.querySelector('h1').focus();}
  document.querySelector('.menu-toggle').addEventListener('click',ev=>{const button=ev.currentTarget;const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.querySelector('#site-nav').classList.toggle('open',open);});
  window.addEventListener('hashchange',route);
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){document.querySelector('#site-nav').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');}});
  route();
})();
