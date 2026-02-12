var pe=Object.defineProperty;var de=(e,t)=>{for(var o in t)pe(e,o,{get:t[o],enumerable:!0})};var q=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,o){this.container=t,this.getCtx=o,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let o=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let r=this.routes.get(o);if(r){this.currentView=r;let n=document.createElement("button");n.className="back-button",n.textContent="Wszystkie kategorie",n.onclick=()=>{window.location.hash="#/"},this.container.appendChild(n);let i=document.createElement("div");i.className="category-content",i.id="current-category",this.container.appendChild(i),r.mount(i,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function g(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var z=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,o)=>t+o.totalPrice,0)}isEmpty(){return this.items.length===0}};function F(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let o=e.map(s=>({Kategoria:s.category,Nazwa:s.name,Ilo\u015B\u0107:s.quantity,Jednostka:s.unit,"Cena jedn.":s.unitPrice,"Express (+20%)":s.isExpress?"TAK":"NIE","Cena ca\u0142kowita":s.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),r=XLSX.utils.json_to_sheet(o),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,r,"Zam\xF3wienie");let i=new Date().toISOString().slice(0,10),a=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${i}.xlsx`;XLSX.writeFile(n,a)}var B=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var _={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=e.querySelector("#addSampleBtn"),r=e.querySelector("#sampleQty");o?.addEventListener("click",()=>{let n=parseInt(r.value)||1,i=n*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:n},price:i}),alert(`Dodano do koszyka: ${n} szt. za ${g(i)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function ye(e,t){let o=[...e].sort((i,a)=>i.min-a.min),r=o.find(i=>t>=i.min&&(i.max===null||t<=i.max));if(r)return r;let n=o.find(i=>i.min>=t);return n||o[o.length-1]}function fe(e,t){if(!t)return e;let o=t.find(r=>r.type==="minimum"&&r.unit==="m2");return o&&e<o.value?o.value:e}function k(e,t,o=[]){let r=fe(t,e.rules),n=ye(e.tiers,r),i=0;e.pricing==="per_unit"?i=r*n.price:i=n.price;let a=0,s=[];if(e.modifiers)for(let l of o){let c=e.modifiers.find(d=>d.id===l);c&&(s.push(c.name),c.type==="percent"?a+=i*c.value:c.type==="fixed_per_unit"?a+=c.value*r:a+=c.value)}let m=i+a,p=e.rules?.find(l=>l.type==="minimum"&&l.unit==="pln");return p&&m<p.value&&(m=p.value),{basePrice:i,effectiveQuantity:r,tierPrice:n.price,modifiersTotal:a,totalPrice:parseFloat(m.toFixed(2)),appliedModifiers:s}}var j={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:.2}]};var O={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let o=j;e.innerHTML=`
      <div class="category-view">
        <h2>${o.title}</h2>
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
    `;let r=e.querySelector("#plakatyQty"),n=e.querySelector("#plakatyExpress"),i=e.querySelector("#plakatyResult"),a=e.querySelector("#addPlakatyBtn");function s(){let m=parseFloat(r.value)||0,p=n.checked?["EXPRESS"]:[];try{let l=k(m,o,p);i.textContent=g(l.totalPrice)}catch{i.textContent="B\u0142\u0105d"}}r.addEventListener("input",s),n.addEventListener("change",s),a.addEventListener("click",()=>{let m=parseFloat(r.value)||0,p=n.checked?["EXPRESS"]:[],l=k(m,o,p);t.cart.addItem({categoryId:o.id,categoryName:o.title,details:{qty:`${m} m2`,express:n.checked},price:l.totalPrice})}),s()}};var L=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function ge(e,t){let o=L[0];for(let r of L)if(e>=r.qty)o=r;else break;return t?o.single:o.double}var V={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,r=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),i=e.querySelector("#total-price"),a=e.querySelector("#price-breakdown");r?.addEventListener("click",()=>{let s=e.querySelector("#format").value,m=parseInt(e.querySelector("#quantity").value)||1,p=e.querySelector("#sides").value,l=e.querySelector("#paper").value,c=ge(m,p==="single"),d=l==="satin"?1.12:1,u=t.expressMode?1.2:1;if(o=c*d*u,i&&(i.textContent=o.toFixed(2)+" z\u0142"),a){let f=L[0];for(let y of L)if(m>=y.qty)f=y;else break;a.textContent="Podstawa: "+c.toFixed(2)+" z\u0142 za "+m+" szt (przedzia\u0142: "+f.qty+"+ szt)"}t.updateLastCalculated(o,"Vouchery "+s+" "+(p==="single"?"jednostronne":"dwustronne")+" - "+m+" szt")}),n?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let s=e.querySelector("#format").value,m=e.querySelector("#quantity").value,p=e.querySelector("#sides").value,l=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:o,description:s+" "+(p==="single"?"jednostronne":"dwustronne")+", "+m+" szt, "+(l==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+o.toFixed(2)+" z\u0142")})}};var M=[{qty:1,price:20},{qty:2,price:30},{qty:3,price:32},{qty:4,price:34},{qty:5,price:35},{qty:6,price:35},{qty:7,price:36},{qty:8,price:37},{qty:9,price:39},{qty:10,price:40},{qty:15,price:45},{qty:20,price:49},{qty:30,price:58},{qty:40,price:65},{qty:50,price:75},{qty:100,price:120}];function be(e){let t=M[0];for(let o of M)if(e>=o.qty)t=o;else break;return t.price}var N={id:"dyplomy",name:"\u{1F393} Dyplomy",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,r=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),i=e.querySelector("#total-price"),a=e.querySelector("#price-breakdown");r?.addEventListener("click",()=>{let s=parseInt(e.querySelector("#quantity").value)||1,m=e.querySelector("#paper").value,p=be(s),l=m==="satin"?1.12:1,c=t.expressMode?1.2:1;if(o=p*l*c,i&&(i.textContent=`${o.toFixed(2)} z\u0142`),a){let d=M[0];for(let u of M)if(s>=u.qty)d=u;else break;a.textContent=`${s} szt, przedzia\u0142: ${d.qty}+ szt \u2192 ${p.toFixed(2)} z\u0142${m==="satin"?" \xD7 1.12 (satyna)":""}`}t.updateLastCalculated(o,`Dyplomy DL - ${s} szt`)}),n?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let s=e.querySelector("#quantity").value,m=e.querySelector("#paper").value;t.addToBasket({category:"Dyplomy",price:o,description:`DL dwustronny, ${s} szt, ${m==="satin"?"satyna":"standard"}`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var we={"85x55":[{qty:50,plain:65,foil:160},{qty:100,plain:75,foil:170},{qty:150,plain:85,foil:180},{qty:200,plain:96,foil:190},{qty:250,plain:110,foil:200},{qty:300,plain:126,foil:220},{qty:400,plain:146,foil:240},{qty:500,plain:170,foil:250},{qty:1e3,plain:290,foil:335}],"90x50":[{qty:50,plain:70,foil:170},{qty:100,plain:79,foil:180},{qty:150,plain:89,foil:190},{qty:200,plain:99,foil:200},{qty:250,plain:120,foil:210},{qty:300,plain:129,foil:230},{qty:400,plain:149,foil:250},{qty:500,plain:175,foil:260},{qty:1e3,plain:300,foil:345}]};function ke(e,t,o){let r=we[e],n=r[0];for(let i of r)if(t>=i.qty)n=i;else break;return o?n.foil:n.plain}var U={id:"wizytowki",name:"\u{1F4BC} Wizyt\xF3wki",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,r=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),i=e.querySelector("#total-price"),a=e.querySelector("#price-breakdown");r?.addEventListener("click",()=>{let s=e.querySelector("#format").value,m=parseInt(e.querySelector("#quantity").value),p=e.querySelector("#foiling").value;o=ke(s,m,p==="foil"),t.expressMode&&(o*=1.2),i&&(i.textContent=`${o.toFixed(2)} z\u0142`),a&&(a.textContent=`Format ${s} mm, ${m} szt, ${p==="foil"?"z foli\u0105":"bez foliowania"}`),t.updateLastCalculated(o,`Wizyt\xF3wki ${s} - ${m} szt`)}),n?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let s=e.querySelector("#format").value,m=e.querySelector("#quantity").value,p=e.querySelector("#foiling").value;t.addToBasket({category:"Wizyt\xF3wki",price:o,description:`${s} mm, ${m} szt, ${p==="foil"?"z foli\u0105":"bez foliowania"}`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var P={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function W(e){let{format:t,qty:o,sides:r,isFolded:n,isSatin:i,express:a}=e,s=P.formats[t];if(!s)throw new Error(`Invalid format: ${t}`);let m=r===1?"single":"double",p=n?"folded":"normal",l=s[m][p],c=Object.keys(l).map(Number).sort((w,v)=>w-v),d=c[0];for(let w of c)o>=w&&(d=w);let u=l[d.toString()],f=[];i&&f.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:P.modifiers.satin}),a&&f.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:P.modifiers.express});let y=0,b=[];for(let w of f)(w.type==="percent"||w.type==="percentage")&&(y+=u*w.value,b.push(w.name));let x=u+y;return{basePrice:u,effectiveQuantity:o,tierPrice:u/o,modifiersTotal:y,totalPrice:Math.round(x*100)/100,appliedModifiers:b}}var K={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let o=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await o.text();let r=e.querySelector("#zapFormat"),n=e.querySelector("#zapSides"),i=e.querySelector("#zapFolded"),a=e.querySelector("#zapQty"),s=e.querySelector("#zapSatin"),m=e.querySelector("#calcBtn"),p=e.querySelector("#addToCartBtn"),l=e.querySelector("#zapResult"),c=()=>{let d={format:r.value,qty:parseInt(a.value)||10,sides:parseInt(n.value)||1,isFolded:i.checked,isSatin:s.checked,express:t.expressMode},u=W(d);return l.style.display="block",e.querySelector("#resUnitPrice").textContent=g(u.totalPrice/d.qty),e.querySelector("#resTotalPrice").textContent=g(u.totalPrice),e.querySelector("#resExpressHint").style.display=d.express?"block":"none",e.querySelector("#resSatinHint").style.display=d.isSatin?"block":"none",t.updateLastCalculated(u.totalPrice,"Zaproszenia"),{options:d,result:u}};m.addEventListener("click",()=>c()),p.addEventListener("click",()=>{let{options:d,result:u}=c();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${d.format} ${d.sides===1?"1-str":"2-str"}${d.isFolded?" sk\u0142adane":""}`,quantity:d.qty,unit:"szt",unitPrice:u.totalPrice/d.qty,isExpress:d.express,totalPrice:u.totalPrice,optionsHint:`${d.qty} szt, ${d.isSatin?"Satyna":"Kreda"}`,payload:d})}),c()}};var X={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function Ee(e){let t=X.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function J(e){let t=Ee(e.format),o=[];return e.express&&o.push("express"),k(t,e.qty,o)}var Z={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let o=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#u-format"),r=e.querySelector("#u-qty"),n=e.querySelector("#u-calculate"),i=e.querySelector("#u-add-to-cart"),a=e.querySelector("#u-result-display"),s=e.querySelector("#u-total-price"),m=e.querySelector("#u-express-hint"),p=null,l=null;n.onclick=()=>{l={format:o.value,qty:parseInt(r.value),express:t.expressMode};try{let c=J(l);p=c,s.innerText=g(c.totalPrice),m&&(m.style.display=t.expressMode?"block":"none"),a.style.display="block",i.disabled=!1,t.updateLastCalculated(c.totalPrice,"Ulotki")}catch(c){alert("B\u0142\u0105d: "+c.message)}},i.onclick=()=>{if(p&&l){let c=l.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${l.format}`,quantity:l.qty,unit:"szt",unitPrice:p.totalPrice/l.qty,isExpress:l.express,totalPrice:p.totalPrice,optionsHint:`${l.qty} szt, Dwustronne${c}`,payload:p})}}}};var Q={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function Ce(e){let t=Q.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Y(e){let t=Ce(e.format),o=[];return e.express&&o.push("express"),k(t,e.qty,o)}var G={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let o=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#uj-format"),r=e.querySelector("#uj-qty"),n=e.querySelector("#uj-calculate"),i=e.querySelector("#uj-add-to-cart"),a=e.querySelector("#uj-result-display"),s=e.querySelector("#uj-total-price"),m=e.querySelector("#uj-express-hint"),p=null,l=null;n.onclick=()=>{l={format:o.value,qty:parseInt(r.value),express:t.expressMode};try{let c=Y(l);p=c,s.innerText=g(c.totalPrice),m&&(m.style.display=t.expressMode?"block":"none"),a.style.display="block",i.disabled=!1,t.updateLastCalculated(c.totalPrice,"Ulotki")}catch(c){alert("B\u0142\u0105d: "+c.message)}},i.onclick=()=>{if(p&&l){let c=l.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${l.format}`,quantity:l.qty,unit:"szt",unitPrice:p.totalPrice/l.qty,isExpress:l.express,totalPrice:p.totalPrice,optionsHint:`${l.qty} szt, Jednostronne${c}`,payload:p})}}}};var ee={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function te(e){let t=ee,o=t.materials.find(i=>i.id===e.material);if(!o)throw new Error(`Unknown material: ${e.material}`);let r={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o.tiers,modifiers:t.modifiers},n=[];return e.oczkowanie&&n.push("oczkowanie"),e.express&&n.push("express"),k(r,e.areaM2,n)}var oe={id:"banner",name:"Bannery",async mount(e,t){try{let o=await fetch("categories/banner.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#b-material"),r=e.querySelector("#b-area"),n=e.querySelector("#b-oczkowanie"),i=e.querySelector("#b-calculate"),a=e.querySelector("#b-add-to-cart"),s=e.querySelector("#b-result-display"),m=e.querySelector("#b-unit-price"),p=e.querySelector("#b-total-price"),l=e.querySelector("#b-express-hint"),c=null,d=null;i.onclick=()=>{d={material:o.value,areaM2:parseFloat(r.value),oczkowanie:n.checked,express:t.expressMode};try{let u=te(d);c=u,m.innerText=g(u.tierPrice),p.innerText=g(u.totalPrice),l&&(l.style.display=t.expressMode?"block":"none"),s.style.display="block",a.disabled=!1,t.updateLastCalculated(u.totalPrice,"Banner")}catch(u){alert("B\u0142\u0105d: "+u.message)}},a.onclick=()=>{if(c&&d){let u=o.options[o.selectedIndex].text,f=[`${d.areaM2} m2`,d.oczkowanie?"z oczkowaniem":"bez oczkowania",d.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:u,quantity:d.areaM2,unit:"m2",unitPrice:c.tierPrice,isExpress:d.express,totalPrice:c.totalPrice,optionsHint:f,payload:c})}}}};var C={};de(C,{category:()=>qe,default:()=>Me,groups:()=>ze,modifiers:()=>Le});var qe="Wlepki / Naklejki",ze=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Le=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],Me={category:qe,groups:ze,modifiers:Le};function re(e){let t=C,o=t.groups.find(i=>i.id===e.groupId);if(!o)throw new Error(`Unknown group: ${e.groupId}`);let r={id:"wlepki",title:o.title,unit:o.unit,pricing:o.pricing||"per_unit",tiers:o.tiers,modifiers:t.modifiers,rules:o.rules||[{type:"minimum",unit:"m2",value:1}]},n=[...e.modifiers];return e.express&&n.push("express"),k(r,e.area,n)}var ie={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let o=C;try{let u=await fetch("categories/wlepki-naklejki.html");if(!u.ok)throw new Error("Failed to load template");e.innerHTML=await u.text()}catch(u){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${u}</div>`;return}let r=e.querySelector("#wlepki-group"),n=e.querySelector("#wlepki-area"),i=e.querySelector("#btn-calculate"),a=e.querySelector("#btn-add-to-cart"),s=e.querySelector("#wlepki-result"),m=e.querySelector("#unit-price"),p=e.querySelector("#total-price"),l=null,c=null,d=()=>{let u=e.querySelectorAll(".wlepki-mod:checked"),f=Array.from(u).map(y=>y.value);c={groupId:r.value,area:parseFloat(n.value)||0,express:t.expressMode,modifiers:f};try{let y=re(c);l=y,m.textContent=g(y.tierPrice),p.textContent=g(y.totalPrice),s.style.display="block",a.disabled=!1,t.updateLastCalculated(y.totalPrice,"Wlepki")}catch(y){alert("B\u0142\u0105d: "+y.message)}};i.addEventListener("click",d),a.addEventListener("click",()=>{if(!l||!c)return;let u=o.groups.find(y=>y.id===c.groupId),f=c.modifiers.map(y=>{let b=o.modifiers.find(x=>x.id===y);return b?b.name:y});c.express&&f.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:u?.title||"Wlepki",quantity:c.area,unit:"m2",unitPrice:l.tierPrice,isExpress:!!c.express,totalPrice:l.totalPrice,optionsHint:f.join(", ")||"Standard",payload:l})})}};var H={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function ae(e){let t=H.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let o;if(e.isReplacement){let i=t.width*t.height*H.replacement.print_per_m2+H.replacement.labor;o={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:i}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else o={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let r=[];return e.express&&r.push("express"),k(o,e.qty,r)}var ne={id:"roll-up",name:"Roll-up",async mount(e,t){let o=await fetch("categories/roll-up.html");e.innerHTML=await o.text();let r=e.querySelector("#rollUpType"),n=e.querySelector("#rollUpFormat"),i=e.querySelector("#rollUpQty"),a=e.querySelector("#calcBtn"),s=e.querySelector("#addToCartBtn"),m=e.querySelector("#rollUpResult"),p=()=>{let l={format:n.value,qty:parseInt(i.value)||1,isReplacement:r.value==="replacement",express:t.expressMode},c=ae(l);return m.style.display="block",e.querySelector("#resUnitPrice").textContent=g(c.totalPrice/l.qty),e.querySelector("#resTotalPrice").textContent=g(c.totalPrice),e.querySelector("#resExpressHint").style.display=l.express?"block":"none",t.updateLastCalculated(c.totalPrice,"Roll-up"),{options:l,result:c}};a.addEventListener("click",()=>p()),s.addEventListener("click",()=>{let{options:l,result:c}=p();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${l.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${l.format}`,quantity:l.qty,unit:"szt",unitPrice:c.totalPrice/l.qty,isExpress:l.express,totalPrice:c.totalPrice,optionsHint:`${l.format}, ${l.qty} szt`,payload:l})}),p()}};async function Ae(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function D(e,t,o){return{id:e,name:t,mount:async(r,n)=>{r.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let i=await Ae(o);r.innerHTML=i,He(r,n)}catch(i){r.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${i}</small>
          </div>
        `,console.error("Category load error:",i)}}}}function He(e,t){e.querySelectorAll("button[data-action]").forEach(r=>{let n=r.getAttribute("data-action");n==="calculate"&&r.addEventListener("click",()=>{console.log("Calculate clicked")}),n==="add-to-basket"&&r.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var I={kolor:{formatowe:{"A0+":{price:26,dims:"914\xD71292 mm"},A0:{price:24,dims:"841\xD71189 mm"},A1:{price:12,dims:"594\xD7841 mm"},A2:{price:8.5,dims:"420\xD7594 mm"},A3:{price:5.3,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:21,width:914},A0:{price:20,width:841},A1:{price:14.5,width:594},A2:{price:13.9,width:420},A3:{price:12,width:297},"MB 1067":{price:30,width:1067}}},czarno_bialy:{formatowe:{"A0+":{price:13,dims:"914\xD71292 mm"},A0:{price:11,dims:"841\xD71189 mm"},A1:{price:6,dims:"594\xD7841 mm"},A2:{price:4,dims:"420\xD7594 mm"},A3:{price:2.5,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:10,width:914},A0:{price:9,width:841},A1:{price:5,width:594},A2:{price:4.5,width:420},A3:{price:3.5,width:297},"MB 1067":{price:12.5,width:1067}}}},le={id:"druk-cad",name:"\u{1F4D0} Druk CAD",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk CAD Wielkoformatowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Druk rysunk\xF3w technicznych CAD - linie i cienkie teksty (WEKTOR). Papier 80g/m\xB2.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A0+">A0+ (914\xD71292 mm)</option>
            <option value="A0">A0 (841\xD71189 mm)</option>
            <option value="A1" selected>A1 (594\xD7841 mm)</option>
            <option value="A2">A2 (420\xD7594 mm)</option>
            <option value="A3">A3 (297\xD7420 mm)</option>
            <option value="MB 1067">MB 1067 (rolka 1067 mm)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Druk:</label>
          <select id="color">
            <option value="kolor">Kolor</option>
            <option value="czarno_bialy">Czarno-bia\u0142y</option>
          </select>
        </div>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #667eea; margin: 0 0 15px 0;">Wybierz rodzaj wydruku:</h3>

          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <button id="btn-formatowy" class="btn-toggle active" style="flex: 1; padding: 15px; border: 2px solid #667eea; background: #667eea; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
              \u{1F4D0} FORMATOWY<br>
              <small style="font-weight: normal; opacity: 0.9;">Sta\u0142a cena za format</small>
            </button>
            <button id="btn-nieformatowy" class="btn-toggle" style="flex: 1; padding: 15px; border: 2px solid #444; background: #2a2a2a; color: #999; border-radius: 8px; cursor: pointer; font-weight: bold;">
              \u{1F4CF} NIEFORMATOWY<br>
              <small style="font-weight: normal; opacity: 0.7;">W\u0142asna d\u0142ugo\u015B\u0107 (mb)</small>
            </button>
          </div>

          <div id="formatowy-section" style="display: block;">
            <div style="padding: 15px; background: #2a2a2a; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #999;">Format:</span>
                <strong id="format-display" style="color: #667eea; font-size: 18px;">A1</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #999;">Wymiary:</span>
                <strong id="dims-display" style="color: #ccc;">594\xD7841 mm</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #999;">Cena:</span>
                <strong id="formatowy-price" style="font-size: 24px; color: #667eea;">12.00 z\u0142</strong>
              </div>
            </div>
          </div>

          <div id="nieformatowy-section" style="display: none;">
            <div class="form-group">
              <label>D\u0142ugo\u015B\u0107 (metry):</label>
              <input type="number" id="length" value="1.0" min="0.1" step="0.001" max="50">
              <small style="color: #666;">
                Przyk\u0142ad: 2.0 (2 metry) lub 0.585 (585mm)
              </small>
            </div>

            <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #999;">Cena za mb:</span>
                <strong id="price-per-mb" style="color: #667eea; font-size: 18px;">14.50 z\u0142/mb</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #999;">D\u0142ugo\u015B\u0107:</span>
                <strong id="length-display" style="color: #ccc;">1.000 m</strong>
              </div>
              <div style="border-top: 1px solid #444; padding-top: 10px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #999;">Cena ca\u0142kowita:</span>
                  <strong id="nieformatowy-price" style="font-size: 24px; color: #667eea;">14.50 z\u0142</strong>
                </div>
                <p id="calc-breakdown" style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                  14.50 z\u0142/mb \xD7 1.000 m = 14.50 z\u0142
                </p>
              </div>
            </div>
          </div>
        </div>

        <button id="addToBasket" class="btn-success" style="width: 100%; padding: 15px; font-size: 16px;">
          Dodaj do listy
        </button>
      </div>
    `;let o="formatowy",r=0,n=e.querySelector("#format"),i=e.querySelector("#color"),a=e.querySelector("#btn-formatowy"),s=e.querySelector("#btn-nieformatowy"),m=e.querySelector("#formatowy-section"),p=e.querySelector("#nieformatowy-section"),l=e.querySelector("#length"),c=e.querySelector("#addToBasket");function d(y){o=y,y==="formatowy"?(a.style.background="#667eea",a.style.color="white",a.style.borderColor="#667eea",s.style.background="#2a2a2a",s.style.color="#999",s.style.borderColor="#444",m.style.display="block",p.style.display="none",u()):(s.style.background="#667eea",s.style.color="white",s.style.borderColor="#667eea",a.style.background="#2a2a2a",a.style.color="#999",a.style.borderColor="#444",m.style.display="none",p.style.display="block",f())}a.addEventListener("click",()=>d("formatowy")),s.addEventListener("click",()=>d("nieformatowy"));function u(){let y=n.value,b=i.value,x=I[b].formatowe[y];if(!x){r=0;let S=e.querySelector("#formatowy-price");S&&(S.textContent="---");return}r=x.price,t.expressMode&&(r*=1.2);let w=e.querySelector("#format-display"),v=e.querySelector("#dims-display"),E=e.querySelector("#formatowy-price");w&&(w.textContent=y),v&&(v.textContent=x.dims),E&&(E.textContent=r.toFixed(2)+" z\u0142"),t.updateLastCalculated(r,"CAD "+y+" formatowy - "+(b==="kolor"?"kolor":"cz-b"))}function f(){let y=n.value,b=i.value,x=parseFloat(l.value)||1,w=I[b].metr_biezacy[y];if(!w)return;let v=w.price;r=v*x,t.expressMode&&(r*=1.2);let E=e.querySelector("#price-per-mb"),S=e.querySelector("#length-display"),$=e.querySelector("#nieformatowy-price"),R=e.querySelector("#calc-breakdown");E&&(E.textContent=v.toFixed(2)+" z\u0142/mb"),S&&(S.textContent=x.toFixed(3)+" m"),$&&($.textContent=r.toFixed(2)+" z\u0142"),R&&(R.textContent=v.toFixed(2)+" z\u0142/mb \xD7 "+x.toFixed(3)+" m = "+r.toFixed(2)+" z\u0142"),t.updateLastCalculated(r,"CAD "+y+" nieformatowy "+x.toFixed(3)+"m - "+(b==="kolor"?"kolor":"cz-b"))}n.addEventListener("change",()=>{o==="formatowy"?u():f()}),i.addEventListener("change",()=>{o==="formatowy"?u():f()}),l.addEventListener("input",f),c.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F B\u0142\u0105d obliczenia ceny!");return}let y=n.value,b=i.value==="kolor"?"kolor":"cz-b",x="";if(o==="formatowy")x=y+" formatowy, "+b;else{let w=parseFloat(l.value),v=I[i.value].metr_biezacy[y].price;x=y+" nieformatowy, "+w.toFixed(3)+" m, "+b+" ("+v.toFixed(2)+" z\u0142/mb)"}t.addToBasket({category:"Druk CAD",price:r,description:x}),alert("\u2705 Dodano: "+r.toFixed(2)+" z\u0142")}),d("formatowy")}};var se={czarnoBialy:{A4:[{min:1,max:5,price:.9},{min:6,max:20,price:.6},{min:21,max:100,price:.35},{min:101,max:500,price:.3},{min:501,max:999,price:.23},{min:1e3,max:4999,price:.19},{min:5e3,max:99999,price:.15}],A3:[{min:1,max:5,price:1.7},{min:6,max:20,price:1.1},{min:21,max:100,price:.7},{min:101,max:500,price:.6},{min:501,max:999,price:.45},{min:1e3,max:99999,price:.33}]},kolorowy:{A4:[{min:1,max:10,price:2.4},{min:11,max:40,price:2.2},{min:41,max:100,price:2},{min:101,max:250,price:1.8},{min:251,max:500,price:1.6},{min:501,max:999,price:1.4},{min:1e3,max:99999,price:1.1}],A3:[{min:1,max:10,price:4.8},{min:11,max:40,price:4.2},{min:41,max:100,price:3.8},{min:101,max:250,price:3},{min:251,max:500,price:2.5},{min:501,max:999,price:1.9},{min:1e3,max:99999,price:1.6}]}};function De(e,t,o){let r=se[o][e];for(let n of r)if(t>=n.min&&t<=n.max)return n.price;return r[r.length-1].price}var ce={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3 + skan",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk / Ksero A4/A3</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Cena za stron\u0119 zale\u017Cy od nak\u0142adu. Im wi\u0119cej stron, tym ni\u017Csza cena jednostkowa.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4 (210\xD7297 mm)</option>
            <option value="A3">A3 (297\xD7420 mm)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilo\u015B\u0107 stron:</label>
          <input type="number" id="quantity" value="1" min="1" max="10000" step="1">
          <small style="color: #666;">Ca\u0142kowita liczba stron do wydruku</small>
        </div>

        <div class="form-group">
          <label>Druk:</label>
          <select id="color">
            <option value="czarnoBialy">Czarno-bia\u0142y</option>
            <option value="kolorowy">Kolorowy</option>
          </select>
        </div>

        <div id="price-tiers" style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #667eea; margin: 0 0 10px 0;">Przedzia\u0142y cenowe:</h4>
          <div id="tiers-list"></div>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="color: #999;">Cena za stron\u0119:</span>
            <strong id="price-per-page" style="font-size: 18px; color: #667eea;">0.00 z\u0142/str</strong>
          </div>
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
    `;let o=0,r=0,n=e.querySelector("#format"),i=e.querySelector("#quantity"),a=e.querySelector("#color"),s=e.querySelector("#calculate"),m=e.querySelector("#addToBasket"),p=e.querySelector("#tiers-list"),l=e.querySelector("#price-per-page"),c=e.querySelector("#total-price"),d=e.querySelector("#price-breakdown");function u(){let f=n.value,y=a.value,b=se[y][f];p&&(p.innerHTML=b.map(x=>`<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${x.max>=99999?`${x.min}+ str`:`${x.min}-${x.max} str`}</span>
            <span style="color: #667eea;">${x.price.toFixed(2)} z\u0142/str</span>
          </div>`).join(""))}n.addEventListener("change",u),a.addEventListener("change",u),u(),s?.addEventListener("click",()=>{let f=n.value,y=parseInt(i.value)||1,b=a.value;if(r=De(f,y,b),o=r*y,t.expressMode&&(o*=1.2),l&&(l.textContent=`${r.toFixed(2)} z\u0142/str`),c&&(c.textContent=`${o.toFixed(2)} z\u0142`),d){let x=b==="czarnoBialy"?"Czarno-bia\u0142y":"Kolorowy";d.textContent=`${x}, ${f}, ${y} str \xD7 ${r.toFixed(2)} z\u0142 = ${o.toFixed(2)} z\u0142`}t.updateLastCalculated(o,`Druk ${f} ${b==="czarnoBialy"?"CZ-B":"KOLOR"} - ${y} str`)}),m?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let f=n.value,y=i.value,b=a.value==="czarnoBialy"?"CZ-B":"KOLOR";t.addToBasket({category:"Druk A4/A3",price:o,description:`${f}, ${y} str, ${b} (${r.toFixed(2)} z\u0142/str)`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var me=[_,O,V,N,U,K,Z,G,oe,ie,ne,le,ce,D("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),D("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),D("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var h=new z;function T(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),o=document.getElementById("json-preview");if(!e||!t||!o)return;let r=h.getItems();if(r.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=r.map((i,a)=>`
      <div class="basket-item" style="padding: 12px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: white; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${i.category}: ${i.name}
            </strong>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0 0;">
              ${i.optionsHint} (${i.quantity} ${i.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${g(i.totalPrice)}</strong>
            <button onclick="window.removeItem(${a})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let n=h.getGrandTotal();t.innerText=g(n)}o.innerText=JSON.stringify(r.map(n=>n.payload),null,2)}window.removeItem=e=>{h.removeItem(e),T()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),o=document.getElementById("categorySearch"),r=document.getElementById("tryb-express");if(!e||!t||!r||!o)return;let n=()=>({cart:{addItem:a=>{h.addItem(a),T()}},addToBasket:a=>{h.addItem({id:`item-${Date.now()}`,category:a.category,name:a.description||"Produkt",quantity:1,unit:"szt.",unitPrice:a.price,isExpress:r.checked,totalPrice:a.price,optionsHint:a.description||"",payload:a}),T()},expressMode:r.checked,updateLastCalculated:(a,s)=>{let m=document.getElementById("last-calculated"),p=document.getElementById("currentHint");m&&(m.innerText=g(a)),p&&(p.innerText=s?`(${s})`:"")}}),i=new q(e,n);i.setCategories(B),me.forEach(a=>{i.addRoute(a)}),B.forEach(a=>{let s=document.createElement("option");s.value=a.id,s.innerText=`${a.icon} ${a.name}`,a.implemented||(s.disabled=!0,s.innerText+=" (wkr\xF3tce)"),t.appendChild(s)}),t.addEventListener("change",()=>{let a=t.value;a?window.location.hash=`#/${a}`:window.location.hash="#/"}),o.addEventListener("input",()=>{let a=o.value.toLowerCase();Array.from(t.options).forEach((m,p)=>{if(p===0)return;let l=m.text.toLowerCase();m.hidden=!l.includes(a)})}),o.addEventListener("keydown",a=>{if(a.key==="Enter"){let s=o.value.toLowerCase(),m=Array.from(t.options).find((p,l)=>l>0&&!p.hidden&&!p.disabled);m&&(t.value=m.value,window.location.hash=`#/${m.value}`,o.value="")}}),window.addEventListener("hashchange",()=>{let s=(window.location.hash||"#/").slice(2);t.value=s}),r.addEventListener("change",()=>{let a=window.location.hash;window.location.hash="",window.location.hash=a}),document.getElementById("clear-basket")?.addEventListener("click",()=>{h.clear(),T()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let a={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(h.isEmpty()){alert("Lista jest pusta!");return}F(h.getItems(),a)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let a=h.getItems(),s=JSON.stringify(a.map(m=>m.payload),null,2);navigator.clipboard.writeText(s).then(()=>{alert("JSON skopiowany do schowka!")})}),T(),i.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
