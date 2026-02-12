var pe=Object.defineProperty;var de=(e,t)=>{for(var a in t)pe(e,a,{get:t[a],enumerable:!0})};var L=class{routes=new Map;currentView=null;container;getCtx;categories=[];constructor(t,a){this.container=t,this.getCtx=a,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(t.id,t)}handleRoute(){let a=(window.location.hash||"#/").slice(2);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="";let r=this.routes.get(a);if(r){this.currentView=r;let n=document.createElement("button");n.className="back-button",n.textContent="Wszystkie kategorie",n.onclick=()=>{window.location.hash="#/"},this.container.appendChild(n);let o=document.createElement("div");o.className="category-content",o.id="current-category",this.container.appendChild(o),r.mount(o,this.getCtx())}else this.renderHome()}renderHome(){this.container.innerHTML=`
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
    `}start(){this.handleRoute()}};function f(e){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(e)}var T=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,a)=>t+a.totalPrice,0)}isEmpty(){return this.items.length===0}};function B(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let a=e.map(m=>({Kategoria:m.category,Nazwa:m.name,Ilo\u015B\u0107:m.quantity,Jednostka:m.unit,"Cena jedn.":m.unitPrice,"Express (+20%)":m.isExpress?"TAK":"NIE","Cena ca\u0142kowita":m.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),r=XLSX.utils.json_to_sheet(a),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,r,"Zam\xF3wienie");let o=new Date().toISOString().slice(0,10),s=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${o}.xlsx`;XLSX.writeFile(n,s)}var D=[{id:"druk-a4-a3",name:"Druk A4/A3 + skan",icon:"\u{1F5A8}\uFE0F",implemented:!0,pricing:{print_bw:[{min:1,max:5,a4:.9,a3:1.7},{min:6,max:20,a4:.6,a3:1.1},{min:21,max:100,a4:.35,a3:.7},{min:101,max:500,a4:.3,a3:.6},{min:501,max:999,a4:.23,a3:.45},{min:1e3,max:4999,a4:.19,a3:.33},{min:5e3,max:null,a4:.15,a3:.3}],print_color:[{min:1,max:10,a4:2.4,a3:4.8},{min:11,max:40,a4:2.2,a3:4.2},{min:41,max:100,a4:2,a3:3.8},{min:101,max:250,a4:1.8,a3:3},{min:251,max:500,a4:1.6,a3:2.5},{min:501,max:999,a4:1.4,a3:1.9},{min:1e3,max:null,a4:1.1,a3:1.6}],scan_auto:[{min:1,max:9,price:1},{min:10,max:49,price:.5},{min:50,max:99,price:.4},{min:100,max:null,price:.25}],scan_manual:[{min:1,max:4,price:2},{min:5,max:null,price:1}],email_cost:1,surcharge_factor:.5}},{id:"druk-cad",name:"Druk CAD wielkoformatowy",icon:"\u{1F4D0}",implemented:!0,format_prices:{bw:{"A0+":{length:1292,price:12.5},A0:{length:1189,price:11},A1:{length:841,price:6},A2:{length:594,price:4},A3:{length:420,price:2.5}},color:{"A0+":{length:1292,price:26},A0:{length:1189,price:24},A1:{length:841,price:12},A2:{length:594,price:8.5},A3:{length:420,price:5.3}}},meter_prices:{bw:{"A0+":10,A0:9,A1:5,A2:4.5,A3:3.5},color:{"A0+":21,A0:20,A1:14.5,A2:13.9,A3:12}}},{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!0},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia-kreda",name:"Zaproszenia KREDA",icon:"\u2709\uFE0F",implemented:!0},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0},{id:"roll-up",name:"Roll-up",icon:"\u2195\uFE0F",implemented:!0},{id:"folia-szroniona",name:"Folia szroniona",icon:"\u2744\uFE0F",implemented:!0},{id:"laminowanie",name:"Laminowanie",icon:"\u2728",implemented:!0},{id:"cad-ops",name:"CAD: sk\u0142adanie / skan",icon:"\u{1F4CF}",implemented:!0}];var I={id:"sample",name:"Sample Category",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=e.querySelector("#addSampleBtn"),r=e.querySelector("#sampleQty");a?.addEventListener("click",()=>{let n=parseInt(r.value)||1,o=n*10;t.cart.addItem({categoryId:"sample",categoryName:"Sample Category",details:{qty:n},price:o}),alert(`Dodano do koszyka: ${n} szt. za ${f(o)}`)})},unmount:()=>{console.log("Unmounting sample category")}};function ye(e,t){let a=[...e].sort((o,s)=>o.min-s.min),r=a.find(o=>t>=o.min&&(o.max===null||t<=o.max));if(r)return r;let n=a.find(o=>o.min>=t);return n||a[a.length-1]}function fe(e,t){if(!t)return e;let a=t.find(r=>r.type==="minimum"&&r.unit==="m2");return a&&e<a.value?a.value:e}function b(e,t,a=[]){let r=fe(t,e.rules),n=ye(e.tiers,r),o=0;e.pricing==="per_unit"?o=r*n.price:o=n.price;let s=0,m=[];if(e.modifiers)for(let i of a){let l=e.modifiers.find(u=>u.id===i);l&&(m.push(l.name),l.type==="percent"?s+=o*l.value:l.type==="fixed_per_unit"?s+=l.value*r:s+=l.value)}let p=o+s,c=e.rules?.find(i=>i.type==="minimum"&&i.unit==="pln");return c&&p<c.value&&(p=c.value),{basePrice:o,effectiveQuantity:r,tierPrice:n.price,modifiersTotal:s,totalPrice:parseFloat(p.toFixed(2)),appliedModifiers:m}}var $={id:"solwent-plakaty-200g",title:"SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",unit:"m2",pricing:"per_unit",tiers:[{min:0,max:3,price:70},{min:3,max:9,price:65},{min:9,max:20,price:59},{min:20,max:40,price:53},{min:40,max:null,price:45}],rules:[{type:"minimum",unit:"m2",value:1}],modifiers:[{id:"EXPRESS",type:"percent",value:20}]};var R={id:"solwent-plakaty",name:"Solwent - Plakaty",mount:(e,t)=>{let a=$;e.innerHTML=`
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
    `;let r=e.querySelector("#plakatyQty"),n=e.querySelector("#plakatyExpress"),o=e.querySelector("#plakatyResult"),s=e.querySelector("#addPlakatyBtn");function m(){let p=parseFloat(r.value)||0,c=n.checked?["EXPRESS"]:[];try{let i=b(p,a,c);o.textContent=f(i.totalPrice)}catch{o.textContent="B\u0142\u0105d"}}r.addEventListener("input",m),n.addEventListener("change",m),s.addEventListener("click",()=>{let p=parseFloat(r.value)||0,c=n.checked?["EXPRESS"]:[],i=b(p,a,c);t.cart.addItem({categoryId:a.id,categoryName:a.title,details:{qty:`${p} m2`,express:n.checked},price:i.totalPrice})}),m()}};var C=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function ge(e,t){let a=C[0];for(let r of C)if(e>=r.qty)a=r;else break;return t?a.single:a.double}var _={id:"vouchery",name:"\u{1F39F}\uFE0F Vouchery",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=0,r=e.querySelector("#calculate"),n=e.querySelector("#addToBasket"),o=e.querySelector("#total-price"),s=e.querySelector("#price-breakdown");r?.addEventListener("click",()=>{let m=e.querySelector("#format").value,p=parseInt(e.querySelector("#quantity").value)||1,c=e.querySelector("#sides").value,i=e.querySelector("#paper").value,l=ge(p,c==="single");if(a=l*(i==="satin"?1.12:1),o&&(o.textContent=a.toFixed(2)+" z\u0142"),s){let d=C[0];for(let x of C)if(p>=x.qty)d=x;else break;s.textContent="Podstawa: "+l.toFixed(2)+" z\u0142 za "+p+" szt (przedzia\u0142: "+d.qty+"+ szt)"}t.updateLastCalculated(a,"Vouchery "+m+" "+(c==="single"?"jednostronne":"dwustronne")+" - "+p+" szt")}),n?.addEventListener("click",()=>{if(a===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let m=e.querySelector("#format").value,p=e.querySelector("#quantity").value,c=e.querySelector("#sides").value,i=e.querySelector("#paper").value;t.addToBasket({category:"Vouchery",price:a,description:m+" "+(c==="single"?"jednostronne":"dwustronne")+", "+p+" szt, "+(i==="satin"?"satyna":"standard")}),alert("\u2705 Dodano: "+a.toFixed(2)+" z\u0142")})}};var h={name:"DYPLOMY - druk cyfrowy",modifiers:{satin:.12,express:.2,bulkDiscount:.12,bulkDiscountThreshold:6},formats:{DL:{name:"DL (99x210mm)",single:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120},double:{"1":20,"2":30,"3":32,"4":34,"5":35,"6":35,"7":36,"8":37,"9":39,"10":40,"15":45,"20":49,"30":58,"40":65,"50":75,"100":120}}}};function j(e){let{qty:t,sides:a,isSatin:r,express:n}=e,m=h.formats.DL[a===1?"single":"double"],p=Object.keys(m).map(Number).sort((y,g)=>y-g),c=p[0];for(let y of p)t>=y&&(c=y);let i=m[c.toString()],l=[];t>=h.modifiers.bulkDiscountThreshold&&l.push({id:"bulk-discount",name:`Rabat -${h.modifiers.bulkDiscount*100}% (od ${h.modifiers.bulkDiscountThreshold} szt)`,type:"percentage",value:-h.modifiers.bulkDiscount}),r&&l.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:h.modifiers.satin}),n&&l.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:h.modifiers.express});let u=0,d=[];for(let y of l)(y.type==="percent"||y.type==="percentage")&&(u+=i*y.value,d.push(y.name));let x=i+u;return{basePrice:i,effectiveQuantity:t,tierPrice:i/t,modifiersTotal:u,totalPrice:Math.round(x*100)/100,appliedModifiers:d}}var O={id:"dyplomy",name:"Dyplomy",async mount(e,t){let a=await fetch("categories/dyplomy.html");e.innerHTML=await a.text();let r=e.querySelector("#dypSides"),n=e.querySelector("#dypQty"),o=e.querySelector("#dypSatin"),s=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),p=e.querySelector("#dypResult"),c=()=>{let i={qty:parseInt(n.value)||1,sides:parseInt(r.value)||1,isSatin:o.checked,express:t.expressMode},l=j(i);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(l.totalPrice/i.qty),e.querySelector("#resTotalPrice").textContent=f(l.totalPrice),e.querySelector("#resDiscountHint").style.display=l.appliedModifiers.includes("bulk-discount")?"block":"none",e.querySelector("#resExpressHint").style.display=i.express?"block":"none",e.querySelector("#resSatinHint").style.display=i.isSatin?"block":"none",t.updateLastCalculated(l.totalPrice,"Dyplomy"),{options:i,result:l}};s.addEventListener("click",()=>c()),m.addEventListener("click",()=>{let{options:i,result:l}=c();t.cart.addItem({id:`dyp-${Date.now()}`,category:"Dyplomy",name:`Dyplomy DL ${i.sides===1?"1-str":"2-str"}`,quantity:i.qty,unit:"szt",unitPrice:l.totalPrice/i.qty,isExpress:i.express,totalPrice:l.totalPrice,optionsHint:`${i.qty} szt, ${i.isSatin?"Satyna":"Kreda"}`,payload:i})}),c()}};function V(e,t){let a=Object.keys(e||{}).map(Number).filter(Number.isFinite).sort((n,o)=>n-o);if(!a.length)return null;let r=a.find(n=>t<=n);return r??null}var q={cyfrowe:{standardPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:146,500:170,1e3:290},lam:{50:160,100:170,150:180,200:190,250:200,300:220,400:240,500:250,1e3:335}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:180,150:190,200:200,250:210,300:230,400:250,500:260,1e3:345}}},softtouchPrices:{"85x55":{noLam:{50:65,100:75,150:85,200:96,250:110,300:126,400:145,500:170,1e3:290},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:380}},"90x50":{noLam:{50:70,100:79,150:89,200:99,250:120,300:129,400:149,500:175,1e3:300},lam:{50:170,100:190,150:210,200:220,250:230,300:240,400:260,500:270,1e3:390}}},deluxe:{leadTime:"4\u20135 dni roboczych",options:{uv3d_softtouch:{label:"Maker UV 3D + folia SOFTTOUCH",prices:{50:280,100:320,200:395,250:479,400:655,500:778}},uv3d_gold_softtouch:{label:"Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",prices:{50:450,100:550,200:650,250:720,400:850,500:905}}}}}};function F(e){let t;e.family==="deluxe"?t=q.cyfrowe.deluxe.options[e.deluxeOpt].prices:t=(e.finish==="softtouch"?q.cyfrowe.softtouchPrices:q.cyfrowe.standardPrices)[e.size][e.lam];let a=V(t,e.qty);if(a==null)throw new Error("Brak progu cenowego dla takiej ilo\u015Bci.");let r=t[a];return{qtyBilled:a,total:r}}function U(e){let t=e.family||"standard",a=e.format||"85x55",r=e.folia==="none"?"noLam":"lam",n=e.finish||"mat",o=F({family:t,size:a,lam:r,finish:n,deluxeOpt:e.deluxeOpt,qty:e.qty}),s=o.total;return e.express&&(s=o.total*1.2),{totalPrice:parseFloat(s.toFixed(2)),basePrice:o.total,effectiveQuantity:e.qty,tierPrice:o.total/o.qtyBilled,modifiersTotal:e.express?o.total*.2:0,appliedModifiers:e.express?["TRYB EXPRESS"]:[],qtyBilled:o.qtyBilled}}var N={id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",mount(e,t){e.innerHTML=`
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
    `,this.initLogic(e,t)},initLogic(e,t){let a=e.querySelector("#w-family"),r=e.querySelector("#standard-options"),n=e.querySelector("#deluxe-options"),o=e.querySelector("#w-finish"),s=e.querySelector("#w-size"),m=e.querySelector("#w-lam"),p=e.querySelector("#w-deluxe-opt"),c=e.querySelector("#w-qty"),i=e.querySelector("#w-calculate"),l=e.querySelector("#w-add-to-cart"),u=e.querySelector("#w-result-display"),d=e.querySelector("#w-total-price"),x=e.querySelector("#w-billed-qty-hint"),y=e.querySelector("#w-express-hint");a.onchange=()=>{let w=a.value==="deluxe";r.style.display=w?"none":"block",n.style.display=w?"block":"none"};let g=null,k=null;i.onclick=()=>{k={family:a.value,finish:o.value,format:s.value,folia:m.value==="lam"?"matt_gloss":"none",deluxeOpt:p.value,qty:parseInt(c.value),express:t.expressMode};try{let w=U(k);g=w,d.innerText=f(w.totalPrice),x.innerText=`Rozliczono za: ${w.qtyBilled} szt.`,y.style.display=t.expressMode?"block":"none",u.style.display="block",l.disabled=!1,t.updateLastCalculated(w.totalPrice,"Wizyt\xF3wki")}catch(w){alert("B\u0142\u0105d: "+w.message)}},l.onclick=()=>{if(g&&k){let w=k.family==="deluxe"?"Wizyt\xF3wki DELUXE":"Wizyt\xF3wki Standard",A=k.express?", EXPRESS":"";t.cart.addItem({id:`wizytowki-${Date.now()}`,category:"Wizyt\xF3wki",name:w,quantity:g.qtyBilled,unit:"szt",unitPrice:g.totalPrice/g.qtyBilled,isExpress:k.express,totalPrice:g.totalPrice,optionsHint:`${k.qty} szt (rozliczono ${g.qtyBilled})${A}`,payload:g})}}}};var M={name:"Zaproszenia KREDA - druk cyfrowy",modifiers:{satin:.12,express:.2},formats:{A6:{name:"A6 (105x148mm)",single:{normal:{"10":30,"24":40,"32":45,"50":50,"75":60,"100":68,"150":79},folded:{"10":45,"24":55,"32":60,"50":71,"75":84,"100":99,"150":126}},double:{normal:{"10":35,"24":46,"32":57,"50":66,"75":79,"100":89,"150":115},folded:{"10":58,"24":66,"32":84,"50":105,"75":125,"100":149,"150":199}}},A5:{name:"A5 (148x210mm)",single:{normal:{"10":34,"24":42,"32":48,"50":55,"75":63,"100":79,"150":110},folded:{"10":55,"24":60,"32":75,"50":95,"75":125,"100":150,"150":199}},double:{normal:{"10":40,"24":49,"32":62,"50":79,"75":96,"100":119,"150":169},folded:{"10":65,"24":80,"32":115,"50":149,"75":190,"100":235,"150":325}}},DL:{name:"DL (99x210mm)",single:{normal:{"10":35,"24":50,"32":53,"50":59,"75":70,"100":81,"150":105},folded:{"10":45,"24":55,"32":63,"50":79,"75":97,"100":115,"150":149}},double:{normal:{"10":41,"24":55,"32":64,"50":74,"75":88,"100":105,"150":135},folded:{"10":65,"24":80,"32":90,"50":115,"75":150,"100":185,"150":245}}}}};function W(e){let{format:t,qty:a,sides:r,isFolded:n,isSatin:o,express:s}=e,m=M.formats[t];if(!m)throw new Error(`Invalid format: ${t}`);let p=r===1?"single":"double",c=n?"folded":"normal",i=m[p][c],l=Object.keys(i).map(Number).sort((w,A)=>w-A),u=l[0];for(let w of l)a>=w&&(u=w);let d=i[u.toString()],x=[];o&&x.push({id:"satin",name:"Papier satynowy (+12%)",type:"percentage",value:M.modifiers.satin}),s&&x.push({id:"express",name:"EXPRESS (+20%)",type:"percentage",value:M.modifiers.express});let y=0,g=[];for(let w of x)(w.type==="percent"||w.type==="percentage")&&(y+=d*w.value,g.push(w.name));let k=d+y;return{basePrice:d,effectiveQuantity:a,tierPrice:d/a,modifiersTotal:y,totalPrice:Math.round(k*100)/100,appliedModifiers:g}}var X={id:"zaproszenia-kreda",name:"Zaproszenia KREDA",async mount(e,t){let a=await fetch("categories/zaproszenia-kreda.html");e.innerHTML=await a.text();let r=e.querySelector("#zapFormat"),n=e.querySelector("#zapSides"),o=e.querySelector("#zapFolded"),s=e.querySelector("#zapQty"),m=e.querySelector("#zapSatin"),p=e.querySelector("#calcBtn"),c=e.querySelector("#addToCartBtn"),i=e.querySelector("#zapResult"),l=()=>{let u={format:r.value,qty:parseInt(s.value)||10,sides:parseInt(n.value)||1,isFolded:o.checked,isSatin:m.checked,express:t.expressMode},d=W(u);return i.style.display="block",e.querySelector("#resUnitPrice").textContent=f(d.totalPrice/u.qty),e.querySelector("#resTotalPrice").textContent=f(d.totalPrice),e.querySelector("#resExpressHint").style.display=u.express?"block":"none",e.querySelector("#resSatinHint").style.display=u.isSatin?"block":"none",t.updateLastCalculated(d.totalPrice,"Zaproszenia"),{options:u,result:d}};p.addEventListener("click",()=>l()),c.addEventListener("click",()=>{let{options:u,result:d}=l();t.cart.addItem({id:`zap-${Date.now()}`,category:"Zaproszenia Kreda",name:`Zaproszenia ${u.format} ${u.sides===1?"1-str":"2-str"}${u.isFolded?" sk\u0142adane":""}`,quantity:u.qty,unit:"szt",unitPrice:d.totalPrice/u.qty,isExpress:u.express,totalPrice:d.totalPrice,optionsHint:`${u.qty} szt, ${u.isSatin?"Satyna":"Kreda"}`,payload:u})}),l()}};var K={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function ve(e){let t=K.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Q(e){let t=ve(e.format),a=[];return e.express&&a.push("express"),b(t,e.qty,a)}var J={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#u-format"),r=e.querySelector("#u-qty"),n=e.querySelector("#u-calculate"),o=e.querySelector("#u-add-to-cart"),s=e.querySelector("#u-result-display"),m=e.querySelector("#u-total-price"),p=e.querySelector("#u-express-hint"),c=null,i=null;n.onclick=()=>{i={format:a.value,qty:parseInt(r.value),express:t.expressMode};try{let l=Q(i);c=l,m.innerText=f(l.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),s.style.display="block",o.disabled=!1,t.updateLastCalculated(l.totalPrice,"Ulotki")}catch(l){alert("B\u0142\u0105d: "+l.message)}},o.onclick=()=>{if(c&&i){let l=i.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:c.totalPrice/i.qty,isExpress:i.express,totalPrice:c.totalPrice,optionsHint:`${i.qty} szt, Dwustronne${l}`,payload:c})}}}};var Z={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function Ee(e){let t=Z.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function Y(e){let t=Ee(e.format),a=[];return e.express&&a.push("express"),b(t,e.qty,a)}var G={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let a=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#uj-format"),r=e.querySelector("#uj-qty"),n=e.querySelector("#uj-calculate"),o=e.querySelector("#uj-add-to-cart"),s=e.querySelector("#uj-result-display"),m=e.querySelector("#uj-total-price"),p=e.querySelector("#uj-express-hint"),c=null,i=null;n.onclick=()=>{i={format:a.value,qty:parseInt(r.value),express:t.expressMode};try{let l=Y(i);c=l,m.innerText=f(l.totalPrice),p&&(p.style.display=t.expressMode?"block":"none"),s.style.display="block",o.disabled=!1,t.updateLastCalculated(l.totalPrice,"Ulotki")}catch(l){alert("B\u0142\u0105d: "+l.message)}},o.onclick=()=>{if(c&&i){let l=i.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:c.totalPrice/i.qty,isExpress:i.express,totalPrice:c.totalPrice,optionsHint:`${i.qty} szt, Jednostronne${l}`,payload:c})}}}};var ee={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function te(e){let t=ee,a=t.materials.find(o=>o.id===e.material);if(!a)throw new Error(`Unknown material: ${e.material}`);let r={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:a.tiers,modifiers:t.modifiers},n=[];return e.oczkowanie&&n.push("oczkowanie"),e.express&&n.push("express"),b(r,e.areaM2,n)}var ae={id:"banner",name:"Bannery",async mount(e,t){try{let a=await fetch("categories/banner.html");if(!a.ok)throw new Error("Failed to load template");e.innerHTML=await a.text(),this.initLogic(e,t)}catch(a){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${a}</div>`}},initLogic(e,t){let a=e.querySelector("#b-material"),r=e.querySelector("#b-area"),n=e.querySelector("#b-oczkowanie"),o=e.querySelector("#b-calculate"),s=e.querySelector("#b-add-to-cart"),m=e.querySelector("#b-result-display"),p=e.querySelector("#b-unit-price"),c=e.querySelector("#b-total-price"),i=e.querySelector("#b-express-hint"),l=null,u=null;o.onclick=()=>{u={material:a.value,areaM2:parseFloat(r.value),oczkowanie:n.checked,express:t.expressMode};try{let d=te(u);l=d,p.innerText=f(d.tierPrice),c.innerText=f(d.totalPrice),i&&(i.style.display=t.expressMode?"block":"none"),m.style.display="block",s.disabled=!1,t.updateLastCalculated(d.totalPrice,"Banner")}catch(d){alert("B\u0142\u0105d: "+d.message)}},s.onclick=()=>{if(l&&u){let d=a.options[a.selectedIndex].text,x=[`${u.areaM2} m2`,u.oczkowanie?"z oczkowaniem":"bez oczkowania",u.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:d,quantity:u.areaM2,unit:"m2",unitPrice:l.tierPrice,isExpress:u.express,totalPrice:l.totalPrice,optionsHint:x,payload:l})}}}};var E={};de(E,{category:()=>Le,default:()=>qe,groups:()=>Te,modifiers:()=>Ce});var Le="Wlepki / Naklejki",Te=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],Ce=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],qe={category:Le,groups:Te,modifiers:Ce};function re(e){let t=E,a=t.groups.find(o=>o.id===e.groupId);if(!a)throw new Error(`Unknown group: ${e.groupId}`);let r={id:"wlepki",title:a.title,unit:a.unit,pricing:a.pricing||"per_unit",tiers:a.tiers,modifiers:t.modifiers,rules:a.rules||[{type:"minimum",unit:"m2",value:1}]},n=[...e.modifiers];return e.express&&n.push("express"),b(r,e.area,n)}var ie={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let a=E;try{let d=await fetch("categories/wlepki-naklejki.html");if(!d.ok)throw new Error("Failed to load template");e.innerHTML=await d.text()}catch(d){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${d}</div>`;return}let r=e.querySelector("#wlepki-group"),n=e.querySelector("#wlepki-area"),o=e.querySelector("#btn-calculate"),s=e.querySelector("#btn-add-to-cart"),m=e.querySelector("#wlepki-result"),p=e.querySelector("#unit-price"),c=e.querySelector("#total-price"),i=null,l=null,u=()=>{let d=e.querySelectorAll(".wlepki-mod:checked"),x=Array.from(d).map(y=>y.value);l={groupId:r.value,area:parseFloat(n.value)||0,express:t.expressMode,modifiers:x};try{let y=re(l);i=y,p.textContent=f(y.tierPrice),c.textContent=f(y.totalPrice),m.style.display="block",s.disabled=!1,t.updateLastCalculated(y.totalPrice,"Wlepki")}catch(y){alert("B\u0142\u0105d: "+y.message)}};o.addEventListener("click",u),s.addEventListener("click",()=>{if(!i||!l)return;let d=a.groups.find(y=>y.id===l.groupId),x=l.modifiers.map(y=>{let g=a.modifiers.find(k=>k.id===y);return g?g.name:y});l.express&&x.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:d?.title||"Wlepki",quantity:l.area,unit:"m2",unitPrice:i.tierPrice,isExpress:!!l.express,totalPrice:i.totalPrice,optionsHint:x.join(", ")||"Standard",payload:i})})}};var z={name:"Roll-up Jednostronny",formats:{"85x200":{width:.85,height:2,tiers:[{min:1,max:5,price:290},{min:6,max:10,price:275}]},"100x200":{width:1,height:2,tiers:[{min:1,max:5,price:305},{min:6,max:10,price:285}]},"120x200":{width:1.2,height:2,tiers:[{min:1,max:5,price:330},{min:6,max:10,price:310}]},"150x200":{width:1.5,height:2,tiers:[{min:1,max:5,price:440},{min:6,max:10,price:425}]}},replacement:{labor:50,print_per_m2:80}};function oe(e){let t=z.formats[e.format];if(!t)throw new Error(`Unknown format: ${e.format}`);let a;if(e.isReplacement){let o=t.width*t.height*z.replacement.print_per_m2+z.replacement.labor;a={id:"roll-up-replacement",title:`Wymiana wk\u0142adu (${e.format})`,unit:"szt",pricing:"per_unit",tiers:[{min:1,max:null,price:o}],modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]}}else a={id:"roll-up-full",title:`Roll-up Komplet (${e.format})`,unit:"szt",pricing:"per_unit",tiers:t.tiers,modifiers:[{id:"express",name:"EXPRESS",type:"percent",value:.2}]};let r=[];return e.express&&r.push("express"),b(a,e.qty,r)}var ne={id:"roll-up",name:"Roll-up",async mount(e,t){let a=await fetch("categories/roll-up.html");e.innerHTML=await a.text();let r=e.querySelector("#rollUpType"),n=e.querySelector("#rollUpFormat"),o=e.querySelector("#rollUpQty"),s=e.querySelector("#calcBtn"),m=e.querySelector("#addToCartBtn"),p=e.querySelector("#rollUpResult"),c=()=>{let i={format:n.value,qty:parseInt(o.value)||1,isReplacement:r.value==="replacement",express:t.expressMode},l=oe(i);return p.style.display="block",e.querySelector("#resUnitPrice").textContent=f(l.totalPrice/i.qty),e.querySelector("#resTotalPrice").textContent=f(l.totalPrice),e.querySelector("#resExpressHint").style.display=i.express?"block":"none",t.updateLastCalculated(l.totalPrice,"Roll-up"),{options:i,result:l}};s.addEventListener("click",()=>c()),m.addEventListener("click",()=>{let{options:i,result:l}=c();t.cart.addItem({id:`rollup-${Date.now()}`,category:"Roll-up",name:`${i.isReplacement?"Wymiana wk\u0142adu":"Roll-up Komplet"} ${i.format}`,quantity:i.qty,unit:"szt",unitPrice:l.totalPrice/i.qty,isExpress:i.express,totalPrice:l.totalPrice,optionsHint:`${i.format}, ${i.qty} szt`,payload:i})}),c()}};async function Pe(e){let t=await fetch(`./categories/${e}`);if(!t.ok)throw new Error(`Failed to load ${e}`);return t.text()}function H(e,t,a){return{id:e,name:t,mount:async(r,n)=>{r.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">\u23F3 \u0141adowanie kategorii...</div>';try{let o=await Pe(a);r.innerHTML=o,ze(r,n)}catch(o){r.innerHTML=`
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            \u274C B\u0142\u0105d \u0142adowania kategorii: ${t}
            <br><small>${o}</small>
          </div>
        `,console.error("Category load error:",o)}}}}function ze(e,t){e.querySelectorAll("button[data-action]").forEach(r=>{let n=r.getAttribute("data-action");n==="calculate"&&r.addEventListener("click",()=>{console.log("Calculate clicked")}),n==="add-to-basket"&&r.addEventListener("click",()=>{t.addToBasket({category:e.getAttribute("data-category-id")||"unknown",price:parseFloat(e.getAttribute("data-price")||"0"),description:e.getAttribute("data-description")||""})})})}var He=[{produkt:"A0+ 914\xD71292",jednostka:"1 szt",cena:26,baseWidth:914,baseLength:1292,typ:"cad_length"},{produkt:"A1+ 610\xD7914",jednostka:"1 szt",cena:18,baseWidth:610,baseLength:914,typ:"cad_length"},{produkt:"A2+ 450\xD7610",jednostka:"1 szt",cena:12,baseWidth:450,baseLength:610,typ:"cad_length"},{produkt:"MB 90cm",jednostka:"1 mb",cena:21,baseWidth:900,baseLength:1e3,typ:"cad_length"},{produkt:"MB 61cm",jednostka:"1 mb",cena:15,baseWidth:610,baseLength:1e3,typ:"cad_length"}],le={id:"druk-cad",name:"\u{1F5FA}\uFE0F Druk CAD wielkoformatowy",mount:(e,t)=>{e.innerHTML=`
      <div class="category-form">
        <h2>Druk CAD wielkoformatowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Druk techniczny na ploterze wielkoformatowym. Dostosuj d\u0142ugo\u015B\u0107 druku.
        </p>

        <div id="cad-products"></div>
      </div>
    `;let a=e.querySelector("#cad-products");a&&He.forEach((r,n)=>{let o=document.createElement("div");o.className="product-card",o.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>${r.produkt}</strong>
          <span style="color: #999;">${r.jednostka}</span>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label>D\u0142ugo\u015B\u0107 (mm):</label>
          <input
            type="number"
            id="clen-${n}"
            value="${r.baseLength}"
            min="${r.baseLength}"
            step="10"
          >
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #999;">Cena:</span>
            <strong id="price-${n}" style="font-size: 18px; color: #667eea; margin-left: 8px;">
              ${r.cena.toFixed(2)} z\u0142
            </strong>
          </div>
          <button class="btn-success" data-index="${n}">Dodaj do listy</button>
        </div>
      `,a.appendChild(o);let s=o.querySelector(`#clen-${n}`),m=o.querySelector(`#price-${n}`);s.addEventListener("input",()=>{let c=parseFloat(s.value)||r.baseLength,i=c/r.baseLength,l=r.cena*i;m&&(m.textContent=`${l.toFixed(2)} z\u0142`),t.updateLastCalculated(l,`${r.produkt} - ${c}mm`)}),o.querySelector(".btn-success")?.addEventListener("click",()=>{let c=parseFloat(s.value)||r.baseLength,i=c/r.baseLength,l=r.cena*i;t.addToBasket({category:"Druk CAD",price:l,description:`${r.produkt} - ${c}mm`}),alert(`\u2705 Dodano do listy: ${r.produkt} (${l.toFixed(2)} z\u0142)`)})})}};var se={czarnoBialy:{A4:[{min:1,max:5,price:.9},{min:6,max:20,price:.6},{min:21,max:100,price:.35},{min:101,max:500,price:.3},{min:501,max:999,price:.23},{min:1e3,max:4999,price:.19},{min:5e3,max:99999,price:.15}],A3:[{min:1,max:5,price:1.7},{min:6,max:20,price:1.1},{min:21,max:100,price:.7},{min:101,max:500,price:.6},{min:501,max:999,price:.45},{min:1e3,max:99999,price:.33}]},kolorowy:{A4:[{min:1,max:10,price:2.4},{min:11,max:40,price:2.2},{min:41,max:100,price:2},{min:101,max:250,price:1.8},{min:251,max:500,price:1.6},{min:501,max:999,price:1.4},{min:1e3,max:99999,price:1.1}],A3:[{min:1,max:10,price:4.8},{min:11,max:40,price:4.2},{min:41,max:100,price:3.8},{min:101,max:250,price:3},{min:251,max:500,price:2.5},{min:501,max:999,price:1.9},{min:1e3,max:99999,price:1.6}]}};function Ae(e,t,a){let r=se[a][e];for(let n of r)if(t>=n.min&&t<=n.max)return n.price;return r[r.length-1].price}var ce={id:"druk-a4-a3",name:"\u{1F4C4} Druk A4/A3 + skan",mount:(e,t)=>{e.innerHTML=`
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
    `;let a=0,r=0,n=e.querySelector("#format"),o=e.querySelector("#quantity"),s=e.querySelector("#color"),m=e.querySelector("#calculate"),p=e.querySelector("#addToBasket"),c=e.querySelector("#tiers-list"),i=e.querySelector("#price-per-page"),l=e.querySelector("#total-price"),u=e.querySelector("#price-breakdown");function d(){let x=n.value,y=s.value,g=se[y][x];c&&(c.innerHTML=g.map(k=>`<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${k.max>=99999?`${k.min}+ str`:`${k.min}-${k.max} str`}</span>
            <span style="color: #667eea;">${k.price.toFixed(2)} z\u0142/str</span>
          </div>`).join(""))}n.addEventListener("change",d),s.addEventListener("change",d),d(),m?.addEventListener("click",()=>{let x=n.value,y=parseInt(o.value)||1,g=s.value;if(r=Ae(x,y,g),a=r*y,i&&(i.textContent=`${r.toFixed(2)} z\u0142/str`),l&&(l.textContent=`${a.toFixed(2)} z\u0142`),u){let k=g==="czarnoBialy"?"Czarno-bia\u0142y":"Kolorowy";u.textContent=`${k}, ${x}, ${y} str \xD7 ${r.toFixed(2)} z\u0142 = ${a.toFixed(2)} z\u0142`}t.updateLastCalculated(a,`Druk ${x} ${g==="czarnoBialy"?"CZ-B":"KOLOR"} - ${y} str`)}),p?.addEventListener("click",()=>{if(a===0){alert("\u26A0\uFE0F Najpierw oblicz cen\u0119!");return}let x=n.value,y=o.value,g=s.value==="czarnoBialy"?"CZ-B":"KOLOR";t.addToBasket({category:"Druk A4/A3",price:a,description:`${x}, ${y} str, ${g} (${r.toFixed(2)} z\u0142/str)`}),alert(`\u2705 Dodano: ${a.toFixed(2)} z\u0142`)})}};var me=[I,R,_,O,N,X,J,G,ae,ie,ne,le,ce,H("cad-ops","\u{1F5FA}\uFE0F CAD OPS","cad-ops.html"),H("folia-szroniona","\u2728 Folia Szroniona","folia-szroniona.html"),H("laminowanie","\u{1F512} Laminowanie","laminowanie.html")];var v=new T;function S(){let e=document.getElementById("basket-items"),t=document.getElementById("basket-total"),a=document.getElementById("json-preview");if(!e||!t||!a)return;let r=v.getItems();if(r.length===0)e.innerHTML=`
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</small>
      </p>
    `,t.textContent="0,00 z\u0142";else{e.innerHTML=r.map((o,s)=>`
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
            <strong style="color: #667eea; font-size: 14px;">${f(o.totalPrice)}</strong>
            <button onclick="window.removeItem(${s})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">\u2715 usu\u0144</button>
          </div>
        </div>
      </div>
    `).join("");let n=v.getGrandTotal();t.innerText=f(n)}a.innerText=JSON.stringify(r.map(n=>n.payload),null,2)}window.removeItem=e=>{v.removeItem(e),S()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),a=document.getElementById("categorySearch"),r=document.getElementById("tryb-express");if(!e||!t||!r||!a)return;let n=()=>({cart:{addItem:s=>{v.addItem(s),S()}},addToBasket:s=>{v.addItem({id:`item-${Date.now()}`,category:s.category,name:s.description||"Produkt",quantity:1,unit:"szt.",unitPrice:s.price,isExpress:r.checked,totalPrice:s.price,optionsHint:s.description||"",payload:s}),S()},expressMode:r.checked,updateLastCalculated:(s,m)=>{let p=document.getElementById("last-calculated"),c=document.getElementById("currentHint");p&&(p.innerText=f(s)),c&&(c.innerText=m?`(${m})`:"")}}),o=new L(e,n);o.setCategories(D),me.forEach(s=>{o.addRoute(s)}),D.forEach(s=>{let m=document.createElement("option");m.value=s.id,m.innerText=`${s.icon} ${s.name}`,s.implemented||(m.disabled=!0,m.innerText+=" (wkr\xF3tce)"),t.appendChild(m)}),t.addEventListener("change",()=>{let s=t.value;s?window.location.hash=`#/${s}`:window.location.hash="#/"}),a.addEventListener("input",()=>{let s=a.value.toLowerCase();Array.from(t.options).forEach((p,c)=>{if(c===0)return;let i=p.text.toLowerCase();p.hidden=!i.includes(s)})}),a.addEventListener("keydown",s=>{if(s.key==="Enter"){let m=a.value.toLowerCase(),p=Array.from(t.options).find((c,i)=>i>0&&!c.hidden&&!c.disabled);p&&(t.value=p.value,window.location.hash=`#/${p.value}`,a.value="")}}),window.addEventListener("hashchange",()=>{let m=(window.location.hash||"#/").slice(2);t.value=m}),r.addEventListener("change",()=>{let s=window.location.hash;window.location.hash="",window.location.hash=s}),document.getElementById("clear-basket")?.addEventListener("click",()=>{v.clear(),S()}),document.getElementById("export-excel")?.addEventListener("click",()=>{let s={name:document.getElementById("client-name").value||"Anonim",phone:document.getElementById("client-phone").value||"-",email:document.getElementById("client-email").value||"-",priority:document.getElementById("priority").value};if(v.isEmpty()){alert("Lista jest pusta!");return}B(v.getItems(),s)}),document.getElementById("copy-json")?.addEventListener("click",()=>{let s=v.getItems(),m=JSON.stringify(s.map(p=>p.payload),null,2);navigator.clipboard.writeText(m).then(()=>{alert("JSON skopiowany do schowka!")})}),S(),o.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
//# sourceMappingURL=app.js.map
