var Be=Object.defineProperty;var Re=(e,t)=>{for(var r in t)Be(e,r,{get:t[r],enumerable:!0})};var U=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,r){this.container=t,this.getCtx=r,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let r=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let a=this.routes.get(r);if(a){this.currentView=a;let i=document.createElement("button");i.className="back-button",i.textContent="Wszystkie kategorie",i.onclick=()=>{window.location.hash="#/"},this.container.appendChild(i);let o=document.createElement("div");o.className="category-content",o.id="current-category",this.container.appendChild(o),a.mount(o,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
      <div class="category-grid">
        ${this.categories.map(t=>`
          <div class="category-card ${t.implemented?"":"coming-soon"}"
               ${t.implemented?`onclick="window.location.hash='#/${t.id}'"`:""}>
            <div class="category-icon">${t.icon}</div>
            <div class="category-name">${t.name}</div>
            ${t.implemented?"":'<div class="badge">Wkr\xF3tce</div>'}
          </div>
        `).join("")}
      </div>
    `}start(){this.handleRoute()}};function E(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var Q=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,r)=>t+r.totalPrice,0)}isEmpty(){return this.items.length===0}};function ne(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let r=e.map(l=>({Kategoria:l.category,Nazwa:l.name,Ilo\u015B\u0107:l.quantity,Jednostka:l.unit,"Cena jedn.":l.unitPrice,"Express (+20%)":l.isExpress?"TAK":"NIE","Cena ca\u0142kowita":l.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),a=XLSX.utils.json_to_sheet(r),i=XLSX.utils.book_new();XLSX.utils.book_append_sheet(i,a,"Zam\xF3wienie");let o=new Date().toISOString().slice(0,10),d=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${o}.xlsx`;XLSX.writeFile(i,d)}var _=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var se={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=e.querySelector("#addSampleBtn"),a=e.querySelector("#sampleQty");r?.addEventListener("click",()=>{let i=parseInt(a.value)||1,o=i*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:i},price:o}),alert(`Dodano do koszyka: ${i} szt. za ${E(o)}`)})},unmount:()=>{console.log("Unmounting sample category")}};var re=class e{static instance;overrides={};registry=new Map;products=[];rules=[];constructor(){this.loadOverrides(),this.loadStructuredData()}static getInstance(){return e.instance||(e.instance=new e),e.instance}loadOverrides(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_overrides");t&&(this.overrides=JSON.parse(t))}catch(t){console.error("Failed to load price overrides",t)}}saveOverrides(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_overrides",JSON.stringify(this.overrides))}catch(t){console.error("Failed to save price overrides",t)}}loadStructuredData(){if(!(typeof localStorage>"u"))try{let t=localStorage.getItem("price_products"),r=localStorage.getItem("price_rules");t&&(this.products=JSON.parse(t)),r&&(this.rules=JSON.parse(r))}catch{}}saveStructuredData(){if(!(typeof localStorage>"u"))try{localStorage.setItem("price_products",JSON.stringify(this.products)),localStorage.setItem("price_rules",JSON.stringify(this.rules))}catch{}}register(t,r,a,i){let o=this.overrides[t]!==void 0?this.overrides[t]:i;return this.registry.set(t,{id:t,category:r,name:a,defaultValue:i,currentValue:o}),o}get(t,r){return this.overrides[t]!==void 0?this.overrides[t]:r}updatePrices(t){for(let[r,a]of Object.entries(t)){this.overrides[r]=a;let i=this.registry.get(r);i&&(i.currentValue=a)}this.saveOverrides()}getAllEntries(){return Array.from(this.registry.values())}getProducts(){return this.products}getRules(t){return t?this.rules.filter(r=>r.product_id===t):this.rules}addProduct(t){this.products.find(r=>r.id===t.id)||(this.products.push(t),this.saveStructuredData())}addRule(t){let r=this.rules.findIndex(a=>a.product_id===t.product_id&&a.name===t.name&&a.threshold===t.threshold);r>=0?this.rules[r]=t:this.rules.push(t),this.saveStructuredData()}registerTiers(t,r,a){return a.map((i,o)=>{let d=`${t}-tier-${o}`,l=i.from!==void 0?`${i.from}-${i.to||"\u221E"} szt`:`${i.min}-${i.max||"\u221E"} szt`,s=i.unit!==void 0?"unit":"price",y=i[s],m=this.register(d,r,l,y);return{...i,[s]:m}})}},p=re.getInstance();function Ve(e,t){let r=[...e].sort((o,d)=>o.min-d.min),a=r.find(o=>t>=o.min&&(o.max===null||t<=o.max));if(a)return a;let i=r.find(o=>o.min>=t);return i||r[r.length-1]}function je(e,t){if(!t)return e;let r=t.find(a=>a.type==="minimum"&&a.unit==="m2");return r&&e<r.value?r.value:e}function q(e,t,r=[]){let a=je(t,e.rules),i=p.registerTiers(e.id,e.title,e.tiers),o=Ve(i,a),d=0;e.pricing==="per_unit"?d=a*o.price:d=o.price;let l=0,s=[];if(e.modifiers)for(let f of r){let c=e.modifiers.find(n=>n.id===f);if(c){s.push(c.name);let n=p.register(`${e.id}-mod-${c.id}`,e.title,c.name,c.value);c.type==="percent"?l+=d*n:c.type==="fixed_per_unit"?l+=n*a:l+=n}}let y=d+l,m=e.rules?.find(f=>f.type==="minimum"&&f.unit==="pln");return m&&y<m.value&&(y=m.value),{basePrice:d,effectiveQuantity:a,tierPrice:o.price,modifiersTotal:l,totalPrice:parseFloat(y.toFixed(2)),appliedModifiers:s}}var le={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:.2}]};var ce={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let r=le;e.innerHTML=`
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
    `;let a=e.querySelector("#plakatyQty"),i=e.querySelector("#plakatyExpress"),o=e.querySelector("#plakatyResult"),d=e.querySelector("#addPlakatyBtn");function l(){let s=parseFloat(a.value)||0,y=i.checked?["EXPRESS"]:[];try{let m=q(s,r,y);o.textContent=E(m.totalPrice)}catch{o.textContent="B\u0142\u0105d"}}a.addEventListener("input",l),i.addEventListener("change",l),d.addEventListener("click",()=>{let s=parseFloat(a.value)||0,y=i.checked?["EXPRESS"]:[],m=q(s,r,y);t.cart.addItem({categoryId:r.id,categoryName:r.title,details:{qty:`${s} m2`,express:i.checked},price:m.totalPrice})}),l()}};var Oe=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function Ne(){return Oe.map(e=>({qty:e.qty,single:p.register(`vouchery-s-${e.qty}`,"Vouchery",`Jednostronne ${e.qty} szt`,e.single),double:p.register(`vouchery-d-${e.qty}`,"Vouchery",`Dwustronne ${e.qty} szt`,e.double)}))}function We(e,t){let r=Ne(),a=r[0];for(let i of r)if(e>=i.qty)a=i;else break;return t?a.single:a.double}var de={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),d=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let l=e.querySelector("#format").value,s=parseInt(e.querySelector("#quantity").value)||1,y=e.querySelector("#sides").value,m=e.querySelector("#paper").value,f=We(s,y==="single"),c=p.register("vouchery-mod-satin","Vouchery","Dop\u0142ata Satyna",.12),n=p.register("vouchery-mod-express","Vouchery","Dop\u0142ata Express",.2),u=m==="satin"?1+c:1,g=t.expressMode?1+n:1;if(r=f*u*g,o&&(o.textContent=r.toFixed(2)+" z\u0142"),d){let v=VOUCHERY_PRICING[0];for(let S of VOUCHERY_PRICING)if(s>=S.qty)v=S;else break;d.textContent="Podstawa: "+f.toFixed(2)+" z\u0142 za "+s+" szt (przedzia\u0142: "+v.qty+"+ szt)"}t.updateLastCalculated(r,"Vouchery "+l+" "+(y==="single"?"jednostronne":"dwustronne")+" - "+s+" szt")}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#format").value,s=e.querySelector("#quantity").value,y=e.querySelector("#sides").value,m=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:r,description:l+" "+(y==="single"?"jednostronne":"dwustronne")+", "+s+" szt, "+(m==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+r.toFixed(2)+" z\u0142")})}};var me=[{qty:1,price:20},{qty:2,price:30},{qty:3,price:32},{qty:4,price:34},{qty:5,price:35},{qty:6,price:35},{qty:7,price:36},{qty:8,price:37},{qty:9,price:39},{qty:10,price:40},{qty:15,price:45},{qty:20,price:49},{qty:30,price:58},{qty:40,price:65},{qty:50,price:75},{qty:100,price:120}];function Ke(e){let t=p.registerTiers("dyplomy","Dyplomy",me.map(a=>({min:a.qty,max:null,price:a.price}))),r=t[0];for(let a of t)if(e>=a.min)r=a;else break;return r.price}var pe={id:"dyplomy",name:"\u{1F393} Dyplomy",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),d=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let l=parseInt(e.querySelector("#quantity").value)||1,s=e.querySelector("#paper").value,y=Ke(l),m=s==="satin"?1.12:1,f=t.expressMode?1.2:1;if(r=y*m*f,o&&(o.textContent=`${r.toFixed(2)} z\u0142`),d){let c=p.registerTiers("dyplomy","Dyplomy",me.map(u=>({min:u.qty,max:null,price:u.price}))),n=c[0];for(let u of c)if(l>=u.min)n=u;else break;d.textContent=`${l} szt, przedzia\u0142: ${n.min}+ szt \u2192 ${y.toFixed(2)} z\u0142${s==="satin"?" \xD7 1.12 (satyna)":""}`}t.updateLastCalculated(r,`Dyplomy DL - ${l} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#quantity").value,s=e.querySelector("#paper").value;t.addToBasket({category:"Dyplomy",price:r,description:`DL dwustronny, ${l} szt, ${s==="satin"?"satyna":"standard"}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var Ue={"85x55":[{qty:50,plain:65,foil:160},{qty:100,plain:75,foil:170},{qty:150,plain:85,foil:180},{qty:200,plain:96,foil:190},{qty:250,plain:110,foil:200},{qty:300,plain:126,foil:220},{qty:400,plain:146,foil:240},{qty:500,plain:170,foil:250},{qty:1e3,plain:290,foil:335}],"90x50":[{qty:50,plain:70,foil:170},{qty:100,plain:79,foil:180},{qty:150,plain:89,foil:190},{qty:200,plain:99,foil:200},{qty:250,plain:120,foil:210},{qty:300,plain:129,foil:230},{qty:400,plain:149,foil:250},{qty:500,plain:175,foil:260},{qty:1e3,plain:300,foil:345}]};function Qe(e,t,r){let a=Ue[e],i=r?"foil":"plain",o=p.registerTiers(`wizytowki-${e}-${i}`,`Wizyt\xF3wki ${e} ${i}`,a.map(l=>({min:l.qty,max:null,price:r?l.foil:l.plain}))),d=o[0];for(let l of o)if(t>=l.min)d=l;else break;return d.price}var ue={id:"wizytowki",name:"\u{1F4BC} Wizyt\xF3wki",mount:(e,t)=>{e.innerHTML=`
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
    `;let r=0,a=e.querySelector("#calculate"),i=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),d=e.querySelector("#price-breakdown");a?.addEventListener("click",()=>{let l=e.querySelector("#format").value,s=parseInt(e.querySelector("#quantity").value),y=e.querySelector("#foiling").value;r=Qe(l,s,y==="foil"),t.expressMode&&(r*=1.2),o&&(o.textContent=`${r.toFixed(2)} z\u0142`),d&&(d.textContent=`Format ${l} mm, ${s} szt, ${y==="foil"?"z foli\u0105":"bez foliowania"}`),t.updateLastCalculated(r,`Wizyt\xF3wki ${l} - ${s} szt`)}),i?.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#format").value,s=e.querySelector("#quantity").value,y=e.querySelector("#foiling").value;t.addToBasket({category:"Wizyt\xF3wki",price:r,description:`${l} mm, ${s} szt, ${y==="foil"?"z foli\u0105":"bez foliowania"}`}),alert(`\u2705 Dodano: ${r.toFixed(2)} z\u0142`)})}};var ae={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function ye(e){let{format:t,qty:r,sides:a,isFolded:i,isSatin:o,express:d}=e,l=ae.formats[t];if(!l)throw new Error(`Invalid format: ${t}`);let s=a===1?"single":"double",y=i?"folded":"normal",m=l[s][y],f=Object.keys(m).map(Number).sort((w,I)=>w-I),c=f[0];for(let w of f)r>=w&&(c=w);let n=m[c.toString()],u=p,g=`zap-${t}-${s}-${y}-${c}`,v=`Zaproszenia ${t} ${s==="single"?"1s":"2s"} ${y==="folded"?"sk\u0142":"norm"} (od ${c}szt)`,S=u.register(g,"Zaproszenia",v,n),A=[];o&&A.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:u.register("zap-mod-satin","Zaproszenia","Satyna (+%)",ae.modifiers.satin)}),d&&A.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:u.register("global-express","Global","Express (+%)",.2)});let M=0,z=[];for(let w of A)(w.type==="percent"||w.type==="percentage")&&(M+=S*w.value,z.push(w.name));let h=S+M;return{basePrice:S,effectiveQuantity:r,tierPrice:S/r,modifiersTotal:M,totalPrice:Math.round(h*100)/100,appliedModifiers:z}}var fe={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let r=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await r.text();let a=e.querySelector("#zapFormat"),i=e.querySelector("#zapSides"),o=e.querySelector("#zapFolded"),d=e.querySelector("#zapQty"),l=e.querySelector("#zapSatin"),s=e.querySelector("#calcBtn"),y=e.querySelector("#addToCartBtn"),m=e.querySelector("#zapResult"),f=()=>{let c={format:a.value,qty:parseInt(d.value)||10,sides:parseInt(i.value)||1,isFolded:o.checked,isSatin:l.checked,express:t.expressMode},n=ye(c);return m.style.display="block",e.querySelector("#resUnitPrice").textContent=E(n.totalPrice/c.qty),e.querySelector("#resTotalPrice").textContent=E(n.totalPrice),e.querySelector("#resExpressHint").style.display=c.express?"block":"none",e.querySelector("#resSatinHint").style.display=c.isSatin?"block":"none",t.updateLastCalculated(n.totalPrice,"Zaproszenia"),{options:c,result:n}};s.addEventListener("click",()=>f()),y.addEventListener("click",()=>{let{options:c,result:n}=f();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${c.format} ${c.sides===1?"1-str":"2-str"}${c.isFolded?" sk\u0142adane":""}`,quantity:c.qty,unit:"szt",unitPrice:n.totalPrice/c.qty,isExpress:c.express,totalPrice:n.totalPrice,optionsHint:`${c.qty} szt, ${c.isSatin?"Satyna":"Kreda"}`,payload:c})}),f()}};var ge={name:"Ulotki \u2013 cyfrowe",jednostronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}},dwustronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:365},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function Je(e,t="jednostronne"){let r=ge[t];if(!r)throw new Error(`Invalid mode: ${t}`);let a=r[e];if(!a)throw new Error(`Invalid format: ${e} for mode ${t}`);return{id:`ulotki-${t}-${e.toLowerCase()}`,title:`Ulotki Cyfrowe ${t==="dwustronne"?"Dwustronne":"Jednostronne"} ${a.name}`,unit:"szt",pricing:"flat",tiers:a.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function xe(e){let t=Je(e.format,e.mode),r=[];return e.express&&r.push("express"),q(t,e.qty,r)}var be={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",async mount(e,t){try{let r=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#uj-format"),a=e.querySelector("#uj-qty-input"),i=e.querySelector("#uj-add-to-cart"),o=e.querySelector("#uj-result-display"),d=e.querySelector("#uj-total-price"),l=e.querySelector("#uj-unit-price"),s=e.querySelector("#uj-display-qty"),y=e.querySelector("#uj-express-hint"),m=e.querySelector("#uj-individual-quote"),f=null,c=null,n=()=>{let u=e.querySelector('input[name="uj-mode"]:checked').value,g=parseInt(a.value)||0,v=r.value;if(g>1e3){o.style.display="none",m.style.display="block",i.disabled=!0;return}if(g<1){o.style.display="none",m.style.display="none",i.disabled=!0;return}m.style.display="none",c={mode:u,format:v,qty:g,express:t.expressMode};try{let S=xe(c);f=S,s.innerText=`${g} szt`,l.innerText=E(S.totalPrice/g),d.innerText=E(S.totalPrice),y&&(y.style.display=t.expressMode?"block":"none"),o.style.display="block",i.disabled=!1,t.updateLastCalculated(S.totalPrice,"Ulotki")}catch(S){console.error(S),o.style.display="none",i.disabled=!0}};e.querySelectorAll('input[name="uj-mode"]').forEach(u=>{u.addEventListener("change",n)}),r.onchange=n,a.oninput=n,i.onclick=()=>{if(f&&c){let u=c.express?", EXPRESS":"",g=c.mode==="dwustronne"?"Dwustronne":"Jednostronne";t.cart.addItem({id:`ulotki-cyfrowe-${Date.now()}`,category:"Ulotki",name:`Ulotki ${g} ${c.format}`,quantity:c.qty,unit:"szt",unitPrice:f.totalPrice/c.qty,isExpress:c.express,totalPrice:f.totalPrice,optionsHint:`${c.qty} szt, ${g}${u}`,payload:f})}},n()}};var he={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ve(e){let t=he,r=t.materials.find(y=>y.id===e.material);if(!r)throw new Error(`Unknown material: ${e.material}`);let a="Bannery",i=`banner-${e.material}`,o=p.registerTiers(i,a,r.tiers),d=t.modifiers.map(y=>({...y,value:p.register(`banner-mod-${y.id}`,a,`Dop\u0142ata ${y.name}`,y.value)})),l={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o,modifiers:d},s=[];return e.oczkowanie&&s.push("oczkowanie"),e.express&&s.push("express"),q(l,e.areaM2,s)}var we={id:"banner",name:"Bannery",async mount(e,t){try{let r=await fetch("categories/banner.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=e.querySelector("#b-material"),a=e.querySelector("#b-area"),i=e.querySelector("#b-oczkowanie"),o=e.querySelector("#b-calculate"),d=e.querySelector("#b-add-to-cart"),l=e.querySelector("#b-result-display"),s=e.querySelector("#b-unit-price"),y=e.querySelector("#b-total-price"),m=e.querySelector("#b-express-hint"),f=null,c=null;o.onclick=()=>{c={material:r.value,areaM2:parseFloat(a.value),oczkowanie:i.checked,express:t.expressMode};try{let n=ve(c);f=n,s.innerText=E(n.tierPrice),y.innerText=E(n.totalPrice),m&&(m.style.display=t.expressMode?"block":"none"),l.style.display="block",d.disabled=!1,t.updateLastCalculated(n.totalPrice,"Banner")}catch(n){alert("B\u0142\u0105d: "+n.message)}},d.onclick=()=>{if(f&&c){let n=r.options[r.selectedIndex].text,u=[`${c.areaM2} m2`,c.oczkowanie?"z oczkowaniem":"bez oczkowania",c.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:n,quantity:c.areaM2,unit:"m2",unitPrice:f.tierPrice,isExpress:c.express,totalPrice:f.totalPrice,optionsHint:u,payload:f})}}}};var O={};Re(O,{category:()=>Ye,default:()=>rt,groups:()=>et,modifiers:()=>tt});var Ye="Wlepki / Naklejki",et=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],tt=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],rt={category:Ye,groups:et,modifiers:tt};function ke(e){let t=O,r=t.groups.find(o=>o.id===e.groupId);if(!r)throw new Error(`Unknown group: ${e.groupId}`);let a={id:`wlepki-${r.id}`,title:r.title,unit:r.unit,pricing:r.pricing||"per_unit",tiers:r.tiers,modifiers:t.modifiers,rules:r.rules||[{type:"minimum",unit:"m2",value:1}]},i=[...e.modifiers];return e.express&&i.push("express"),q(a,e.area,i)}var Se={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let r=O;try{let n=await fetch("categories/wlepki-naklejki.html");if(!n.ok)throw new Error("Failed to load template");e.innerHTML=await n.text()}catch(n){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${n}</div>`;return}let a=e.querySelector("#wlepki-group"),i=e.querySelector("#wlepki-area"),o=e.querySelector("#btn-calculate"),d=e.querySelector("#btn-add-to-cart"),l=e.querySelector("#wlepki-result"),s=e.querySelector("#unit-price"),y=e.querySelector("#total-price"),m=null,f=null,c=()=>{let n=e.querySelectorAll(".wlepki-mod:checked"),u=Array.from(n).map(g=>g.value);f={groupId:a.value,area:parseFloat(i.value)||0,express:t.expressMode,modifiers:u};try{let g=ke(f);m=g,s.textContent=E(g.tierPrice),y.textContent=E(g.totalPrice),l.style.display="block",d.disabled=!1,t.updateLastCalculated(g.totalPrice,"Wlepki")}catch(g){alert("B\u0142\u0105d: "+g.message)}};o.addEventListener("click",c),d.addEventListener("click",()=>{if(!m||!f)return;let n=r.groups.find(g=>g.id===f.groupId),u=f.modifiers.map(g=>{let v=r.modifiers.find(S=>S.id===g);return v?v.name:g});f.express&&u.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:n?.title||"Wlepki",quantity:f.area,unit:"m2",unitPrice:m.tierPrice,isExpress:!!f.express,totalPrice:m.totalPrice,optionsHint:u.join(", ")||"Standard",payload:m})})}};var X={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function Ee(e){let t=X.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let r="Roll-up",a;if(e.isReplacement){let o=t.width*t.height,d=p.register("rollup-repl-m2",r,"Wymiana: Druk za m2",X.replacement.print_per_m2),l=p.register("rollup-repl-labor",r,"Wymiana: Robocizna",X.replacement.labor),s=o*d+l,y=p.register("rollup-repl-express",r,"Dop\u0142ata Express (wymiana)",.2);a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:s}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:y}]}}else{let o=`rollup-full-${e.format}`,d=p.registerTiers(o,r,t.tiers),l=p.register(`${o}-express`,r,`Dop\u0142ata Express (${e.format})`,.2);a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:d,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:l}]}}let i=[];return e.express&&i.push("express"),q(a,e.qty,i)}var Te={id:"roll-up",name:"Roll-up",async mount(e,t){let r=await fetch("categories/roll-up.html");e.innerHTML=await r.text();let a=e.querySelector("#rollUpType"),i=e.querySelector("#rollUpFormat"),o=e.querySelector("#rollUpQty"),d=e.querySelector("#calcBtn"),l=e.querySelector("#addToCartBtn"),s=e.querySelector("#rollUpResult"),y=()=>{let m={format:i.value,qty:parseInt(o.value)||1,isReplacement:a.value==="replacement",express:t.expressMode},f=Ee(m);return s.style.display="block",e.querySelector("#resUnitPrice").textContent=E(f.totalPrice/m.qty),e.querySelector("#resTotalPrice").textContent=E(f.totalPrice),e.querySelector("#resExpressHint").style.display=m.express?"block":"none",t.updateLastCalculated(f.totalPrice,"Roll-up"),{options:m,result:f}};d.addEventListener("click",()=>y()),l.addEventListener("click",()=>{let{options:m,result:f}=y();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${m.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${m.format}`,quantity:m.qty,unit:"szt",unitPrice:f.totalPrice/m.qty,isExpress:m.express,totalPrice:f.totalPrice,optionsHint:`${m.format}, ${m.qty} szt`,payload:m})}),y()}};async function it(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function J(e,t,r){return{id:e,name:t,mount:async(a,i)=>{a.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let o=await it(r);a.innerHTML=o,ot(a,i)}catch(o){a.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${o}</small>
          </div>
        `,console.error("Category load error:",o)}}}}function ot(e,t){e.querySelectorAll("button[data-action]").forEach(a=>{let i=a.getAttribute("data-action");i==="calculate"&&a.addEventListener("click",()=>{console.log("Calculate clicked")}),i==="add-to-basket"&&a.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var Le={id:"druk-cad",name:"Druk CAD wielkoformatowy",async mount(e,t){try{let r=await fetch("categories/druk-cad-advanced.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=p,a="CAD",i={formatowe:{czb:{A3:r.register("cad-f-czb-A3",a,"CAD A3 CZB",2.5),A2:r.register("cad-f-czb-A2",a,"CAD A2 CZB",4),A1:r.register("cad-f-czb-A1",a,"CAD A1 CZB",6),A0:r.register("cad-f-czb-A0",a,"CAD A0 CZB",11),"A0+":r.register("cad-f-czb-A0p",a,"CAD A0+ CZB",12.5)},kolor:{A3:r.register("cad-f-kol-A3",a,"CAD A3 Kolor",5.3),A2:r.register("cad-f-kol-A2",a,"CAD A2 Kolor",8.5),A1:r.register("cad-f-kol-A1",a,"CAD A1 Kolor",12),A0:r.register("cad-f-kol-A0",a,"CAD A0 Kolor",24),"A0+":r.register("cad-f-kol-A0p",a,"CAD A0+ Kolor",26)}},nieformatowe:{czb:{297:r.register("cad-n-czb-297",a,"CAD 297mm CZB (z\u0142/mb)",3.5),420:r.register("cad-n-czb-420",a,"CAD 420mm CZB (z\u0142/mb)",4.5),594:r.register("cad-n-czb-594",a,"CAD 594mm CZB (z\u0142/mb)",5),841:r.register("cad-n-czb-841",a,"CAD 841mm CZB (z\u0142/mb)",9),914:r.register("cad-n-czb-914",a,"CAD 914mm CZB (z\u0142/mb)",10),1067:r.register("cad-n-czb-1067",a,"CAD 1067mm CZB (z\u0142/mb)",12.5)},kolor:{297:r.register("cad-n-kol-297",a,"CAD 297mm Kolor (z\u0142/mb)",12),420:r.register("cad-n-kol-420",a,"CAD 420mm Kolor (z\u0142/mb)",13.9),594:r.register("cad-n-kol-594",a,"CAD 594mm Kolor (z\u0142/mb)",14.5),841:r.register("cad-n-kol-841",a,"CAD 841mm Kolor (z\u0142/mb)",20),914:r.register("cad-n-kol-914",a,"CAD 914mm Kolor (z\u0142/mb)",21),1067:r.register("cad-n-kol-1067",a,"CAD 1067mm Kolor (z\u0142/mb)",30)}},skladanie:{formatowe:{A3:r.register("cad-s-f-A3",a,"CAD Sk\u0142adanie A3",1),"A3-poprzeczne":r.register("cad-s-f-A3p",a,"CAD Sk\u0142adanie A3L",.7),A2:r.register("cad-s-f-A2",a,"CAD Sk\u0142adanie A2",1.5),A1:r.register("cad-s-f-A1",a,"CAD Sk\u0142adanie A1",2),A0:r.register("cad-s-f-A0",a,"CAD Sk\u0142adanie A0",3),"A0+":r.register("cad-s-f-A0p",a,"CAD Sk\u0142adanie A0+",4)},nieformatowe:r.register("cad-s-n",a,"CAD Sk\u0142adanie mb (z\u0142/m2)",2.5)},skanowanie:r.register("cad-skan",a,"CAD Skanowanie (z\u0142/cm)",.08)},o={A3:[297,420],A2:[420,594],A1:[594,841],A0:[841,1189],"A0+":[914,1292]},d=[297,420,594,841,914,1067],l=5,s=[],y=!1,m=300,f=e.querySelector("#fileInput"),c=e.querySelector("#uploadZone"),n=e.querySelector("#dpiInput"),u=e.querySelector("#colorToggle"),g=e.querySelector("#colorSwitch"),v=e.querySelector("#filesTableWrapper"),S=e.querySelector("#filesTableBody"),A=e.querySelector("#summaryPanel"),M=e.querySelector("#summaryGrid"),z=e.querySelector("#clearBtn"),h=e.querySelector("#add-all-to-cart"),w=(x,b)=>x*25.4/b,I=x=>d.reduce((b,k)=>Math.abs(k-x)<Math.abs(b-x)?k:b),C=x=>d.includes(Math.round(x)),P=(x,b)=>{let k=Math.round(x),T=Math.round(b),[L,H]=k<T?[k,T]:[T,k];if(!C(L))return{format:`${L}mm`,isFormatowy:!1,isStandardWidth:!1,widthCategory:I(L)};for(let[R,V]of Object.entries(o)){let[W,K]=V;if(L===W){let te=Math.abs(H-K)<=l;return{format:R,isFormatowy:te,isStandardWidth:!0,widthCategory:W,actualLength:H,standardLength:K}}}return{format:`${L}\xD7${H}`,isFormatowy:!1,isStandardWidth:!0,widthCategory:L}},G=x=>{let b=y?"kolor":"czb",{format:k,isFormatowy:T,widthCategory:L}=x.formatInfo;if(T)return i.formatowe[b][k]||0;{let H=i.nieformatowe[b][L]||0,R=Math.max(x.widthMm,x.heightMm)/1e3;return H*R}},Y=x=>{if(!x.folding)return 0;let{format:b,isFormatowy:k}=x.formatInfo;if(k)return i.skladanie.formatowe[b]||0;{let T=x.widthMm/1e3*(x.heightMm/1e3);return i.skladanie.nieformatowe*T}},ee=x=>{if(!x.scanning)return 0;let b=Math.max(x.widthMm,x.heightMm);return i.skanowanie*b/10},F=()=>{if(s.length===0){v.style.display="none",A.style.display="none";return}v.style.display="block",A.style.display="block",S.innerHTML=s.map((b,k)=>{let T=G(b),L=Y(b),H=ee(b),R=(T+L+H)*(t.expressMode?1.2:1),{format:V,isFormatowy:W,isStandardWidth:K}=b.formatInfo,te=K?W?'<span class="badge badge-formatowy">Format</span>':'<span class="badge badge-nieformatowy">MB</span>':'<span class="badge badge-warning">\u26A0\uFE0F Niestandard</span>';return`
          <tr>
            <td>${b.name}</td>
            <td>${Math.round(b.widthMm)}\xD7${Math.round(b.heightMm)}</td>
            <td><strong>${V}</strong></td>
            <td>${te}</td>
            <td><input type="checkbox" ${b.folding?"checked":""} data-idx="${k}" class="fold-check"></td>
            <td><input type="checkbox" ${b.scanning?"checked":""} data-idx="${k}" class="scan-check"></td>
            <td><strong>${R.toFixed(2)} z\u0142</strong></td>
          </tr>
        `}).join(""),e.querySelectorAll(".fold-check").forEach(b=>{b.addEventListener("change",k=>{s[parseInt(k.target.dataset.idx)].folding=k.target.checked,F()})}),e.querySelectorAll(".scan-check").forEach(b=>{b.addEventListener("change",k=>{s[parseInt(k.target.dataset.idx)].scanning=k.target.checked,F()})});let x=0;s.forEach(b=>{x+=(G(b)+Y(b)+ee(b))*(t.expressMode?1.2:1)}),M.innerHTML=`
        <div class="summary-item"><span>Liczba plik\xF3w:</span><span>${s.length}</span></div>
        <div class="summary-item"><span>Razem brutto:</span><strong>${x.toFixed(2)} z\u0142</strong></div>
      `,t.updateLastCalculated(x,`Druk CAD (${s.length} plik\xF3w)`)};c.onclick=()=>f.click(),f.onchange=x=>{let b=x.target.files;for(let k of b)if(k.type.startsWith("image/")||k.type==="application/pdf"){let T=new Image,L=new FileReader;L.onload=H=>{T.onload=()=>{let R=w(T.width,m),V=w(T.height,m);s.push({name:k.name,widthPx:T.width,heightPx:T.height,widthMm:R,heightMm:V,formatInfo:P(R,V),folding:!1,scanning:!1}),F()},T.src=H.target.result},L.readAsDataURL(k)}else{let T=w(2480,m),L=w(3508,m);s.push({name:k.name,widthPx:2480,heightPx:3508,widthMm:T,heightMm:L,formatInfo:P(T,L),folding:!1,scanning:!1}),F()}},u.onclick=()=>{y=!y,g.classList.toggle("active"),F()},n.onchange=()=>{m=parseInt(n.value)||300,s=s.map(x=>{let b=w(x.widthPx,m),k=w(x.heightPx,m);return{...x,widthMm:b,heightMm:k,formatInfo:P(b,k)}}),F()},z.onclick=()=>{s=[],F()},h.onclick=()=>{s.forEach(x=>{let b=G(x),k=Y(x),T=ee(x),L=(b+k+T)*(t.expressMode?1.2:1);t.cart.addItem({id:`cad-${Date.now()}-${Math.random()}`,category:"Druk CAD",name:x.name,quantity:1,unit:"szt.",unitPrice:L,isExpress:t.expressMode,totalPrice:parseFloat(L.toFixed(2)),optionsHint:`${x.formatInfo.format} (${y?"Kolor":"CZ-B"}), ${x.folding?"Sk\u0142adanie":""}`,payload:x})}),alert(`Dodano ${s.length} plik\xF3w do koszyka.`)}}};function oe(e,t){return e.find(r=>t>=r.from&&t<=r.to)||null}var j=(e,t,r)=>p.registerTiers(e,t,r),D={get print(){return{bw:{A4:j("print-bw-a4","Druk A4/A3",[{from:1,to:5,unit:.9},{from:6,to:20,unit:.6},{from:21,to:100,unit:.35},{from:101,to:500,unit:.3},{from:501,to:999,unit:.23},{from:1e3,to:4999,unit:.19},{from:5e3,to:99999,unit:.15}]),A3:j("print-bw-a3","Druk A4/A3",[{from:1,to:5,unit:1.7},{from:6,to:20,unit:1.1},{from:21,to:100,unit:.7},{from:101,to:500,unit:.6},{from:501,to:999,unit:.45},{from:1e3,to:99999,unit:.33}])},color:{A4:j("print-color-a4","Druk A4/A3",[{from:1,to:10,unit:2.4},{from:11,to:40,unit:2.2},{from:41,to:100,unit:2},{from:101,to:250,unit:1.8},{from:251,to:500,unit:1.6},{from:501,to:999,unit:1.4},{from:1e3,to:99999,unit:1.1}]),A3:j("print-color-a3","Druk A4/A3",[{from:1,to:10,unit:4.8},{from:11,to:40,unit:4.2},{from:41,to:100,unit:3.8},{from:101,to:250,unit:3},{from:251,to:500,unit:2.5},{from:501,to:999,unit:1.9},{from:1e3,to:99999,unit:1.6}])}}},get scan(){return{auto:j("scan-auto","Skany",[{from:1,to:9,unit:1},{from:10,to:49,unit:.5},{from:50,to:99,unit:.4},{from:100,to:999999999,unit:.25}]),manual:j("scan-manual","Skany",[{from:1,to:4,unit:2},{from:5,to:999999999,unit:1}])}},get email_price(){return p.get("email-price",1)}},ie={get color(){return{formatowe:{A0p:p.get("cad-color-f-a0p",26),A0:p.get("cad-color-f-a0",24),A1:p.get("cad-color-f-a1",12),A2:p.get("cad-color-f-a2",8.5),A3:p.get("cad-color-f-a3",5.3)},mb:{A0p:p.get("cad-color-m-a0p",21),A0:p.get("cad-color-m-a0",20),A1:p.get("cad-color-m-a1",14.5),A2:p.get("cad-color-m-a2",13.9),A3:p.get("cad-color-m-a3",12),R1067:p.get("cad-color-m-r1067",30)}}},get bw(){return{formatowe:{A0p:p.get("cad-bw-f-a0p",12.5),A0:p.get("cad-bw-f-a0",11),A1:p.get("cad-bw-f-a1",6),A2:p.get("cad-bw-f-a2",4),A3:p.get("cad-bw-f-a3",2.5)},mb:{A0p:p.get("cad-bw-m-a0p",10),A0:p.get("cad-bw-m-a0",9),A1:p.get("cad-bw-m-a1",5),A2:p.get("cad-bw-m-a2",4.5),A3:p.get("cad-bw-m-a3",3.5),R1067:p.get("cad-bw-m-r1067",12.5)}}}};var Ce={get A0p(){return p.get("fold-a0p",4)},get A0(){return p.get("fold-a0",3)},get A1(){return p.get("fold-a1",2)},get A2(){return p.get("fold-a2",1.5)},get A3(){return p.get("fold-a3",1)},get A3L(){return p.get("fold-a3l",.7)}},ze={get value(){return p.get("wf-scan-cm",.08)}},$=(e,t,r,a)=>{let i={};for(let[o,d]of Object.entries(a)){let l=`biz-${e}-${t}-${r}-${o}`,s=`Wizyt\xF3wki ${t} ${r} ${o} szt`;i[o]=p.register(l,"Wizyt\xF3wki",s,d)}return i},Ae={get cyfrowe(){return{standardPrices:{"85x55":{noLam:$("std","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290}),lam:$("std","85x55","lami",{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335})},"90x50":{noLam:$("std","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:$("std","90x50","lami",{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345})}},softtouchPrices:{"85x55":{noLam:$("st","85x55","bez lami",{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290}),lam:$("st","85x55","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380})},"90x50":{noLam:$("st","90x50","bez lami",{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300}),lam:$("st","90x50","lami",{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390})}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:$("deluxe","UV 3D","Softtouch",{50:280,100:320,200:395,250:479,400:655,500:778})},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:$("deluxe","UV 3D Gold","Softtouch",{50:450,100:550,200:650,250:720,400:850,500:905})}}}}}},nt=()=>{let e=D.print,t=D.scan,r=D.email_price,a=ie.color,i=ie.bw,o=Ce.A0,d=ze.value,l=Ae.cyfrowe};nt();function Me(e){if(e.pages<=0)return{unitPrice:0,printTotal:0,emailTotal:e.email?D.email_price:0,inkTotal:0,grandTotal:e.email?D.email_price:0};let t=D.print[e.mode][e.format],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla druku.");let a=r.unit,i=e.pages*a,o=0;e.email&&(o=D.email_price);let d=0;return e.ink25&&(d=.5*a*e.ink25Qty),{unitPrice:a,printTotal:i,emailTotal:o,inkTotal:d,grandTotal:i+o+d}}function qe(e){if(e.pages<=0)return{unitPrice:0,total:0};let t=D.scan[e.type],r=oe(t,e.pages);if(!r)throw new Error("Brak progu cenowego dla skanowania.");let a=r.unit;return{unitPrice:a,total:e.pages*a}}function Pe(e,t){let r=e.format.toUpperCase(),a=Me({mode:e.mode,format:r,pages:e.printQty,email:e.email,ink25:e.surcharge,ink25Qty:e.surchargeQty}),i={total:0,unitPrice:0};e.scanType!=="none"&&e.scanQty>0&&(i=qe({type:e.scanType,pages:e.scanQty}));let o=a.grandTotal+i.total,d=o;return e.express&&(d=o*1.2),{totalPrice:parseFloat(d.toFixed(2)),unitPrintPrice:a.unitPrice,totalPrintPrice:a.printTotal,unitScanPrice:i.unitPrice,totalScanPrice:i.total,emailPrice:a.emailTotal,surchargePrice:a.inkTotal,baseTotal:o}}var $e={id:"druk-a4-a3",name:"Druk A4/A3 + skan",async mount(e,t){try{let r=await fetch("categories/druk-a4-a3-skan.html");if(!r.ok)throw new Error("Failed to load template");e.innerHTML=await r.text(),this.initLogic(e,t)}catch(r){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${r}</div>`}},initLogic(e,t){let r=_.find(w=>w.id==="druk-a4-a3")?.pricing;if(!r)return;let a=e.querySelector("#d-mode"),i=e.querySelector("#d-format"),o=e.querySelector("#d-print-qty"),d=e.querySelector("#d-email"),l=e.querySelector("#d-surcharge"),s=e.querySelector("#d-surcharge-qty"),y=e.querySelector("#surcharge-qty-row"),m=e.querySelector("#d-scan-type"),f=e.querySelector("#d-scan-qty"),c=e.querySelector("#scan-qty-row"),n=e.querySelector("#d-calculate"),u=e.querySelector("#d-add-to-cart"),g=e.querySelector("#d-result-display"),v=e.querySelector("#d-total-price"),S=e.querySelector("#d-express-hint"),A=e.querySelector("#tier-table"),M=()=>{if(!A)return;let w=a.value,I=i.value,C=r[w]?.[I];C&&(A.innerHTML=C.map(P=>`<div>${P.from}-${P.to||"\u221E"} szt.</div><div style="text-align: right;">${P.unit.toFixed(2)} z\u0142</div>`).join(""))};a.onchange=M,i.onchange=M,M(),l.onchange=()=>{y.style.display=l.checked?"flex":"none"},m.onchange=()=>{c.style.display=m.value!=="none"?"flex":"none"};let z=null,h=null;n.onclick=()=>{h={mode:a.value,format:i.value,printQty:parseInt(o.value)||0,email:d.checked,surcharge:l.checked,surchargeQty:parseInt(s.value)||0,scanType:m.value,scanQty:parseInt(f.value)||0,express:t.expressMode};try{let w=Pe(h,r);z=w,v.innerText=E(w.totalPrice),S&&(S.style.display=t.expressMode?"block":"none"),g.style.display="block",u.disabled=!1,t.updateLastCalculated(w.totalPrice,"Druk A4/A3 + skan")}catch(w){alert("B\u0142\u0105d: "+w.message)}},u.onclick=()=>{if(z&&h){let w=Date.now(),I=t.expressMode?1.2:1;if(h.printQty>0||h.scanQty>0&&h.scanType!=="none"){let C=[];h.printQty>0&&C.push(`${h.printQty} str. ${h.format.toUpperCase()} (${h.mode==="bw"?"CZ-B":"KOLOR"})`),h.scanQty>0&&h.scanType!=="none"&&C.push(`Skan ${h.scanType}: ${h.scanQty} str.`),t.expressMode&&C.push("EXPRESS");let P=(z.totalPrintPrice+z.totalScanPrice)*I;t.cart.addItem({id:`druk-${w}-main`,category:"Druk A4/A3 + skan",name:`${h.format.toUpperCase()} ${h.mode==="bw"?"CZ-B":"KOLOR"}`,quantity:h.printQty||h.scanQty,unit:h.printQty>0?"str.":"skan",unitPrice:P/(h.printQty||h.scanQty),isExpress:t.expressMode,totalPrice:parseFloat(P.toFixed(2)),optionsHint:C.join(", "),payload:{...z,type:"main"}})}if(h.email){let C=z.emailPrice*I;t.cart.addItem({id:`email-${w}-email`,category:"Druk A4/A3 + skan",name:"Wysy\u0142ka e-mail",quantity:1,unit:"szt.",unitPrice:C,isExpress:t.expressMode,totalPrice:parseFloat(C.toFixed(2)),optionsHint:t.expressMode?"EXPRESS":"",payload:{price:C,type:"email"}})}if(h.surcharge&&h.surchargeQty>0){let C=z.surchargePrice*I;t.cart.addItem({id:`surcharge-${w}-surcharge`,category:"Druk A4/A3 + skan",name:"Zadruk >25% - dop\u0142ata",quantity:h.surchargeQty,unit:"str.",unitPrice:C/h.surchargeQty,isExpress:t.expressMode,totalPrice:parseFloat(C.toFixed(2)),optionsHint:`${h.surchargeQty} str. (+50%), ${t.expressMode?"EXPRESS":""}`,payload:{price:C,type:"surcharge"}})}}}}};var Ie=[se,ce,de,pe,ue,fe,be,we,Se,Te,Le,$e,J("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),J("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),J("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var He={SETTINGS_PIN:"2024"};var De={id:"settings",name:"\u2699\uFE0F Ustawienia",mount:(e,t)=>{let r=p.getAllEntries(),a=Array.from(new Set(r.map(c=>c.category))).sort();e.innerHTML=`
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
                  ${a.map(c=>`<option value="${c}">${c}</option>`).join("")}
                </select>
              </div>
              <button class="btn-success save-btn">Zapisz ceny</button>
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
    `;let i=e.querySelector("#price-table-body"),o=e.querySelector("#filter-category"),d=e.querySelector("#save-success"),l=e.querySelector("#close-success");function s(c=""){let n=c?r.filter(u=>u.category===c):r;i.innerHTML=n.map(u=>`
        <tr data-category="${u.category}">
          <td style="color: #94a3b8;">${u.category}</td>
          <td><strong>${u.name}</strong></td>
          <td>${u.currentValue.toFixed(2)} z\u0142</td>
          <td>
            <input type="number" step="0.01" min="0"
                   class="price-input" data-id="${u.id}"
                   placeholder="${u.currentValue.toFixed(2)}">
          </td>
        </tr>
      `).join("")}function y(){let c=e.querySelectorAll(".price-input"),n={},u=0;if(c.forEach(g=>{let v=g.value;if(v!==""&&!isNaN(parseFloat(v))){let S=parseFloat(v),A=g.getAttribute("data-id"),M=r.find(z=>z.id===A);M&&M.currentValue!==S&&(n[A]=S,u++)}}),u>0){p.updatePrices(n);let g=p.getAllEntries();r.forEach(v=>{n[v.id]!==void 0&&(v.currentValue=n[v.id])}),s(o.value),d&&(d.style.display="flex")}else alert("Brak zmian do zapisania.")}let m=e.querySelectorAll(".tab-btn"),f=e.querySelectorAll(".tab-content");m.forEach(c=>{c.addEventListener("click",()=>{let n=c.getAttribute("data-tab");m.forEach(u=>u.classList.remove("active")),c.classList.add("active"),f.forEach(u=>{u.id===n?u.style.display="block":u.style.display="none"})})}),o.addEventListener("change",()=>s(o.value)),e.querySelectorAll(".save-btn").forEach(c=>c.addEventListener("click",y)),l?.addEventListener("click",()=>{d&&(d.style.display="none")}),s()}};var B=new Q;function N(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),r=document.getElementById("json-preview");if(!e||!t||!r)return;let a=B.getItems();if(a.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=a.map((o,d)=>`
      <div class="basket-item" style="padding: 12px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: white; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${o.category}: ${o.name}
            </strong>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0 0;">
              ${o.optionsHint} (${o.quantity} ${o.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${E(o.totalPrice)}</strong>
            <button onclick="window.removeItem(${d})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let i=B.getGrandTotal();t.innerText=E(i)}r.innerText=JSON.stringify(a.map(i=>i.payload),null,2)}window.removeItem=e=>{B.removeItem(e),N()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),r=document.getElementById("categorySearch"),a=document.getElementById("tryb-express");if(!e||!t||!a||!r)return;let i=()=>({cart:{addItem:n=>{B.addItem(n),N()}},addToBasket:n=>{B.addItem({id:`item-${Date.now()}`,category:n.category,name:n.description||"Produkt",quantity:1,unit:"szt.",unitPrice:n.price,isExpress:a.checked,totalPrice:n.price,optionsHint:n.description||"",payload:n}),N()},expressMode:a.checked,updateLastCalculated:(n,u)=>{let g=document.getElementById("last-calculated"),v=document.getElementById("currentHint");g&&(g.innerText=E(n)),v&&(v.innerText=u?`(${u})`:"")}}),o=new U(e,i);o.setCategories(_),Ie.forEach(n=>{o.addRoute(n)}),o.addRoute(De),_.forEach(n=>{let u=document.createElement("option");u.value=n.id,u.innerText=`${n.icon} ${n.name}`,n.implemented||(u.disabled=!0,u.innerText+=" (wkr\xF3tce)"),t.appendChild(u)}),t.addEventListener("change",()=>{let n=t.value;n?window.location.hash=`#/${n}`:window.location.hash="#/"}),r.addEventListener("input",()=>{let n=r.value.toLowerCase();Array.from(t.options).forEach((g,v)=>{if(v===0)return;let S=g.text.toLowerCase();g.hidden=!S.includes(n)})}),r.addEventListener("keydown",n=>{if(n.key==="Enter"){let u=r.value.toLowerCase(),g=Array.from(t.options).find((v,S)=>S>0&&!v.hidden&&!v.disabled);g&&(t.value=g.value,window.location.hash=`#/${g.value}`,r.value="")}}),window.addEventListener("hashchange",()=>{let u=(window.location.hash||"#/").slice(2);t.value=u}),a.addEventListener("change",()=>{let n=window.location.hash;window.location.hash="",window.location.hash=n}),document.getElementById("clear-basket")?.addEventListener("click",()=>{B.clear(),N()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let n={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(B.isEmpty()){alert("Lista jest pusta!");return}ne(B.getItems(),n)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let n=B.getItems(),u=JSON.stringify(n.map(g=>g.payload),null,2);navigator.clipboard.writeText(u).then(()=>{alert("JSON skopiowany do schowka!")})}),N(),o.start();let d=document.getElementById("settings-btn"),l=document.getElementById("pin-modal"),s=document.getElementById("pin-input"),y=document.getElementById("pin-submit"),m=document.getElementById("pin-cancel"),f=document.getElementById("pin-error");d?.addEventListener("click",()=>{l&&(l.style.display="flex"),s?.focus()}),m?.addEventListener("click",()=>{l&&(l.style.display="none"),s&&(s.value=""),f&&(f.style.display="none")});let c=()=>{s?.value===He.SETTINGS_PIN?(l&&(l.style.display="none"),s.value="",f&&(f.style.display="none"),window.location.hash="#/settings"):(f&&(f.style.display="block"),s&&(s.value="",s.focus()))};y?.addEventListener("click",c),s?.addEventListener("keydown",n=>{n.key==="Enter"&&c()})});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
