var Re=Object.defineProperty;var Fe=(e,t)=>{for(var r in t)Re(e,r,{get:t[r],enumerable:!0})};var K=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,r){this.container=t,this.getCtx=r,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let r=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let a=this.routes.get(r),i=this.categories.find(o=>o.id===r);if(!a&&i&&i.type==="iframe"&&(a={id:i.id,name:i.name,mount:o=>{o.innerHTML=`
            <iframe
              src="${i.id==="cad-kalkulator"?"kalkulator_cad.html":i.path}"
              style="width: 100%; height: calc(100vh - 150px); border: 2px solid #e2e8f0; border-radius: 12px; display: block; background: white;"
              title="${i.name}"
              allow="clipboard-write"
            ></iframe>
          `}}),a){this.currentView=a;let o=document.createElement("button");o.className="back-button",o.textContent="Wszystkie kategorie",o.onclick=()=>{window.location.hash="#/"},this.container.appendChild(o);let l=document.createElement("div");l.className="category-content",l.id="current-category",this.container.appendChild(l),a.mount(l,this.getCtx())}else this.renderHome()}renderHome(){let t={};this.categories.forEach(a=>{let i=a.group||"Pozosta\u0142e";t[i]||(t[i]=[]),t[i].push(a)});let r="";for(let[a,i]of Object.entries(t))r+=`
        <h2 class="category-group-title">${a}</h2>
        <div class="category-grid">
          ${i.map(o=>`
            <div class="category-card ${o.implemented?"":"coming-soon"}"
                 ${o.implemented?`onclick="window.location.hash='#/${o.id}'"`:""}>
              <div class="category-icon">${o.icon}</div>
              <div class="category-name">${o.name}</div>
              ${o.implemented?"":'<div class="badge">Wkr\xF3tce</div>'}
            </div>
          `).join("")}
        </div>
      `;this.container.innerHTML=r}start(){this.handleRoute()}};function E(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var U=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,r)=>t+r.totalPrice,0)}isEmpty(){return this.items.length===0}};function ie(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let r=e.map(c=>({Kategoria:c.category,Nazwa:c.name,Ilo\u015B\u0107:c.quantity,Jednostka:c.unit,"Cena jedn.":c.unitPrice,"Express (+20%)":c.isExpress?"TAK":"NIE","Cena ca\u0142kowita":c.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),a=XLSX.utils.json_to_sheet(r),i=XLSX.utils.book_new();XLSX.utils.book_append_sheet(i,a,"Zam\xF3wienie");let o=new Date().toISOString().slice(0,10),l=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${o}.xlsx`;XLSX.writeFile(i,l)}var te=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki",icon:"\u{1F4C4}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki",icon:"\u{1F4C7}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia",icon:"\u2709\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"druk-cad",name:"Druk CAD",icon:"\u{1F4D0}",group:"Druk wielkoformatowy",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",group:"Druk wielkoformatowy",implemented:!0},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",group:"Druk wielkoformatowy",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",group:"Druk wielkoformatowy",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",group:"Druk wielkoformatowy",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"cad-kalkulator",name:"CAD - Kalkulator",description:"Wycena wydruk\xF3w wielkiformatowych (A3-A0+)",icon:"\u{1F5A8}\uFE0F",group:"Druk wielkoformatowy",path:"/kalkulator-cad",type:"iframe",implemented:!0}];var ne={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
      <div class="category-view">
        <h2>Przyk\u0142adowa Kategoria</h2>
        <div class="form">
          <div class="row">
            <label>Ilo\u015B\u0107</label>
            <input type="number" id="sampleQty" value="1" min="1">
          </div>
          <div class="row">
            <label>Cena jednostkowa</label>
            <span>10,00 z\u0142</span>
          </div>
          <div class="actions" style="margin-top: 20px;">
            <button id="addSampleBtn" class="primary">Dodaj do koszyka</button>
          </div>
        </div>
      </div>
    `;let r=e.querySelector("#addSampleBtn"),a=e.querySelector("#sampleQty");r?.addEventListener("click",()=>{let i=parseInt(a.value)||1,o=i*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:i},price:o}),alert(`Dodano do koszyka: ${i} szt. za ${E(o)}`)})},unmount:()=>{console.log("Unmounting sample category")}};var re=class e{static instance;overrides={};registry=new Map;products=[];rules=[];constructor(){this.loadOverrides(),this.loadStructuredData()}static getInstance(){return e.instance||(e.instance=new e),e.instance}loadOverrides(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_overrides");t&&(this.overrides=JSON.parse(t))}catch(t){console.error("Failed to load price overrides",t)}}saveOverrides(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_overrides",JSON.stringify(this.overrides))}catch(t){console.error("Failed to save price overrides",t)}}loadStructuredData(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_products"),r=localStorage.getItem("price_rules");t&&(this.products=JSON.parse(t)),r&&(this.rules=JSON.parse(r))}catch{}}saveStructuredData(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_products",JSON.stringify(this.products)),localStorage.setItem("price_rules",JSON.stringify(this.rules))}catch{}}register(t,r,a,i){let o=this.overrides[t]!==void 0?this.overrides[t]:i;return this.registry.set(t,{id:t,category:r,name:a,defaultValue:i,currentValue:o}),o}get(t,r){return this.overrides[t]!==void 0?this.overrides[t]:r}updatePrices(t){for(let[r,a]of Object.entries(t)){this.overrides[r]=a;let i=this.registry.get(r);i&&(i.currentValue=a)}this.saveOverrides()}getAllEntries(){return Array.from(this.registry.values())}getProducts(){return this.products}getRules(t){return t?this.rules.filter(r=>r.product_id===t):this.rules}addProduct(t){this.products.find(r=>r.id===t.id)||(this.products.push(t),this.saveStructuredData())}addRule(t){let r=this.rules.findIndex(a=>a.product_id===t.product_id&&a.name===t.name&&a.threshold===t.threshold);r>=0?this.rules[r]=t:this.rules.push(t),this.saveStructuredData()}registerTiers(t,r,a){return a.map((i,o)=>{let l=`${t}-tier-${o}`,c=i.from!==void 0?`${i.from}-${i.to||"\u221E"} szt`:`${i.min}-${i.max||"\u221E"} szt`,s=i.unit!==void 0?"unit":"price",d=i[s],u=this.register(l,r,c,d);return{...i,[s]:u}})}},y=re.getInstance();function je(e,t){let r=[...e].sort((o,l)=>o.min-l.min),a=r.find(o=>t>=o.min&&(o.max===null||t<=o.max));if(a)return a;let i=r.find(o=>o.min>=t);return i||r[r.length-1]}function _e(e,t){if(!t)return e;let r=t.find(a=>a.type==="minimum"&&a.unit==="m2");return r&&e<r.value?r.value:e}function q(e,t,r=[]){let a=_e(t,e.rules),i=y.registerTiers(e.id,e.title,e.tiers),o=je(i,a),l=0;e.pricing==="per_unit"?l=a*o.price:l=o.price;let c=0,s=[];if(e.modifiers)for(let f of r){let p=e.modifiers.find(m=>m.id===f);if(p){s.push(p.name);let m=y.register(`${e.id}-mod-${p.id}`,e.title,p.name,p.value);p.type==="percent"?c+=l*m:p.type==="fixed_per_unit"?c+=m*a:c+=m}}let d=l+c,u=e.rules?.find(f=>f.type==="minimum"&&f.unit==="pln");return u&&d<u.value&&(d=u.value),{basePrice:l,effectiveQuantity:a,tierPrice:o.price,modifiersTotal:c,totalPrice:parseFloat(d.toFixed(2)),appliedModifiers:s}}var se={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:.2}]};var le={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let r=se;e.innerHTML=`
      <div class="category-view">
        <h2>${r.title}</h2>
        <div class="form" style="display: grid; gap: 15px;">
          <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
            <label>Powierzchnia (m2)</label>
            <input type="number" id="plakatyQty" value="1" min="0.1" step="0.1" style="width: 100px;">
          </div>
          <div class="row" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="plakatyExpress" style="width: auto;">
            <label for="plakatyExpress">Tryb EXPRESS (+20%)</label>
          </div>

          <div class="divider"></div>

          <div class="summary-box" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Cena:</span>
              <strong id="plakatyResult">0,00 z\u0142</strong>
            </div>
          </div>

          <div class="actions">
            <button id="addPlakatyBtn" class="primary" style="width: 100%;">Dodaj do zam\xF3wienia</button>
          </div>
        </div>
      </div>
    `;let a=e.querySelector("#plakatyQty"),i=e.querySelector("#plakatyExpress"),o=e.querySelector("#plakatyResult"),l=e.querySelector("#addPlakatyBtn");function c(){let s=parseFloat(a.value)||0,d=i.checked?["EXPRESS"]:[];try{let u=q(s,r,d);o.textContent=E(u.totalPrice)}catch{o.textContent="B\u0142\u0105d"}}a.addEventListener("input",c),i.addEventListener("change",c),l.addEventListener("click",()=>{let s=parseFloat(a.value)||0,d=i.checked?["EXPRESS"]:[],u=q(s,r,d);t.cart.addItem({categoryId:r.id,categoryName:r.title,details:{qty:`${s} m2`,express:i.checked},price:u.totalPrice})}),c()}};var Ne=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function We(){return Ne.map(e=>({qty:e.qty,single:y.register(`vouchery-s-${e.qty}`,"Vouchery",`Jednostronne ${e.qty} szt`,e.single),double:y.register(`vouchery-d-${e.qty}`,"Vouchery",`Dwustronne ${e.qty} szt`,e.double)}))}function Ke(e,t){let r=We(),a=r[0];for(let i of r)if(e>=i.qty)a=i;else break;return t?a.single:a.double}var ce={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Vouchery - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda 200-350g. Cena zale\u017Cy od ilo\u015Bci.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4</option>
            <option value="DL">DL</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilo\u015B\u0107 sztuk:</label>
          <input type="number" id="quantity" value="1" min="1" max="100">
        </div>

        <div class="form-group">
          <label>Druk:</label>
          <select id="sides">
            <option value="single">Jednostronny</option>
            <option value="double">Dwustronny</option>
          </select>
        </div>

        <div class="form-group">
          <label>Papier:</label>
          <select id="paper">
            <option value="standard">Standardowy (kreda)</option>
            <option value="satin">Satynowy (+12%)</option>
          </select>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena ca\u0142kowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 z\u0142</strong>
          </div>
          <p id="price-breakdown" style="color: #666; font-size: 12px; margin: 10px 0 0 0;"></p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="calculate" class="btn-primary" style="flex: 1;">Oblicz cen\u0119</button>
          <button id="addToBasket" class="btn-success" style="flex: 1;">Dodaj do listy</button>
        </div>
      </div>
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let c=e.querySelector("#format").value,s=parseInt(e.querySelector("#quantity").value)||1,d=e.querySelector("#sides").value,u=e.querySelector("#paper").value,f=Ke(s,d==="single"),p=y.register("vouchery-mod-satin","Vouchery","Dop\u0142ata Satyna",.12),m=y.register("vouchery-mod-express","Vouchery","Dop\u0142ata Express",.2),n=u==="satin"?1+p:1,g=t.expressMode?1+m:1;if(r=f*n*g,o&&(o.textContent=r.toFixed(2)+" z\u0142"),l){let x=VOUCHERY_PRICING[0];for(let v of VOUCHERY_PRICING)if(s>=v.qty)x=v;else break;l.textContent="Podstawa: "+f.toFixed(2)+" z\u0142 za "+s+" szt (przedzia\u0142: "+x.qty+"+ szt)"}t.updateLastCalculated(r,"Vouchery "+c+" "+(d==="single"?"jednostronne":"dwustronne")+" - "+s+" szt")}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let c=e.querySelector("#format").value,s=e.querySelector("#quantity").value,d=e.querySelector("#sides").value,u=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:r,description:c+" "+(d==="single"?"jednostronne":"dwustronne")+", "+s+" szt, "+(u==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+r.toFixed(2)+" z\u0142")})}};var de=[{qty:1,price:20},{qty:2,price:30},{qty:3,price:32},{qty:4,price:34},{qty:5,price:35},{qty:6,price:35},{qty:7,price:36},{qty:8,price:37},{qty:9,price:39},{qty:10,price:40},{qty:15,price:45},{qty:20,price:49},{qty:30,price:58},{qty:40,price:65},{qty:50,price:75},{qty:100,price:120}];function Ue(e){let t=y.registerTiers("dyplomy","Dyplomy",de.map(a=>({min:a.qty,max:null,price:a.price}))),r=t[0];for(let a of t)if(e>=a.min)r=a;else break;return r.price}var me={id:"dyplomy",name:"\u{1F393} Dyplomy",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Dyplomy - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda 200-300g. Format DL dwustronny. Cena zale\u017Cy od ilo\u015Bci.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="DL">DL (99\xD7210 mm) - dwustronny</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilo\u015B\u0107 sztuk:</label>
          <input type="number" id="quantity" value="1" min="1" max="200">
        </div>

        <div class="form-group">
          <label>Gramatura papieru:</label>
          <select id="gramature">
            <option value="1.0">120g</option>
            <option value="1.1">160g (+10%)</option>
            <option value="1.2">200g (+20%)</option>
            <option value="1.3">250g (+30%)</option>
            <option value="1.4">300g (+40%)</option>
            <option value="1.6">350g (+60%)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Wyko\u0144czenie:</label>
          <select id="finish">
            <option value="1.0">Mat</option>
            <option value="1.15">Po\u0142ysk (+15%)</option>
          </select>
        </div>

        <div id="price-tiers" style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #667eea; margin: 0 0 10px 0;">Przedzia\u0142y cenowe:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 13px; color: #ccc;">
            <div>1 szt \u2192 20 z\u0142</div><div>2 szt \u2192 30 z\u0142</div>
            <div>5 szt \u2192 35 z\u0142</div><div>10 szt \u2192 40 z\u0142</div>
            <div>20 szt \u2192 49 z\u0142</div><div>30 szt \u2192 58 z\u0142</div>
            <div>50 szt \u2192 75 z\u0142</div><div>100 szt \u2192 120 z\u0142</div>
          </div>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena ca\u0142kowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 z\u0142</strong>
          </div>
          <p id="price-breakdown" style="color: #666; font-size: 12px; margin: 10px 0 0 0;"></p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="calculate" class="btn-primary" style="flex: 1;">Oblicz cen\u0119</button>
          <button id="addToBasket" class="btn-success" style="flex: 1;">Dodaj do listy</button>
        </div>
      </div>
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let c=parseInt(e.querySelector("#quantity").value)||1,s=parseFloat(e.querySelector("#gramature").value),d=parseFloat(e.querySelector("#finish").value),u=Ue(c),f=s-1+(d-1);if(t.expressMode&&(f+=.2),r=u*(1+f),o&&(o.textContent=`${r.toFixed(2)} z\u0142`),l){let p=y.registerTiers("dyplomy","Dyplomy",de.map(n=>({min:n.qty,max:null,price:n.price}))),m=p[0];for(let n of p)if(c>=n.min)m=n;else break;l.textContent=`${c} szt, baza: ${u.toFixed(2)} z\u0142 \xD7 ${s} (gramatura) \xD7 ${d} (wyko\u0144czenie)`}t.updateLastCalculated(r,`Dyplomy DL - ${c} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let c=e.querySelector("#quantity").value,s=e.querySelector("#gramature").options[e.querySelector("#gramature").selectedIndex].text,d=e.querySelector("#finish").options[e.querySelector("#finish").selectedIndex].text;t.addToBasket({category:"Dyplomy",price:r,description:`DL dwustronny, ${c} szt, ${s}, ${d}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var Qe={"85x55":[{qty:50,plain:65,foil:160},{qty:100,plain:75,foil:170},{qty:150,plain:85,foil:180},{qty:200,plain:96,foil:190},{qty:250,plain:110,foil:200},{qty:300,plain:126,foil:220},{qty:400,plain:146,foil:240},{qty:500,plain:170,foil:250},{qty:1e3,plain:290,foil:335}],"90x50":[{qty:50,plain:70,foil:170},{qty:100,plain:79,foil:180},{qty:150,plain:89,foil:190},{qty:200,plain:99,foil:200},{qty:250,plain:120,foil:210},{qty:300,plain:129,foil:230},{qty:400,plain:149,foil:250},{qty:500,plain:175,foil:260},{qty:1e3,plain:300,foil:345}]};function pe(e,t,r){let a=Qe[e],i=r?"foil":"plain",o=y.registerTiers(`wizytowki-${e}-${i}`,`Wizyt\xF3wki ${e} ${i}`,a.map(c=>({min:c.qty,max:null,price:r?c.foil:c.plain}))),l=o[0];for(let c of o)if(t>=c.min)l=c;else break;return l.price}var ue={id:"wizytowki-druk-cyfrowy",name:"\u{1F4BC} Wizyt\xF3wki",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Wizyt\xF3wki - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda mat 350g. Czas realizacji: 4-5 dni roboczych.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="85x55">85\xD755 mm (standardowy)</option>
            <option value="90x50">90\xD750 mm</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilo\u015B\u0107 sztuk:</label>
          <select id="quantity">
            <option value="50">50 szt</option>
            <option value="100">100 szt</option>
            <option value="150">150 szt</option>
            <option value="200">200 szt</option>
            <option value="250">250 szt</option>
            <option value="300">300 szt</option>
            <option value="400">400 szt</option>
            <option value="500">500 szt</option>
            <option value="1000">1000 szt</option>
          </select>
        </div>

        <div class="form-group">
          <label>Gramatura papieru:</label>
          <select id="gramature">
            <option value="1.0">120g</option>
            <option value="1.1">160g (+10%)</option>
            <option value="1.2">200g (+20%)</option>
            <option value="1.3">250g (+30%)</option>
            <option value="1.4">300g (+40%)</option>
            <option value="1.6" selected>350g (+60%)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Wyko\u0144czenie:</label>
          <select id="finish">
            <option value="1.0">Mat</option>
            <option value="1.15">Po\u0142ysk (+15%)</option>
            <option value="foil">Z foli\u0105 mat/b\u0142ysk (sta\u0142a cena)</option>
          </select>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena ca\u0142kowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 z\u0142</strong>
          </div>
          <p id="price-breakdown" style="color: #666; font-size: 12px; margin: 10px 0 0 0;"></p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="calculate" class="btn-primary" style="flex: 1;">Oblicz cen\u0119</button>
          <button id="addToBasket" class="btn-success" style="flex: 1;">Dodaj do listy</button>
        </div>
      </div>
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let c=e.querySelector("#format").value,s=parseInt(e.querySelector("#quantity").value),d=e.querySelector("#finish").value,u=parseFloat(e.querySelector("#gramature").value);if(d==="foil")r=pe(c,s,!0),t.expressMode&&(r*=1.2);else{let f=parseFloat(d),p=pe(c,s,!1),m=u-1+(f-1);t.expressMode&&(m+=.2),r=p*(1+m)}o&&(o.textContent=`${r.toFixed(2)} z\u0142`),l&&(l.textContent=`Format ${c} mm, ${s} szt, ${d==="foil"?"z foli\u0105":"wyko\u0144czenie: "+d}`),t.updateLastCalculated(r,`Wizyt\xF3wki ${c} - ${s} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let c=e.querySelector("#format").value,s=e.querySelector("#quantity").value,d=e.querySelector("#finish").options[e.querySelector("#finish").selectedIndex].text,u=e.querySelector("#gramature").options[e.querySelector("#gramature").selectedIndex].text;t.addToBasket({category:"Wizyt\xF3wki",price:r,description:`${c} mm, ${s} szt, ${u}, ${d}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var ye={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function fe(e){let{format:t,qty:r,sides:a,isFolded:i,gramMod:o,finishMod:l,express:c}=e,s=ye.formats[t];if(!s)throw new Error(`Invalid format: ${t}`);let d=a===1?"single":"double",u=i?"folded":"normal",f=s[d][u],p=Object.keys(f).map(Number).sort((S,$)=>S-$),m=p[0];for(let S of p)r>=S&&(m=S);let n=f[m.toString()],g=y,x=`zap-${t}-${d}-${u}-${m}`,v=`Zaproszenia ${t} ${d==="single"?"1s":"2s"} ${u==="folded"?"sk\u0142":"norm"} (od ${m}szt)`,M=g.register(x,"Zaproszenia",v,n),C=[];o>1&&C.push({id:"gramature",name:`Gramatura (${Math.round((o-1)*100)}%)`,type:"percentage",value:o-1}),l>1&&C.push({id:"finish",name:"Wyko\u0144czenie po\u0142ysk (+15%)",type:"percentage",value:.15}),c&&C.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:g.register("global-express","Global","Express (+%)",.2)});let k=0,z=[];for(let S of C)(S.type==="percent"||S.type==="percentage")&&(k+=M*S.value,z.push(S.name));let A=M+k;return{basePrice:M,effectiveQuantity:r,tierPrice:M/r,modifiersTotal:k,totalPrice:Math.round(A*100)/100,appliedModifiers:z}}var ge={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let r=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await r.text();let a=e.querySelector("#zapFormat"),i=e.querySelector("#zapSides"),o=e.querySelector("#zapFolded"),l=e.querySelector("#zapQty"),c=e.querySelector("#zapGramature"),s=e.querySelector("#zapFinish"),d=e.querySelector("#calcBtn"),u=e.querySelector("#addToCartBtn"),f=e.querySelector("#zapResult"),p=()=>{let m={format:a.value,qty:parseInt(l.value)||10,sides:parseInt(i.value)||1,isFolded:o.checked,gramMod:parseFloat(c.value),finishMod:parseFloat(s.value),express:t.expressMode},n=fe(m);return f.style.display="block",e.querySelector("#resUnitPrice").textContent=E(n.totalPrice/m.qty),e.querySelector("#resTotalPrice").textContent=E(n.totalPrice),e.querySelector("#resExpressHint").style.display=m.express?"block":"none",e.querySelector("#resFinishHint").style.display=m.finishMod>1?"block":"none",t.updateLastCalculated(n.totalPrice,"Zaproszenia"),{options:m,result:n}};d.addEventListener("click",()=>p()),u.addEventListener("click",()=>{let{options:m,result:n}=p();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${m.format} ${m.sides===1?"1-str":"2-str"}${m.isFolded?" sk\u0142adane":""}`,quantity:m.qty,unit:"szt",unitPrice:n.totalPrice/m.qty,isExpress:m.express,totalPrice:n.totalPrice,optionsHint:`${m.qty} szt, ${c.options[c.selectedIndex].text}, ${s.options[s.selectedIndex].text}`,payload:m})}),p()}};var xe={name:"Ulotki \u2013 cyfrowe",jednostronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}},dwustronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:365},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function Je(e,t="jednostronne"){let r=xe[t];if(!r)throw new Error(`Invalid mode: ${t}`);let a=r[e];if(!a)throw new Error(`Invalid format: ${e} for mode ${t}`);return{id:`ulotki-${t}-${e.toLowerCase()}`,title:`Ulotki Cyfrowe ${t==="dwustronne"?"Dwustronne":"Jednostronne"} ${a.name}`,unit:"szt",pricing:"flat",tiers:a.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function be(e){let t=Je(e.format,e.mode),r=[];return e.express&&r.push("express"),q(t,e.qty,r)}var he={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",async mount(e,t){try{let r=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#uj-format"),a=e.querySelector("#uj-qty-input"),i=e.querySelector("#uj-add-to-cart"),o=e.querySelector("#uj-result-display"),l=e.querySelector("#uj-total-price"),c=e.querySelector("#uj-unit-price"),s=e.querySelector("#uj-display-qty"),d=e.querySelector("#uj-express-hint"),u=e.querySelector("#uj-individual-quote"),f=null,p=null,m=()=>{let n=e.querySelector('input[name="uj-mode"]:checked').value,g=parseInt(a.value)||0,x=r.value;if(g>1e3){o.style.display="none",u.style.display="block",i.disabled=!0;return}if(g<1){o.style.display="none",u.style.display="none",i.disabled=!0;return}u.style.display="none",p={mode:n,format:x,qty:g,express:t.expressMode};try{let v=be(p);f=v,s.innerText=`${g} szt`,c.innerText=E(v.totalPrice/g),l.innerText=E(v.totalPrice),d&&(d.style.display=t.expressMode?"block":"none"),o.style.display="block",i.disabled=!1,t.updateLastCalculated(v.totalPrice,"Ulotki")}catch(v){console.error(v),o.style.display="none",i.disabled=!0}};e.querySelectorAll('input[name="uj-mode"]').forEach(n=>{n.addEventListener("change",m)}),r.onchange=m,a.oninput=m,i.onclick=()=>{if(f&&p){let n=p.express?", EXPRESS":"",g=p.mode==="dwustronne"?"Dwustronne":"Jednostronne";t.cart.addItem({id:`ulotki-cyfrowe-${Date.now()}`,category:"Ulotki",name:`Ulotki ${g} ${p.format}`,quantity:p.qty,unit:"szt",unitPrice:f.totalPrice/p.qty,isExpress:p.express,totalPrice:f.totalPrice,optionsHint:`${p.qty} szt, ${g}${n}`,payload:f})}},m()}};var ke={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ve(e){let t=ke,r=t.materials.find(d=>d.id===e.material);if(!r)throw new Error(`Unknown material: ${e.material}`);let a="Bannery",i=`banner-${e.material}`,o=y.registerTiers(i,a,r.tiers),l=t.modifiers.map(d=>({...d,value:y.register(`banner-mod-${d.id}`,a,`Dop\u0142ata ${d.name}`,d.value)})),c={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o,modifiers:l},s=[];return e.oczkowanie&&s.push("oczkowanie"),e.express&&s.push("express"),q(c,e.areaM2,s)}var we={id:"banner",name:"Bannery",async mount(e,t){try{let r=await fetch("categories/banner.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#b-material"),a=e.querySelector("#b-area"),i=e.querySelector("#b-oczkowanie"),o=e.querySelector("#b-calculate"),l=e.querySelector("#b-add-to-cart"),c=e.querySelector("#b-result-display"),s=e.querySelector("#b-unit-price"),d=e.querySelector("#b-total-price"),u=e.querySelector("#b-express-hint"),f=null,p=null;o.onclick=()=>{p={material:r.value,areaM2:parseFloat(a.value),oczkowanie:i.checked,express:t.expressMode};try{let m=ve(p);f=m,s.innerText=E(m.tierPrice),d.innerText=E(m.totalPrice),u&&(u.style.display=t.expressMode?"block":"none"),c.style.display="block",l.disabled=!1,t.updateLastCalculated(m.totalPrice,"Banner")}catch(m){alert("B\u0142\u0105d: "+m.message)}},l.onclick=()=>{if(f&&p){let m=r.options[r.selectedIndex].text,n=[`${p.areaM2} m2`,p.oczkowanie?"z oczkowaniem":"bez oczkowania",p.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:m,quantity:p.areaM2,unit:"m2",unitPrice:f.tierPrice,isExpress:p.express,totalPrice:f.totalPrice,optionsHint:n,payload:f})}}}};var _={};Fe(_,{category:()=>Ye,default:()=>rt,groups:()=>et,modifiers:()=>tt});var Ye="Wlepki / Naklejki",et=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],tt=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],rt={category:Ye,groups:et,modifiers:tt};function Se(e){let t=_,r=t.groups.find(o=>o.id===e.groupId);if(!r)throw new Error(`Unknown group: ${e.groupId}`);let a={id:`wlepki-${r.id}`,title:r.title,unit:r.unit,pricing:r.pricing||"per_unit",tiers:r.tiers,modifiers:t.modifiers,rules:r.rules||[{type:"minimum",unit:"m2",value:1}]},i=[...e.modifiers];return e.express&&i.push("express"),q(a,e.area,i)}var Ee={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let r=_;try{let m=await fetch("categories/wlepki-naklejki.html");if(!m.ok)throw new Error("Failed to load template");e.innerHTML=await m.text()}catch(m){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${m}</div>`;return}let a=e.querySelector("#wlepki-group"),i=e.querySelector("#wlepki-area"),o=e.querySelector("#btn-calculate"),l=e.querySelector("#btn-add-to-cart"),c=e.querySelector("#wlepki-result"),s=e.querySelector("#unit-price"),d=e.querySelector("#total-price"),u=null,f=null,p=()=>{let m=e.querySelectorAll(".wlepki-mod:checked"),n=Array.from(m).map(g=>g.value);f={groupId:a.value,area:parseFloat(i.value)||0,express:t.expressMode,modifiers:n};try{let g=Se(f);u=g,s.textContent=E(g.tierPrice),d.textContent=E(g.totalPrice),c.style.display="block",l.disabled=!1,t.updateLastCalculated(g.totalPrice,"Wlepki")}catch(g){alert("B\u0142\u0105d: "+g.message)}};o.addEventListener("click",p),l.addEventListener("click",()=>{if(!u||!f)return;let m=r.groups.find(g=>g.id===f.groupId),n=f.modifiers.map(g=>{let x=r.modifiers.find(v=>v.id===g);return x?x.name:g});f.express&&n.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:m?.title||"Wlepki",quantity:f.area,unit:"m2",unitPrice:u.tierPrice,isExpress:!!f.express,totalPrice:u.totalPrice,optionsHint:n.join(", ")||"Standard",payload:u})})}};var Z={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function Te(e){let t=Z.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let r="Roll-up",a;if(e.isReplacement){let o=t.width*t.height,l=y.register("rollup-repl-m2",r,"Wymiana: Druk za m2",Z.replacement.print_per_m2),c=y.register("rollup-repl-labor",r,"Wymiana: Robocizna",Z.replacement.labor),s=o*l+c,d=y.register("rollup-repl-express",r,"Dop\u0142ata Express (wymiana)",.2);a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:s}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:d}]}}else{let o=`rollup-full-${e.format}`,l=y.registerTiers(o,r,t.tiers),c=y.register(`${o}-express`,r,`Dop\u0142ata Express (${e.format})`,.2);a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:l,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:c}]}}let i=[];return e.express&&i.push("express"),q(a,e.qty,i)}var Le={id:"roll-up",name:"Roll-up",async mount(e,t){let r=await fetch("categories/roll-up.html");e.innerHTML=await r.text();let a=e.querySelector("#rollUpType"),i=e.querySelector("#rollUpFormat"),o=e.querySelector("#rollUpQty"),l=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),s=e.querySelector("#rollUpResult"),d=()=>{let u={format:i.value,qty:parseInt(o.value)||1,isReplacement:a.value==="replacement",express:t.expressMode},f=Te(u);return s.style.display="block",e.querySelector("#resUnitPrice").textContent=E(f.totalPrice/u.qty),e.querySelector("#resTotalPrice").textContent=E(f.totalPrice),e.querySelector("#resExpressHint").style.display=u.express?"block":"none",t.updateLastCalculated(f.totalPrice,"Roll-up"),{options:u,result:f}};l.addEventListener("click",()=>d()),c.addEventListener("click",()=>{let{options:u,result:f}=d();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${u.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${u.format}`,quantity:u.qty,unit:"szt",unitPrice:f.totalPrice/u.qty,isExpress:u.express,totalPrice:f.totalPrice,optionsHint:`${u.format}, ${u.qty} szt`,payload:u})}),d()}};async function ot(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function X(e,t,r){return{id:e,name:t,mount:async(a,i)=>{a.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let o=await ot(r);a.innerHTML=o,it(a,i)}catch(o){a.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${o}</small>
          </div>
        `,console.error("Category load error:",o)}}}}function it(e,t){e.querySelectorAll("button[data-action]").forEach(a=>{let i=a.getAttribute("data-action");i==="calculate"&&a.addEventListener("click",()=>{console.log("Calculate clicked")}),i==="add-to-basket"&&a.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var Me={id:"druk-cad",name:"Druk CAD wielkoformatowy",async mount(e,t){try{let r=await fetch("categories/druk-cad-advanced.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=y,a="CAD",i={formatowe:{czb:{A3:r.register("cad-f-czb-A3",a,"CAD A3 CZB",2.5),A2:r.register("cad-f-czb-A2",a,"CAD A2 CZB",4),A1:r.register("cad-f-czb-A1",a,"CAD A1 CZB",6),A0:r.register("cad-f-czb-A0",a,"CAD A0 CZB",11),"A0+":r.register("cad-f-czb-A0p",a,"CAD A0+ CZB",12.5)},kolor:{A3:r.register("cad-f-kol-A3",a,"CAD A3 Kolor",5.3),A2:r.register("cad-f-kol-A2",a,"CAD A2 Kolor",8.5),A1:r.register("cad-f-kol-A1",a,"CAD A1 Kolor",12),A0:r.register("cad-f-kol-A0",a,"CAD A0 Kolor",24),"A0+":r.register("cad-f-kol-A0p",a,"CAD A0+ Kolor",26)}},nieformatowe:{czb:{297:r.register("cad-n-czb-297",a,"CAD 297mm CZB (z\u0142/mb)",3.5),420:r.register("cad-n-czb-420",a,"CAD 420mm CZB (z\u0142/mb)",4.5),594:r.register("cad-n-czb-594",a,"CAD 594mm CZB (z\u0142/mb)",5),841:r.register("cad-n-czb-841",a,"CAD 841mm CZB (z\u0142/mb)",9),914:r.register("cad-n-czb-914",a,"CAD 914mm CZB (z\u0142/mb)",10),1067:r.register("cad-n-czb-1067",a,"CAD 1067mm CZB (z\u0142/mb)",12.5)},kolor:{297:r.register("cad-n-kol-297",a,"CAD 297mm Kolor (z\u0142/mb)",12),420:r.register("cad-n-kol-420",a,"CAD 420mm Kolor (z\u0142/mb)",13.9),594:r.register("cad-n-kol-594",a,"CAD 594mm Kolor (z\u0142/mb)",14.5),841:r.register("cad-n-kol-841",a,"CAD 841mm Kolor (z\u0142/mb)",20),914:r.register("cad-n-kol-914",a,"CAD 914mm Kolor (z\u0142/mb)",21),1067:r.register("cad-n-kol-1067",a,"CAD 1067mm Kolor (z\u0142/mb)",30)}},skladanie:{formatowe:{A3:r.register("cad-s-f-A3",a,"CAD Sk\u0142adanie A3",1),"A3-poprzeczne":r.register("cad-s-f-A3p",a,"CAD Sk\u0142adanie A3L",.7),A2:r.register("cad-s-f-A2",a,"CAD Sk\u0142adanie A2",1.5),A1:r.register("cad-s-f-A1",a,"CAD Sk\u0142adanie A1",2),A0:r.register("cad-s-f-A0",a,"CAD Sk\u0142adanie A0",3),"A0+":r.register("cad-s-f-A0p",a,"CAD Sk\u0142adanie A0+",4)},nieformatowe:r.register("cad-s-n",a,"CAD Sk\u0142adanie mb (z\u0142/m2)",2.5)},skanowanie:r.register("cad-skan",a,"CAD Skanowanie (z\u0142/cm)",.08)},o={A3:[297,420],A2:[420,594],A1:[594,841],A0:[841,1189],"A0+":[914,1292]},l=[297,420,594,841,914,1067],c=5,s=[],d=!1,u=300,f=e.querySelector("#fileInput"),p=e.querySelector("#uploadZone"),m=e.querySelector("#dpiInput"),n=e.querySelector("#colorToggle"),g=e.querySelector("#colorSwitch"),x=e.querySelector("#filesTableWrapper"),v=e.querySelector("#filesTableBody"),M=e.querySelector("#summaryPanel"),C=e.querySelector("#summaryGrid"),k=e.querySelector("#clearBtn"),z=e.querySelector("#add-all-to-cart"),A=(b,h)=>b*25.4/h,S=b=>l.reduce((h,w)=>Math.abs(w-b)<Math.abs(h-b)?w:h),$=b=>l.includes(Math.round(b)),B=(b,h)=>{let w=Math.round(b),T=Math.round(h),[L,D]=w<T?[w,T]:[T,w];if(!$(L))return{format:`${L}mm`,isFormatowy:!1,isStandardWidth:!1,widthCategory:S(L)};for(let[R,V]of Object.entries(o)){let[N,W]=V;if(L===N){let ee=Math.abs(D-W)<=c;return{format:R,isFormatowy:ee,isStandardWidth:!0,widthCategory:N,actualLength:D,standardLength:W}}}return{format:`${L}\xD7${D}`,isFormatowy:!1,isStandardWidth:!0,widthCategory:L}},J=b=>{let h=d?"kolor":"czb",{format:w,isFormatowy:T,widthCategory:L}=b.formatInfo;if(T)return i.formatowe[h][w]||0;{let D=i.nieformatowe[h][L]||0,R=Math.max(b.widthMm,b.heightMm)/1e3;return D*R}},G=b=>{if(!b.folding)return 0;let{format:h,isFormatowy:w}=b.formatInfo;if(w)return i.skladanie.formatowe[h]||0;{let T=b.widthMm/1e3*(b.heightMm/1e3);return i.skladanie.nieformatowe*T}},Y=b=>{if(!b.scanning)return 0;let h=Math.max(b.widthMm,b.heightMm);return i.skanowanie*h/10},F=()=>{if(s.length===0){x.style.display="none",M.style.display="none";return}x.style.display="block",M.style.display="block",v.innerHTML=s.map((h,w)=>{let T=J(h),L=G(h),D=Y(h),R=(T+L+D)*(t.expressMode?1.2:1),{format:V,isFormatowy:N,isStandardWidth:W}=h.formatInfo,ee=W?N?'<span class="badge badge-formatowy">Format</span>':'<span class="badge badge-nieformatowy">MB</span>':'<span class="badge badge-warning">\u26A0\uFE0F Niestandard</span>';return`
          <tr>
            <td>${h.name}</td>
            <td>${Math.round(h.widthMm)}\xD7${Math.round(h.heightMm)}</td>
            <td><strong>${V}</strong></td>
            <td>${ee}</td>
            <td><input type="checkbox" ${h.folding?"checked":""} data-idx="${w}" class="fold-check"></td>
            <td><input type="checkbox" ${h.scanning?"checked":""} data-idx="${w}" class="scan-check"></td>
            <td><strong>${R.toFixed(2)} z\u0142</strong></td>
          </tr>
        `}).join(""),e.querySelectorAll(".fold-check").forEach(h=>{h.addEventListener("change",w=>{s[parseInt(w.target.dataset.idx)].folding=w.target.checked,F()})}),e.querySelectorAll(".scan-check").forEach(h=>{h.addEventListener("change",w=>{s[parseInt(w.target.dataset.idx)].scanning=w.target.checked,F()})});let b=0;s.forEach(h=>{b+=(J(h)+G(h)+Y(h))*(t.expressMode?1.2:1)}),C.innerHTML=`
        <div class="summary-item"><span>Liczba plik\xF3w:</span><span>${s.length}</span></div>
        <div class="summary-item"><span>Razem brutto:</span><strong>${b.toFixed(2)} z\u0142</strong></div>
      `,t.updateLastCalculated(b,`Druk CAD (${s.length} plik\xF3w)`)};p.onclick=()=>f.click(),f.onchange=b=>{let h=b.target.files;for(let w of h)if(w.type.startsWith("image/")||w.type==="application/pdf"){let T=new Image,L=new FileReader;L.onload=D=>{T.onload=()=>{let R=A(T.width,u),V=A(T.height,u);s.push({name:w.name,widthPx:T.width,heightPx:T.height,widthMm:R,heightMm:V,formatInfo:B(R,V),folding:!1,scanning:!1}),F()},T.src=D.target.result},L.readAsDataURL(w)}else{let T=A(2480,u),L=A(3508,u);s.push({name:w.name,widthPx:2480,heightPx:3508,widthMm:T,heightMm:L,formatInfo:B(T,L),folding:!1,scanning:!1}),F()}},n.onclick=()=>{d=!d,g.classList.toggle("active"),F()},m.onchange=()=>{u=parseInt(m.value)||300,s=s.map(b=>{let h=A(b.widthPx,u),w=A(b.heightPx,u);return{...b,widthMm:h,heightMm:w,formatInfo:B(h,w)}}),F()},k.onclick=()=>{s=[],F()},z.onclick=()=>{s.forEach(b=>{let h=J(b),w=G(b),T=Y(b),L=(h+w+T)*(t.expressMode?1.2:1);t.cart.addItem({id:`cad-${Date.now()}-${Math.random()}`,category:"Druk CAD",name:b.name,quantity:1,unit:"szt.",unitPrice:L,isExpress:t.expressMode,totalPrice:parseFloat(L.toFixed(2)),optionsHint:`${b.formatInfo.format} (${d?"Kolor":"CZ-B"}), ${b.folding?"Sk\u0142adanie":""}`,payload:b})}),alert(`Dodano ${s.length} plik\xF3w do koszyka.`)}}};function oe(e,t){return e.find(r=>t>=r.from&&t<=r.to)||null}var j=(e,t,r)=>y.registerTiers(e,t,r),P={get print(){return{bw:{A4:j("print-bw-a4","Druk A4/A3",[{from:1,to:5,unit:.9},{from:6,to:20,unit:.6},{from:21,to:100,unit:.35},{from:101,to:500,unit:.3},{from:501,to:999,unit:.23},{from:1e3,to:4999,unit:.19},{from:5e3,to:99999,unit:.15}]),A3:j("print-bw-a3","Druk A4/A3",[{from:1,to:5,unit:1.7},{from:6,to:20,unit:1.1},{from:21,to:100,unit:.7},{from:101,to:500,unit:.6},{from:501,to:999,unit:.45},{from:1e3,to:99999,unit:.33}])},color:{A4:j("print-color-a4","Druk A4/A3",[{from:1,to:10,unit:2.4},{from:11,to:40,unit:2.2},{from:41,to:100,unit:2},{from:101,to:250,unit:1.8},{from:251,to:500,unit:1.6},{from:501,to:999,unit:1.4},{from:1e3,to:99999,unit:1.1}]),A3:j("print-color-a3","Druk A4/A3",[{from:1,to:10,unit:4.8},{from:11,to:40,unit:4.2},{from:41,to:100,unit:3.8},{from:101,to:250,unit:3},{from:251,to:500,unit:2.5},{from:501,to:999,unit:1.9},{from:1e3,to:99999,unit:1.6}])}}},get scan(){return{auto:j("scan-auto","Skany",[{from:1,to:9,unit:1},{from:10,to:49,unit:.5},{from:50,to:99,unit:.4},{from:100,to:999999999,unit:.25}]),manual:j("scan-manual","Skany",[{from:1,to:4,unit:2},{from:5,to:999999999,unit:1}])}},get email_price(){return y.get("email-price",1)}},ae={get color(){return{formatowe:{A0p:y.get("cad-color-f-a0p",26),A0:y.get("cad-color-f-a0",24),A1:y.get("cad-color-f-a1",12),A2:y.get("cad-color-f-a2",8.5),A3:y.get("cad-color-f-a3",5.3)},mb:{A0p:y.get("cad-color-m-a0p",21),A0:y.get("cad-color-m-a0",20),A1:y.get("cad-color-m-a1",14.5),A2:y.get("cad-color-m-a2",13.9),A3:y.get("cad-color-m-a3",12),R1067:y.get("cad-color-m-r1067",30)}}},get bw(){return{formatowe:{A0p:y.get("cad-bw-f-a0p",12.5),A0:y.get("cad-bw-f-a0",11),A1:y.get("cad-bw-f-a1",6),A2:y.get("cad-bw-f-a2",4),A3:y.get("cad-bw-f-a3",2.5)},mb:{A0p:y.get("cad-bw-m-a0p",10),A0:y.get("cad-bw-m-a0",9),A1:y.get("cad-bw-m-a1",5),A2:y.get("cad-bw-m-a2",4.5),A3:y.get("cad-bw-m-a3",3.5),R1067:y.get("cad-bw-m-r1067",12.5)}}}};var Ce={get A0p(){return y.get("fold-a0p",4)},get A0(){return y.get("fold-a0",3)},get A1(){return y.get("fold-a1",2)},get A2(){return y.get("fold-a2",1.5)},get A3(){return y.get("fold-a3",1)},get A3L(){return y.get("fold-a3l",.7)}},ze={get value(){return y.get("wf-scan-cm",.08)}},H=(e,t,r,a)=>{let i={};for(let[o,l]of Object.entries(a)){let c=`biz-${e}-${t}-${r}-${o}`,s=`Wizyt\xF3wki ${t} ${r} ${o} szt`;i[o]=y.register(c,"Wizyt\xF3wki",s,l)}return i},Ae={get cyfrowe(){return{standardPrices:{"85x55":{noLam:H("std","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290}),lam:H("std","85x55","lami",{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335})},"90x50":{noLam:H("std","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:H("std","90x50","lami",{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345})}},softtouchPrices:{"85x55":{noLam:H("st","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290}),lam:H("st","85x55","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380})},"90x50":{noLam:H("st","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:H("st","90x50","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390})}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:H("deluxe","UV 3D","Softtouch",{50:280,100:320,200:395,250:479,400:655,500:778})},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:H("deluxe","UV 3D Gold","Softtouch",{50:450,100:550,200:650,250:720,400:850,500:905})}}}}}},nt=()=>{let e=P.print,t=P.scan,r=P.email_price,a=ae.color,i=ae.bw,o=Ce.A0,l=ze.value,c=Ae.cyfrowe};nt();function qe(e){if(e.pages<=0)return{unitPrice:0,printTotal:0,emailTotal:e.email?P.email_price:0,inkTotal:0,grandTotal:e.email?P.email_price:0};let t=P.print[e.mode][e.format],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla druku.");let a=r.unit,i=e.pages*a,o=0;e.email&&(o=P.email_price);let l=0;return e.ink25&&(l=.5*a*e.ink25Qty),{unitPrice:a,printTotal:i,emailTotal:o,inkTotal:l,grandTotal:i+o+l}}function Pe(e){if(e.pages<=0)return{unitPrice:0,total:0};let t=P.scan[e.type],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla skanowania.");let a=r.unit;return{unitPrice:a,total:e.pages*a}}function He(e,t){let r=e.format.toUpperCase(),a=qe({mode:e.mode,format:r,pages:e.printQty,email:e.email,ink25:e.surcharge,ink25Qty:e.surchargeQty}),i={total:0,unitPrice:0};e.scanType!=="none"&&e.scanQty>0&&(i=Pe({type:e.scanType,pages:e.scanQty}));let o=a.grandTotal+i.total,l=o;return e.express&&(l=o*1.2),{totalPrice:parseFloat(l.toFixed(2)),unitPrintPrice:a.unitPrice,totalPrintPrice:a.printTotal,unitScanPrice:i.unitPrice,totalScanPrice:i.total,emailPrice:a.emailTotal,surchargePrice:a.inkTotal,baseTotal:o}}var $e={id:"druk-a4-a3",name:"Druk A4/A3 + skan",async mount(e,t){try{let r=await fetch("categories/druk-a4-a3-skan.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#d-mode"),a=e.querySelector("#d-format"),i=e.querySelector("#d-print-qty"),o=e.querySelector("#d-email"),l=e.querySelector("#d-surcharge"),c=e.querySelector("#d-surcharge-qty"),s=e.querySelector("#surcharge-qty-row"),d=e.querySelector("#d-scan-type"),u=e.querySelector("#d-scan-qty"),f=e.querySelector("#scan-qty-row"),p=e.querySelector("#d-calculate"),m=e.querySelector("#d-add-to-cart"),n=e.querySelector("#d-result-display"),g=e.querySelector("#d-total-price"),x=e.querySelector("#d-express-hint"),v=e.querySelector("#tier-table"),M=()=>{if(!v||!r||!a)return;let z=r.value,A=a.value.toUpperCase(),$=P.print[z][A];$&&(v.innerHTML=$.map(B=>`<div>${B.from}-${B.to>=99999?"\u221E":B.to} szt.</div><div style="text-align: right;">${B.unit.toFixed(2)} z\u0142</div>`).join(""))};r&&(r.onchange=M),a&&(a.onchange=M),M(),l&&s&&(l.onchange=()=>{s.style.display=l.checked?"flex":"none"}),d&&f&&(d.onchange=()=>{f.style.display=d.value!=="none"?"flex":"none"});let C=null,k=null;p&&(p.onclick=()=>{k={mode:r.value,format:a.value,printQty:parseInt(i.value)||0,email:o.checked,surcharge:l.checked,surchargeQty:parseInt(c.value)||0,scanType:d.value,scanQty:parseInt(u.value)||0,express:t.expressMode};try{let z=He(k);C=z,g.innerText=E(z.totalPrice),x&&(x.style.display=t.expressMode?"block":"none"),n.style.display="block",m.disabled=!1,t.updateLastCalculated(z.totalPrice,"Druk A4/A3 + skan")}catch(z){alert("B\u0142\u0105d: "+z.message)}}),m&&(m.onclick=()=>{if(C&&k){let z=Date.now(),A=t.expressMode?1.2:1;if(k.printQty>0||k.scanQty>0&&k.scanType!=="none"){let S=[];k.printQty>0&&S.push(`${k.printQty} str. ${k.format.toUpperCase()} (${k.mode==="bw"?"CZ-B":"KOLOR"})`),k.scanQty>0&&k.scanType!=="none"&&S.push(`Skan ${k.scanType}: ${k.scanQty} str.`),t.expressMode&&S.push("EXPRESS");let $=(C.totalPrintPrice+C.totalScanPrice)*A;t.cart.addItem({id:`druk-${z}-main`,category:"Druk A4/A3 + skan",name:`${k.format.toUpperCase()} ${k.mode==="bw"?"CZ-B":"KOLOR"}`,quantity:k.printQty||k.scanQty,unit:k.printQty>0?"str.":"skan",unitPrice:$/(k.printQty||k.scanQty),isExpress:t.expressMode,totalPrice:parseFloat($.toFixed(2)),optionsHint:S.join(", "),payload:{...C,type:"main"}})}if(k.email){let S=C.emailPrice*A;t.cart.addItem({id:`email-${z}-email`,category:"Druk A4/A3 + skan",name:"Wysy\u0142ka e-mail",quantity:1,unit:"szt.",unitPrice:S,isExpress:t.expressMode,totalPrice:parseFloat(S.toFixed(2)),optionsHint:t.expressMode?"EXPRESS":"",payload:{price:S,type:"email"}})}if(k.surcharge&&k.surchargeQty>0){let S=C.surchargePrice*A;t.cart.addItem({id:`surcharge-${z}-surcharge`,category:"Druk A4/A3 + skan",name:"Zadruk >25% - dop\u0142ata",quantity:k.surchargeQty,unit:"str.",unitPrice:S/k.surchargeQty,isExpress:t.expressMode,totalPrice:parseFloat(S.toFixed(2)),optionsHint:`${k.surchargeQty} str. (+50%), ${t.expressMode?"EXPRESS":""}`,payload:{price:S,type:"surcharge"}})}}})}};var De=[ne,le,ce,me,ue,ge,he,we,Ee,Le,Me,$e,X("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),X("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),X("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var Ie={SETTINGS_PIN:"2024"};var Be={id:"settings",name:"\u2699\uFE0F Ustawienia",mount:(e,t)=>{let r=y.getAllEntries(),a=Array.from(new Set(r.map(p=>p.category))).sort();e.innerHTML=`
      <div class="category-view" style="max-width: 1000px; margin: 0 auto;">
        <div class="view-header">
          <h2>\u2699\uFE0F Zarz\u0105dzanie cenami</h2>
        </div>

        <div class="settings-tabs" style="display: flex; gap: 5px; margin-bottom: 20px;">
          <button class="tab-btn active" data-tab="tab-ceny">Ceny</button>
          <button class="tab-btn" data-tab="tab-mnozniki">Mno\u017Cniki</button>
          <button class="tab-btn" data-tab="tab-progi">Progi ilo\u015Bciowe</button>
          <button class="tab-btn" data-tab="tab-ogolne">Og\xF3lne</button>
        </div>

        <div id="tab-ceny" class="tab-content active">
          <div class="card">
            <div class="sticky-actions">
              <div style="display: flex; gap: 10px; align-items: center;">
                <label style="margin: 0;">Filtruj kategori\u0119:</label>
                <select id="filter-category" style="width: 200px;">
                  <option value="">Wszystkie</option>
                  ${a.map(p=>`<option value="${p}">${p}</option>`).join("")}
                </select>
              </div>
              <button id="save-prices-top" class="btn-success save-btn">Zapisz ceny</button>
            </div>

            <div class="settings-table-container">
              <table class="settings-table">
                <thead>
                  <tr>
                    <th>Kategoria</th>
                    <th>Produkt / Pr\xF3g</th>
                    <th>Aktualna cena</th>
                    <th>Nowa cena</th>
                  </tr>
                </thead>
                <tbody id="price-table-body">
                  <!-- Rows will be injected here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="tab-mnozniki" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Wsp\xF3\u0142czynniki i mno\u017Cniki</h3>
            <p style="color: #94a3b8;">Zarz\u0105dzaj mno\u017Cnikami dla dwustronno\u015Bci, ekspresu i innych.</p>
            <div class="settings-table-container">
              <table class="settings-table">
                <thead>
                  <tr><th>Nazwa</th><th>Warto\u015B\u0107</th></tr>
                </thead>
                <tbody>
                  <tr><td>Dwustronno\u015B\u0107 (Standard)</td><td>1.8x</td></tr>
                  <tr><td>Tryb EXPRESS</td><td>1.2x</td></tr>
                  <tr><td>Druk Satyna (+12%)</td><td>1.12x</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="tab-progi" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Progi ilo\u015Bciowe</h3>
            <p style="color: #94a3b8;">Definiuj progi dla kalkulacji uniwersalnej.</p>
            <!-- Content for thresholds -->
          </div>
        </div>

        <div id="tab-ogolne" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Ustawienia og\xF3lne</h3>
            <div class="form-group">
              <label>Nazwa drukarni:</label>
              <input type="text" class="form-control" value="RazDwa">
            </div>
            <div class="form-group">
              <label>Waluta:</label>
              <input type="text" class="form-control" value="PLN">
            </div>
          </div>
        </div>

        <div id="save-success" class="modal-overlay" style="display: none; background: rgba(16, 185, 129, 0.2);">
           <div class="modal-content" style="border-color: #10b981;">
              <h3 style="color: #10b981;">\u2705 Sukces</h3>
              <p>Ceny zosta\u0142y zaktualizowane!</p>
              <button id="close-success" class="btn-success" style="margin-top: 20px;">OK</button>
           </div>
        </div>
      </div>
    `;let i=e.querySelector("#price-table-body"),o=e.querySelector("#filter-category"),l=e.querySelector("#save-success"),c=e.querySelector("#close-success");function s(p=""){let m=p?r.filter(n=>n.category===p):r;i.innerHTML=m.map(n=>`
        <tr data-category="${n.category}">
          <td style="color: #94a3b8;">${n.category}</td>
          <td><strong>${n.name}</strong></td>
          <td>${n.currentValue.toFixed(2)} z\u0142</td>
          <td>
            <input type="number" step="0.01" min="0"
                   class="price-input" data-id="${n.id}"
                   placeholder="${n.currentValue.toFixed(2)}">
          </td>
        </tr>
      `).join("")}function d(){let p=e.querySelectorAll(".price-input"),m={},n=0;if(p.forEach(g=>{let x=g.value;if(x!==""&&!isNaN(parseFloat(x))){let v=parseFloat(x),M=g.getAttribute("data-id"),C=r.find(k=>k.id===M);C&&C.currentValue!==v&&(m[M]=v,n++)}}),n>0){y.updatePrices(m);let g=y.getAllEntries();r.forEach(x=>{m[x.id]!==void 0&&(x.currentValue=m[x.id])}),s(o.value),l&&(l.style.display="flex")}else alert("Brak zmian do zapisania.")}let u=e.querySelectorAll(".tab-btn"),f=e.querySelectorAll(".tab-content");u.forEach(p=>{p.addEventListener("click",()=>{let m=p.getAttribute("data-tab");u.forEach(n=>n.classList.remove("active")),p.classList.add("active"),f.forEach(n=>{n.id===m?n.style.display="block":n.style.display="none"})})}),o.addEventListener("change",()=>s(o.value)),e.querySelectorAll(".save-btn").forEach(p=>p.addEventListener("click",d)),c?.addEventListener("click",()=>{l&&(l.style.display="none")}),s()}};var I=new U;function O(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),r=document.getElementById("json-preview");if(!e||!t||!r)return;let a=I.getItems();if(a.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=a.map((o,l)=>`
      <div class="basket-item" style="padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: #003B5C; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${o.category}: ${o.name}
            </strong>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">
              ${o.optionsHint} (${o.quantity} ${o.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${E(o.totalPrice)}</strong>
            <button onclick="window.removeItem(${l})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let i=I.getGrandTotal();t.innerText=E(i)}r.innerText=JSON.stringify(a.map(i=>i.payload),null,2)}window.removeItem=e=>{I.removeItem(e),O()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),r=document.getElementById("categorySearch"),a=document.getElementById("tryb-express");if(!e||!t||!a||!r)return;let i=()=>({cart:{addItem:n=>{I.addItem(n),O()}},addToBasket:n=>{I.addItem({id:`item-${Date.now()}`,category:n.category,name:n.description||"Produkt",quantity:1,unit:"szt.",unitPrice:n.price,isExpress:a.checked,totalPrice:n.price,optionsHint:n.description||"",payload:n}),O()},expressMode:a.checked,updateLastCalculated:(n,g)=>{let x=document.getElementById("last-calculated"),v=document.getElementById("currentHint");x&&(x.innerText=E(n)),v&&(v.innerText=g?`(${g})`:"")}}),o=new K(e,i);o.setCategories(te),De.forEach(n=>{o.addRoute(n)}),o.addRoute(Be);let l={};te.forEach(n=>{let g=n.group||"Inne";if(!l[g]){let v=document.createElement("optgroup");v.label=g,t.appendChild(v),l[g]=v}let x=document.createElement("option");x.value=n.id,x.innerText=`${n.icon} ${n.name}`,n.implemented||(x.disabled=!0,x.innerText+=" (wkr\xF3tce)"),l[g].appendChild(x)}),t.addEventListener("change",()=>{let n=t.value;n?window.location.hash=`#/${n}`:window.location.hash="#/"}),r.addEventListener("input",()=>{let n=r.value.toLowerCase();Array.from(t.options).forEach((x,v)=>{if(v===0)return;let M=x.text.toLowerCase();x.hidden=!M.includes(n)})}),r.addEventListener("keydown",n=>{if(n.key==="Enter"){let g=r.value.toLowerCase(),x=Array.from(t.options).find((v,M)=>M>0&&!v.hidden&&!v.disabled);x&&(t.value=x.value,window.location.hash=`#/${x.value}`,r.value="")}}),window.addEventListener("hashchange",()=>{let g=(window.location.hash||"#/").slice(2);t.value=g}),a.addEventListener("change",()=>{let n=window.location.hash;window.location.hash="",window.location.hash=n}),document.getElementById("clear-basket")?.addEventListener("click",()=>{I.clear(),O()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let n={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(I.isEmpty()){alert("Lista jest pusta!");return}ie(I.getItems(),n)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let n=I.getItems(),g=JSON.stringify(n.map(x=>x.payload),null,2);navigator.clipboard.writeText(g).then(()=>{alert("JSON skopiowany do schowka!")})}),O(),o.start();let c=document.getElementById("settings-btn"),s=document.getElementById("pin-modal"),d=document.getElementById("pin-input"),u=document.getElementById("pin-submit"),f=document.getElementById("pin-cancel"),p=document.getElementById("pin-error");c?.addEventListener("click",()=>{s&&(s.style.display="flex"),d?.focus()}),f?.addEventListener("click",()=>{s&&(s.style.display="none"),d&&(d.value=""),p&&(p.style.display="none")});let m=()=>{d?.value===Ie.SETTINGS_PIN?(s&&(s.style.display="none"),d.value="",p&&(p.style.display="none"),window.location.hash="#/settings"):(p&&(p.style.display="block"),d&&(d.value="",d.focus()))};u?.addEventListener("click",m),d?.addEventListener("keydown",n=>{n.key==="Enter"&&m()})});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
