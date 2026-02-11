var ce=Object.defineProperty;var me=(e,t)=>{for(var a in t)ce(e,a,{get:t[a],enumerable:!0})};var T=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,a){this.container=t,this.getCtx=a,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let a=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let o=this.routes.get(a);if(o){this.currentView=o;let n=document.createElement("button");n.className="back-button",n.textContent="Wszystkie kategorie",n.onclick=()=>{window.location.hash="#/"},this.container.appendChild(n);let i=document.createElement("div");i.className="category-content",i.id="current-category",this.container.appendChild(i),o.mount(i,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function f(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var C=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,a)=>t+a.totalPrice,0)}isEmpty(){return this.items.length===0}};function D(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let a=e.map(c=>({Kategoria:c.category,Nazwa:c.name,Ilo\u015B\u0107:c.quantity,Jednostka:c.unit,"Cena jedn.":c.unitPrice,"Express (+20%)":c.isExpress?"TAK":"NIE","Cena ca\u0142kowita":c.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),o=XLSX.utils.json_to_sheet(a),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,o,"Zam\xF3wienie");let i=new Date().toISOString().slice(0,10),l=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${i}.xlsx`;XLSX.writeFile(n,l)}var A=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var B={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=e.querySelector("#addSampleBtn"),o=e.querySelector("#sampleQty");a?.addEventListener("click",()=>{let n=parseInt(o.value)||1,i=n*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:n},price:i}),alert(`Dodano do koszyka: ${n} szt. za ${f(i)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function de(e,t){let a=[...e].sort((i,l)=>i.min-l.min),o=a.find(i=>t>=i.min&&(i.max===null||t<=i.max));if(o)return o;let n=a.find(i=>i.min>=t);return n||a[a.length-1]}function ue(e,t){if(!t)return e;let a=t.find(o=>o.type==="minimum"&&o.unit==="m2");return a&&e<a.value?a.value:e}function k(e,t,a=[]){let o=ue(t,e.rules),n=de(e.tiers,o),i=0;e.pricing==="per_unit"?i=o*n.price:i=n.price;let l=0,c=[];if(e.modifiers)for(let r of a){let s=e.modifiers.find(d=>d.id===r);s&&(c.push(s.name),s.type==="percent"?l+=i*s.value:s.type==="fixed_per_unit"?l+=s.value*o:l+=s.value)}let p=i+l,m=e.rules?.find(r=>r.type==="minimum"&&r.unit==="pln");return m&&p<m.value&&(p=m.value),{basePrice:i,effectiveQuantity:o,tierPrice:n.price,modifiersTotal:l,totalPrice:parseFloat(p.toFixed(2)),appliedModifiers:c}}var I={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:20}]};var R={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let a=I;e.innerHTML=`
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
    `;let o=e.querySelector("#plakatyQty"),n=e.querySelector("#plakatyExpress"),i=e.querySelector("#plakatyResult"),l=e.querySelector("#addPlakatyBtn");function c(){let p=parseFloat(o.value)||0,m=n.checked?["EXPRESS"]:[];try{let r=k(p,a,m);i.textContent=f(r.totalPrice)}catch{i.textContent="B\u0142\u0105d"}}o.addEventListener("input",c),n.addEventListener("change",c),l.addEventListener("click",()=>{let p=parseFloat(o.value)||0,m=n.checked?["EXPRESS"]:[],r=k(p,a,m);t.cart.addItem({categoryId:a.id,categoryName:a.title,details:{qty:`${p} m2`,express:n.checked},price:r.totalPrice})}),c()}};var $={id:"vouchery",name:"Vouchery"};var b={name:"DYPLOMY - druk cyfrowy",modifiers:{satin:.12,express:.2,bulkDiscount:.12,bulkDiscountThreshold:6},formats:{DL:{name:"DL (99x210mm)",single:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120},double:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120}}}};function V(e){let{qty:t,sides:a,isSatin:o,express:n}=e,c=b.formats.DL[a===1?"single":"double"],p=Object.keys(c).map(Number).sort((y,w)=>y-w),m=p[0];for(let y of p)t>=y&&(m=y);let r=c[m.toString()],s=[];t>=b.modifiers.bulkDiscountThreshold&&s.push({id:"bulk-discount",name:`Rabat -${b.modifiers.bulkDiscount*100}% (od ${b.modifiers.bulkDiscountThreshold} szt)`,type:"percentage",value:-b.modifiers.bulkDiscount}),o&&s.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:b.modifiers.satin}),n&&s.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:b.modifiers.express});let d=0,u=[];for(let y of s)(y.type==="percent"||y.type==="percentage")&&(d+=r*y.value,u.push(y.name));let g=r+d;return{basePrice:r,effectiveQuantity:t,tierPrice:r/t,modifiersTotal:d,totalPrice:Math.round(g*100)/100,appliedModifiers:u}}var _={id:"dyplomy",name:"Dyplomy",async mount(e,t){let a=await fetch("categories/dyplomy.html");e.innerHTML=await a.text();let o=e.querySelector("#dypSides"),n=e.querySelector("#dypQty"),i=e.querySelector("#dypSatin"),l=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),p=e.querySelector("#dypResult"),m=()=>{let r={qty:parseInt(n.value)||1,sides:parseInt(o.value)||1,isSatin:i.checked,express:t.expressMode},s=V(r);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(s.totalPrice/r.qty),e.querySelector("#resTotalPrice").textContent=f(s.totalPrice),e.querySelector("#resDiscountHint").style.display=s.appliedModifiers.includes("bulk-discount")?"block":"none",e.querySelector("#resExpressHint").style.display=r.express?"block":"none",e.querySelector("#resSatinHint").style.display=r.isSatin?"block":"none",t.updateLastCalculated(s.totalPrice,"Dyplomy"),{options:r,result:s}};l.addEventListener("click",()=>m()),c.addEventListener("click",()=>{let{options:r,result:s}=m();t.cart.addItem({id:`dyp-${Date.now()}`,category:"Dyplomy",name:`Dyplomy DL ${r.sides===1?"1-str":"2-str"}`,quantity:r.qty,unit:"szt",unitPrice:s.totalPrice/r.qty,isExpress:r.express,totalPrice:s.totalPrice,optionsHint:`${r.qty} szt, ${r.isSatin?"Satyna":"Kreda"}`,payload:r})}),m()}};function O(e,t){let a=Object.keys(e||{}).map(Number).filter(Number.isFinite).sort((n,i)=>n-i);if(!a.length)return null;let o=a.find(n=>t<=n);return o??null}var M={cyfrowe:{standardPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290},lam:{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345}}},softtouchPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390}}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:{50:280,100:320,200:395,250:479,400:655,500:778}},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:{50:450,100:550,200:650,250:720,400:850,500:905}}}}}};function j(e){let t;e.family==="deluxe"?t=M.cyfrowe.deluxe.options[e.deluxeOpt].prices:t=(e.finish==="softtouch"?M.cyfrowe.softtouchPrices:M.cyfrowe.standardPrices)[e.size][e.lam];let a=O(t,e.qty);if(a==null)throw new Error("Brak progu cenowego dla takiej ilo\u015Bci.");let o=t[a];return{qtyBilled:a,total:o}}function F(e){let t=e.family||"standard",a=e.format||"85x55",o=e.folia==="none"?"noLam":"lam",n=e.finish||"mat",i=j({family:t,size:a,lam:o,finish:n,deluxeOpt:e.deluxeOpt,qty:e.qty}),l=i.total;return e.express&&(l=i.total*1.2),{totalPrice:parseFloat(l.toFixed(2)),basePrice:i.total,effectiveQuantity:e.qty,tierPrice:i.total/i.qtyBilled,modifiersTotal:e.express?i.total*.2:0,appliedModifiers:e.express?["TRYB EXPRESS"]:[],qtyBilled:i.qtyBilled}}var U={id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",mount(e,t){e.innerHTML=`
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
    `,this.initLogic(e,t)},initLogic(e,t){let a=e.querySelector("#w-family"),o=e.querySelector("#standard-options"),n=e.querySelector("#deluxe-options"),i=e.querySelector("#w-finish"),l=e.querySelector("#w-size"),c=e.querySelector("#w-lam"),p=e.querySelector("#w-deluxe-opt"),m=e.querySelector("#w-qty"),r=e.querySelector("#w-calculate"),s=e.querySelector("#w-add-to-cart"),d=e.querySelector("#w-result-display"),u=e.querySelector("#w-total-price"),g=e.querySelector("#w-billed-qty-hint"),y=e.querySelector("#w-express-hint");a.onchange=()=>{let x=a.value==="deluxe";o.style.display=x?"none":"block",n.style.display=x?"block":"none"};let w=null,h=null;r.onclick=()=>{h={family:a.value,finish:i.value,format:l.value,folia:c.value==="lam"?"matt_gloss":"none",deluxeOpt:p.value,qty:parseInt(m.value),express:t.expressMode};try{let x=F(h);w=x,u.innerText=f(x.totalPrice),g.innerText=`Rozliczono za: ${x.qtyBilled} szt.`,y.style.display=t.expressMode?"block":"none",d.style.display="block",s.disabled=!1,t.updateLastCalculated(x.totalPrice,"Wizyt\xF3wki")}catch(x){alert("B\u0142\u0105d: "+x.message)}},s.onclick=()=>{if(w&&h){let x=h.family==="deluxe"?"Wizyt\xF3wki DELUXE":"Wizyt\xF3wki Standard",z=h.express?", EXPRESS":"";t.cart.addItem({id:`wizytowki-${Date.now()}`,category:"Wizyt\xF3wki",name:x,quantity:w.qtyBilled,unit:"szt",unitPrice:w.totalPrice/w.qtyBilled,isExpress:h.express,totalPrice:w.totalPrice,optionsHint:`${h.qty} szt (rozliczono ${w.qtyBilled})${z}`,payload:w})}}}};var P={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function W(e){let{format:t,qty:a,sides:o,isFolded:n,isSatin:i,express:l}=e,c=P.formats[t];if(!c)throw new Error(`Invalid format: ${t}`);let p=o===1?"single":"double",m=n?"folded":"normal",r=c[p][m],s=Object.keys(r).map(Number).sort((x,z)=>x-z),d=s[0];for(let x of s)a>=x&&(d=x);let u=r[d.toString()],g=[];i&&g.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:P.modifiers.satin}),l&&g.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:P.modifiers.express});let y=0,w=[];for(let x of g)(x.type==="percent"||x.type==="percentage")&&(y+=u*x.value,w.push(x.name));let h=u+y;return{basePrice:u,effectiveQuantity:a,tierPrice:u/a,modifiersTotal:y,totalPrice:Math.round(h*100)/100,appliedModifiers:w}}var N={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let a=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await a.text();let o=e.querySelector("#zapFormat"),n=e.querySelector("#zapSides"),i=e.querySelector("#zapFolded"),l=e.querySelector("#zapQty"),c=e.querySelector("#zapSatin"),p=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),r=e.querySelector("#zapResult"),s=()=>{let d={format:o.value,qty:parseInt(l.value)||10,sides:parseInt(n.value)||1,isFolded:i.checked,isSatin:c.checked,express:t.expressMode},u=W(d);return r.style.display="block",e.querySelector("#resUnitPrice").textContent=f(u.totalPrice/d.qty),e.querySelector("#resTotalPrice").textContent=f(u.totalPrice),e.querySelector("#resExpressHint").style.display=d.express?"block":"none",e.querySelector("#resSatinHint").style.display=d.isSatin?"block":"none",t.updateLastCalculated(u.totalPrice,"Zaproszenia"),{options:d,result:u}};p.addEventListener("click",()=>s()),m.addEventListener("click",()=>{let{options:d,result:u}=s();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${d.format} ${d.sides===1?"1-str":"2-str"}${d.isFolded?" sk\u0142adane":""}`,quantity:d.qty,unit:"szt",unitPrice:u.totalPrice/d.qty,isExpress:d.express,totalPrice:u.totalPrice,optionsHint:`${d.qty} szt, ${d.isSatin?"Satyna":"Kreda"}`,payload:d})}),s()}};var X={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function ge(e){let t=X.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function K(e){let t=ge(e.format),a=[];return e.express&&a.push("express"),k(t,e.qty,a)}var Z={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#u-format"),o=e.querySelector("#u-qty"),n=e.querySelector("#u-calculate"),i=e.querySelector("#u-add-to-cart"),l=e.querySelector("#u-result-display"),c=e.querySelector("#u-total-price"),p=e.querySelector("#u-express-hint"),m=null,r=null;n.onclick=()=>{r={format:a.value,qty:parseInt(o.value),express:t.expressMode};try{let s=K(r);m=s,c.innerText=f(s.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),l.style.display="block",i.disabled=!1,t.updateLastCalculated(s.totalPrice,"Ulotki")}catch(s){alert("B\u0142\u0105d: "+s.message)}},i.onclick=()=>{if(m&&r){let s=r.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${r.format}`,quantity:r.qty,unit:"szt",unitPrice:m.totalPrice/r.qty,isExpress:r.express,totalPrice:m.totalPrice,optionsHint:`${r.qty} szt, Dwustronne${s}`,payload:m})}}}};var J={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function he(e){let t=J.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Q(e){let t=he(e.format),a=[];return e.express&&a.push("express"),k(t,e.qty,a)}var Y={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#uj-format"),o=e.querySelector("#uj-qty"),n=e.querySelector("#uj-calculate"),i=e.querySelector("#uj-add-to-cart"),l=e.querySelector("#uj-result-display"),c=e.querySelector("#uj-total-price"),p=e.querySelector("#uj-express-hint"),m=null,r=null;n.onclick=()=>{r={format:a.value,qty:parseInt(o.value),express:t.expressMode};try{let s=Q(r);m=s,c.innerText=f(s.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),l.style.display="block",i.disabled=!1,t.updateLastCalculated(s.totalPrice,"Ulotki")}catch(s){alert("B\u0142\u0105d: "+s.message)}},i.onclick=()=>{if(m&&r){let s=r.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${r.format}`,quantity:r.qty,unit:"szt",unitPrice:m.totalPrice/r.qty,isExpress:r.express,totalPrice:m.totalPrice,optionsHint:`${r.qty} szt, Jednostronne${s}`,payload:m})}}}};var G={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function ee(e){let t=G,a=t.materials.find(i=>i.id===e.material);if(!a)throw new Error(`Unknown material: ${e.material}`);let o={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:a.tiers,modifiers:t.modifiers},n=[];return e.oczkowanie&&n.push("oczkowanie"),e.express&&n.push("express"),k(o,e.areaM2,n)}var te={id:"banner",name:"Bannery",async mount(e,t){try{let a=await fetch("categories/banner.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#b-material"),o=e.querySelector("#b-area"),n=e.querySelector("#b-oczkowanie"),i=e.querySelector("#b-calculate"),l=e.querySelector("#b-add-to-cart"),c=e.querySelector("#b-result-display"),p=e.querySelector("#b-unit-price"),m=e.querySelector("#b-total-price"),r=e.querySelector("#b-express-hint"),s=null,d=null;i.onclick=()=>{d={material:a.value,areaM2:parseFloat(o.value),oczkowanie:n.checked,express:t.expressMode};try{let u=ee(d);s=u,p.innerText=f(u.tierPrice),m.innerText=f(u.totalPrice),r&&(r.style.display=t.expressMode?"block":"none"),c.style.display="block",l.disabled=!1,t.updateLastCalculated(u.totalPrice,"Banner")}catch(u){alert("B\u0142\u0105d: "+u.message)}},l.onclick=()=>{if(s&&d){let u=a.options[a.selectedIndex].text,g=[`${d.areaM2} m2`,d.oczkowanie?"z oczkowaniem":"bez oczkowania",d.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:u,quantity:d.areaM2,unit:"m2",unitPrice:s.tierPrice,isExpress:d.express,totalPrice:s.totalPrice,optionsHint:g,payload:s})}}}};var E={};me(E,{category:()=>ve,default:()=>Se,groups:()=>Ee,modifiers:()=>Le});var ve="Wlepki / Naklejki",Ee=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Le=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],Se={category:ve,groups:Ee,modifiers:Le};function ae(e){let t=E,a=t.groups.find(i=>i.id===e.groupId);if(!a)throw new Error(`Unknown group: ${e.groupId}`);let o={id:"wlepki",title:a.title,unit:a.unit,pricing:a.pricing||"per_unit",tiers:a.tiers,modifiers:t.modifiers,rules:a.rules||[{type:"minimum",unit:"m2",value:1}]},n=[...e.modifiers];return e.express&&n.push("express"),k(o,e.area,n)}var ie={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let a=E;try{let u=await fetch("categories/wlepki-naklejki.html");if(!u.ok)throw new Error("Failed to load template");e.innerHTML=await u.text()}catch(u){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${u}</div>`;return}let o=e.querySelector("#wlepki-group"),n=e.querySelector("#wlepki-area"),i=e.querySelector("#btn-calculate"),l=e.querySelector("#btn-add-to-cart"),c=e.querySelector("#wlepki-result"),p=e.querySelector("#unit-price"),m=e.querySelector("#total-price"),r=null,s=null,d=()=>{let u=e.querySelectorAll(".wlepki-mod:checked"),g=Array.from(u).map(y=>y.value);s={groupId:o.value,area:parseFloat(n.value)||0,express:t.expressMode,modifiers:g};try{let y=ae(s);r=y,p.textContent=f(y.tierPrice),m.textContent=f(y.totalPrice),c.style.display="block",l.disabled=!1,t.updateLastCalculated(y.totalPrice,"Wlepki")}catch(y){alert("B\u0142\u0105d: "+y.message)}};i.addEventListener("click",d),l.addEventListener("click",()=>{if(!r||!s)return;let u=a.groups.find(y=>y.id===s.groupId),g=s.modifiers.map(y=>{let w=a.modifiers.find(h=>h.id===y);return w?w.name:y});s.express&&g.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:u?.title||"Wlepki",quantity:s.area,unit:"m2",unitPrice:r.tierPrice,isExpress:!!s.express,totalPrice:r.totalPrice,optionsHint:g.join(", ")||"Standard",payload:r})})}};var H={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function oe(e){let t=H.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let a;if(e.isReplacement){let i=t.width*t.height*H.replacement.print_per_m2+H.replacement.labor;a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:i}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let o=[];return e.express&&o.push("express"),k(a,e.qty,o)}var re={id:"roll-up",name:"Roll-up",async mount(e,t){let a=await fetch("categories/roll-up.html");e.innerHTML=await a.text();let o=e.querySelector("#rollUpType"),n=e.querySelector("#rollUpFormat"),i=e.querySelector("#rollUpQty"),l=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),p=e.querySelector("#rollUpResult"),m=()=>{let r={format:n.value,qty:parseInt(i.value)||1,isReplacement:o.value==="replacement",express:t.expressMode},s=oe(r);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(s.totalPrice/r.qty),e.querySelector("#resTotalPrice").textContent=f(s.totalPrice),e.querySelector("#resExpressHint").style.display=r.express?"block":"none",t.updateLastCalculated(s.totalPrice,"Roll-up"),{options:r,result:s}};l.addEventListener("click",()=>m()),c.addEventListener("click",()=>{let{options:r,result:s}=m();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${r.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${r.format}`,quantity:r.qty,unit:"szt",unitPrice:s.totalPrice/r.qty,isExpress:r.express,totalPrice:s.totalPrice,optionsHint:`${r.format}, ${r.qty} szt`,payload:r})}),m()}};async function Ce(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function L(e,t,a){return{id:e,name:t,mount:async(o,n)=>{o.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let i=await Ce(a);o.innerHTML=i,Me(o,n)}catch(i){o.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${i}</small>
          </div>
        `,console.error("Category load error:",i)}}}}function Me(e,t){e.querySelectorAll("button[data-action]").forEach(o=>{let n=o.getAttribute("data-action");n==="calculate"&&o.addEventListener("click",()=>{console.log("Calculate clicked")}),n==="add-to-basket"&&o.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var Pe=[{produkt:"A0+ 914\xD71292",jednostka:"1 szt",cena:26,baseWidth:914,baseLength:1292,typ:"cad_length"},{produkt:"A1+ 610\xD7914",jednostka:"1 szt",cena:18,baseWidth:610,baseLength:914,typ:"cad_length"},{produkt:"A2+ 450\xD7610",jednostka:"1 szt",cena:12,baseWidth:450,baseLength:610,typ:"cad_length"},{produkt:"MB 90cm",jednostka:"1 mb",cena:21,baseWidth:900,baseLength:1e3,typ:"cad_length"},{produkt:"MB 61cm",jednostka:"1 mb",cena:15,baseWidth:610,baseLength:1e3,typ:"cad_length"}],ne={id:"druk-cad",name:"\u{1F5FA}\uFE0F Druk CAD wielkoformatowy",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk CAD wielkoformatowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Druk techniczny na ploterze wielkoformatowym. Dostosuj d\u0142ugo\u015B\u0107 druku.
        </p>

        <div id="cad-products"></div>
      </div>
    `;let a=e.querySelector("#cad-products");a&&Pe.forEach((o,n)=>{let i=document.createElement("div");i.className="product-card",i.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>${o.produkt}</strong>
          <span style="color: #999;">${o.jednostka}</span>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label>D\u0142ugo\u015B\u0107 (mm):</label>
          <input
            type="number"
            id="clen-${n}"
            value="${o.baseLength}"
            min="${o.baseLength}"
            step="10"
          >
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #999;">Cena:</span>
            <strong id="price-${n}" style="font-size: 18px; color: #667eea; margin-left: 8px;">
              ${o.cena.toFixed(2)} z\u0142
            </strong>
          </div>
          <button class="btn-success" data-index="${n}">Dodaj do listy</button>
        </div>
      `,a.appendChild(i);let l=i.querySelector(`#clen-${n}`),c=i.querySelector(`#price-${n}`);l.addEventListener("input",()=>{let r=(parseFloat(l.value)||o.baseLength)/o.baseLength,s=o.cena*r;c&&(c.textContent=`${s.toFixed(2)} z\u0142`)}),i.querySelector(".btn-success")?.addEventListener("click",()=>{let m=parseFloat(l.value)||o.baseLength,r=m/o.baseLength,s=o.cena*r;t.addToBasket({category:"Druk CAD",price:s,description:`${o.produkt} - ${m}mm`}),alert(`\u2705 Dodano do listy: ${o.produkt} (${s.toFixed(2)} z\u0142)`)})})}};var le={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk A4/A3</h2>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilo\u015B\u0107 stron:</label>
          <input type="number" id="pages" value="1" min="1" max="1000">
        </div>

        <div class="form-group">
          <label>Kolor:</label>
          <select id="color">
            <option value="mono">Czarno-bia\u0142y (0.50 z\u0142/str)</option>
            <option value="color">Kolorowy (1.50 z\u0142/str)</option>
          </select>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena ca\u0142kowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 z\u0142</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="calculate" class="btn-primary" style="flex: 1;">Oblicz cen\u0119</button>
          <button id="addToBasket" class="btn-success" style="flex: 1;">Dodaj do listy</button>
        </div>
      </div>
    `;let a=0,o=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),i=e.querySelector("#total-price");o?.addEventListener("click",()=>{let l=e.querySelector("#format").value,c=parseInt(e.querySelector("#pages").value)||1,p=e.querySelector("#color").value,m=p==="mono"?.5:1.5,r=l==="A3"?1.5:1;a=c*m*r,i&&(i.textContent=`${a.toFixed(2)} z\u0142`),t.updateLastCalculated(a,`${l} ${p} - ${c} str.`)}),n?.addEventListener("click",()=>{if(a===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let l=e.querySelector("#format").value,c=e.querySelector("#pages").value,p=e.querySelector("#color").value;t.addToBasket({category:"Druk A4/A3",price:a,description:`Format: ${l}, Strony: ${c}, Kolor: ${p}`}),alert(`\u2705 Dodano do listy: ${a.toFixed(2)} z\u0142`)})}};var se=[B,R,$,_,U,N,Z,Y,te,ie,re,ne,le,L("druk-a4-a3-skan","\u{1F4C4} Druk A4/A3 + skan","druk-a4-a3-skan.html"),L("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),L("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),L("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var v=new C;function S(){let e=document.getElementById("basketList"),t=document.getElementById("basketTotal"),a=document.getElementById("basketDebug");if(!e||!t||!a)return;let o=v.getItems();o.length===0?e.innerHTML=`
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class="basketMeta">Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</div>
        </div>
        <div class="basketPrice">\u2014</div>
      </div>
    `:e.innerHTML=o.map((i,l)=>`
      <div class="basketItem">
        <div style="min-width:0;">
          <div class="basketTitle">${i.category}: ${i.name}</div>
          <div class="basketMeta">${i.optionsHint} (${i.quantity} ${i.unit})</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${f(i.totalPrice)}</div>
          <button class="iconBtn" onclick="window.removeItem(${l})" title="Usu\u0144">\xD7</button>
        </div>
      </div>
    `).join("");let n=v.getGrandTotal();t.innerText=f(n),a.innerText=JSON.stringify(o.map(i=>i.payload),null,2)}window.removeItem=e=>{v.removeItem(e),S()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),a=document.getElementById("categorySearch"),o=document.getElementById("globalExpress");if(!e||!t||!o||!a)return;let n=()=>({cart:{addItem:l=>{v.addItem(l),S()}},addToBasket:l=>{v.addItem({id:`item-${Date.now()}`,category:l.category,name:l.description||"Produkt",quantity:1,unit:"szt.",unitPrice:l.price,isExpress:o.checked,totalPrice:l.price,optionsHint:l.description||"",payload:l}),S()},expressMode:o.checked,updateLastCalculated:(l,c)=>{let p=document.getElementById("currentPrice"),m=document.getElementById("currentHint");p&&(p.innerText=f(l)),m&&(m.innerText=c?`(${c})`:"")}}),i=new T(e,n);i.setCategories(A),se.forEach(l=>{i.addRoute(l)}),A.forEach(l=>{let c=document.createElement("option");c.value=l.id,c.innerText=`${l.icon} ${l.name}`,l.implemented||(c.disabled=!0,c.innerText+=" (wkr\xF3tce)"),t.appendChild(c)}),t.addEventListener("change",()=>{let l=t.value;l?window.location.hash=`#/${l}`:window.location.hash="#/"}),a.addEventListener("input",()=>{let l=a.value.toLowerCase();Array.from(t.options).forEach((p,m)=>{if(m===0)return;let r=p.text.toLowerCase();p.hidden=!r.includes(l)})}),a.addEventListener("keydown",l=>{if(l.key==="Enter"){let c=a.value.toLowerCase(),p=Array.from(t.options).find((m,r)=>r>0&&!m.hidden&&!m.disabled);p&&(t.value=p.value,window.location.hash=`#/${p.value}`,a.value="")}}),window.addEventListener("hashchange",()=>{let c=(window.location.hash||"#/").slice(2);t.value=c}),o.addEventListener("change",()=>{let l=window.location.hash;window.location.hash="",window.location.hash=l}),document.getElementById("clearBtn")?.addEventListener("click",()=>{v.clear(),S()}),document.getElementById("sendBtn")?.addEventListener("click",()=>{let l={name:document.getElementById("custName").value||"Anonim",phone:document.getElementById("custPhone").value||"-",email:document.getElementById("custEmail").value||"-",priority:document.getElementById("custPriority").value};if(v.isEmpty()){alert("Lista jest pusta!");return}D(v.getItems(),l)}),S(),i.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
