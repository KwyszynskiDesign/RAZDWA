var xe=Object.defineProperty;var ge=(e,t)=>{for(var o in t)xe(e,o,{get:t[o],enumerable:!0})};var q=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,o){this.container=t,this.getCtx=o,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let o=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let r=this.routes.get(o);if(r){this.currentView=r;let n=document.createElement("button");n.className="back-button",n.textContent="Wszystkie kategorie",n.onclick=()=>{window.location.hash="#/"},this.container.appendChild(n);let a=document.createElement("div");a.className="category-content",a.id="current-category",this.container.appendChild(a),r.mount(a,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function b(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var M=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,o)=>t+o.totalPrice,0)}isEmpty(){return this.items.length===0}};function F(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let o=e.map(c=>({Kategoria:c.category,Nazwa:c.name,Ilo\u015B\u0107:c.quantity,Jednostka:c.unit,"Cena jedn.":c.unitPrice,"Express (+20%)":c.isExpress?"TAK":"NIE","Cena ca\u0142kowita":c.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),r=XLSX.utils.json_to_sheet(o),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,r,"Zam\xF3wienie");let a=new Date().toISOString().slice(0,10),l=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${a}.xlsx`;XLSX.writeFile(n,l)}var I=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var O={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=e.querySelector("#addSampleBtn"),r=e.querySelector("#sampleQty");o?.addEventListener("click",()=>{let n=parseInt(r.value)||1,a=n*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:n},price:a}),alert(`Dodano do koszyka: ${n} szt. za ${b(a)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function be(e,t){let o=[...e].sort((a,l)=>a.min-l.min),r=o.find(a=>t>=a.min&&(a.max===null||t<=a.max));if(r)return r;let n=o.find(a=>a.min>=t);return n||o[o.length-1]}function ke(e,t){if(!t)return e;let o=t.find(r=>r.type==="minimum"&&r.unit==="m2");return o&&e<o.value?o.value:e}function k(e,t,o=[]){let r=ke(t,e.rules),n=be(e.tiers,r),a=0;e.pricing==="per_unit"?a=r*n.price:a=n.price;let l=0,c=[];if(e.modifiers)for(let i of o){let s=e.modifiers.find(y=>y.id===i);s&&(c.push(s.name),s.type==="percent"?l+=a*s.value:s.type==="fixed_per_unit"?l+=s.value*r:l+=s.value)}let p=a+l,m=e.rules?.find(i=>i.type==="minimum"&&i.unit==="pln");return m&&p<m.value&&(p=m.value),{basePrice:a,effectiveQuantity:r,tierPrice:n.price,modifiersTotal:l,totalPrice:parseFloat(p.toFixed(2)),appliedModifiers:c}}var j={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:20}]};var V={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let o=j;e.innerHTML=`
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
    `;let r=e.querySelector("#plakatyQty"),n=e.querySelector("#plakatyExpress"),a=e.querySelector("#plakatyResult"),l=e.querySelector("#addPlakatyBtn");function c(){let p=parseFloat(r.value)||0,m=n.checked?["EXPRESS"]:[];try{let i=k(p,o,m);a.textContent=b(i.totalPrice)}catch{a.textContent="B\u0142\u0105d"}}r.addEventListener("input",c),n.addEventListener("change",c),l.addEventListener("click",()=>{let p=parseFloat(r.value)||0,m=n.checked?["EXPRESS"]:[],i=k(p,o,m);t.cart.addItem({categoryId:o.id,categoryName:o.title,details:{qty:`${p} m2`,express:n.checked},price:i.totalPrice})}),c()}};var P=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function he(e,t){let o=P[0];for(let r of P)if(e>=r.qty)o=r;else break;return t?o.single:o.double}var U={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,r=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),a=e.querySelector("#total-price"),l=e.querySelector("#price-breakdown");r?.addEventListener("click",()=>{let c=e.querySelector("#format").value,p=parseInt(e.querySelector("#quantity").value)||1,m=e.querySelector("#sides").value,i=e.querySelector("#paper").value,s=he(p,m==="single");if(o=s*(i==="satin"?1.12:1),a&&(a.textContent=o.toFixed(2)+" z\u0142"),l){let u=P[0];for(let g of P)if(p>=g.qty)u=g;else break;l.textContent="Podstawa: "+s.toFixed(2)+" z\u0142 za "+p+" szt (przedzia\u0142: "+u.qty+"+ szt)"}t.updateLastCalculated(o,"Vouchery "+c+" "+(m==="single"?"jednostronne":"dwustronne")+" - "+p+" szt")}),n?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let c=e.querySelector("#format").value,p=e.querySelector("#quantity").value,m=e.querySelector("#sides").value,i=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:o,description:c+" "+(m==="single"?"jednostronne":"dwustronne")+", "+p+" szt, "+(i==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+o.toFixed(2)+" z\u0142")})}};var E={name:"DYPLOMY - druk cyfrowy",modifiers:{satin:.12,express:.2,bulkDiscount:.12,bulkDiscountThreshold:6},formats:{DL:{name:"DL (99x210mm)",single:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120},double:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120}}}};function N(e){let{qty:t,sides:o,isSatin:r,express:n}=e,c=E.formats.DL[o===1?"single":"double"],p=Object.keys(c).map(Number).sort((d,f)=>d-f),m=p[0];for(let d of p)t>=d&&(m=d);let i=c[m.toString()],s=[];t>=E.modifiers.bulkDiscountThreshold&&s.push({id:"bulk-discount",name:`Rabat -${E.modifiers.bulkDiscount*100}% (od ${E.modifiers.bulkDiscountThreshold} szt)`,type:"percentage",value:-E.modifiers.bulkDiscount}),r&&s.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:E.modifiers.satin}),n&&s.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:E.modifiers.express});let y=0,u=[];for(let d of s)(d.type==="percent"||d.type==="percentage")&&(y+=i*d.value,u.push(d.name));let g=i+y;return{basePrice:i,effectiveQuantity:t,tierPrice:i/t,modifiersTotal:y,totalPrice:Math.round(g*100)/100,appliedModifiers:u}}var W={id:"dyplomy",name:"Dyplomy",async mount(e,t){let o=await fetch("categories/dyplomy.html");e.innerHTML=await o.text();let r=e.querySelector("#dypSides"),n=e.querySelector("#dypQty"),a=e.querySelector("#dypSatin"),l=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),p=e.querySelector("#dypResult"),m=()=>{let i={qty:parseInt(n.value)||1,sides:parseInt(r.value)||1,isSatin:a.checked,express:t.expressMode},s=N(i);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=b(s.totalPrice/i.qty),e.querySelector("#resTotalPrice").textContent=b(s.totalPrice),e.querySelector("#resDiscountHint").style.display=s.appliedModifiers.includes("bulk-discount")?"block":"none",e.querySelector("#resExpressHint").style.display=i.express?"block":"none",e.querySelector("#resSatinHint").style.display=i.isSatin?"block":"none",t.updateLastCalculated(s.totalPrice,"Dyplomy"),{options:i,result:s}};l.addEventListener("click",()=>m()),c.addEventListener("click",()=>{let{options:i,result:s}=m();t.cart.addItem({id:`dyp-${Date.now()}`,category:"Dyplomy",name:`Dyplomy DL ${i.sides===1?"1-str":"2-str"}`,quantity:i.qty,unit:"szt",unitPrice:s.totalPrice/i.qty,isExpress:i.express,totalPrice:s.totalPrice,optionsHint:`${i.qty} szt, ${i.isSatin?"Satyna":"Kreda"}`,payload:i})}),m()}};function K(e,t){let o=Object.keys(e||{}).map(Number).filter(Number.isFinite).sort((n,a)=>n-a);if(!o.length)return null;let r=o.find(n=>t<=n);return r??null}var z={cyfrowe:{standardPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290},lam:{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345}}},softtouchPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390}}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:{50:280,100:320,200:395,250:479,400:655,500:778}},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:{50:450,100:550,200:650,250:720,400:850,500:905}}}}}};function X(e){let t;e.family==="deluxe"?t=z.cyfrowe.deluxe.options[e.deluxeOpt].prices:t=(e.finish==="softtouch"?z.cyfrowe.softtouchPrices:z.cyfrowe.standardPrices)[e.size][e.lam];let o=K(t,e.qty);if(o==null)throw new Error("Brak progu cenowego dla takiej ilo\u015Bci.");let r=t[o];return{qtyBilled:o,total:r}}function Q(e){let t=e.family||"standard",o=e.format||"85x55",r=e.folia==="none"?"noLam":"lam",n=e.finish||"mat",a=X({family:t,size:o,lam:r,finish:n,deluxeOpt:e.deluxeOpt,qty:e.qty}),l=a.total;return e.express&&(l=a.total*1.2),{totalPrice:parseFloat(l.toFixed(2)),basePrice:a.total,effectiveQuantity:e.qty,tierPrice:a.total/a.qtyBilled,modifiersTotal:e.express?a.total*.2:0,appliedModifiers:e.express?["TRYB EXPRESS"]:[],qtyBilled:a.qtyBilled}}var J={id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",mount(e,t){e.innerHTML=`
      <div class="category-view">
        <div class="view-header">
            <h2>Wizyt\xF3wki - druk cyfrowy</h2>
        </div>

        <div class="calculator-form card">
            <div class="form-group">
                <label for="w-family">Rodzaj:</label>
                <select id="w-family" class="form-control">
                    <option value="standard">Standard</option>
                    <option value="deluxe">DELUXE</option>
                </select>
            </div>

            <div id="standard-options">
                <div class="form-group">
                    <label for="w-finish">Wyko\u0144czenie:</label>
                    <select id="w-finish" class="form-control">
                        <option value="mat">Mat</option>
                        <option value="blysk">B\u0142ysk</option>
                        <option value="softtouch">SoftTouch</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="w-size">Rozmiar:</label>
                    <select id="w-size" class="form-control">
                        <option value="85x55">85x55 mm</option>
                        <option value="90x50">90x50 mm</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="w-lam">Foliowanie:</label>
                    <select id="w-lam" class="form-control">
                        <option value="noLam">Bez foliowania</option>
                        <option value="lam">Foliowane</option>
                    </select>
                </div>
            </div>

            <div id="deluxe-options" style="display: none;">
                <div class="form-group">
                    <label for="w-deluxe-opt">Opcja DELUXE:</label>
                    <select id="w-deluxe-opt" class="form-control">
                        <option value="uv3d_softtouch">UV 3D + SoftTouch</option>
                        <option value="uv3d_gold_softtouch">UV 3D + Z\u0142ocenie + SoftTouch</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="w-qty">Ilo\u015B\u0107 (szt):</label>
                <input type="number" id="w-qty" class="form-control" value="100" min="1">
                <div class="hint">Zaokr\u0105glamy w g\xF3r\u0119 do najbli\u017Cszego progu.</div>
            </div>

            <div class="form-actions">
                <button id="w-calculate" class="btn btn-primary">Oblicz</button>
                <button id="w-add-to-cart" class="btn btn-success" disabled>Dodaj do koszyka</button>
            </div>
        </div>

        <div id="w-result-display" class="result-display card" style="display: none;">
            <div class="result-row">
                <span>Cena brutto:</span>
                <span id="w-total-price" class="price-value">-</span>
            </div>
            <div id="w-billed-qty-hint" class="hint"></div>
            <div id="w-express-hint" class="express-hint" style="display: none;">
                W tym dop\u0142ata EXPRESS +20%
            </div>
        </div>
      </div>
    `,this.initLogic(e,t)},initLogic(e,t){let o=e.querySelector("#w-family"),r=e.querySelector("#standard-options"),n=e.querySelector("#deluxe-options"),a=e.querySelector("#w-finish"),l=e.querySelector("#w-size"),c=e.querySelector("#w-lam"),p=e.querySelector("#w-deluxe-opt"),m=e.querySelector("#w-qty"),i=e.querySelector("#w-calculate"),s=e.querySelector("#w-add-to-cart"),y=e.querySelector("#w-result-display"),u=e.querySelector("#w-total-price"),g=e.querySelector("#w-billed-qty-hint"),d=e.querySelector("#w-express-hint");o.onchange=()=>{let w=o.value==="deluxe";r.style.display=w?"none":"block",n.style.display=w?"block":"none"};let f=null,x=null;i.onclick=()=>{x={family:o.value,finish:a.value,format:l.value,folia:c.value==="lam"?"matt_gloss":"none",deluxeOpt:p.value,qty:parseInt(m.value),express:t.expressMode};try{let w=Q(x);f=w,u.innerText=b(w.totalPrice),g.innerText=`Rozliczono za: ${w.qtyBilled} szt.`,d.style.display=t.expressMode?"block":"none",y.style.display="block",s.disabled=!1,t.updateLastCalculated(w.totalPrice,"Wizyt\xF3wki")}catch(w){alert("B\u0142\u0105d: "+w.message)}},s.onclick=()=>{if(f&&x){let w=x.family==="deluxe"?"Wizyt\xF3wki DELUXE":"Wizyt\xF3wki Standard",v=x.express?", EXPRESS":"";t.cart.addItem({id:`wizytowki-${Date.now()}`,category:"Wizyt\xF3wki",name:w,quantity:f.qtyBilled,unit:"szt",unitPrice:f.totalPrice/f.qtyBilled,isExpress:x.express,totalPrice:f.totalPrice,optionsHint:`${x.qty} szt (rozliczono ${f.qtyBilled})${v}`,payload:f})}}}};var A={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function Z(e){let{format:t,qty:o,sides:r,isFolded:n,isSatin:a,express:l}=e,c=A.formats[t];if(!c)throw new Error(`Invalid format: ${t}`);let p=r===1?"single":"double",m=n?"folded":"normal",i=c[p][m],s=Object.keys(i).map(Number).sort((w,v)=>w-v),y=s[0];for(let w of s)o>=w&&(y=w);let u=i[y.toString()],g=[];a&&g.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:A.modifiers.satin}),l&&g.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:A.modifiers.express});let d=0,f=[];for(let w of g)(w.type==="percent"||w.type==="percentage")&&(d+=u*w.value,f.push(w.name));let x=u+d;return{basePrice:u,effectiveQuantity:o,tierPrice:u/o,modifiersTotal:d,totalPrice:Math.round(x*100)/100,appliedModifiers:f}}var Y={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let o=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await o.text();let r=e.querySelector("#zapFormat"),n=e.querySelector("#zapSides"),a=e.querySelector("#zapFolded"),l=e.querySelector("#zapQty"),c=e.querySelector("#zapSatin"),p=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),i=e.querySelector("#zapResult"),s=()=>{let y={format:r.value,qty:parseInt(l.value)||10,sides:parseInt(n.value)||1,isFolded:a.checked,isSatin:c.checked,express:t.expressMode},u=Z(y);return i.style.display="block",e.querySelector("#resUnitPrice").textContent=b(u.totalPrice/y.qty),e.querySelector("#resTotalPrice").textContent=b(u.totalPrice),e.querySelector("#resExpressHint").style.display=y.express?"block":"none",e.querySelector("#resSatinHint").style.display=y.isSatin?"block":"none",t.updateLastCalculated(u.totalPrice,"Zaproszenia"),{options:y,result:u}};p.addEventListener("click",()=>s()),m.addEventListener("click",()=>{let{options:y,result:u}=s();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${y.format} ${y.sides===1?"1-str":"2-str"}${y.isFolded?" sk\u0142adane":""}`,quantity:y.qty,unit:"szt",unitPrice:u.totalPrice/y.qty,isExpress:y.express,totalPrice:u.totalPrice,optionsHint:`${y.qty} szt, ${y.isSatin?"Satyna":"Kreda"}`,payload:y})}),s()}};var G={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function Le(e){let t=G.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function ee(e){let t=Le(e.format),o=[];return e.express&&o.push("express"),k(t,e.qty,o)}var te={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let o=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#u-format"),r=e.querySelector("#u-qty"),n=e.querySelector("#u-calculate"),a=e.querySelector("#u-add-to-cart"),l=e.querySelector("#u-result-display"),c=e.querySelector("#u-total-price"),p=e.querySelector("#u-express-hint"),m=null,i=null;n.onclick=()=>{i={format:o.value,qty:parseInt(r.value),express:t.expressMode};try{let s=ee(i);m=s,c.innerText=b(s.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),l.style.display="block",a.disabled=!1,t.updateLastCalculated(s.totalPrice,"Ulotki")}catch(s){alert("B\u0142\u0105d: "+s.message)}},a.onclick=()=>{if(m&&i){let s=i.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:m.totalPrice/i.qty,isExpress:i.express,totalPrice:m.totalPrice,optionsHint:`${i.qty} szt, Dwustronne${s}`,payload:m})}}}};var oe={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function qe(e){let t=oe.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function re(e){let t=qe(e.format),o=[];return e.express&&o.push("express"),k(t,e.qty,o)}var ie={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let o=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#uj-format"),r=e.querySelector("#uj-qty"),n=e.querySelector("#uj-calculate"),a=e.querySelector("#uj-add-to-cart"),l=e.querySelector("#uj-result-display"),c=e.querySelector("#uj-total-price"),p=e.querySelector("#uj-express-hint"),m=null,i=null;n.onclick=()=>{i={format:o.value,qty:parseInt(r.value),express:t.expressMode};try{let s=re(i);m=s,c.innerText=b(s.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),l.style.display="block",a.disabled=!1,t.updateLastCalculated(s.totalPrice,"Ulotki")}catch(s){alert("B\u0142\u0105d: "+s.message)}},a.onclick=()=>{if(m&&i){let s=i.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:m.totalPrice/i.qty,isExpress:i.express,totalPrice:m.totalPrice,optionsHint:`${i.qty} szt, Jednostronne${s}`,payload:m})}}}};var ae={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ne(e){let t=ae,o=t.materials.find(a=>a.id===e.material);if(!o)throw new Error(`Unknown material: ${e.material}`);let r={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:o.tiers,modifiers:t.modifiers},n=[];return e.oczkowanie&&n.push("oczkowanie"),e.express&&n.push("express"),k(r,e.areaM2,n)}var le={id:"banner",name:"Bannery",async mount(e,t){try{let o=await fetch("categories/banner.html");if(!o.ok)throw new Error("Failed to load template");e.innerHTML=await o.text(),this.initLogic(e,t)}catch(o){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${o}</div>`}},initLogic(e,t){let o=e.querySelector("#b-material"),r=e.querySelector("#b-area"),n=e.querySelector("#b-oczkowanie"),a=e.querySelector("#b-calculate"),l=e.querySelector("#b-add-to-cart"),c=e.querySelector("#b-result-display"),p=e.querySelector("#b-unit-price"),m=e.querySelector("#b-total-price"),i=e.querySelector("#b-express-hint"),s=null,y=null;a.onclick=()=>{y={material:o.value,areaM2:parseFloat(r.value),oczkowanie:n.checked,express:t.expressMode};try{let u=ne(y);s=u,p.innerText=b(u.tierPrice),m.innerText=b(u.totalPrice),i&&(i.style.display=t.expressMode?"block":"none"),c.style.display="block",l.disabled=!1,t.updateLastCalculated(u.totalPrice,"Banner")}catch(u){alert("B\u0142\u0105d: "+u.message)}},l.onclick=()=>{if(s&&y){let u=o.options[o.selectedIndex].text,g=[`${y.areaM2} m2`,y.oczkowanie?"z oczkowaniem":"bez oczkowania",y.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:u,quantity:y.areaM2,unit:"m2",unitPrice:s.tierPrice,isExpress:y.express,totalPrice:s.totalPrice,optionsHint:g,payload:s})}}}};var L={};ge(L,{category:()=>Pe,default:()=>He,groups:()=>ze,modifiers:()=>Ae});var Pe="Wlepki / Naklejki",ze=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Ae=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],He={category:Pe,groups:ze,modifiers:Ae};function se(e){let t=L,o=t.groups.find(a=>a.id===e.groupId);if(!o)throw new Error(`Unknown group: ${e.groupId}`);let r={id:"wlepki",title:o.title,unit:o.unit,pricing:o.pricing||"per_unit",tiers:o.tiers,modifiers:t.modifiers,rules:o.rules||[{type:"minimum",unit:"m2",value:1}]},n=[...e.modifiers];return e.express&&n.push("express"),k(r,e.area,n)}var ce={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let o=L;try{let u=await fetch("categories/wlepki-naklejki.html");if(!u.ok)throw new Error("Failed to load template");e.innerHTML=await u.text()}catch(u){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${u}</div>`;return}let r=e.querySelector("#wlepki-group"),n=e.querySelector("#wlepki-area"),a=e.querySelector("#btn-calculate"),l=e.querySelector("#btn-add-to-cart"),c=e.querySelector("#wlepki-result"),p=e.querySelector("#unit-price"),m=e.querySelector("#total-price"),i=null,s=null,y=()=>{let u=e.querySelectorAll(".wlepki-mod:checked"),g=Array.from(u).map(d=>d.value);s={groupId:r.value,area:parseFloat(n.value)||0,express:t.expressMode,modifiers:g};try{let d=se(s);i=d,p.textContent=b(d.tierPrice),m.textContent=b(d.totalPrice),c.style.display="block",l.disabled=!1,t.updateLastCalculated(d.totalPrice,"Wlepki")}catch(d){alert("B\u0142\u0105d: "+d.message)}};a.addEventListener("click",y),l.addEventListener("click",()=>{if(!i||!s)return;let u=o.groups.find(d=>d.id===s.groupId),g=s.modifiers.map(d=>{let f=o.modifiers.find(x=>x.id===d);return f?f.name:d});s.express&&g.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:u?.title||"Wlepki",quantity:s.area,unit:"m2",unitPrice:i.tierPrice,isExpress:!!s.express,totalPrice:i.totalPrice,optionsHint:g.join(", ")||"Standard",payload:i})})}};var D={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function me(e){let t=D.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let o;if(e.isReplacement){let a=t.width*t.height*D.replacement.print_per_m2+D.replacement.labor;o={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:a}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else o={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let r=[];return e.express&&r.push("express"),k(o,e.qty,r)}var pe={id:"roll-up",name:"Roll-up",async mount(e,t){let o=await fetch("categories/roll-up.html");e.innerHTML=await o.text();let r=e.querySelector("#rollUpType"),n=e.querySelector("#rollUpFormat"),a=e.querySelector("#rollUpQty"),l=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),p=e.querySelector("#rollUpResult"),m=()=>{let i={format:n.value,qty:parseInt(a.value)||1,isReplacement:r.value==="replacement",express:t.expressMode},s=me(i);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=b(s.totalPrice/i.qty),e.querySelector("#resTotalPrice").textContent=b(s.totalPrice),e.querySelector("#resExpressHint").style.display=i.express?"block":"none",t.updateLastCalculated(s.totalPrice,"Roll-up"),{options:i,result:s}};l.addEventListener("click",()=>m()),c.addEventListener("click",()=>{let{options:i,result:s}=m();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${i.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:s.totalPrice/i.qty,isExpress:i.express,totalPrice:s.totalPrice,optionsHint:`${i.format}, ${i.qty} szt`,payload:i})}),m()}};async function Be(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function B(e,t,o){return{id:e,name:t,mount:async(r,n)=>{r.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let a=await Be(o);r.innerHTML=a,Ie(r,n)}catch(a){r.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${a}</small>
          </div>
        `,console.error("Category load error:",a)}}}}function Ie(e,t){e.querySelectorAll("button[data-action]").forEach(r=>{let n=r.getAttribute("data-action");n==="calculate"&&r.addEventListener("click",()=>{console.log("Calculate clicked")}),n==="add-to-basket"&&r.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var R={kolor:{formatowe:{"A0+":{price:26,dims:"914\xD71292 mm"},A0:{price:24,dims:"841\xD71189 mm"},A1:{price:12,dims:"594\xD7841 mm"},A2:{price:8.5,dims:"420\xD7594 mm"},A3:{price:5.3,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:21,width:914},A0:{price:20,width:841},A1:{price:14.5,width:594},A2:{price:13.9,width:420},A3:{price:12,width:297},"MB 1067":{price:30,width:1067}}},czarno_bialy:{formatowe:{"A0+":{price:13,dims:"914\xD71292 mm"},A0:{price:11,dims:"841\xD71189 mm"},A1:{price:6,dims:"594\xD7841 mm"},A2:{price:4,dims:"420\xD7594 mm"},A3:{price:2.5,dims:"297\xD7420 mm"}},metr_biezacy:{"A0+":{price:10,width:914},A0:{price:9,width:841},A1:{price:5,width:594},A2:{price:4.5,width:420},A3:{price:3.5,width:297},"MB 1067":{price:12.5,width:1067}}}},de={id:"druk-cad",name:"\u{1F4D0} Druk CAD",mount:(e,t)=>{e.innerHTML=`
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
    `;let o="formatowy",r=0,n=e.querySelector("#format"),a=e.querySelector("#color"),l=e.querySelector("#btn-formatowy"),c=e.querySelector("#btn-nieformatowy"),p=e.querySelector("#formatowy-section"),m=e.querySelector("#nieformatowy-section"),i=e.querySelector("#length"),s=e.querySelector("#addToBasket");function y(d){o=d,d==="formatowy"?(l.style.background="#667eea",l.style.color="white",l.style.borderColor="#667eea",c.style.background="#2a2a2a",c.style.color="#999",c.style.borderColor="#444",p.style.display="block",m.style.display="none",u()):(c.style.background="#667eea",c.style.color="white",c.style.borderColor="#667eea",l.style.background="#2a2a2a",l.style.color="#999",l.style.borderColor="#444",p.style.display="none",m.style.display="block",g())}l.addEventListener("click",()=>y("formatowy")),c.addEventListener("click",()=>y("nieformatowy"));function u(){let d=n.value,f=a.value,x=R[f].formatowe[d];if(!x){r=0;let T=e.querySelector("#formatowy-price");T&&(T.textContent="---");return}r=x.price;let w=e.querySelector("#format-display"),v=e.querySelector("#dims-display"),S=e.querySelector("#formatowy-price");w&&(w.textContent=d),v&&(v.textContent=x.dims),S&&(S.textContent=r.toFixed(2)+" z\u0142"),t.updateLastCalculated(r,"CAD "+d+" formatowy - "+(f==="kolor"?"kolor":"cz-b"))}function g(){let d=n.value,f=a.value,x=parseFloat(i.value)||1,w=R[f].metr_biezacy[d];if(!w)return;let v=w.price;r=v*x;let S=e.querySelector("#price-per-mb"),T=e.querySelector("#length-display"),$=e.querySelector("#nieformatowy-price"),_=e.querySelector("#calc-breakdown");S&&(S.textContent=v.toFixed(2)+" z\u0142/mb"),T&&(T.textContent=x.toFixed(3)+" m"),$&&($.textContent=r.toFixed(2)+" z\u0142"),_&&(_.textContent=v.toFixed(2)+" z\u0142/mb \xD7 "+x.toFixed(3)+" m = "+r.toFixed(2)+" z\u0142"),t.updateLastCalculated(r,"CAD "+d+" nieformatowy "+x.toFixed(3)+"m - "+(f==="kolor"?"kolor":"cz-b"))}n.addEventListener("change",()=>{o==="formatowy"?u():g()}),a.addEventListener("change",()=>{o==="formatowy"?u():g()}),i.addEventListener("input",g),s.addEventListener("click",()=>{if(r===0){alert("\u26A0\uFE0F B\u0142\u0105d obliczenia ceny!");return}let d=n.value,f=a.value==="kolor"?"kolor":"cz-b",x="";if(o==="formatowy")x=d+" formatowy, "+f;else{let w=parseFloat(i.value),v=R[a.value].metr_biezacy[d].price;x=d+" nieformatowy, "+w.toFixed(3)+" m, "+f+" ("+v.toFixed(2)+" z\u0142/mb)"}t.addToBasket({category:"Druk CAD",price:r,description:x}),alert("\u2705 Dodano: "+r.toFixed(2)+" z\u0142")}),y("formatowy")}};var ue={czarnoBialy:{A4:[{min:1,max:5,price:.9},{min:6,max:20,price:.6},{min:21,max:100,price:.35},{min:101,max:500,price:.3},{min:501,max:999,price:.23},{min:1e3,max:4999,price:.19},{min:5e3,max:99999,price:.15}],A3:[{min:1,max:5,price:1.7},{min:6,max:20,price:1.1},{min:21,max:100,price:.7},{min:101,max:500,price:.6},{min:501,max:999,price:.45},{min:1e3,max:99999,price:.33}]},kolorowy:{A4:[{min:1,max:10,price:2.4},{min:11,max:40,price:2.2},{min:41,max:100,price:2},{min:101,max:250,price:1.8},{min:251,max:500,price:1.6},{min:501,max:999,price:1.4},{min:1e3,max:99999,price:1.1}],A3:[{min:1,max:10,price:4.8},{min:11,max:40,price:4.2},{min:41,max:100,price:3.8},{min:101,max:250,price:3},{min:251,max:500,price:2.5},{min:501,max:999,price:1.9},{min:1e3,max:99999,price:1.6}]}};function Re(e,t,o){let r=ue[o][e];for(let n of r)if(t>=n.min&&t<=n.max)return n.price;return r[r.length-1].price}var ye={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3 + skan",mount:(e,t)=>{e.innerHTML=`
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
    `;let o=0,r=0,n=e.querySelector("#format"),a=e.querySelector("#quantity"),l=e.querySelector("#color"),c=e.querySelector("#calculate"),p=e.querySelector("#addToBasket"),m=e.querySelector("#tiers-list"),i=e.querySelector("#price-per-page"),s=e.querySelector("#total-price"),y=e.querySelector("#price-breakdown");function u(){let g=n.value,d=l.value,f=ue[d][g];m&&(m.innerHTML=f.map(x=>`<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${x.max>=99999?`${x.min}+ str`:`${x.min}-${x.max} str`}</span>
            <span style="color: #667eea;">${x.price.toFixed(2)} z\u0142/str</span>
          </div>`).join(""))}n.addEventListener("change",u),l.addEventListener("change",u),u(),c?.addEventListener("click",()=>{let g=n.value,d=parseInt(a.value)||1,f=l.value;if(r=Re(g,d,f),o=r*d,i&&(i.textContent=`${r.toFixed(2)} z\u0142/str`),s&&(s.textContent=`${o.toFixed(2)} z\u0142`),y){let x=f==="czarnoBialy"?"Czarno-bia\u0142y":"Kolorowy";y.textContent=`${x}, ${g}, ${d} str \xD7 ${r.toFixed(2)} z\u0142 = ${o.toFixed(2)} z\u0142`}t.updateLastCalculated(o,`Druk ${g} ${f==="czarnoBialy"?"CZ-B":"KOLOR"} - ${d} str`)}),p?.addEventListener("click",()=>{if(o===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let g=n.value,d=a.value,f=l.value==="czarnoBialy"?"CZ-B":"KOLOR";t.addToBasket({category:"Druk A4/A3",price:o,description:`${g}, ${d} str, ${f} (${r.toFixed(2)} z\u0142/str)`}),alert(`\u2705 Dodano: ${o.toFixed(2)} z\u0142`)})}};var fe=[O,V,U,W,J,Y,te,ie,le,ce,pe,de,ye,B("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),B("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),B("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var h=new M;function C(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),o=document.getElementById("json-preview");if(!e||!t||!o)return;let r=h.getItems();if(r.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=r.map((a,l)=>`
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
            <button onclick="window.removeItem(${l})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let n=h.getGrandTotal();t.innerText=b(n)}o.innerText=JSON.stringify(r.map(n=>n.payload),null,2)}window.removeItem=e=>{h.removeItem(e),C()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),o=document.getElementById("categorySearch"),r=document.getElementById("tryb-express");if(!e||!t||!r||!o)return;let n=()=>({cart:{addItem:l=>{h.addItem(l),C()}},addToBasket:l=>{h.addItem({id:`item-${Date.now()}`,category:l.category,name:l.description||"Produkt",quantity:1,unit:"szt.",unitPrice:l.price,isExpress:r.checked,totalPrice:l.price,optionsHint:l.description||"",payload:l}),C()},expressMode:r.checked,updateLastCalculated:(l,c)=>{let p=document.getElementById("last-calculated"),m=document.getElementById("currentHint");p&&(p.innerText=b(l)),m&&(m.innerText=c?`(${c})`:"")}}),a=new q(e,n);a.setCategories(I),fe.forEach(l=>{a.addRoute(l)}),I.forEach(l=>{let c=document.createElement("option");c.value=l.id,c.innerText=`${l.icon} ${l.name}`,l.implemented||(c.disabled=!0,c.innerText+=" (wkr\xF3tce)"),t.appendChild(c)}),t.addEventListener("change",()=>{let l=t.value;l?window.location.hash=`#/${l}`:window.location.hash="#/"}),o.addEventListener("input",()=>{let l=o.value.toLowerCase();Array.from(t.options).forEach((p,m)=>{if(m===0)return;let i=p.text.toLowerCase();p.hidden=!i.includes(l)})}),o.addEventListener("keydown",l=>{if(l.key==="Enter"){let c=o.value.toLowerCase(),p=Array.from(t.options).find((m,i)=>i>0&&!m.hidden&&!m.disabled);p&&(t.value=p.value,window.location.hash=`#/${p.value}`,o.value="")}}),window.addEventListener("hashchange",()=>{let c=(window.location.hash||"#/").slice(2);t.value=c}),r.addEventListener("change",()=>{let l=window.location.hash;window.location.hash="",window.location.hash=l}),document.getElementById("clear-basket")?.addEventListener("click",()=>{h.clear(),C()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let l={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(h.isEmpty()){alert("Lista jest pusta!");return}F(h.getItems(),l)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let l=h.getItems(),c=JSON.stringify(l.map(p=>p.payload),null,2);navigator.clipboard.writeText(c).then(()=>{alert("JSON skopiowany do schowka!")})}),C(),a.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
