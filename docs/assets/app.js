var se=Object.defineProperty;var ce=(e,t)=>{for(var o in t)se(e,o,{get:t[o],enumerable:!0})};var T=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,o){this.container=t,this.getCtx=o,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let o=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let i=this.routes.get(o);if(i){this.currentView=i;let r=document.createElement("button");r.className="back-button",r.textContent="Wszystkie kategorie",r.onclick=()=>{window.location.hash="#/"},this.container.appendChild(r);let a=document.createElement("div");a.className="category-content",a.id="current-category",this.container.appendChild(a),i.mount(a,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function b(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var q=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,o)=>t+o.totalPrice,0)}isEmpty(){return this.items.length===0}};function F(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let o=e.map(l=>({Kategoria:l.category,Nazwa:l.name,Ilo\u015B\u0107:l.quantity,Jednostka:l.unit,"Cena jedn.":l.unitPrice,"Express (+20%)":l.isExpress?"TAK":"NIE","Cena ca\u0142kowita":l.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),i=XLSX.utils.json_to_sheet(o),r=XLSX.utils.book_new();XLSX.utils.book_append_sheet(r,i,"Zam\xF3wienie");let a=new Date().toISOString().slice(0,10),n=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${a}.xlsx`;XLSX.writeFile(r,n)}var I=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var _={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=e.querySelector("#addSampleBtn"),i=e.querySelector("#sampleQty");o?.addEventListener("click",()=>{let r=parseInt(i.value)||1,a=r*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:r},price:a}),alert(`Dodano do koszyka: ${r} szt. za ${b(a)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function pe(e,t){let o=[...e].sort((a,n)=>a.min-n.min),i=o.find(a=>t>=a.min&&(a.max===null||t<=a.max));if(i)return i;let r=o.find(a=>a.min>=t);return r||o[o.length-1]}function de(e,t){if(!t)return e;let o=t.find(i=>i.type==="minimum"&&i.unit==="m2");return o&&e<o.value?o.value:e}function v(e,t,o=[]){let i=de(t,e.rules),r=pe(e.tiers,i),a=0;e.pricing==="per_unit"?a=i*r.price:a=r.price;let n=0,l=[];if(e.modifiers)for(let s of o){let p=e.modifiers.find(m=>m.id===s);p&&(l.push(p.name),p.type==="percent"?n+=a*p.value:p.type==="fixed_per_unit"?n+=p.value*i:n+=p.value)}let c=a+n,u=e.rules?.find(s=>s.type==="minimum"&&s.unit==="pln");return u&&c<u.value&&(c=u.value),{basePrice:a,effectiveQuantity:i,tierPrice:r.price,modifiersTotal:n,totalPrice:parseFloat(c.toFixed(2)),appliedModifiers:l}}var j={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:.2}]};var O={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let o=j;e.innerHTML=`
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
    `;let i=e.querySelector("#plakatyQty"),r=e.querySelector("#plakatyExpress"),a=e.querySelector("#plakatyResult"),n=e.querySelector("#addPlakatyBtn");function l(){let c=parseFloat(i.value)||0,u=r.checked?["EXPRESS"]:[];try{let s=v(c,o,u);a.textContent=b(s.totalPrice)}catch{a.textContent="B\u0142\u0105d"}}i.addEventListener("input",l),r.addEventListener("change",l),n.addEventListener("click",()=>{let c=parseFloat(i.value)||0,u=r.checked?["EXPRESS"]:[],s=v(c,o,u);t.cart.addItem({categoryId:o.id,categoryName:o.title,details:{qty:`${c} m2`,express:r.checked},price:s.totalPrice})}),l()}};var L=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function ye(e,t){let o=L[0];for(let i of L)if(e>=i.qty)o=i;else break;return t?o.single:o.double}var V={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,i=e.querySelector("#calculate"),r=e.querySelector("#addToBasket"),a=e.querySelector("#total-price"),n=e.querySelector("#price-breakdown");i?.addEventListener("click",()=>{let l=e.querySelector("#format").value,c=parseInt(e.querySelector("#quantity").value)||1,u=e.querySelector("#sides").value,s=e.querySelector("#paper").value,p=ye(c,u==="single"),m=s==="satin"?1.12:1,y=t.expressMode?1.2:1;if(o=p*m*y,a&&(a.textContent=o.toFixed(2)+" z\u0142"),n){let f=L[0];for(let d of L)if(c>=d.qty)f=d;else break;n.textContent="Podstawa: "+p.toFixed(2)+" z\u0142 za "+c+" szt (przedzia\u0142: "+f.qty+"+ szt)"}t.updateLastCalculated(o,"Vouchery "+l+" "+(u==="single"?"jednostronne":"dwustronne")+" - "+c+" szt")}),r?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#format").value,c=e.querySelector("#quantity").value,u=e.querySelector("#sides").value,s=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:o,description:l+" "+(u==="single"?"jednostronne":"dwustronne")+", "+c+" szt, "+(s==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+o.toFixed(2)+" z\u0142")})}};var M=[{qty:1,price:20},{qty:2,price:30},{qty:3,price:32},{qty:4,price:34},{qty:5,price:35},{qty:6,price:35},{qty:7,price:36},{qty:8,price:37},{qty:9,price:39},{qty:10,price:40},{qty:15,price:45},{qty:20,price:49},{qty:30,price:58},{qty:40,price:65},{qty:50,price:75},{qty:100,price:120}];function fe(e){let t=M[0];for(let o of M)if(e>=o.qty)t=o;else break;return t.price}var N={id:"dyplomy",name:"\u{1F393} Dyplomy",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,i=e.querySelector("#calculate"),r=e.querySelector("#addToBasket"),a=e.querySelector("#total-price"),n=e.querySelector("#price-breakdown");i?.addEventListener("click",()=>{let l=parseInt(e.querySelector("#quantity").value)||1,c=e.querySelector("#paper").value,u=fe(l),s=c==="satin"?1.12:1,p=t.expressMode?1.2:1;if(o=u*s*p,a&&(a.textContent=`${o.toFixed(2)} z\u0142`),n){let m=M[0];for(let y of M)if(l>=y.qty)m=y;else break;n.textContent=`${l} szt, przedzia\u0142: ${m.qty}+ szt \u2192 ${u.toFixed(2)} z\u0142${c==="satin"?" \xD7 1.12 (satyna)":""}`}t.updateLastCalculated(o,`Dyplomy DL - ${l} szt`)}),r?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#quantity").value,c=e.querySelector("#paper").value;t.addToBasket({category:"Dyplomy",price:o,description:`DL dwustronny, ${l} szt, ${c==="satin"?"satyna":"standard"}`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var xe={"85x55":[{qty:50,plain:65,foil:160},{qty:100,plain:75,foil:170},{qty:150,plain:85,foil:180},{qty:200,plain:96,foil:190},{qty:250,plain:110,foil:200},{qty:300,plain:126,foil:220},{qty:400,plain:146,foil:240},{qty:500,plain:170,foil:250},{qty:1e3,plain:290,foil:335}],"90x50":[{qty:50,plain:70,foil:170},{qty:100,plain:79,foil:180},{qty:150,plain:89,foil:190},{qty:200,plain:99,foil:200},{qty:250,plain:120,foil:210},{qty:300,plain:129,foil:230},{qty:400,plain:149,foil:250},{qty:500,plain:175,foil:260},{qty:1e3,plain:300,foil:345}]};function ge(e,t,o){let i=xe[e],r=i[0];for(let a of i)if(t>=a.qty)r=a;else break;return o?r.foil:r.plain}var W={id:"wizytowki",name:"\u{1F4BC} Wizyt\xF3wki",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,i=e.querySelector("#calculate"),r=e.querySelector("#addToBasket"),a=e.querySelector("#total-price"),n=e.querySelector("#price-breakdown");i?.addEventListener("click",()=>{let l=e.querySelector("#format").value,c=parseInt(e.querySelector("#quantity").value),u=e.querySelector("#foiling").value;o=ge(l,c,u==="foil"),t.expressMode&&(o*=1.2),a&&(a.textContent=`${o.toFixed(2)} z\u0142`),n&&(n.textContent=`Format ${l} mm, ${c} szt, ${u==="foil"?"z foli\u0105":"bez foliowania"}`),t.updateLastCalculated(o,`Wizyt\xF3wki ${l} - ${c} szt`)}),r?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#format").value,c=e.querySelector("#quantity").value,u=e.querySelector("#foiling").value;t.addToBasket({category:"Wizyt\xF3wki",price:o,description:`${l} mm, ${c} szt, ${u==="foil"?"z foli\u0105":"bez foliowania"}`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var P={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function K(e){let{format:t,qty:o,sides:i,isFolded:r,isSatin:a,express:n}=e,l=P.formats[t];if(!l)throw new Error(`Invalid format: ${t}`);let c=i===1?"single":"double",u=r?"folded":"normal",s=l[c][u],p=Object.keys(s).map(Number).sort((w,k)=>w-k),m=p[0];for(let w of p)o>=w&&(m=w);let y=s[m.toString()],f=[];a&&f.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:P.modifiers.satin}),n&&f.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:P.modifiers.express});let d=0,g=[];for(let w of f)(w.type==="percent"||w.type==="percentage")&&(d+=y*w.value,g.push(w.name));let x=y+d;return{basePrice:y,effectiveQuantity:o,tierPrice:y/o,modifiersTotal:d,totalPrice:Math.round(x*100)/100,appliedModifiers:g}}var U={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let o=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await o.text();let i=e.querySelector("#zapFormat"),r=e.querySelector("#zapSides"),a=e.querySelector("#zapFolded"),n=e.querySelector("#zapQty"),l=e.querySelector("#zapSatin"),c=e.querySelector("#calcBtn"),u=e.querySelector("#addToCartBtn"),s=e.querySelector("#zapResult"),p=()=>{let m={format:i.value,qty:parseInt(n.value)||10,sides:parseInt(r.value)||1,isFolded:a.checked,isSatin:l.checked,express:t.expressMode},y=K(m);return s.style.display="block",e.querySelector("#resUnitPrice").textContent=b(y.totalPrice/m.qty),e.querySelector("#resTotalPrice").textContent=b(y.totalPrice),e.querySelector("#resExpressHint").style.display=m.express?"block":"none",e.querySelector("#resSatinHint").style.display=m.isSatin?"block":"none",t.updateLastCalculated(y.totalPrice,"Zaproszenia"),{options:m,result:y}};c.addEventListener("click",()=>p()),u.addEventListener("click",()=>{let{options:m,result:y}=p();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${m.format} ${m.sides===1?"1-str":"2-str"}${m.isFolded?" sk\u0142adane":""}`,quantity:m.qty,unit:"szt",unitPrice:y.totalPrice/m.qty,isExpress:m.express,totalPrice:y.totalPrice,optionsHint:`${m.qty} szt, ${m.isSatin?"Satyna":"Kreda"}`,payload:m})}),p()}};var X={name:"Ulotki \u2013 cyfrowe",jednostronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}},dwustronne:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:365},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function ve(e,t="jednostronne"){let o=X[t];if(!o)throw new Error(`Invalid mode: ${t}`);let i=o[e];if(!i)throw new Error(`Invalid format: ${e} for mode ${t}`);return{id:`ulotki-cyfrowe-${t}-${e.toLowerCase()}`,title:`Ulotki Cyfrowe ${t==="dwustronne"?"Dwustronne":"Jednostronne"} ${i.name}`,unit:"szt",pricing:"flat",tiers:i.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Q(e){let t=ve(e.format,e.mode),o=[];return e.express&&o.push("express"),v(t,e.qty,o)}var Z={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki \u2013 cyfrowe",async mount(e,t){try{let o=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#uj-format"),i=e.querySelector("#uj-qty-input"),r=e.querySelector("#uj-add-to-cart"),a=e.querySelector("#uj-result-display"),n=e.querySelector("#uj-total-price"),l=e.querySelector("#uj-unit-price"),c=e.querySelector("#uj-display-qty"),u=e.querySelector("#uj-express-hint"),s=e.querySelector("#uj-individual-quote"),p=null,m=null,y=()=>{let f=e.querySelector('input[name="uj-mode"]:checked').value,d=parseInt(i.value)||0,g=o.value;if(d>1e3){a.style.display="none",s.style.display="block",r.disabled=!0;return}if(d<1){a.style.display="none",s.style.display="none",r.disabled=!0;return}s.style.display="none",m={mode:f,format:g,qty:d,express:t.expressMode};try{let x=Q(m);p=x,c.innerText=`${d} szt`,l.innerText=b(x.totalPrice/d),n.innerText=b(x.totalPrice),u&&(u.style.display=t.expressMode?"block":"none"),a.style.display="block",r.disabled=!1,t.updateLastCalculated(x.totalPrice,"Ulotki")}catch(x){console.error(x),a.style.display="none",r.disabled=!0}};e.querySelectorAll('input[name="uj-mode"]').forEach(f=>{f.addEventListener("change",y)}),o.onchange=y,i.oninput=y,r.onclick=()=>{if(p&&m){let f=m.express?", EXPRESS":"",d=m.mode==="dwustronne"?"Dwustronne":"Jednostronne";t.cart.addItem({id:`ulotki-cyfrowe-${Date.now()}`,category:"Ulotki",name:`Ulotki ${d} ${m.format}`,quantity:m.qty,unit:"szt",unitPrice:p.totalPrice/m.qty,isExpress:m.express,totalPrice:p.totalPrice,optionsHint:`${m.qty} szt, ${d}${f}`,payload:p})}},y()}};var J={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function Y(e){let t=J,o=t.materials.find(a=>a.id===e.material);if(!o)throw new Error(`Unknown material: ${e.material}`);let i={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o.tiers,modifiers:t.modifiers},r=[];return e.oczkowanie&&r.push("oczkowanie"),e.express&&r.push("express"),v(i,e.areaM2,r)}var G={id:"banner",name:"Bannery",async mount(e,t){try{let o=await fetch("categories/banner.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#b-material"),i=e.querySelector("#b-area"),r=e.querySelector("#b-oczkowanie"),a=e.querySelector("#b-calculate"),n=e.querySelector("#b-add-to-cart"),l=e.querySelector("#b-result-display"),c=e.querySelector("#b-unit-price"),u=e.querySelector("#b-total-price"),s=e.querySelector("#b-express-hint"),p=null,m=null;a.onclick=()=>{m={material:o.value,areaM2:parseFloat(i.value),oczkowanie:r.checked,express:t.expressMode};try{let y=Y(m);p=y,c.innerText=b(y.tierPrice),u.innerText=b(y.totalPrice),s&&(s.style.display=t.expressMode?"block":"none"),l.style.display="block",n.disabled=!1,t.updateLastCalculated(y.totalPrice,"Banner")}catch(y){alert("B\u0142\u0105d: "+y.message)}},n.onclick=()=>{if(p&&m){let y=o.options[o.selectedIndex].text,f=[`${m.areaM2} m2`,m.oczkowanie?"z oczkowaniem":"bez oczkowania",m.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:y,quantity:m.areaM2,unit:"m2",unitPrice:p.tierPrice,isExpress:m.express,totalPrice:p.totalPrice,optionsHint:f,payload:p})}}}};var z={};ce(z,{category:()=>he,default:()=>ze,groups:()=>Ee,modifiers:()=>Se});var he="Wlepki / Naklejki",Ee=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Se=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],ze={category:he,groups:Ee,modifiers:Se};function ee(e){let t=z,o=t.groups.find(a=>a.id===e.groupId);if(!o)throw new Error(`Unknown group: ${e.groupId}`);let i={id:"wlepki",title:o.title,unit:o.unit,pricing:o.pricing||"per_unit",tiers:o.tiers,modifiers:t.modifiers,rules:o.rules||[{type:"minimum",unit:"m2",value:1}]},r=[...e.modifiers];return e.express&&r.push("express"),v(i,e.area,r)}var te={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let o=z;try{let y=await fetch("categories/wlepki-naklejki.html");if(!y.ok)throw new Error("Failed to load template");e.innerHTML=await y.text()}catch(y){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${y}</div>`;return}let i=e.querySelector("#wlepki-group"),r=e.querySelector("#wlepki-area"),a=e.querySelector("#btn-calculate"),n=e.querySelector("#btn-add-to-cart"),l=e.querySelector("#wlepki-result"),c=e.querySelector("#unit-price"),u=e.querySelector("#total-price"),s=null,p=null,m=()=>{let y=e.querySelectorAll(".wlepki-mod:checked"),f=Array.from(y).map(d=>d.value);p={groupId:i.value,area:parseFloat(r.value)||0,express:t.expressMode,modifiers:f};try{let d=ee(p);s=d,c.textContent=b(d.tierPrice),u.textContent=b(d.totalPrice),l.style.display="block",n.disabled=!1,t.updateLastCalculated(d.totalPrice,"Wlepki")}catch(d){alert("B\u0142\u0105d: "+d.message)}};a.addEventListener("click",m),n.addEventListener("click",()=>{if(!s||!p)return;let y=o.groups.find(d=>d.id===p.groupId),f=p.modifiers.map(d=>{let g=o.modifiers.find(x=>x.id===d);return g?g.name:d});p.express&&f.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:y?.title||"Wlepki",quantity:p.area,unit:"m2",unitPrice:s.tierPrice,isExpress:!!p.express,totalPrice:s.totalPrice,optionsHint:f.join(", ")||"Standard",payload:s})})}};var H={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function oe(e){let t=H.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let o;if(e.isReplacement){let a=t.width*t.height*H.replacement.print_per_m2+H.replacement.labor;o={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:a}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else o={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let i=[];return e.express&&i.push("express"),v(o,e.qty,i)}var ie={id:"roll-up",name:"Roll-up",async mount(e,t){let o=await fetch("categories/roll-up.html");e.innerHTML=await o.text();let i=e.querySelector("#rollUpType"),r=e.querySelector("#rollUpFormat"),a=e.querySelector("#rollUpQty"),n=e.querySelector("#calcBtn"),l=e.querySelector("#addToCartBtn"),c=e.querySelector("#rollUpResult"),u=()=>{let s={format:r.value,qty:parseInt(a.value)||1,isReplacement:i.value==="replacement",express:t.expressMode},p=oe(s);return c.style.display="block",e.querySelector("#resUnitPrice").textContent=b(p.totalPrice/s.qty),e.querySelector("#resTotalPrice").textContent=b(p.totalPrice),e.querySelector("#resExpressHint").style.display=s.express?"block":"none",t.updateLastCalculated(p.totalPrice,"Roll-up"),{options:s,result:p}};n.addEventListener("click",()=>u()),l.addEventListener("click",()=>{let{options:s,result:p}=u();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${s.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${s.format}`,quantity:s.qty,unit:"szt",unitPrice:p.totalPrice/s.qty,isExpress:s.express,totalPrice:p.totalPrice,optionsHint:`${s.format}, ${s.qty} szt`,payload:s})}),u()}};async function Te(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function D(e,t,o){return{id:e,name:t,mount:async(i,r)=>{i.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let a=await Te(o);i.innerHTML=a,qe(i,r)}catch(a){i.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${a}</small>
          </div>
        `,console.error("Category load error:",a)}}}}function qe(e,t){e.querySelectorAll("button[data-action]").forEach(i=>{let r=i.getAttribute("data-action");r==="calculate"&&i.addEventListener("click",()=>{console.log("Calculate clicked")}),r==="add-to-basket"&&i.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var B={kolor:{formatowe:{"A0+":{price:26,dims:"914\xD71292 mm"},A0:{price:24,dims:"841\xD71189 mm"},A1:{price:12,dims:"594\xD7841 mm"},A2:{price:8.5,dims:"420\xD7594 mm"},A3:{price:5.3,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:21,width:914},A0:{price:20,width:841},A1:{price:14.5,width:594},A2:{price:13.9,width:420},A3:{price:12,width:297},"MB 1067":{price:30,width:1067}}},czarno_bialy:{formatowe:{"A0+":{price:12.5,dims:"914\xD71292 mm"},A0:{price:11,dims:"841\xD71189 mm"},A1:{price:6,dims:"594\xD7841 mm"},A2:{price:4,dims:"420\xD7594 mm"},A3:{price:2.5,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:10,width:914},A0:{price:9,width:841},A1:{price:5,width:594},A2:{price:4.5,width:420},A3:{price:3.5,width:297},"MB 1067":{price:12.5,width:1067}}}},ae={id:"druk-cad",name:"\u{1F4D0} Druk CAD",mount:(e,t)=>{e.innerHTML=`
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
    `;let o="formatowy",i=0,r=e.querySelector("#format"),a=e.querySelector("#color"),n=e.querySelector("#btn-formatowy"),l=e.querySelector("#btn-nieformatowy"),c=e.querySelector("#formatowy-section"),u=e.querySelector("#nieformatowy-section"),s=e.querySelector("#length"),p=e.querySelector("#addToBasket");function m(d){o=d,d==="formatowy"?(n.style.background="#667eea",n.style.color="white",n.style.borderColor="#667eea",l.style.background="#2a2a2a",l.style.color="#999",l.style.borderColor="#444",c.style.display="block",u.style.display="none",y()):(l.style.background="#667eea",l.style.color="white",l.style.borderColor="#667eea",n.style.background="#2a2a2a",n.style.color="#999",n.style.borderColor="#444",c.style.display="none",u.style.display="block",f())}n.addEventListener("click",()=>m("formatowy")),l.addEventListener("click",()=>m("nieformatowy"));function y(){let d=r.value,g=a.value,x=B[g].formatowe[d];if(!x){i=0;let S=e.querySelector("#formatowy-price");S&&(S.textContent="---");return}i=x.price,t.expressMode&&(i*=1.2);let w=e.querySelector("#format-display"),k=e.querySelector("#dims-display"),E=e.querySelector("#formatowy-price");w&&(w.textContent=d),k&&(k.textContent=x.dims),E&&(E.textContent=i.toFixed(2)+" z\u0142"),t.updateLastCalculated(i,"CAD "+d+" formatowy - "+(g==="kolor"?"kolor":"cz-b"))}function f(){let d=r.value,g=a.value,x=parseFloat(s.value)||1,w=B[g].metr_biezacy[d];if(!w)return;let k=w.price;i=k*x,t.expressMode&&(i*=1.2);let E=e.querySelector("#price-per-mb"),S=e.querySelector("#length-display"),$=e.querySelector("#nieformatowy-price"),R=e.querySelector("#calc-breakdown");E&&(E.textContent=k.toFixed(2)+" z\u0142/mb"),S&&(S.textContent=x.toFixed(3)+" m"),$&&($.textContent=i.toFixed(2)+" z\u0142"),R&&(R.textContent=k.toFixed(2)+" z\u0142/mb \xD7 "+x.toFixed(3)+" m = "+i.toFixed(2)+" z\u0142"),t.updateLastCalculated(i,"CAD "+d+" nieformatowy "+x.toFixed(3)+"m - "+(g==="kolor"?"kolor":"cz-b"))}r.addEventListener("change",()=>{o==="formatowy"?y():f()}),a.addEventListener("change",()=>{o==="formatowy"?y():f()}),s.addEventListener("input",f),p.addEventListener("click",()=>{if(i===0){alert("\u26A0\uFE0F B\u0142\u0105d obliczenia ceny!");return}let d=r.value,g=a.value==="kolor"?"kolor":"cz-b",x="";if(o==="formatowy")x=d+" formatowy, "+g;else{let w=parseFloat(s.value),k=B[a.value].metr_biezacy[d].price;x=d+" nieformatowy, "+w.toFixed(3)+" m, "+g+" ("+k.toFixed(2)+" z\u0142/mb)"}t.addToBasket({category:"Druk CAD",price:i,description:x}),alert("\u2705 Dodano: "+i.toFixed(2)+" z\u0142")}),m("formatowy")}};var re={czarnoBialy:{A4:[{min:1,max:5,price:.9},{min:6,max:20,price:.6},{min:21,max:100,price:.35},{min:101,max:500,price:.3},{min:501,max:999,price:.23},{min:1e3,max:4999,price:.19},{min:5e3,max:99999,price:.15}],A3:[{min:1,max:5,price:1.7},{min:6,max:20,price:1.1},{min:21,max:100,price:.7},{min:101,max:500,price:.6},{min:501,max:999,price:.45},{min:1e3,max:99999,price:.33}]},kolorowy:{A4:[{min:1,max:10,price:2.4},{min:11,max:40,price:2.2},{min:41,max:100,price:2},{min:101,max:250,price:1.8},{min:251,max:500,price:1.6},{min:501,max:999,price:1.4},{min:1e3,max:99999,price:1.1}],A3:[{min:1,max:10,price:4.8},{min:11,max:40,price:4.2},{min:41,max:100,price:3.8},{min:101,max:250,price:3},{min:251,max:500,price:2.5},{min:501,max:999,price:1.9},{min:1e3,max:99999,price:1.6}]}};function Le(e,t,o){let i=re[o][e];for(let r of i)if(t>=r.min&&t<=r.max)return r.price;return i[i.length-1].price}var ne={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3 + skan",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,i=0,r=e.querySelector("#format"),a=e.querySelector("#quantity"),n=e.querySelector("#color"),l=e.querySelector("#calculate"),c=e.querySelector("#addToBasket"),u=e.querySelector("#tiers-list"),s=e.querySelector("#price-per-page"),p=e.querySelector("#total-price"),m=e.querySelector("#price-breakdown");function y(){let f=r.value,d=n.value,g=re[d][f];u&&(u.innerHTML=g.map(x=>`<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${x.max>=99999?`${x.min}+ str`:`${x.min}-${x.max} str`}</span>
            <span style="color: #667eea;">${x.price.toFixed(2)} z\u0142/str</span>
          </div>`).join(""))}r.addEventListener("change",y),n.addEventListener("change",y),y(),l?.addEventListener("click",()=>{let f=r.value,d=parseInt(a.value)||1,g=n.value;if(i=Le(f,d,g),o=i*d,t.expressMode&&(o*=1.2),s&&(s.textContent=`${i.toFixed(2)} z\u0142/str`),p&&(p.textContent=`${o.toFixed(2)} z\u0142`),m){let x=g==="czarnoBialy"?"Czarno-bia\u0142y":"Kolorowy";m.textContent=`${x}, ${f}, ${d} str \xD7 ${i.toFixed(2)} z\u0142 = ${o.toFixed(2)} z\u0142`}t.updateLastCalculated(o,`Druk ${f} ${g==="czarnoBialy"?"CZ-B":"KOLOR"} - ${d} str`)}),c?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let f=r.value,d=a.value,g=n.value==="czarnoBialy"?"CZ-B":"KOLOR";t.addToBasket({category:"Druk A4/A3",price:o,description:`${f}, ${d} str, ${g} (${i.toFixed(2)} z\u0142/str)`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var le=[_,O,V,N,W,U,Z,G,te,ie,ae,ne,D("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),D("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),D("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var h=new q;function C(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),o=document.getElementById("json-preview");if(!e||!t||!o)return;let i=h.getItems();if(i.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=i.map((a,n)=>`
      <div class="basket-item" style="padding: 12px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: white; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${a.category}: ${a.name}
            </strong>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0 0;">
              ${a.optionsHint} (${a.quantity} ${a.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${b(a.totalPrice)}</strong>
            <button onclick="window.removeItem(${n})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let r=h.getGrandTotal();t.innerText=b(r)}o.innerText=JSON.stringify(i.map(r=>r.payload),null,2)}window.removeItem=e=>{h.removeItem(e),C()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),o=document.getElementById("categorySearch"),i=document.getElementById("tryb-express");if(!e||!t||!i||!o)return;let r=()=>({cart:{addItem:n=>{h.addItem(n),C()}},addToBasket:n=>{h.addItem({id:`item-${Date.now()}`,category:n.category,name:n.description||"Produkt",quantity:1,unit:"szt.",unitPrice:n.price,isExpress:i.checked,totalPrice:n.price,optionsHint:n.description||"",payload:n}),C()},expressMode:i.checked,updateLastCalculated:(n,l)=>{let c=document.getElementById("last-calculated"),u=document.getElementById("currentHint");c&&(c.innerText=b(n)),u&&(u.innerText=l?`(${l})`:"")}}),a=new T(e,r);a.setCategories(I),le.forEach(n=>{a.addRoute(n)}),I.forEach(n=>{let l=document.createElement("option");l.value=n.id,l.innerText=`${n.icon} ${n.name}`,n.implemented||(l.disabled=!0,l.innerText+=" (wkr\xF3tce)"),t.appendChild(l)}),t.addEventListener("change",()=>{let n=t.value;n?window.location.hash=`#/${n}`:window.location.hash="#/"}),o.addEventListener("input",()=>{let n=o.value.toLowerCase();Array.from(t.options).forEach((c,u)=>{if(u===0)return;let s=c.text.toLowerCase();c.hidden=!s.includes(n)})}),o.addEventListener("keydown",n=>{if(n.key==="Enter"){let l=o.value.toLowerCase(),c=Array.from(t.options).find((u,s)=>s>0&&!u.hidden&&!u.disabled);c&&(t.value=c.value,window.location.hash=`#/${c.value}`,o.value="")}}),window.addEventListener("hashchange",()=>{let l=(window.location.hash||"#/").slice(2);t.value=l}),i.addEventListener("change",()=>{let n=window.location.hash;window.location.hash="",window.location.hash=n}),document.getElementById("clear-basket")?.addEventListener("click",()=>{h.clear(),C()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let n={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(h.isEmpty()){alert("Lista jest pusta!");return}F(h.getItems(),n)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let n=h.getItems(),l=JSON.stringify(n.map(c=>c.payload),null,2);navigator.clipboard.writeText(l).then(()=>{alert("JSON skopiowany do schowka!")})}),C(),a.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
