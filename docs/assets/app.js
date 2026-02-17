var Be=Object.defineProperty;var Re=(e,t)=>{for(var r in t)Be(e,r,{get:t[r],enumerable:!0})};var K=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,r){this.container=t,this.getCtx=r,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let r=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let a=this.routes.get(r),i=this.categories.find(o=>o.id===r);if(!a&&i&&i.type==="iframe"&&(a={id:i.id,name:i.name,mount:o=>{o.innerHTML=`
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
      `;this.container.innerHTML=r}start(){this.handleRoute()}};function S(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var U=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,r)=>t+r.totalPrice,0)}isEmpty(){return this.items.length===0}};function ne(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let r=e.map(d=>({Kategoria:d.category,Nazwa:d.name,Ilo\u015B\u0107:d.quantity,Jednostka:d.unit,"Cena jedn.":d.unitPrice,"Express (+20%)":d.isExpress?"TAK":"NIE","Cena ca\u0142kowita":d.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),a=XLSX.utils.json_to_sheet(r),i=XLSX.utils.book_new();XLSX.utils.book_append_sheet(i,a,"Zam\xF3wienie");let o=new Date().toISOString().slice(0,10),l=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${o}.xlsx`;XLSX.writeFile(i,l)}var te=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki",icon:"\u{1F4C4}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki",icon:"\u{1F4C7}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia",icon:"\u2709\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",group:"Druk ma\u0142oformatowy",implemented:!0},{id:"druk-cad",name:"Druk CAD",icon:"\u{1F4D0}",group:"Druk wielkoformatowy",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",group:"Druk wielkoformatowy",implemented:!0},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",group:"Druk wielkoformatowy",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",group:"Druk wielkoformatowy",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",group:"Druk wielkoformatowy",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",group:"Reklama i wyko\u0144czenie",implemented:!0},{id:"cad-kalkulator",name:"CAD - Kalkulator",description:"Wycena wydruk\xF3w wielkiformatowych (A3-A0+)",icon:"\u{1F5A8}\uFE0F",group:"Druk wielkoformatowy",path:"/kalkulator-cad",type:"iframe",implemented:!0}];var se={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=e.querySelector("#addSampleBtn"),a=e.querySelector("#sampleQty");r?.addEventListener("click",()=>{let i=parseInt(a.value)||1,o=i*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:i},price:o}),alert(`Dodano do koszyka: ${i} szt. za ${S(o)}`)})},unmount:()=>{console.log("Unmounting sample category")}};var re=class e{static instance;overrides={};registry=new Map;products=[];rules=[];constructor(){this.loadOverrides(),this.loadStructuredData()}static getInstance(){return e.instance||(e.instance=new e),e.instance}loadOverrides(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_overrides");t&&(this.overrides=JSON.parse(t))}catch(t){console.error("Failed to load price overrides",t)}}saveOverrides(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_overrides",JSON.stringify(this.overrides))}catch(t){console.error("Failed to save price overrides",t)}}loadStructuredData(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_products"),r=localStorage.getItem("price_rules");t&&(this.products=JSON.parse(t)),r&&(this.rules=JSON.parse(r))}catch{}}saveStructuredData(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_products",JSON.stringify(this.products)),localStorage.setItem("price_rules",JSON.stringify(this.rules))}catch{}}register(t,r,a,i){let o=this.overrides[t]!==void 0?this.overrides[t]:i;return this.registry.set(t,{id:t,category:r,name:a,defaultValue:i,currentValue:o}),o}get(t,r){return this.overrides[t]!==void 0?this.overrides[t]:r}updatePrices(t){for(let[r,a]of Object.entries(t)){this.overrides[r]=a;let i=this.registry.get(r);i&&(i.currentValue=a)}this.saveOverrides()}getAllEntries(){return Array.from(this.registry.values())}getProducts(){return this.products}getRules(t){return t?this.rules.filter(r=>r.product_id===t):this.rules}addProduct(t){this.products.find(r=>r.id===t.id)||(this.products.push(t),this.saveStructuredData())}addRule(t){let r=this.rules.findIndex(a=>a.product_id===t.product_id&&a.name===t.name&&a.threshold===t.threshold);r>=0?this.rules[r]=t:this.rules.push(t),this.saveStructuredData()}registerTiers(t,r,a){return a.map((i,o)=>{let l=`${t}-tier-${o}`,d=i.from!==void 0?`${i.from}-${i.to||"\u221E"} szt`:`${i.min}-${i.max||"\u221E"} szt`,c=i.unit!==void 0?"unit":"price",m=i[c],p=this.register(l,r,d,m);return{...i,[c]:p}})}},u=re.getInstance();function Ve(e,t){let r=[...e].sort((o,l)=>o.min-l.min),a=r.find(o=>t>=o.min&&(o.max===null||t<=o.max));if(a)return a;let i=r.find(o=>o.min>=t);return i||r[r.length-1]}function je(e,t){if(!t)return e;let r=t.find(a=>a.type==="minimum"&&a.unit==="m2");return r&&e<r.value?r.value:e}function q(e,t,r=[]){let a=je(t,e.rules),i=u.registerTiers(e.id,e.title,e.tiers),o=Ve(i,a),l=0;e.pricing==="per_unit"?l=a*o.price:l=o.price;let d=0,c=[];if(e.modifiers)for(let f of r){let n=e.modifiers.find(y=>y.id===f);if(n){c.push(n.name);let y=u.register(`${e.id}-mod-${n.id}`,e.title,n.name,n.value);n.type==="percent"?d+=l*y:n.type==="fixed_per_unit"?d+=y*a:d+=y}}let m=l+d,p=e.rules?.find(f=>f.type==="minimum"&&f.unit==="pln");return p&&m<p.value&&(m=p.value),{basePrice:l,effectiveQuantity:a,tierPrice:o.price,modifiersTotal:d,totalPrice:parseFloat(m.toFixed(2)),appliedModifiers:c}}var le={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:.2}]};var ce={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let r=le;e.innerHTML=`
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
    `;let a=e.querySelector("#plakatyQty"),i=e.querySelector("#plakatyExpress"),o=e.querySelector("#plakatyResult"),l=e.querySelector("#addPlakatyBtn");function d(){let c=parseFloat(a.value)||0,m=i.checked?["EXPRESS"]:[];try{let p=q(c,r,m);o.textContent=S(p.totalPrice)}catch{o.textContent="B\u0142\u0105d"}}a.addEventListener("input",d),i.addEventListener("change",d),l.addEventListener("click",()=>{let c=parseFloat(a.value)||0,m=i.checked?["EXPRESS"]:[],p=q(c,r,m);t.cart.addItem({categoryId:r.id,categoryName:r.title,details:{qty:`${c} m2`,express:i.checked},price:p.totalPrice})}),d()}};var Oe=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function Ne(){return Oe.map(e=>({qty:e.qty,single:u.register(`vouchery-s-${e.qty}`,"Vouchery",`Jednostronne ${e.qty} szt`,e.single),double:u.register(`vouchery-d-${e.qty}`,"Vouchery",`Dwustronne ${e.qty} szt`,e.double)}))}function We(e,t){let r=Ne(),a=r[0];for(let i of r)if(e>=i.qty)a=i;else break;return t?a.single:a.double}var de={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let d=e.querySelector("#format").value,c=parseInt(e.querySelector("#quantity").value)||1,m=e.querySelector("#sides").value,p=e.querySelector("#paper").value,f=We(c,m==="single"),n=u.register("vouchery-mod-satin","Vouchery","Dop\u0142ata Satyna",.12),y=u.register("vouchery-mod-express","Vouchery","Dop\u0142ata Express",.2),s=p==="satin"?1+n:1,g=t.expressMode?1+y:1;if(r=f*s*g,o&&(o.textContent=r.toFixed(2)+" z\u0142"),l){let x=VOUCHERY_PRICING[0];for(let k of VOUCHERY_PRICING)if(c>=k.qty)x=k;else break;l.textContent="Podstawa: "+f.toFixed(2)+" z\u0142 za "+c+" szt (przedzia\u0142: "+x.qty+"+ szt)"}t.updateLastCalculated(r,"Vouchery "+d+" "+(m==="single"?"jednostronne":"dwustronne")+" - "+c+" szt")}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let d=e.querySelector("#format").value,c=e.querySelector("#quantity").value,m=e.querySelector("#sides").value,p=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:r,description:d+" "+(m==="single"?"jednostronne":"dwustronne")+", "+c+" szt, "+(p==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+r.toFixed(2)+" z\u0142")})}};var me=[{qty:1,price:20},{qty:2,price:30},{qty:3,price:32},{qty:4,price:34},{qty:5,price:35},{qty:6,price:35},{qty:7,price:36},{qty:8,price:37},{qty:9,price:39},{qty:10,price:40},{qty:15,price:45},{qty:20,price:49},{qty:30,price:58},{qty:40,price:65},{qty:50,price:75},{qty:100,price:120}];function Ke(e){let t=u.registerTiers("dyplomy","Dyplomy",me.map(a=>({min:a.qty,max:null,price:a.price}))),r=t[0];for(let a of t)if(e>=a.min)r=a;else break;return r.price}var pe={id:"dyplomy",name:"\u{1F393} Dyplomy",mount:(e,t)=>{e.innerHTML=`
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
          <label>Papier:</label>
          <select id="paper">
            <option value="standard">Standardowy (kreda)</option>
            <option value="satin">Satynowy (+12%)</option>
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let d=parseInt(e.querySelector("#quantity").value)||1,c=e.querySelector("#paper").value,m=Ke(d),p=c==="satin"?1.12:1,f=t.expressMode?1.2:1;if(r=m*p*f,o&&(o.textContent=`${r.toFixed(2)} z\u0142`),l){let n=u.registerTiers("dyplomy","Dyplomy",me.map(s=>({min:s.qty,max:null,price:s.price}))),y=n[0];for(let s of n)if(d>=s.min)y=s;else break;l.textContent=`${d} szt, przedzia\u0142: ${y.min}+ szt \u2192 ${m.toFixed(2)} z\u0142${c==="satin"?" \xD7 1.12 (satyna)":""}`}t.updateLastCalculated(r,`Dyplomy DL - ${d} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let d=e.querySelector("#quantity").value,c=e.querySelector("#paper").value;t.addToBasket({category:"Dyplomy",price:r,description:`DL dwustronny, ${d} szt, ${c==="satin"?"satyna":"standard"}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var Ue={"85x55":[{qty:50,plain:65,foil:160},{qty:100,plain:75,foil:170},{qty:150,plain:85,foil:180},{qty:200,plain:96,foil:190},{qty:250,plain:110,foil:200},{qty:300,plain:126,foil:220},{qty:400,plain:146,foil:240},{qty:500,plain:170,foil:250},{qty:1e3,plain:290,foil:335}],"90x50":[{qty:50,plain:70,foil:170},{qty:100,plain:79,foil:180},{qty:150,plain:89,foil:190},{qty:200,plain:99,foil:200},{qty:250,plain:120,foil:210},{qty:300,plain:129,foil:230},{qty:400,plain:149,foil:250},{qty:500,plain:175,foil:260},{qty:1e3,plain:300,foil:345}]};function Qe(e,t,r){let a=Ue[e],i=r?"foil":"plain",o=u.registerTiers(`wizytowki-${e}-${i}`,`Wizyt\xF3wki ${e} ${i}`,a.map(d=>({min:d.qty,max:null,price:r?d.foil:d.plain}))),l=o[0];for(let d of o)if(t>=d.min)l=d;else break;return l.price}var ue={id:"wizytowki",name:"\u{1F4BC} Wizyt\xF3wki",mount:(e,t)=>{e.innerHTML=`
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
          <label>Wyko\u0144czenie:</label>
          <select id="foiling">
            <option value="plain">Bez foliowania</option>
            <option value="foil">Z foli\u0105 mat/b\u0142ysk</option>
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let d=e.querySelector("#format").value,c=parseInt(e.querySelector("#quantity").value),m=e.querySelector("#foiling").value;r=Qe(d,c,m==="foil"),t.expressMode&&(r*=1.2),o&&(o.textContent=`${r.toFixed(2)} z\u0142`),l&&(l.textContent=`Format ${d} mm, ${c} szt, ${m==="foil"?"z foli\u0105":"bez foliowania"}`),t.updateLastCalculated(r,`Wizyt\xF3wki ${d} - ${c} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let d=e.querySelector("#format").value,c=e.querySelector("#quantity").value,m=e.querySelector("#foiling").value;t.addToBasket({category:"Wizyt\xF3wki",price:r,description:`${d} mm, ${c} szt, ${m==="foil"?"z foli\u0105":"bez foliowania"}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var ae={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function ye(e){let{format:t,qty:r,sides:a,isFolded:i,isSatin:o,express:l}=e,d=ae.formats[t];if(!d)throw new Error(`Invalid format: ${t}`);let c=a===1?"single":"double",m=i?"folded":"normal",p=d[c][m],f=Object.keys(p).map(Number).sort((E,z)=>E-z),n=f[0];for(let E of f)r>=E&&(n=E);let y=p[n.toString()],s=u,g=`zap-${t}-${c}-${m}-${n}`,x=`Zaproszenia ${t} ${c==="single"?"1s":"2s"} ${m==="folded"?"sk\u0142":"norm"} (od ${n}szt)`,k=s.register(g,"Zaproszenia",x,y),C=[];o&&C.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:s.register("zap-mod-satin","Zaproszenia","Satyna (+%)",ae.modifiers.satin)}),l&&C.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:s.register("global-express","Global","Express (+%)",.2)});let A=0,w=[];for(let E of C)(E.type==="percent"||E.type==="percentage")&&(A+=k*E.value,w.push(E.name));let M=k+A;return{basePrice:k,effectiveQuantity:r,tierPrice:k/r,modifiersTotal:A,totalPrice:Math.round(M*100)/100,appliedModifiers:w}}var fe={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let r=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await r.text();let a=e.querySelector("#zapFormat"),i=e.querySelector("#zapSides"),o=e.querySelector("#zapFolded"),l=e.querySelector("#zapQty"),d=e.querySelector("#zapSatin"),c=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),p=e.querySelector("#zapResult"),f=()=>{let n={format:a.value,qty:parseInt(l.value)||10,sides:parseInt(i.value)||1,isFolded:o.checked,isSatin:d.checked,express:t.expressMode},y=ye(n);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=S(y.totalPrice/n.qty),e.querySelector("#resTotalPrice").textContent=S(y.totalPrice),e.querySelector("#resExpressHint").style.display=n.express?"block":"none",e.querySelector("#resSatinHint").style.display=n.isSatin?"block":"none",t.updateLastCalculated(y.totalPrice,"Zaproszenia"),{options:n,result:y}};c.addEventListener("click",()=>f()),m.addEventListener("click",()=>{let{options:n,result:y}=f();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${n.format} ${n.sides===1?"1-str":"2-str"}${n.isFolded?" sk\u0142adane":""}`,quantity:n.qty,unit:"szt",unitPrice:y.totalPrice/n.qty,isExpress:n.express,totalPrice:y.totalPrice,optionsHint:`${n.qty} szt, ${n.isSatin?"Satyna":"Kreda"}`,payload:n})}),f()}};var ge={name:"Ulotki \u2013 cyfrowe",jednostronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}},dwustronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:365},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function Je(e,t="jednostronne"){let r=ge[t];if(!r)throw new Error(`Invalid mode: ${t}`);let a=r[e];if(!a)throw new Error(`Invalid format: ${e} for mode ${t}`);return{id:`ulotki-${t}-${e.toLowerCase()}`,title:`Ulotki Cyfrowe ${t==="dwustronne"?"Dwustronne":"Jednostronne"} ${a.name}`,unit:"szt",pricing:"flat",tiers:a.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function xe(e){let t=Je(e.format,e.mode),r=[];return e.express&&r.push("express"),q(t,e.qty,r)}var be={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",async mount(e,t){try{let r=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#uj-format"),a=e.querySelector("#uj-qty-input"),i=e.querySelector("#uj-add-to-cart"),o=e.querySelector("#uj-result-display"),l=e.querySelector("#uj-total-price"),d=e.querySelector("#uj-unit-price"),c=e.querySelector("#uj-display-qty"),m=e.querySelector("#uj-express-hint"),p=e.querySelector("#uj-individual-quote"),f=null,n=null,y=()=>{let s=e.querySelector('input[name="uj-mode"]:checked').value,g=parseInt(a.value)||0,x=r.value;if(g>1e3){o.style.display="none",p.style.display="block",i.disabled=!0;return}if(g<1){o.style.display="none",p.style.display="none",i.disabled=!0;return}p.style.display="none",n={mode:s,format:x,qty:g,express:t.expressMode};try{let k=xe(n);f=k,c.innerText=`${g} szt`,d.innerText=S(k.totalPrice/g),l.innerText=S(k.totalPrice),m&&(m.style.display=t.expressMode?"block":"none"),o.style.display="block",i.disabled=!1,t.updateLastCalculated(k.totalPrice,"Ulotki")}catch(k){console.error(k),o.style.display="none",i.disabled=!0}};e.querySelectorAll('input[name="uj-mode"]').forEach(s=>{s.addEventListener("change",y)}),r.onchange=y,a.oninput=y,i.onclick=()=>{if(f&&n){let s=n.express?", EXPRESS":"",g=n.mode==="dwustronne"?"Dwustronne":"Jednostronne";t.cart.addItem({id:`ulotki-cyfrowe-${Date.now()}`,category:"Ulotki",name:`Ulotki ${g} ${n.format}`,quantity:n.qty,unit:"szt",unitPrice:f.totalPrice/n.qty,isExpress:n.express,totalPrice:f.totalPrice,optionsHint:`${n.qty} szt, ${g}${s}`,payload:f})}},y()}};var he={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ke(e){let t=he,r=t.materials.find(m=>m.id===e.material);if(!r)throw new Error(`Unknown material: ${e.material}`);let a="Bannery",i=`banner-${e.material}`,o=u.registerTiers(i,a,r.tiers),l=t.modifiers.map(m=>({...m,value:u.register(`banner-mod-${m.id}`,a,`Dop\u0142ata ${m.name}`,m.value)})),d={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o,modifiers:l},c=[];return e.oczkowanie&&c.push("oczkowanie"),e.express&&c.push("express"),q(d,e.areaM2,c)}var we={id:"banner",name:"Bannery",async mount(e,t){try{let r=await fetch("categories/banner.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#b-material"),a=e.querySelector("#b-area"),i=e.querySelector("#b-oczkowanie"),o=e.querySelector("#b-calculate"),l=e.querySelector("#b-add-to-cart"),d=e.querySelector("#b-result-display"),c=e.querySelector("#b-unit-price"),m=e.querySelector("#b-total-price"),p=e.querySelector("#b-express-hint"),f=null,n=null;o.onclick=()=>{n={material:r.value,areaM2:parseFloat(a.value),oczkowanie:i.checked,express:t.expressMode};try{let y=ke(n);f=y,c.innerText=S(y.tierPrice),m.innerText=S(y.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),d.style.display="block",l.disabled=!1,t.updateLastCalculated(y.totalPrice,"Banner")}catch(y){alert("B\u0142\u0105d: "+y.message)}},l.onclick=()=>{if(f&&n){let y=r.options[r.selectedIndex].text,s=[`${n.areaM2} m2`,n.oczkowanie?"z oczkowaniem":"bez oczkowania",n.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:y,quantity:n.areaM2,unit:"m2",unitPrice:f.tierPrice,isExpress:n.express,totalPrice:f.totalPrice,optionsHint:s,payload:f})}}}};var _={};Re(_,{category:()=>Ye,default:()=>rt,groups:()=>et,modifiers:()=>tt});var Ye="Wlepki / Naklejki",et=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],tt=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],rt={category:Ye,groups:et,modifiers:tt};function ve(e){let t=_,r=t.groups.find(o=>o.id===e.groupId);if(!r)throw new Error(`Unknown group: ${e.groupId}`);let a={id:`wlepki-${r.id}`,title:r.title,unit:r.unit,pricing:r.pricing||"per_unit",tiers:r.tiers,modifiers:t.modifiers,rules:r.rules||[{type:"minimum",unit:"m2",value:1}]},i=[...e.modifiers];return e.express&&i.push("express"),q(a,e.area,i)}var Se={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let r=_;try{let y=await fetch("categories/wlepki-naklejki.html");if(!y.ok)throw new Error("Failed to load template");e.innerHTML=await y.text()}catch(y){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${y}</div>`;return}let a=e.querySelector("#wlepki-group"),i=e.querySelector("#wlepki-area"),o=e.querySelector("#btn-calculate"),l=e.querySelector("#btn-add-to-cart"),d=e.querySelector("#wlepki-result"),c=e.querySelector("#unit-price"),m=e.querySelector("#total-price"),p=null,f=null,n=()=>{let y=e.querySelectorAll(".wlepki-mod:checked"),s=Array.from(y).map(g=>g.value);f={groupId:a.value,area:parseFloat(i.value)||0,express:t.expressMode,modifiers:s};try{let g=ve(f);p=g,c.textContent=S(g.tierPrice),m.textContent=S(g.totalPrice),d.style.display="block",l.disabled=!1,t.updateLastCalculated(g.totalPrice,"Wlepki")}catch(g){alert("B\u0142\u0105d: "+g.message)}};o.addEventListener("click",n),l.addEventListener("click",()=>{if(!p||!f)return;let y=r.groups.find(g=>g.id===f.groupId),s=f.modifiers.map(g=>{let x=r.modifiers.find(k=>k.id===g);return x?x.name:g});f.express&&s.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:y?.title||"Wlepki",quantity:f.area,unit:"m2",unitPrice:p.tierPrice,isExpress:!!f.express,totalPrice:p.totalPrice,optionsHint:s.join(", ")||"Standard",payload:p})})}};var Z={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function Ee(e){let t=Z.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let r="Roll-up",a;if(e.isReplacement){let o=t.width*t.height,l=u.register("rollup-repl-m2",r,"Wymiana: Druk za m2",Z.replacement.print_per_m2),d=u.register("rollup-repl-labor",r,"Wymiana: Robocizna",Z.replacement.labor),c=o*l+d,m=u.register("rollup-repl-express",r,"Dop\u0142ata Express (wymiana)",.2);a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:c}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:m}]}}else{let o=`rollup-full-${e.format}`,l=u.registerTiers(o,r,t.tiers),d=u.register(`${o}-express`,r,`Dop\u0142ata Express (${e.format})`,.2);a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:l,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:d}]}}let i=[];return e.express&&i.push("express"),q(a,e.qty,i)}var Te={id:"roll-up",name:"Roll-up",async mount(e,t){let r=await fetch("categories/roll-up.html");e.innerHTML=await r.text();let a=e.querySelector("#rollUpType"),i=e.querySelector("#rollUpFormat"),o=e.querySelector("#rollUpQty"),l=e.querySelector("#calcBtn"),d=e.querySelector("#addToCartBtn"),c=e.querySelector("#rollUpResult"),m=()=>{let p={format:i.value,qty:parseInt(o.value)||1,isReplacement:a.value==="replacement",express:t.expressMode},f=Ee(p);return c.style.display="block",e.querySelector("#resUnitPrice").textContent=S(f.totalPrice/p.qty),e.querySelector("#resTotalPrice").textContent=S(f.totalPrice),e.querySelector("#resExpressHint").style.display=p.express?"block":"none",t.updateLastCalculated(f.totalPrice,"Roll-up"),{options:p,result:f}};l.addEventListener("click",()=>m()),d.addEventListener("click",()=>{let{options:p,result:f}=m();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${p.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${p.format}`,quantity:p.qty,unit:"szt",unitPrice:f.totalPrice/p.qty,isExpress:p.express,totalPrice:f.totalPrice,optionsHint:`${p.format}, ${p.qty} szt`,payload:p})}),m()}};async function it(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function X(e,t,r){return{id:e,name:t,mount:async(a,i)=>{a.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let o=await it(r);a.innerHTML=o,ot(a,i)}catch(o){a.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${o}</small>
          </div>
        `,console.error("Category load error:",o)}}}}function ot(e,t){e.querySelectorAll("button[data-action]").forEach(a=>{let i=a.getAttribute("data-action");i==="calculate"&&a.addEventListener("click",()=>{console.log("Calculate clicked")}),i==="add-to-basket"&&a.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var Le={id:"druk-cad",name:"Druk CAD wielkoformatowy",async mount(e,t){try{let r=await fetch("categories/druk-cad-advanced.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=u,a="CAD",i={formatowe:{czb:{A3:r.register("cad-f-czb-A3",a,"CAD A3 CZB",2.5),A2:r.register("cad-f-czb-A2",a,"CAD A2 CZB",4),A1:r.register("cad-f-czb-A1",a,"CAD A1 CZB",6),A0:r.register("cad-f-czb-A0",a,"CAD A0 CZB",11),"A0+":r.register("cad-f-czb-A0p",a,"CAD A0+ CZB",12.5)},kolor:{A3:r.register("cad-f-kol-A3",a,"CAD A3 Kolor",5.3),A2:r.register("cad-f-kol-A2",a,"CAD A2 Kolor",8.5),A1:r.register("cad-f-kol-A1",a,"CAD A1 Kolor",12),A0:r.register("cad-f-kol-A0",a,"CAD A0 Kolor",24),"A0+":r.register("cad-f-kol-A0p",a,"CAD A0+ Kolor",26)}},nieformatowe:{czb:{297:r.register("cad-n-czb-297",a,"CAD 297mm CZB (z\u0142/mb)",3.5),420:r.register("cad-n-czb-420",a,"CAD 420mm CZB (z\u0142/mb)",4.5),594:r.register("cad-n-czb-594",a,"CAD 594mm CZB (z\u0142/mb)",5),841:r.register("cad-n-czb-841",a,"CAD 841mm CZB (z\u0142/mb)",9),914:r.register("cad-n-czb-914",a,"CAD 914mm CZB (z\u0142/mb)",10),1067:r.register("cad-n-czb-1067",a,"CAD 1067mm CZB (z\u0142/mb)",12.5)},kolor:{297:r.register("cad-n-kol-297",a,"CAD 297mm Kolor (z\u0142/mb)",12),420:r.register("cad-n-kol-420",a,"CAD 420mm Kolor (z\u0142/mb)",13.9),594:r.register("cad-n-kol-594",a,"CAD 594mm Kolor (z\u0142/mb)",14.5),841:r.register("cad-n-kol-841",a,"CAD 841mm Kolor (z\u0142/mb)",20),914:r.register("cad-n-kol-914",a,"CAD 914mm Kolor (z\u0142/mb)",21),1067:r.register("cad-n-kol-1067",a,"CAD 1067mm Kolor (z\u0142/mb)",30)}},skladanie:{formatowe:{A3:r.register("cad-s-f-A3",a,"CAD Sk\u0142adanie A3",1),"A3-poprzeczne":r.register("cad-s-f-A3p",a,"CAD Sk\u0142adanie A3L",.7),A2:r.register("cad-s-f-A2",a,"CAD Sk\u0142adanie A2",1.5),A1:r.register("cad-s-f-A1",a,"CAD Sk\u0142adanie A1",2),A0:r.register("cad-s-f-A0",a,"CAD Sk\u0142adanie A0",3),"A0+":r.register("cad-s-f-A0p",a,"CAD Sk\u0142adanie A0+",4)},nieformatowe:r.register("cad-s-n",a,"CAD Sk\u0142adanie mb (z\u0142/m2)",2.5)},skanowanie:r.register("cad-skan",a,"CAD Skanowanie (z\u0142/cm)",.08)},o={A3:[297,420],A2:[420,594],A1:[594,841],A0:[841,1189],"A0+":[914,1292]},l=[297,420,594,841,914,1067],d=5,c=[],m=!1,p=300,f=e.querySelector("#fileInput"),n=e.querySelector("#uploadZone"),y=e.querySelector("#dpiInput"),s=e.querySelector("#colorToggle"),g=e.querySelector("#colorSwitch"),x=e.querySelector("#filesTableWrapper"),k=e.querySelector("#filesTableBody"),C=e.querySelector("#summaryPanel"),A=e.querySelector("#summaryGrid"),w=e.querySelector("#clearBtn"),M=e.querySelector("#add-all-to-cart"),E=(b,h)=>b*25.4/h,z=b=>l.reduce((h,v)=>Math.abs(v-b)<Math.abs(h-b)?v:h),R=b=>l.includes(Math.round(b)),H=(b,h)=>{let v=Math.round(b),T=Math.round(h),[L,$]=v<T?[v,T]:[T,v];if(!R(L))return{format:`${L}mm`,isFormatowy:!1,isStandardWidth:!1,widthCategory:z(L)};for(let[B,V]of Object.entries(o)){let[N,W]=V;if(L===N){let ee=Math.abs($-W)<=d;return{format:B,isFormatowy:ee,isStandardWidth:!0,widthCategory:N,actualLength:$,standardLength:W}}}return{format:`${L}\xD7${$}`,isFormatowy:!1,isStandardWidth:!0,widthCategory:L}},J=b=>{let h=m?"kolor":"czb",{format:v,isFormatowy:T,widthCategory:L}=b.formatInfo;if(T)return i.formatowe[h][v]||0;{let $=i.nieformatowe[h][L]||0,B=Math.max(b.widthMm,b.heightMm)/1e3;return $*B}},G=b=>{if(!b.folding)return 0;let{format:h,isFormatowy:v}=b.formatInfo;if(v)return i.skladanie.formatowe[h]||0;{let T=b.widthMm/1e3*(b.heightMm/1e3);return i.skladanie.nieformatowe*T}},Y=b=>{if(!b.scanning)return 0;let h=Math.max(b.widthMm,b.heightMm);return i.skanowanie*h/10},F=()=>{if(c.length===0){x.style.display="none",C.style.display="none";return}x.style.display="block",C.style.display="block",k.innerHTML=c.map((h,v)=>{let T=J(h),L=G(h),$=Y(h),B=(T+L+$)*(t.expressMode?1.2:1),{format:V,isFormatowy:N,isStandardWidth:W}=h.formatInfo,ee=W?N?'<span class="badge badge-formatowy">Format</span>':'<span class="badge badge-nieformatowy">MB</span>':'<span class="badge badge-warning">\u26A0\uFE0F Niestandard</span>';return`
          <tr>
            <td>${h.name}</td>
            <td>${Math.round(h.widthMm)}\xD7${Math.round(h.heightMm)}</td>
            <td><strong>${V}</strong></td>
            <td>${ee}</td>
            <td><input type="checkbox" ${h.folding?"checked":""} data-idx="${v}" class="fold-check"></td>
            <td><input type="checkbox" ${h.scanning?"checked":""} data-idx="${v}" class="scan-check"></td>
            <td><strong>${B.toFixed(2)} z\u0142</strong></td>
          </tr>
        `}).join(""),e.querySelectorAll(".fold-check").forEach(h=>{h.addEventListener("change",v=>{c[parseInt(v.target.dataset.idx)].folding=v.target.checked,F()})}),e.querySelectorAll(".scan-check").forEach(h=>{h.addEventListener("change",v=>{c[parseInt(v.target.dataset.idx)].scanning=v.target.checked,F()})});let b=0;c.forEach(h=>{b+=(J(h)+G(h)+Y(h))*(t.expressMode?1.2:1)}),A.innerHTML=`
        <div class="summary-item"><span>Liczba plik\xF3w:</span><span>${c.length}</span></div>
        <div class="summary-item"><span>Razem brutto:</span><strong>${b.toFixed(2)} z\u0142</strong></div>
      `,t.updateLastCalculated(b,`Druk CAD (${c.length} plik\xF3w)`)};n.onclick=()=>f.click(),f.onchange=b=>{let h=b.target.files;for(let v of h)if(v.type.startsWith("image/")||v.type==="application/pdf"){let T=new Image,L=new FileReader;L.onload=$=>{T.onload=()=>{let B=E(T.width,p),V=E(T.height,p);c.push({name:v.name,widthPx:T.width,heightPx:T.height,widthMm:B,heightMm:V,formatInfo:H(B,V),folding:!1,scanning:!1}),F()},T.src=$.target.result},L.readAsDataURL(v)}else{let T=E(2480,p),L=E(3508,p);c.push({name:v.name,widthPx:2480,heightPx:3508,widthMm:T,heightMm:L,formatInfo:H(T,L),folding:!1,scanning:!1}),F()}},s.onclick=()=>{m=!m,g.classList.toggle("active"),F()},y.onchange=()=>{p=parseInt(y.value)||300,c=c.map(b=>{let h=E(b.widthPx,p),v=E(b.heightPx,p);return{...b,widthMm:h,heightMm:v,formatInfo:H(h,v)}}),F()},w.onclick=()=>{c=[],F()},M.onclick=()=>{c.forEach(b=>{let h=J(b),v=G(b),T=Y(b),L=(h+v+T)*(t.expressMode?1.2:1);t.cart.addItem({id:`cad-${Date.now()}-${Math.random()}`,category:"Druk CAD",name:b.name,quantity:1,unit:"szt.",unitPrice:L,isExpress:t.expressMode,totalPrice:parseFloat(L.toFixed(2)),optionsHint:`${b.formatInfo.format} (${m?"Kolor":"CZ-B"}), ${b.folding?"Sk\u0142adanie":""}`,payload:b})}),alert(`Dodano ${c.length} plik\xF3w do koszyka.`)}}};function oe(e,t){return e.find(r=>t>=r.from&&t<=r.to)||null}var j=(e,t,r)=>u.registerTiers(e,t,r),P={get print(){return{bw:{A4:j("print-bw-a4","Druk A4/A3",[{from:1,to:5,unit:.9},{from:6,to:20,unit:.6},{from:21,to:100,unit:.35},{from:101,to:500,unit:.3},{from:501,to:999,unit:.23},{from:1e3,to:4999,unit:.19},{from:5e3,to:99999,unit:.15}]),A3:j("print-bw-a3","Druk A4/A3",[{from:1,to:5,unit:1.7},{from:6,to:20,unit:1.1},{from:21,to:100,unit:.7},{from:101,to:500,unit:.6},{from:501,to:999,unit:.45},{from:1e3,to:99999,unit:.33}])},color:{A4:j("print-color-a4","Druk A4/A3",[{from:1,to:10,unit:2.4},{from:11,to:40,unit:2.2},{from:41,to:100,unit:2},{from:101,to:250,unit:1.8},{from:251,to:500,unit:1.6},{from:501,to:999,unit:1.4},{from:1e3,to:99999,unit:1.1}]),A3:j("print-color-a3","Druk A4/A3",[{from:1,to:10,unit:4.8},{from:11,to:40,unit:4.2},{from:41,to:100,unit:3.8},{from:101,to:250,unit:3},{from:251,to:500,unit:2.5},{from:501,to:999,unit:1.9},{from:1e3,to:99999,unit:1.6}])}}},get scan(){return{auto:j("scan-auto","Skany",[{from:1,to:9,unit:1},{from:10,to:49,unit:.5},{from:50,to:99,unit:.4},{from:100,to:999999999,unit:.25}]),manual:j("scan-manual","Skany",[{from:1,to:4,unit:2},{from:5,to:999999999,unit:1}])}},get email_price(){return u.get("email-price",1)}},ie={get color(){return{formatowe:{A0p:u.get("cad-color-f-a0p",26),A0:u.get("cad-color-f-a0",24),A1:u.get("cad-color-f-a1",12),A2:u.get("cad-color-f-a2",8.5),A3:u.get("cad-color-f-a3",5.3)},mb:{A0p:u.get("cad-color-m-a0p",21),A0:u.get("cad-color-m-a0",20),A1:u.get("cad-color-m-a1",14.5),A2:u.get("cad-color-m-a2",13.9),A3:u.get("cad-color-m-a3",12),R1067:u.get("cad-color-m-r1067",30)}}},get bw(){return{formatowe:{A0p:u.get("cad-bw-f-a0p",12.5),A0:u.get("cad-bw-f-a0",11),A1:u.get("cad-bw-f-a1",6),A2:u.get("cad-bw-f-a2",4),A3:u.get("cad-bw-f-a3",2.5)},mb:{A0p:u.get("cad-bw-m-a0p",10),A0:u.get("cad-bw-m-a0",9),A1:u.get("cad-bw-m-a1",5),A2:u.get("cad-bw-m-a2",4.5),A3:u.get("cad-bw-m-a3",3.5),R1067:u.get("cad-bw-m-r1067",12.5)}}}};var Ce={get A0p(){return u.get("fold-a0p",4)},get A0(){return u.get("fold-a0",3)},get A1(){return u.get("fold-a1",2)},get A2(){return u.get("fold-a2",1.5)},get A3(){return u.get("fold-a3",1)},get A3L(){return u.get("fold-a3l",.7)}},ze={get value(){return u.get("wf-scan-cm",.08)}},D=(e,t,r,a)=>{let i={};for(let[o,l]of Object.entries(a)){let d=`biz-${e}-${t}-${r}-${o}`,c=`Wizyt\xF3wki ${t} ${r} ${o} szt`;i[o]=u.register(d,"Wizyt\xF3wki",c,l)}return i},Ae={get cyfrowe(){return{standardPrices:{"85x55":{noLam:D("std","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290}),lam:D("std","85x55","lami",{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335})},"90x50":{noLam:D("std","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:D("std","90x50","lami",{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345})}},softtouchPrices:{"85x55":{noLam:D("st","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290}),lam:D("st","85x55","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380})},"90x50":{noLam:D("st","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:D("st","90x50","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390})}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:D("deluxe","UV 3D","Softtouch",{50:280,100:320,200:395,250:479,400:655,500:778})},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:D("deluxe","UV 3D Gold","Softtouch",{50:450,100:550,200:650,250:720,400:850,500:905})}}}}}},nt=()=>{let e=P.print,t=P.scan,r=P.email_price,a=ie.color,i=ie.bw,o=Ce.A0,l=ze.value,d=Ae.cyfrowe};nt();function Me(e){if(e.pages<=0)return{unitPrice:0,printTotal:0,emailTotal:e.email?P.email_price:0,inkTotal:0,grandTotal:e.email?P.email_price:0};let t=P.print[e.mode][e.format],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla druku.");let a=r.unit,i=e.pages*a,o=0;e.email&&(o=P.email_price);let l=0;return e.ink25&&(l=.5*a*e.ink25Qty),{unitPrice:a,printTotal:i,emailTotal:o,inkTotal:l,grandTotal:i+o+l}}function qe(e){if(e.pages<=0)return{unitPrice:0,total:0};let t=P.scan[e.type],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla skanowania.");let a=r.unit;return{unitPrice:a,total:e.pages*a}}function Pe(e,t){let r=e.format.toUpperCase(),a=Me({mode:e.mode,format:r,pages:e.printQty,email:e.email,ink25:e.surcharge,ink25Qty:e.surchargeQty}),i={total:0,unitPrice:0};e.scanType!=="none"&&e.scanQty>0&&(i=qe({type:e.scanType,pages:e.scanQty}));let o=a.grandTotal+i.total,l=o;return e.express&&(l=o*1.2),{totalPrice:parseFloat(l.toFixed(2)),unitPrintPrice:a.unitPrice,totalPrintPrice:a.printTotal,unitScanPrice:i.unitPrice,totalScanPrice:i.total,emailPrice:a.emailTotal,surchargePrice:a.inkTotal,baseTotal:o}}var De={id:"druk-a4-a3",name:"Druk A4/A3 + skan",async mount(e,t){try{let r=await fetch("categories/druk-a4-a3-skan.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#d-mode"),a=e.querySelector("#d-format"),i=e.querySelector("#d-print-qty"),o=e.querySelector("#d-email"),l=e.querySelector("#d-surcharge"),d=e.querySelector("#d-surcharge-qty"),c=e.querySelector("#surcharge-qty-row"),m=e.querySelector("#d-scan-type"),p=e.querySelector("#d-scan-qty"),f=e.querySelector("#scan-qty-row"),n=e.querySelector("#d-calculate"),y=e.querySelector("#d-add-to-cart"),s=e.querySelector("#d-result-display"),g=e.querySelector("#d-total-price"),x=e.querySelector("#d-express-hint"),k=e.querySelector("#tier-table"),C=()=>{if(!k||!r||!a)return;let M=r.value,E=a.value.toUpperCase(),R=P.print[M][E];R&&(k.innerHTML=R.map(H=>`<div>${H.from}-${H.to>=99999?"\u221E":H.to} szt.</div><div style="text-align: right;">${H.unit.toFixed(2)} z\u0142</div>`).join(""))};r&&(r.onchange=C),a&&(a.onchange=C),C(),l&&c&&(l.onchange=()=>{c.style.display=l.checked?"flex":"none"}),m&&f&&(m.onchange=()=>{f.style.display=m.value!=="none"?"flex":"none"});let A=null,w=null;n&&(n.onclick=()=>{w={mode:r.value,format:a.value,printQty:parseInt(i.value)||0,email:o.checked,surcharge:l.checked,surchargeQty:parseInt(d.value)||0,scanType:m.value,scanQty:parseInt(p.value)||0,express:t.expressMode};try{let M=Pe(w);A=M,g.innerText=S(M.totalPrice),x&&(x.style.display=t.expressMode?"block":"none"),s.style.display="block",y.disabled=!1,t.updateLastCalculated(M.totalPrice,"Druk A4/A3 + skan")}catch(M){alert("B\u0142\u0105d: "+M.message)}}),y&&(y.onclick=()=>{if(A&&w){let M=Date.now(),E=t.expressMode?1.2:1;if(w.printQty>0||w.scanQty>0&&w.scanType!=="none"){let z=[];w.printQty>0&&z.push(`${w.printQty} str. ${w.format.toUpperCase()} (${w.mode==="bw"?"CZ-B":"KOLOR"})`),w.scanQty>0&&w.scanType!=="none"&&z.push(`Skan ${w.scanType}: ${w.scanQty} str.`),t.expressMode&&z.push("EXPRESS");let R=(A.totalPrintPrice+A.totalScanPrice)*E;t.cart.addItem({id:`druk-${M}-main`,category:"Druk A4/A3 + skan",name:`${w.format.toUpperCase()} ${w.mode==="bw"?"CZ-B":"KOLOR"}`,quantity:w.printQty||w.scanQty,unit:w.printQty>0?"str.":"skan",unitPrice:R/(w.printQty||w.scanQty),isExpress:t.expressMode,totalPrice:parseFloat(R.toFixed(2)),optionsHint:z.join(", "),payload:{...A,type:"main"}})}if(w.email){let z=A.emailPrice*E;t.cart.addItem({id:`email-${M}-email`,category:"Druk A4/A3 + skan",name:"Wysy\u0142ka e-mail",quantity:1,unit:"szt.",unitPrice:z,isExpress:t.expressMode,totalPrice:parseFloat(z.toFixed(2)),optionsHint:t.expressMode?"EXPRESS":"",payload:{price:z,type:"email"}})}if(w.surcharge&&w.surchargeQty>0){let z=A.surchargePrice*E;t.cart.addItem({id:`surcharge-${M}-surcharge`,category:"Druk A4/A3 + skan",name:"Zadruk >25% - dop\u0142ata",quantity:w.surchargeQty,unit:"str.",unitPrice:z/w.surchargeQty,isExpress:t.expressMode,totalPrice:parseFloat(z.toFixed(2)),optionsHint:`${w.surchargeQty} str. (+50%), ${t.expressMode?"EXPRESS":""}`,payload:{price:z,type:"surcharge"}})}}})}};var $e=[se,ce,de,pe,ue,fe,be,we,Se,Te,Le,De,X("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),X("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),X("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var Ie={SETTINGS_PIN:"2024"};var He={id:"settings",name:"\u2699\uFE0F Ustawienia",mount:(e,t)=>{let r=u.getAllEntries(),a=Array.from(new Set(r.map(n=>n.category))).sort();e.innerHTML=`
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
                  ${a.map(n=>`<option value="${n}">${n}</option>`).join("")}
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
    `;let i=e.querySelector("#price-table-body"),o=e.querySelector("#filter-category"),l=e.querySelector("#save-success"),d=e.querySelector("#close-success");function c(n=""){let y=n?r.filter(s=>s.category===n):r;i.innerHTML=y.map(s=>`
        <tr data-category="${s.category}">
          <td style="color: #94a3b8;">${s.category}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.currentValue.toFixed(2)} z\u0142</td>
          <td>
            <input type="number" step="0.01" min="0"
                   class="price-input" data-id="${s.id}"
                   placeholder="${s.currentValue.toFixed(2)}">
          </td>
        </tr>
      `).join("")}function m(){let n=e.querySelectorAll(".price-input"),y={},s=0;if(n.forEach(g=>{let x=g.value;if(x!==""&&!isNaN(parseFloat(x))){let k=parseFloat(x),C=g.getAttribute("data-id"),A=r.find(w=>w.id===C);A&&A.currentValue!==k&&(y[C]=k,s++)}}),s>0){u.updatePrices(y);let g=u.getAllEntries();r.forEach(x=>{y[x.id]!==void 0&&(x.currentValue=y[x.id])}),c(o.value),l&&(l.style.display="flex")}else alert("Brak zmian do zapisania.")}let p=e.querySelectorAll(".tab-btn"),f=e.querySelectorAll(".tab-content");p.forEach(n=>{n.addEventListener("click",()=>{let y=n.getAttribute("data-tab");p.forEach(s=>s.classList.remove("active")),n.classList.add("active"),f.forEach(s=>{s.id===y?s.style.display="block":s.style.display="none"})})}),o.addEventListener("change",()=>c(o.value)),e.querySelectorAll(".save-btn").forEach(n=>n.addEventListener("click",m)),d?.addEventListener("click",()=>{l&&(l.style.display="none")}),c()}};var I=new U;function O(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),r=document.getElementById("json-preview");if(!e||!t||!r)return;let a=I.getItems();if(a.length===0)e.innerHTML=`
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
            <strong style="color: #667eea; font-size: 14px;">${S(o.totalPrice)}</strong>
            <button onclick="window.removeItem(${l})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let i=I.getGrandTotal();t.innerText=S(i)}r.innerText=JSON.stringify(a.map(i=>i.payload),null,2)}window.removeItem=e=>{I.removeItem(e),O()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),r=document.getElementById("categorySearch"),a=document.getElementById("tryb-express");if(!e||!t||!a||!r)return;let i=()=>({cart:{addItem:s=>{I.addItem(s),O()}},addToBasket:s=>{I.addItem({id:`item-${Date.now()}`,category:s.category,name:s.description||"Produkt",quantity:1,unit:"szt.",unitPrice:s.price,isExpress:a.checked,totalPrice:s.price,optionsHint:s.description||"",payload:s}),O()},expressMode:a.checked,updateLastCalculated:(s,g)=>{let x=document.getElementById("last-calculated"),k=document.getElementById("currentHint");x&&(x.innerText=S(s)),k&&(k.innerText=g?`(${g})`:"")}}),o=new K(e,i);o.setCategories(te),$e.forEach(s=>{o.addRoute(s)}),o.addRoute(He);let l={};te.forEach(s=>{let g=s.group||"Inne";if(!l[g]){let k=document.createElement("optgroup");k.label=g,t.appendChild(k),l[g]=k}let x=document.createElement("option");x.value=s.id,x.innerText=`${s.icon} ${s.name}`,s.implemented||(x.disabled=!0,x.innerText+=" (wkr\xF3tce)"),l[g].appendChild(x)}),t.addEventListener("change",()=>{let s=t.value;s?window.location.hash=`#/${s}`:window.location.hash="#/"}),r.addEventListener("input",()=>{let s=r.value.toLowerCase();Array.from(t.options).forEach((x,k)=>{if(k===0)return;let C=x.text.toLowerCase();x.hidden=!C.includes(s)})}),r.addEventListener("keydown",s=>{if(s.key==="Enter"){let g=r.value.toLowerCase(),x=Array.from(t.options).find((k,C)=>C>0&&!k.hidden&&!k.disabled);x&&(t.value=x.value,window.location.hash=`#/${x.value}`,r.value="")}}),window.addEventListener("hashchange",()=>{let g=(window.location.hash||"#/").slice(2);t.value=g}),a.addEventListener("change",()=>{let s=window.location.hash;window.location.hash="",window.location.hash=s}),document.getElementById("clear-basket")?.addEventListener("click",()=>{I.clear(),O()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let s={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(I.isEmpty()){alert("Lista jest pusta!");return}ne(I.getItems(),s)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let s=I.getItems(),g=JSON.stringify(s.map(x=>x.payload),null,2);navigator.clipboard.writeText(g).then(()=>{alert("JSON skopiowany do schowka!")})}),O(),o.start();let d=document.getElementById("settings-btn"),c=document.getElementById("pin-modal"),m=document.getElementById("pin-input"),p=document.getElementById("pin-submit"),f=document.getElementById("pin-cancel"),n=document.getElementById("pin-error");d?.addEventListener("click",()=>{c&&(c.style.display="flex"),m?.focus()}),f?.addEventListener("click",()=>{c&&(c.style.display="none"),m&&(m.value=""),n&&(n.style.display="none")});let y=()=>{m?.value===Ie.SETTINGS_PIN?(c&&(c.style.display="none"),m.value="",n&&(n.style.display="none"),window.location.hash="#/settings"):(n&&(n.style.display="block"),m&&(m.value="",m.focus()))};p?.addEventListener("click",y),m?.addEventListener("keydown",s=>{s.key==="Enter"&&y()})});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
