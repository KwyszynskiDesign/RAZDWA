var me=Object.defineProperty;var pe=(e,t)=>{for(var a in t)me(e,a,{get:t[a],enumerable:!0})};var S=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,a){this.container=t,this.getCtx=a,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let a=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let i=this.routes.get(a);if(i){this.currentView=i;let n=document.createElement("button");n.className="back-button",n.textContent="Wszystkie kategorie",n.onclick=()=>{window.location.hash="#/"},this.container.appendChild(n);let r=document.createElement("div");r.className="category-content",r.id="current-category",this.container.appendChild(r),i.mount(r,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function f(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var T=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,a)=>t+a.totalPrice,0)}isEmpty(){return this.items.length===0}};function B(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let a=e.map(m=>({Kategoria:m.category,Nazwa:m.name,Ilo\u015B\u0107:m.quantity,Jednostka:m.unit,"Cena jedn.":m.unitPrice,"Express (+20%)":m.isExpress?"TAK":"NIE","Cena ca\u0142kowita":m.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),i=XLSX.utils.json_to_sheet(a),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,i,"Zam\xF3wienie");let r=new Date().toISOString().slice(0,10),s=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${r}.xlsx`;XLSX.writeFile(n,s)}var A=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var D={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=e.querySelector("#addSampleBtn"),i=e.querySelector("#sampleQty");a?.addEventListener("click",()=>{let n=parseInt(i.value)||1,r=n*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:n},price:r}),alert(`Dodano do koszyka: ${n} szt. za ${f(r)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function ue(e,t){let a=[...e].sort((r,s)=>r.min-s.min),i=a.find(r=>t>=r.min&&(r.max===null||t<=r.max));if(i)return i;let n=a.find(r=>r.min>=t);return n||a[a.length-1]}function ye(e,t){if(!t)return e;let a=t.find(i=>i.type==="minimum"&&i.unit==="m2");return a&&e<a.value?a.value:e}function b(e,t,a=[]){let i=ye(t,e.rules),n=ue(e.tiers,i),r=0;e.pricing==="per_unit"?r=i*n.price:r=n.price;let s=0,m=[];if(e.modifiers)for(let o of a){let l=e.modifiers.find(d=>d.id===o);l&&(m.push(l.name),l.type==="percent"?s+=r*l.value:l.type==="fixed_per_unit"?s+=l.value*i:s+=l.value)}let p=r+s,c=e.rules?.find(o=>o.type==="minimum"&&o.unit==="pln");return c&&p<c.value&&(p=c.value),{basePrice:r,effectiveQuantity:i,tierPrice:n.price,modifiersTotal:s,totalPrice:parseFloat(p.toFixed(2)),appliedModifiers:m}}var I={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:20}]};var $={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let a=I;e.innerHTML=`
      <div class="category-view">
        <h2>${a.title}</h2>
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
    `;let i=e.querySelector("#plakatyQty"),n=e.querySelector("#plakatyExpress"),r=e.querySelector("#plakatyResult"),s=e.querySelector("#addPlakatyBtn");function m(){let p=parseFloat(i.value)||0,c=n.checked?["EXPRESS"]:[];try{let o=b(p,a,c);r.textContent=f(o.totalPrice)}catch{r.textContent="B\u0142\u0105d"}}i.addEventListener("input",m),n.addEventListener("change",m),s.addEventListener("click",()=>{let p=parseFloat(i.value)||0,c=n.checked?["EXPRESS"]:[],o=b(p,a,c);t.cart.addItem({categoryId:a.id,categoryName:a.title,details:{qty:`${p} m2`,express:n.checked},price:o.totalPrice})}),m()}};var R={id:"vouchery",name:"Vouchery"};var v={name:"DYPLOMY - druk cyfrowy",modifiers:{satin:.12,express:.2,bulkDiscount:.12,bulkDiscountThreshold:6},formats:{DL:{name:"DL (99x210mm)",single:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120},double:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120}}}};function _(e){let{qty:t,sides:a,isSatin:i,express:n}=e,m=v.formats.DL[a===1?"single":"double"],p=Object.keys(m).map(Number).sort((y,x)=>y-x),c=p[0];for(let y of p)t>=y&&(c=y);let o=m[c.toString()],l=[];t>=v.modifiers.bulkDiscountThreshold&&l.push({id:"bulk-discount",name:`Rabat -${v.modifiers.bulkDiscount*100}% (od ${v.modifiers.bulkDiscountThreshold} szt)`,type:"percentage",value:-v.modifiers.bulkDiscount}),i&&l.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:v.modifiers.satin}),n&&l.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:v.modifiers.express});let d=0,u=[];for(let y of l)(y.type==="percent"||y.type==="percentage")&&(d+=o*y.value,u.push(y.name));let w=o+d;return{basePrice:o,effectiveQuantity:t,tierPrice:o/t,modifiersTotal:d,totalPrice:Math.round(w*100)/100,appliedModifiers:u}}var O={id:"dyplomy",name:"Dyplomy",async mount(e,t){let a=await fetch("categories/dyplomy.html");e.innerHTML=await a.text();let i=e.querySelector("#dypSides"),n=e.querySelector("#dypQty"),r=e.querySelector("#dypSatin"),s=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),p=e.querySelector("#dypResult"),c=()=>{let o={qty:parseInt(n.value)||1,sides:parseInt(i.value)||1,isSatin:r.checked,express:t.expressMode},l=_(o);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(l.totalPrice/o.qty),e.querySelector("#resTotalPrice").textContent=f(l.totalPrice),e.querySelector("#resDiscountHint").style.display=l.appliedModifiers.includes("bulk-discount")?"block":"none",e.querySelector("#resExpressHint").style.display=o.express?"block":"none",e.querySelector("#resSatinHint").style.display=o.isSatin?"block":"none",t.updateLastCalculated(l.totalPrice,"Dyplomy"),{options:o,result:l}};s.addEventListener("click",()=>c()),m.addEventListener("click",()=>{let{options:o,result:l}=c();t.cart.addItem({id:`dyp-${Date.now()}`,category:"Dyplomy",name:`Dyplomy DL ${o.sides===1?"1-str":"2-str"}`,quantity:o.qty,unit:"szt",unitPrice:l.totalPrice/o.qty,isExpress:o.express,totalPrice:l.totalPrice,optionsHint:`${o.qty} szt, ${o.isSatin?"Satyna":"Kreda"}`,payload:o})}),c()}};function j(e,t){let a=Object.keys(e||{}).map(Number).filter(Number.isFinite).sort((n,r)=>n-r);if(!a.length)return null;let i=a.find(n=>t<=n);return i??null}var C={cyfrowe:{standardPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290},lam:{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345}}},softtouchPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390}}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:{50:280,100:320,200:395,250:479,400:655,500:778}},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:{50:450,100:550,200:650,250:720,400:850,500:905}}}}}};function V(e){let t;e.family==="deluxe"?t=C.cyfrowe.deluxe.options[e.deluxeOpt].prices:t=(e.finish==="softtouch"?C.cyfrowe.softtouchPrices:C.cyfrowe.standardPrices)[e.size][e.lam];let a=j(t,e.qty);if(a==null)throw new Error("Brak progu cenowego dla takiej ilo\u015Bci.");let i=t[a];return{qtyBilled:a,total:i}}function F(e){let t=e.family||"standard",a=e.format||"85x55",i=e.folia==="none"?"noLam":"lam",n=e.finish||"mat",r=V({family:t,size:a,lam:i,finish:n,deluxeOpt:e.deluxeOpt,qty:e.qty}),s=r.total;return e.express&&(s=r.total*1.2),{totalPrice:parseFloat(s.toFixed(2)),basePrice:r.total,effectiveQuantity:e.qty,tierPrice:r.total/r.qtyBilled,modifiersTotal:e.express?r.total*.2:0,appliedModifiers:e.express?["TRYB EXPRESS"]:[],qtyBilled:r.qtyBilled}}var U={id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",mount(e,t){e.innerHTML=`
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
    `,this.initLogic(e,t)},initLogic(e,t){let a=e.querySelector("#w-family"),i=e.querySelector("#standard-options"),n=e.querySelector("#deluxe-options"),r=e.querySelector("#w-finish"),s=e.querySelector("#w-size"),m=e.querySelector("#w-lam"),p=e.querySelector("#w-deluxe-opt"),c=e.querySelector("#w-qty"),o=e.querySelector("#w-calculate"),l=e.querySelector("#w-add-to-cart"),d=e.querySelector("#w-result-display"),u=e.querySelector("#w-total-price"),w=e.querySelector("#w-billed-qty-hint"),y=e.querySelector("#w-express-hint");a.onchange=()=>{let g=a.value==="deluxe";i.style.display=g?"none":"block",n.style.display=g?"block":"none"};let x=null,k=null;o.onclick=()=>{k={family:a.value,finish:r.value,format:s.value,folia:m.value==="lam"?"matt_gloss":"none",deluxeOpt:p.value,qty:parseInt(c.value),express:t.expressMode};try{let g=F(k);x=g,u.innerText=f(g.totalPrice),w.innerText=`Rozliczono za: ${g.qtyBilled} szt.`,y.style.display=t.expressMode?"block":"none",d.style.display="block",l.disabled=!1,t.updateLastCalculated(g.totalPrice,"Wizyt\xF3wki")}catch(g){alert("B\u0142\u0105d: "+g.message)}},l.onclick=()=>{if(x&&k){let g=k.family==="deluxe"?"Wizyt\xF3wki DELUXE":"Wizyt\xF3wki Standard",H=k.express?", EXPRESS":"";t.cart.addItem({id:`wizytowki-${Date.now()}`,category:"Wizyt\xF3wki",name:g,quantity:x.qtyBilled,unit:"szt",unitPrice:x.totalPrice/x.qtyBilled,isExpress:k.express,totalPrice:x.totalPrice,optionsHint:`${k.qty} szt (rozliczono ${x.qtyBilled})${H}`,payload:x})}}}};var M={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function N(e){let{format:t,qty:a,sides:i,isFolded:n,isSatin:r,express:s}=e,m=M.formats[t];if(!m)throw new Error(`Invalid format: ${t}`);let p=i===1?"single":"double",c=n?"folded":"normal",o=m[p][c],l=Object.keys(o).map(Number).sort((g,H)=>g-H),d=l[0];for(let g of l)a>=g&&(d=g);let u=o[d.toString()],w=[];r&&w.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:M.modifiers.satin}),s&&w.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:M.modifiers.express});let y=0,x=[];for(let g of w)(g.type==="percent"||g.type==="percentage")&&(y+=u*g.value,x.push(g.name));let k=u+y;return{basePrice:u,effectiveQuantity:a,tierPrice:u/a,modifiersTotal:y,totalPrice:Math.round(k*100)/100,appliedModifiers:x}}var W={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let a=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await a.text();let i=e.querySelector("#zapFormat"),n=e.querySelector("#zapSides"),r=e.querySelector("#zapFolded"),s=e.querySelector("#zapQty"),m=e.querySelector("#zapSatin"),p=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),o=e.querySelector("#zapResult"),l=()=>{let d={format:i.value,qty:parseInt(s.value)||10,sides:parseInt(n.value)||1,isFolded:r.checked,isSatin:m.checked,express:t.expressMode},u=N(d);return o.style.display="block",e.querySelector("#resUnitPrice").textContent=f(u.totalPrice/d.qty),e.querySelector("#resTotalPrice").textContent=f(u.totalPrice),e.querySelector("#resExpressHint").style.display=d.express?"block":"none",e.querySelector("#resSatinHint").style.display=d.isSatin?"block":"none",t.updateLastCalculated(u.totalPrice,"Zaproszenia"),{options:d,result:u}};p.addEventListener("click",()=>l()),c.addEventListener("click",()=>{let{options:d,result:u}=l();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${d.format} ${d.sides===1?"1-str":"2-str"}${d.isFolded?" sk\u0142adane":""}`,quantity:d.qty,unit:"szt",unitPrice:u.totalPrice/d.qty,isExpress:d.express,totalPrice:u.totalPrice,optionsHint:`${d.qty} szt, ${d.isSatin?"Satyna":"Kreda"}`,payload:d})}),l()}};var X={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function ke(e){let t=X.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function K(e){let t=ke(e.format),a=[];return e.express&&a.push("express"),b(t,e.qty,a)}var Z={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#u-format"),i=e.querySelector("#u-qty"),n=e.querySelector("#u-calculate"),r=e.querySelector("#u-add-to-cart"),s=e.querySelector("#u-result-display"),m=e.querySelector("#u-total-price"),p=e.querySelector("#u-express-hint"),c=null,o=null;n.onclick=()=>{o={format:a.value,qty:parseInt(i.value),express:t.expressMode};try{let l=K(o);c=l,m.innerText=f(l.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),s.style.display="block",r.disabled=!1,t.updateLastCalculated(l.totalPrice,"Ulotki")}catch(l){alert("B\u0142\u0105d: "+l.message)}},r.onclick=()=>{if(c&&o){let l=o.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${o.format}`,quantity:o.qty,unit:"szt",unitPrice:c.totalPrice/o.qty,isExpress:o.express,totalPrice:c.totalPrice,optionsHint:`${o.qty} szt, Dwustronne${l}`,payload:c})}}}};var J={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function he(e){let t=J.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Q(e){let t=he(e.format),a=[];return e.express&&a.push("express"),b(t,e.qty,a)}var Y={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#uj-format"),i=e.querySelector("#uj-qty"),n=e.querySelector("#uj-calculate"),r=e.querySelector("#uj-add-to-cart"),s=e.querySelector("#uj-result-display"),m=e.querySelector("#uj-total-price"),p=e.querySelector("#uj-express-hint"),c=null,o=null;n.onclick=()=>{o={format:a.value,qty:parseInt(i.value),express:t.expressMode};try{let l=Q(o);c=l,m.innerText=f(l.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),s.style.display="block",r.disabled=!1,t.updateLastCalculated(l.totalPrice,"Ulotki")}catch(l){alert("B\u0142\u0105d: "+l.message)}},r.onclick=()=>{if(c&&o){let l=o.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${o.format}`,quantity:o.qty,unit:"szt",unitPrice:c.totalPrice/o.qty,isExpress:o.express,totalPrice:c.totalPrice,optionsHint:`${o.qty} szt, Jednostronne${l}`,payload:c})}}}};var G={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ee(e){let t=G,a=t.materials.find(r=>r.id===e.material);if(!a)throw new Error(`Unknown material: ${e.material}`);let i={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:a.tiers,modifiers:t.modifiers},n=[];return e.oczkowanie&&n.push("oczkowanie"),e.express&&n.push("express"),b(i,e.areaM2,n)}var te={id:"banner",name:"Bannery",async mount(e,t){try{let a=await fetch("categories/banner.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#b-material"),i=e.querySelector("#b-area"),n=e.querySelector("#b-oczkowanie"),r=e.querySelector("#b-calculate"),s=e.querySelector("#b-add-to-cart"),m=e.querySelector("#b-result-display"),p=e.querySelector("#b-unit-price"),c=e.querySelector("#b-total-price"),o=e.querySelector("#b-express-hint"),l=null,d=null;r.onclick=()=>{d={material:a.value,areaM2:parseFloat(i.value),oczkowanie:n.checked,express:t.expressMode};try{let u=ee(d);l=u,p.innerText=f(u.tierPrice),c.innerText=f(u.totalPrice),o&&(o.style.display=t.expressMode?"block":"none"),m.style.display="block",s.disabled=!1,t.updateLastCalculated(u.totalPrice,"Banner")}catch(u){alert("B\u0142\u0105d: "+u.message)}},s.onclick=()=>{if(l&&d){let u=a.options[a.selectedIndex].text,w=[`${d.areaM2} m2`,d.oczkowanie?"z oczkowaniem":"bez oczkowania",d.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:u,quantity:d.areaM2,unit:"m2",unitPrice:l.tierPrice,isExpress:d.express,totalPrice:l.totalPrice,optionsHint:w,payload:l})}}}};var E={};pe(E,{category:()=>Ee,default:()=>Te,groups:()=>Le,modifiers:()=>Se});var Ee="Wlepki / Naklejki",Le=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Se=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],Te={category:Ee,groups:Le,modifiers:Se};function ae(e){let t=E,a=t.groups.find(r=>r.id===e.groupId);if(!a)throw new Error(`Unknown group: ${e.groupId}`);let i={id:"wlepki",title:a.title,unit:a.unit,pricing:a.pricing||"per_unit",tiers:a.tiers,modifiers:t.modifiers,rules:a.rules||[{type:"minimum",unit:"m2",value:1}]},n=[...e.modifiers];return e.express&&n.push("express"),b(i,e.area,n)}var ie={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let a=E;try{let u=await fetch("categories/wlepki-naklejki.html");if(!u.ok)throw new Error("Failed to load template");e.innerHTML=await u.text()}catch(u){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${u}</div>`;return}let i=e.querySelector("#wlepki-group"),n=e.querySelector("#wlepki-area"),r=e.querySelector("#btn-calculate"),s=e.querySelector("#btn-add-to-cart"),m=e.querySelector("#wlepki-result"),p=e.querySelector("#unit-price"),c=e.querySelector("#total-price"),o=null,l=null,d=()=>{let u=e.querySelectorAll(".wlepki-mod:checked"),w=Array.from(u).map(y=>y.value);l={groupId:i.value,area:parseFloat(n.value)||0,express:t.expressMode,modifiers:w};try{let y=ae(l);o=y,p.textContent=f(y.tierPrice),c.textContent=f(y.totalPrice),m.style.display="block",s.disabled=!1,t.updateLastCalculated(y.totalPrice,"Wlepki")}catch(y){alert("B\u0142\u0105d: "+y.message)}};r.addEventListener("click",d),s.addEventListener("click",()=>{if(!o||!l)return;let u=a.groups.find(y=>y.id===l.groupId),w=l.modifiers.map(y=>{let x=a.modifiers.find(k=>k.id===y);return x?x.name:y});l.express&&w.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:u?.title||"Wlepki",quantity:l.area,unit:"m2",unitPrice:o.tierPrice,isExpress:!!l.express,totalPrice:o.totalPrice,optionsHint:w.join(", ")||"Standard",payload:o})})}};var q={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function re(e){let t=q.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let a;if(e.isReplacement){let r=t.width*t.height*q.replacement.print_per_m2+q.replacement.labor;a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:r}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let i=[];return e.express&&i.push("express"),b(a,e.qty,i)}var oe={id:"roll-up",name:"Roll-up",async mount(e,t){let a=await fetch("categories/roll-up.html");e.innerHTML=await a.text();let i=e.querySelector("#rollUpType"),n=e.querySelector("#rollUpFormat"),r=e.querySelector("#rollUpQty"),s=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),p=e.querySelector("#rollUpResult"),c=()=>{let o={format:n.value,qty:parseInt(r.value)||1,isReplacement:i.value==="replacement",express:t.expressMode},l=re(o);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(l.totalPrice/o.qty),e.querySelector("#resTotalPrice").textContent=f(l.totalPrice),e.querySelector("#resExpressHint").style.display=o.express?"block":"none",t.updateLastCalculated(l.totalPrice,"Roll-up"),{options:o,result:l}};s.addEventListener("click",()=>c()),m.addEventListener("click",()=>{let{options:o,result:l}=c();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${o.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${o.format}`,quantity:o.qty,unit:"szt",unitPrice:l.totalPrice/o.qty,isExpress:o.express,totalPrice:l.totalPrice,optionsHint:`${o.format}, ${o.qty} szt`,payload:o})}),c()}};async function Me(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function z(e,t,a){return{id:e,name:t,mount:async(i,n)=>{i.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let r=await Me(a);i.innerHTML=r,Pe(i,n)}catch(r){i.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${r}</small>
          </div>
        `,console.error("Category load error:",r)}}}}function Pe(e,t){e.querySelectorAll("button[data-action]").forEach(i=>{let n=i.getAttribute("data-action");n==="calculate"&&i.addEventListener("click",()=>{console.log("Calculate clicked")}),n==="add-to-basket"&&i.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var qe=[{produkt:"A0+ 914\xD71292",jednostka:"1 szt",cena:26,baseWidth:914,baseLength:1292,typ:"cad_length"},{produkt:"A1+ 610\xD7914",jednostka:"1 szt",cena:18,baseWidth:610,baseLength:914,typ:"cad_length"},{produkt:"A2+ 450\xD7610",jednostka:"1 szt",cena:12,baseWidth:450,baseLength:610,typ:"cad_length"},{produkt:"MB 90cm",jednostka:"1 mb",cena:21,baseWidth:900,baseLength:1e3,typ:"cad_length"},{produkt:"MB 61cm",jednostka:"1 mb",cena:15,baseWidth:610,baseLength:1e3,typ:"cad_length"}],ne={id:"druk-cad",name:"\u{1F5FA}\uFE0F Druk CAD wielkoformatowy",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk CAD wielkoformatowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Druk techniczny na ploterze wielkoformatowym. Dostosuj d\u0142ugo\u015B\u0107 druku.
        </p>

        <div id="cad-products"></div>
      </div>
    `;let a=e.querySelector("#cad-products");a&&qe.forEach((i,n)=>{let r=document.createElement("div");r.className="product-card",r.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>${i.produkt}</strong>
          <span style="color: #999;">${i.jednostka}</span>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label>D\u0142ugo\u015B\u0107 (mm):</label>
          <input
            type="number"
            id="clen-${n}"
            value="${i.baseLength}"
            min="${i.baseLength}"
            step="10"
          >
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #999;">Cena:</span>
            <strong id="price-${n}" style="font-size: 18px; color: #667eea; margin-left: 8px;">
              ${i.cena.toFixed(2)} z\u0142
            </strong>
          </div>
          <button class="btn-success" data-index="${n}">Dodaj do listy</button>
        </div>
      `,a.appendChild(r);let s=r.querySelector(`#clen-${n}`),m=r.querySelector(`#price-${n}`);s.addEventListener("input",()=>{let c=parseFloat(s.value)||i.baseLength,o=c/i.baseLength,l=i.cena*o;m&&(m.textContent=`${l.toFixed(2)} z\u0142`),t.updateLastCalculated(l,`${i.produkt} - ${c}mm`)}),r.querySelector(".btn-success")?.addEventListener("click",()=>{let c=parseFloat(s.value)||i.baseLength,o=c/i.baseLength,l=i.cena*o;t.addToBasket({category:"Druk CAD",price:l,description:`${i.produkt} - ${c}mm`}),alert(`\u2705 Dodano do listy: ${i.produkt} (${l.toFixed(2)} z\u0142)`)})})}};var le={czarnoBialy:{A4:[{min:1,max:5,price:.9},{min:6,max:20,price:.6},{min:21,max:100,price:.35},{min:101,max:500,price:.3},{min:501,max:999,price:.23},{min:1e3,max:4999,price:.19},{min:5e3,max:99999,price:.15}],A3:[{min:1,max:5,price:1.7},{min:6,max:20,price:1.1},{min:21,max:100,price:.7},{min:101,max:500,price:.6},{min:501,max:999,price:.45},{min:1e3,max:99999,price:.33}]},kolorowy:{A4:[{min:1,max:10,price:2.4},{min:11,max:40,price:2.2},{min:41,max:100,price:2},{min:101,max:250,price:1.8},{min:251,max:500,price:1.6},{min:501,max:999,price:1.4},{min:1e3,max:99999,price:1.1}],A3:[{min:1,max:10,price:4.8},{min:11,max:40,price:4.2},{min:41,max:100,price:3.8},{min:101,max:250,price:3},{min:251,max:500,price:2.5},{min:501,max:999,price:1.9},{min:1e3,max:99999,price:1.9}]}};function ze(e,t,a){let i=le[a][e];for(let n of i)if(t>=n.min&&t<=n.max)return n.price;return i[i.length-1].price}var se={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3 + skan",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=0,i=0,n=e.querySelector("#format"),r=e.querySelector("#quantity"),s=e.querySelector("#color"),m=e.querySelector("#calculate"),p=e.querySelector("#addToBasket"),c=e.querySelector("#tiers-list"),o=e.querySelector("#price-per-page"),l=e.querySelector("#total-price"),d=e.querySelector("#price-breakdown");function u(){let w=n.value,y=s.value,x=le[y][w];c&&(c.innerHTML=x.map(k=>`<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${k.max>=99999?`${k.min}+ str`:`${k.min}-${k.max} str`}</span>
            <span style="color: #667eea;">${k.price.toFixed(2)} z\u0142/str</span>
          </div>`).join(""))}n.addEventListener("change",u),s.addEventListener("change",u),u(),m?.addEventListener("click",()=>{let w=n.value,y=parseInt(r.value)||1,x=s.value;if(i=ze(w,y,x),a=i*y,o&&(o.textContent=`${i.toFixed(2)} z\u0142/str`),l&&(l.textContent=`${a.toFixed(2)} z\u0142`),d){let k=x==="czarnoBialy"?"Czarno-bia\u0142y":"Kolorowy";d.textContent=`${k}, ${w}, ${y} str \xD7 ${i.toFixed(2)} z\u0142 = ${a.toFixed(2)} z\u0142`}t.updateLastCalculated(a,`Druk ${w} ${x==="czarnoBialy"?"CZ-B":"KOLOR"} - ${y} str`)}),p?.addEventListener("click",()=>{if(a===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let w=n.value,y=r.value,x=s.value==="czarnoBialy"?"CZ-B":"KOLOR";t.addToBasket({category:"Druk A4/A3",price:a,description:`${w}, ${y} str, ${x} (${i.toFixed(2)} z\u0142/str)`}),alert(`\u2705 Dodano: ${a.toFixed(2)} z\u0142`)})}};var ce=[D,$,R,O,U,W,Z,Y,te,ie,oe,ne,se,z("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),z("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),z("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var h=new T;function L(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),a=document.getElementById("json-preview");if(!e||!t||!a)return;let i=h.getItems();if(i.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=i.map((r,s)=>`
      <div class="basket-item" style="padding: 12px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: white; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${r.category}: ${r.name}
            </strong>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0 0;">
              ${r.optionsHint} (${r.quantity} ${r.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${f(r.totalPrice)}</strong>
            <button onclick="window.removeItem(${s})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let n=h.getGrandTotal();t.innerText=f(n)}a.innerText=JSON.stringify(i.map(n=>n.payload),null,2)}window.removeItem=e=>{h.removeItem(e),L()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),a=document.getElementById("categorySearch"),i=document.getElementById("tryb-express");if(!e||!t||!i||!a)return;let n=()=>({cart:{addItem:s=>{h.addItem(s),L()}},addToBasket:s=>{h.addItem({id:`item-${Date.now()}`,category:s.category,name:s.description||"Produkt",quantity:1,unit:"szt.",unitPrice:s.price,isExpress:i.checked,totalPrice:s.price,optionsHint:s.description||"",payload:s}),L()},expressMode:i.checked,updateLastCalculated:(s,m)=>{let p=document.getElementById("last-calculated"),c=document.getElementById("currentHint");p&&(p.innerText=f(s)),c&&(c.innerText=m?`(${m})`:"")}}),r=new S(e,n);r.setCategories(A),ce.forEach(s=>{r.addRoute(s)}),A.forEach(s=>{let m=document.createElement("option");m.value=s.id,m.innerText=`${s.icon} ${s.name}`,s.implemented||(m.disabled=!0,m.innerText+=" (wkr\xF3tce)"),t.appendChild(m)}),t.addEventListener("change",()=>{let s=t.value;s?window.location.hash=`#/${s}`:window.location.hash="#/"}),a.addEventListener("input",()=>{let s=a.value.toLowerCase();Array.from(t.options).forEach((p,c)=>{if(c===0)return;let o=p.text.toLowerCase();p.hidden=!o.includes(s)})}),a.addEventListener("keydown",s=>{if(s.key==="Enter"){let m=a.value.toLowerCase(),p=Array.from(t.options).find((c,o)=>o>0&&!c.hidden&&!c.disabled);p&&(t.value=p.value,window.location.hash=`#/${p.value}`,a.value="")}}),window.addEventListener("hashchange",()=>{let m=(window.location.hash||"#/").slice(2);t.value=m}),i.addEventListener("change",()=>{let s=window.location.hash;window.location.hash="",window.location.hash=s}),document.getElementById("clear-basket")?.addEventListener("click",()=>{h.clear(),L()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let s={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(h.isEmpty()){alert("Lista jest pusta!");return}B(h.getItems(),s)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let s=h.getItems(),m=JSON.stringify(s.map(p=>p.payload),null,2);navigator.clipboard.writeText(m).then(()=>{alert("JSON skopiowany do schowka!")})}),L(),r.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
