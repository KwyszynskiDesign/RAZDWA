var K=Object.defineProperty;var M=(e,t)=>{for(var i in t)K(e,i,{get:t[i],enumerable:!0})};var h=class{routes=new Map;container;ctxProvider;currentView=null;categories=[];constructor(t,i){this.container=t,this.ctxProvider=i,window.addEventListener("hashchange",()=>this.handleRoute())}setCategories(t){this.categories=t}addRoute(t){this.routes.set(`/${t.id}`,t)}start(){this.handleRoute()}handleRoute(){let i=(window.location.hash||"#/").slice(1)||"/",n=this.routes.get(i);this.currentView&&this.currentView.unmount&&this.currentView.unmount(),this.container.innerHTML="",n?(this.currentView=n,n.mount(this.container,this.ctxProvider())):i==="/"?(this.renderCategoryGrid(),this.currentView=null):(this.container.innerHTML="<h2>404 - Nie znaleziono strony</h2>",this.currentView=null)}renderCategoryGrid(){this.container.innerHTML=`
      <h2>Wybierz kategori\u0119</h2>
      <div class="category-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
        ${this.categories.map(i=>`
          <a href="#/${i.id}" class="category-card" style="
            text-decoration: none;
            color: inherit;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            gap: 12px;
            ${i.implemented?"":"opacity: 0.5; pointer-events: none;"}
          ">
            <span style="font-size: 32px;">${i.icon}</span>
            <span style="font-weight: 800;">${i.name}</span>
            ${i.implemented?"":'<span style="font-size: 11px; font-weight: 400; opacity: 0.7;">Wkr\xF3tce...</span>'}
          </a>
        `).join("")}
      </div>
    `,this.container.querySelectorAll(".category-card").forEach(i=>{i.onmouseenter=()=>{i.style.background="rgba(255, 255, 255, 0.1)",i.style.borderColor="var(--primary)",i.style.transform="translateY(-2px)"},i.onmouseleave=()=>{i.style.background="rgba(255, 255, 255, 0.05)",i.style.borderColor="rgba(255, 255, 255, 0.1)",i.style.transform="translateY(0)"}})}};function Q(e,t){let i=e.find(n=>t>=n.min&&(n.max===null||t<=n.max));return i||e[e.length-1]}function Z(e,t){if(!t)return e;let i=t.find(n=>n.type==="minimum"&&n.unit==="m2");return i&&e<i.value?i.value:e}function x(e,t,i=[]){let n=Z(t,e.rules),c=Q(e.tiers,n),a=0;e.pricing==="per_unit"?a=n*c.price:a=c.price;let o=0,l=[];if(e.modifiers)for(let s of i){let r=e.modifiers.find(m=>m.id===s);r&&(l.push(r.name),r.type==="percent"?o+=a*r.value:r.type==="fixed_per_unit"?o+=r.value*n:o+=r.value)}let d=a+o,p=e.rules?.find(s=>s.type==="minimum"&&s.unit==="pln");return p&&d<p.value&&(d=p.value),{basePrice:a,effectiveQuantity:n,tierPrice:c.price,modifiersTotal:o,totalPrice:parseFloat(d.toFixed(2)),appliedModifiers:l}}var g={};M(g,{default:()=>oe,id:()=>G,materials:()=>ne,modifiers:()=>ae,pricing:()=>ie,rules:()=>re,title:()=>ee,unit:()=>te});var G="solwent-plakaty",ee="SOLWENT - PLAKATY",te="m2",ie="per_unit",re=[{type:"minimum",unit:"m2",value:1}],ae=[{id:"express",name:"EXPRESS",type:"percent",value:.2}],ne=[{name:"Papier 150g p\xF3\u0142mat",tiers:[{min:1,max:3,price:65},{min:4,max:9,price:60},{min:10,max:20,price:55},{min:21,max:40,price:50},{min:41,max:null,price:42}]},{name:"Papier 200g po\u0142ysk",tiers:[{min:1,max:3,price:70},{min:4,max:9,price:65},{min:10,max:20,price:59},{min:21,max:40,price:53},{min:41,max:null,price:45}]},{name:"Papier 115g matowy",tiers:[{min:1,max:3,price:45},{min:4,max:19,price:40},{min:20,max:null,price:35}]}],oe={id:G,title:ee,unit:te,pricing:ie,rules:re,modifiers:ae,materials:ne};function H(e){let t=g,i=t.materials.find(a=>a.name===e.material);if(!i)throw new Error(`Unknown material: ${e.material}`);let n={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:i.tiers,rules:t.rules,modifiers:t.modifiers},c=[];return e.express&&c.push("express"),x(n,e.areaM2,c)}function f(e){return e.toFixed(2).replace(".",",")+" z\u0142"}var C={id:"solwent-plakaty",name:"Solwent - Plakaty",mount(e,t){let n=g.materials;e.innerHTML=`
      <h2>Solwent - Plakaty</h2>
      <div class="form">
        <div class="row">
          <label for="material">Materia\u0142:</label>
          <select id="material">
            ${n.map(m=>`<option value="${m.name}">${m.name}</option>`).join("")}
          </select>
        </div>

        <div class="row">
          <label for="area">Powierzchnia (m2):</label>
          <input type="number" id="area" value="1" min="0.1" step="0.1">
          <div class="hint">MINIMALKA 1m2!</div>
        </div>

        <div class="actions">
          <button id="calculate" class="primary">Oblicz</button>
          <button id="add-to-cart" class="success" disabled>Dodaj do listy</button>
        </div>

        <div id="result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena jednostkowa:</span>
            <span id="unit-price" style="font-weight: 900;">-</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 800;">Cena ca\u0142kowita:</span>
            <span id="total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
        </div>
      </div>
    `;let c=e.querySelector("#material"),a=e.querySelector("#area"),o=e.querySelector("#calculate"),l=e.querySelector("#add-to-cart"),d=e.querySelector("#result-display"),p=e.querySelector("#unit-price"),s=e.querySelector("#total-price"),r=null;o.onclick=()=>{let m={material:c.value,areaM2:parseFloat(a.value),express:t.expressMode};try{let u=H(m);r=u,p.innerText=f(u.tierPrice),s.innerText=f(u.totalPrice),d.style.display="block",l.disabled=!1,t.updateLastCalculated(u.totalPrice,"Solwent - Plakaty")}catch(u){alert("B\u0142\u0105d: "+u.message)}},l.onclick=()=>{r&&t.cart.addItem({id:`solwent-${Date.now()}`,category:"Solwent - Plakaty",name:c.value,quantity:parseFloat(a.value),unit:"m2",unitPrice:r.tierPrice,isExpress:t.expressMode,totalPrice:r.totalPrice,optionsHint:`${a.value}m2${t.expressMode?", EXPRESS":""}`,payload:r})}}};var L=[{qty:1,single:20,double:25},{qty:2,single:29,double:32},{qty:3,single:30,double:37},{qty:4,single:32,double:39},{qty:5,single:35,double:43},{qty:6,single:39,double:45},{qty:7,single:41,double:48},{qty:8,single:45,double:50},{qty:9,single:48,double:52},{qty:10,single:52,double:58},{qty:15,single:60,double:70},{qty:20,single:67,double:82},{qty:25,single:74,double:100},{qty:30,single:84,double:120}];function le(e){let t=L.map((i,n)=>({min:(n===0?0:L[n-1].qty)+1,max:i.qty,price:e==="single"?i.single:i.double}));return{id:`vouchery-${e}`,title:`Vouchery A4 ${e==="single"?"jednostronne":"dwustronne"}`,unit:"szt",pricing:"flat",tiers:t,modifiers:[{id:"satin",name:"Papier satynowy",type:"percent",value:.12},{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function z(e){let t=le(e.sides),i=[];return e.satin&&i.push("satin"),e.express&&i.push("express"),x(t,e.qty,i)}var B={id:"vouchery",name:"Vouchery",mount(e,t){e.innerHTML=`
      <h2>Vouchery A4</h2>
      <div class="form">
        <div class="row">
          <label for="v-qty">Ilo\u015B\u0107 (szt):</label>
          <input type="number" id="v-qty" value="1" min="1" max="30" step="1">
          <div class="hint">Zakres 1-30 szt.</div>
        </div>

        <div class="row">
          <label>Zadruk:</label>
          <div class="radio-group" style="display: flex; gap: 20px; margin-top: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="v-sides" value="single" checked> Jednostronne
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="v-sides" value="double"> Dwustronne
            </label>
          </div>
        </div>

        <div class="row">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="v-satin"> Papier satynowy (+12%)
          </label>
        </div>

        <div class="actions">
          <button id="v-calculate" class="primary">Oblicz</button>
          <button id="v-add-to-cart" class="success" disabled>Dodaj do listy</button>
        </div>

        <div id="v-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena bazowa:</span>
            <span id="v-base-price" style="font-weight: 900;">-</span>
          </div>
          <div id="v-modifiers-row" style="display: none; justify-content: space-between; font-size: 0.9em; opacity: 0.8;">
            <span>Dop\u0142aty:</span>
            <span id="v-modifiers-total">-</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
            <span style="font-weight: 800;">Cena ca\u0142kowita:</span>
            <span id="v-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
        </div>
      </div>
    `;let i=e.querySelector("#v-qty"),n=e.querySelector("#v-satin"),c=e.querySelector("#v-calculate"),a=e.querySelector("#v-add-to-cart"),o=e.querySelector("#v-result-display"),l=e.querySelector("#v-base-price"),d=e.querySelector("#v-modifiers-row"),p=e.querySelector("#v-modifiers-total"),s=e.querySelector("#v-total-price"),r=null,m=null;c.onclick=()=>{let u=e.querySelector('input[name="v-sides"]:checked'),w=u?u.value:"single";m={qty:parseInt(i.value),sides:w,satin:n.checked,express:t.expressMode};try{let y=z(m);r=y,l.innerText=f(y.basePrice),y.modifiersTotal>0?(d.style.display="flex",p.innerText="+"+f(y.modifiersTotal)):d.style.display="none",s.innerText=f(y.totalPrice),o.style.display="block",a.disabled=!1,t.updateLastCalculated(y.totalPrice,"Vouchery")}catch(y){alert("B\u0142\u0105d: "+y.message)}},a.onclick=()=>{if(r&&m){let u=m.sides==="single"?"Jednostronne":"Dwustronne",w=m.satin?", Satyna":"",y=m.express?", EXPRESS":"";t.cart.addItem({id:`vouchery-${Date.now()}`,category:"Vouchery",name:`Vouchery A4 ${u}`,quantity:m.qty,unit:"szt",unitPrice:r.totalPrice/m.qty,isExpress:m.express,totalPrice:r.totalPrice,optionsHint:`${m.qty} szt${w}${y}`,payload:r})}}}};var I={"85x55":{none:[{qty:50,price:65},{qty:100,price:75},{qty:150,price:85},{qty:200,price:96},{qty:250,price:110},{qty:300,price:126},{qty:400,price:146},{qty:500,price:170},{qty:1e3,price:290}],matt_gloss:[{qty:50,price:160},{qty:100,price:170},{qty:150,price:180},{qty:200,price:190},{qty:250,price:200},{qty:300,price:220},{qty:400,price:240},{qty:500,price:250},{qty:1e3,price:335}]},"90x50":{none:[{qty:50,price:70},{qty:100,price:79},{qty:150,price:89},{qty:200,price:99},{qty:250,price:120},{qty:300,price:129},{qty:400,price:149},{qty:500,price:175},{qty:1e3,price:300}],matt_gloss:[{qty:50,price:170},{qty:100,price:180},{qty:150,price:190},{qty:200,price:200},{qty:250,price:210},{qty:300,price:230},{qty:400,price:250},{qty:500,price:260},{qty:1e3,price:345}]}};function me(e,t){let n=I[e][t],c=n.map((a,o)=>({min:(o===0?0:n[o-1].qty)+1,max:a.qty,price:a.price}));return{id:`wizytowki-${e}-${t}`,title:`Wizyt\xF3wki ${e} ${t==="none"?"(bez foliowania)":"(foliowane)"}`,unit:"szt",pricing:"flat",tiers:c,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function V(e){let t=me(e.format,e.folia),i=[];return e.express&&i.push("express"),x(t,e.qty,i)}var $={id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",mount(e,t){e.innerHTML=`
      <h2>Wizyt\xF3wki - druk cyfrowy</h2>
      <div class="form">
        <div class="row">
          <label for="w-format">Format:</label>
          <select id="w-format">
            <option value="85x55">85x55 mm</option>
            <option value="90x50">90x50 mm</option>
          </select>
        </div>

        <div class="row">
          <label for="w-folia">Foliowanie:</label>
          <select id="w-folia">
            <option value="none">Bez foliowania</option>
            <option value="matt_gloss">Folia mat / b\u0142ysk</option>
          </select>
        </div>

        <div class="row">
          <label for="w-qty">Ilo\u015B\u0107 (szt):</label>
          <select id="w-qty">
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

        <div class="actions">
          <button id="w-calculate" class="primary">Oblicz</button>
          <button id="w-add-to-cart" class="success" disabled>Dodaj do koszyka</button>
        </div>

        <div id="w-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena brutto:</span>
            <span id="w-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
          <div id="w-express-hint" style="display: none; font-size: 0.8em; color: var(--ok); margin-top: 4px;">
            W tym dop\u0142ata EXPRESS +20%
          </div>
        </div>
      </div>
    `;let i=e.querySelector("#w-format"),n=e.querySelector("#w-folia"),c=e.querySelector("#w-qty"),a=e.querySelector("#w-calculate"),o=e.querySelector("#w-add-to-cart"),l=e.querySelector("#w-result-display"),d=e.querySelector("#w-total-price"),p=e.querySelector("#w-express-hint"),s=null,r=null;a.onclick=()=>{r={format:i.value,folia:n.value,qty:parseInt(c.value),express:t.expressMode};try{let m=V(r);s=m,d.innerText=f(m.totalPrice),p.style.display=t.expressMode?"block":"none",l.style.display="block",o.disabled=!1,t.updateLastCalculated(m.totalPrice,"Wizyt\xF3wki")}catch(m){alert("B\u0142\u0105d: "+m.message)}},o.onclick=()=>{if(s&&r){let m=r.folia==="none"?"Bez folii":"Folia",u=r.express?", EXPRESS":"";t.cart.addItem({id:`wizytowki-${Date.now()}`,category:"Wizyt\xF3wki",name:`Wizyt\xF3wki ${r.format}`,quantity:r.qty,unit:"szt",unitPrice:s.totalPrice/r.qty,isExpress:r.express,totalPrice:s.totalPrice,optionsHint:`${r.qty} szt, ${m}${u}`,payload:s})}}}};var D={name:"Ulotki - Cyfrowe Dwustronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:47},{min:30,max:30,price:49},{min:40,max:40,price:55},{min:50,max:50,price:60},{min:60,max:60,price:65},{min:70,max:70,price:70},{min:80,max:80,price:75},{min:90,max:90,price:90},{min:100,max:100,price:95},{min:150,max:150,price:120},{min:200,max:200,price:140},{min:300,max:300,price:190},{min:400,max:400,price:230},{min:500,max:500,price:270},{min:700,max:700,price:355},{min:1e3,max:1e3,price:476}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:45},{min:20,max:20,price:55},{min:30,max:30,price:60},{min:40,max:40,price:72},{min:50,max:50,price:90},{min:60,max:60,price:99},{min:70,max:70,price:112},{min:80,max:80,price:122},{min:90,max:90,price:130},{min:100,max:100,price:140},{min:150,max:150,price:180},{min:200,max:200,price:220},{min:300,max:300,price:310},{min:400,max:400,price:390},{min:500,max:500,price:460},{min:700,max:700,price:620},{min:1e3,max:1e3,price:790}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:40},{min:20,max:20,price:50},{min:30,max:30,price:55},{min:40,max:40,price:65},{min:50,max:50,price:70},{min:60,max:60,price:78},{min:70,max:70,price:88},{min:80,max:80,price:99},{min:90,max:90,price:109},{min:100,max:100,price:119},{min:150,max:150,price:150},{min:200,max:200,price:179},{min:300,max:300,price:235},{min:400,max:400,price:290},{min:500,max:500,price:350},{min:700,max:700,price:460},{min:1e3,max:1e3,price:590}]}}};function ue(e){let t=D.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-dwustronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Dwustronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function R(e){let t=ue(e.format),i=[];return e.express&&i.push("express"),x(t,e.qty,i)}var j={id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",async mount(e,t){try{let i=await fetch("categories/ulotki-cyfrowe-dwustronne.html");if(!i.ok)throw new Error("Failed to load template");e.innerHTML=await i.text(),this.initLogic(e,t)}catch(i){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${i}</div>`}},initLogic(e,t){let i=e.querySelector("#u-format"),n=e.querySelector("#u-qty"),c=e.querySelector("#u-calculate"),a=e.querySelector("#u-add-to-cart"),o=e.querySelector("#u-result-display"),l=e.querySelector("#u-total-price"),d=e.querySelector("#u-express-hint"),p=null,s=null;c.onclick=()=>{s={format:i.value,qty:parseInt(n.value),express:t.expressMode};try{let r=R(s);p=r,l.innerText=f(r.totalPrice),d&&(d.style.display=t.expressMode?"block":"none"),o.style.display="block",a.disabled=!1,t.updateLastCalculated(r.totalPrice,"Ulotki")}catch(r){alert("B\u0142\u0105d: "+r.message)}},a.onclick=()=>{if(p&&s){let r=s.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-dwustronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Dwustronne ${s.format}`,quantity:s.qty,unit:"szt",unitPrice:p.totalPrice/s.qty,isExpress:s.express,totalPrice:p.totalPrice,optionsHint:`${s.qty} szt, Dwustronne${r}`,payload:p})}}}};var W={name:"Ulotki - Cyfrowe Jednostronne",formats:{A6:{name:"A6 (105x148)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:61},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:79},{min:150,max:150,price:90},{min:200,max:200,price:110},{min:300,max:300,price:145},{min:400,max:400,price:160},{min:500,max:500,price:190},{min:700,max:700,price:255},{min:1e3,max:1e3,price:320}]},A5:{name:"A5 (148 x 210)",tiers:[{min:10,max:10,price:35},{min:20,max:20,price:42},{min:30,max:30,price:50},{min:40,max:40,price:59},{min:50,max:50,price:69},{min:60,max:60,price:75},{min:70,max:70,price:82},{min:80,max:80,price:88},{min:90,max:90,price:93},{min:100,max:100,price:95},{min:150,max:150,price:130},{min:200,max:200,price:150},{min:300,max:300,price:210},{min:400,max:400,price:259},{min:500,max:500,price:300},{min:700,max:700,price:410},{min:1e3,max:1e3,price:530}]},DL:{name:"DL (99 x 210)",tiers:[{min:10,max:10,price:30},{min:20,max:20,price:35},{min:30,max:30,price:40},{min:40,max:40,price:45},{min:50,max:50,price:55},{min:60,max:60,price:60},{min:70,max:70,price:65},{min:80,max:80,price:70},{min:90,max:90,price:75},{min:100,max:100,price:83},{min:150,max:150,price:100},{min:200,max:200,price:120},{min:300,max:300,price:160},{min:400,max:400,price:199},{min:500,max:500,price:230},{min:700,max:700,price:310},{min:1e3,max:1e3,price:399}]}}};function ye(e){let t=W.formats[e];if(!t)throw new Error(`Invalid format: ${e}`);return{id:`ulotki-cyfrowe-jednostronne-${e.toLowerCase()}`,title:`Ulotki Cyfrowe Jednostronne ${t.name}`,unit:"szt",pricing:"flat",tiers:t.tiers,modifiers:[{id:"express",name:"TRYB EXPRESS",type:"percent",value:.2}]}}function _(e){let t=ye(e.format),i=[];return e.express&&i.push("express"),x(t,e.qty,i)}var U={id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",async mount(e,t){try{let i=await fetch("categories/ulotki-cyfrowe-jednostronne.html");if(!i.ok)throw new Error("Failed to load template");e.innerHTML=await i.text(),this.initLogic(e,t)}catch(i){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${i}</div>`}},initLogic(e,t){let i=e.querySelector("#uj-format"),n=e.querySelector("#uj-qty"),c=e.querySelector("#uj-calculate"),a=e.querySelector("#uj-add-to-cart"),o=e.querySelector("#uj-result-display"),l=e.querySelector("#uj-total-price"),d=e.querySelector("#uj-express-hint"),p=null,s=null;c.onclick=()=>{s={format:i.value,qty:parseInt(n.value),express:t.expressMode};try{let r=_(s);p=r,l.innerText=f(r.totalPrice),d&&(d.style.display=t.expressMode?"block":"none"),o.style.display="block",a.disabled=!1,t.updateLastCalculated(r.totalPrice,"Ulotki")}catch(r){alert("B\u0142\u0105d: "+r.message)}},a.onclick=()=>{if(p&&s){let r=s.express?", EXPRESS":"";t.cart.addItem({id:`ulotki-jednostronne-${Date.now()}`,category:"Ulotki",name:`Ulotki Jednostronne ${s.format}`,quantity:s.qty,unit:"szt",unitPrice:p.totalPrice/s.qty,isExpress:s.express,totalPrice:p.totalPrice,optionsHint:`${s.qty} szt, Jednostronne${r}`,payload:p})}}}};var X={id:"banner",title:"Bannery",unit:"m2",pricing:"per_unit",materials:[{id:"powlekany",name:"Banner powlekany",tiers:[{min:1,max:25,price:53},{min:26,max:50,price:49},{min:51,max:null,price:45}]},{id:"blockout",name:"Banner Blockout",tiers:[{min:1,max:25,price:64},{min:26,max:50,price:59},{min:51,max:null,price:55}]}],modifiers:[{id:"oczkowanie",name:"Oczkowanie (+2.50 z\u0142/m2)",type:"fixed_per_unit",value:2.5},{id:"express",name:"TRYB EXPRESS (+20%)",type:"percent",value:.2}]};function O(e){let t=X,i=t.materials.find(a=>a.id===e.material);if(!i)throw new Error(`Unknown material: ${e.material}`);let n={id:t.id,title:t.title,unit:t.unit,pricing:t.pricing,tiers:i.tiers,modifiers:t.modifiers},c=[];return e.oczkowanie&&c.push("oczkowanie"),e.express&&c.push("express"),x(n,e.areaM2,c)}var N={id:"banner",name:"Bannery",async mount(e,t){try{let i=await fetch("categories/banner.html");if(!i.ok)throw new Error("Failed to load template");e.innerHTML=await i.text(),this.initLogic(e,t)}catch(i){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania: ${i}</div>`}},initLogic(e,t){let i=e.querySelector("#b-material"),n=e.querySelector("#b-area"),c=e.querySelector("#b-oczkowanie"),a=e.querySelector("#b-calculate"),o=e.querySelector("#b-add-to-cart"),l=e.querySelector("#b-result-display"),d=e.querySelector("#b-unit-price"),p=e.querySelector("#b-total-price"),s=e.querySelector("#b-express-hint"),r=null,m=null;a.onclick=()=>{m={material:i.value,areaM2:parseFloat(n.value),oczkowanie:c.checked,express:t.expressMode};try{let u=O(m);r=u,d.innerText=f(u.tierPrice),p.innerText=f(u.totalPrice),s&&(s.style.display=t.expressMode?"block":"none"),l.style.display="block",o.disabled=!1,t.updateLastCalculated(u.totalPrice,"Banner")}catch(u){alert("B\u0142\u0105d: "+u.message)}},o.onclick=()=>{if(r&&m){let u=i.options[i.selectedIndex].text,w=[`${m.areaM2} m2`,m.oczkowanie?"z oczkowaniem":"bez oczkowania",m.express?"EXPRESS":""].filter(Boolean).join(", ");t.cart.addItem({id:`banner-${Date.now()}`,category:"Bannery",name:u,quantity:m.areaM2,unit:"m2",unitPrice:r.tierPrice,isExpress:m.express,totalPrice:r.totalPrice,optionsHint:w,payload:r})}}}};var k={};M(k,{category:()=>xe,default:()=>be,groups:()=>we,modifiers:()=>ve});var xe="Wlepki / Naklejki",we=[{id:"wlepki_obrys_folia",title:"Wlepki po obrysie (Folia Bia\u0142a/Trans)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:67},{min:6,max:25,price:60},{min:26,max:50,price:52},{min:51,max:null,price:48}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_polipropylen",title:"Wlepki po obrysie - Polipropylen",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:10,price:50},{min:11,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]},{id:"wlepki_standard_folia",title:"Folia Bia\u0142a / Transparentna (standard)",unit:"m2",pricing:"per_unit",tiers:[{min:1,max:5,price:54},{min:6,max:25,price:50},{min:26,max:50,price:46},{min:51,max:null,price:42}],rules:[{type:"minimum",unit:"m2",value:1}]}],ve=[{id:"mocny_klej",name:"Mocny klej",type:"percent",value:.12},{id:"arkusze",name:"Ci\u0119te na arkusze",type:"fixed_per_unit",value:2},{id:"pojedyncze",name:"Ci\u0119te na pojedyncze sztuki",type:"fixed_per_unit",value:10},{id:"express",name:"EXPRESS",type:"percent",value:.2}],be={category:xe,groups:we,modifiers:ve};function A(e){let t=k,i=t.groups.find(a=>a.id===e.groupId);if(!i)throw new Error(`Unknown group: ${e.groupId}`);let n={id:"wlepki",title:i.title,unit:i.unit,pricing:i.pricing||"per_unit",tiers:i.tiers,modifiers:t.modifiers,rules:i.rules||[{type:"minimum",unit:"m2",value:1}]},c=[...e.modifiers];return e.express&&c.push("express"),x(n,e.area,c)}var F={id:"wlepki-naklejki",name:"Wlepki / Naklejki",async mount(e,t){let i=k;try{let u=await fetch("categories/wlepki-naklejki.html");if(!u.ok)throw new Error("Failed to load template");e.innerHTML=await u.text()}catch(u){e.innerHTML=`<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${u}</div>`;return}let n=e.querySelector("#wlepki-group"),c=e.querySelector("#wlepki-area"),a=e.querySelector("#btn-calculate"),o=e.querySelector("#btn-add-to-cart"),l=e.querySelector("#wlepki-result"),d=e.querySelector("#unit-price"),p=e.querySelector("#total-price"),s=null,r=null,m=()=>{let u=e.querySelectorAll(".wlepki-mod:checked"),w=Array.from(u).map(y=>y.value);r={groupId:n.value,area:parseFloat(c.value)||0,express:t.expressMode,modifiers:w};try{let y=A(r);s=y,d.textContent=f(y.tierPrice),p.textContent=f(y.totalPrice),l.style.display="block",o.disabled=!1,t.updateLastCalculated(y.totalPrice,"Wlepki")}catch(y){alert("B\u0142\u0105d: "+y.message)}};a.addEventListener("click",m),o.addEventListener("click",()=>{if(!s||!r)return;let u=i.groups.find(y=>y.id===r.groupId),w=r.modifiers.map(y=>{let P=i.modifiers.find(Y=>Y.id===y);return P?P.name:y});r.express&&w.unshift("EXPRESS (+20%)"),t.cart.addItem({id:`wlepki-${Date.now()}`,category:"Wlepki / Naklejki",name:u?.title||"Wlepki",quantity:r.area,unit:"m2",unitPrice:s.tierPrice,isExpress:!!r.express,totalPrice:s.totalPrice,optionsHint:w.join(", ")||"Standard",payload:s})})}};var q=class{items=[];storageKey="razdwa-cart-v1";constructor(){this.load()}load(){try{let t=localStorage.getItem(this.storageKey);t&&(this.items=JSON.parse(t))}catch(t){console.error("Failed to load cart from localStorage",t),this.items=[]}}save(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(t){console.error("Failed to save cart to localStorage",t)}}addItem(t){this.items.push(t),this.save()}removeItem(t){t>=0&&t<this.items.length&&(this.items.splice(t,1),this.save())}clear(){this.items=[],this.save()}getItems(){return[...this.items]}getGrandTotal(){return this.items.reduce((t,i)=>t+i.totalPrice,0)}isEmpty(){return this.items.length===0}};function J(e,t){if(typeof XLSX>"u"){console.error("XLSX library not loaded from CDN"),alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");return}let i=e.map(l=>({Kategoria:l.category,Nazwa:l.name,Ilo\u015B\u0107:l.quantity,Jednostka:l.unit,"Cena jedn.":l.unitPrice,"Express (+20%)":l.isExpress?"TAK":"NIE","Cena ca\u0142kowita":l.totalPrice,Klient:t.name,Telefon:t.phone,Email:t.email,Priorytet:t.priority})),n=XLSX.utils.json_to_sheet(i),c=XLSX.utils.book_new();XLSX.utils.book_append_sheet(c,n,"Zam\xF3wienie");let a=new Date().toISOString().slice(0,10),o=`Zamowienie_${t.name.replace(/\s+/g,"_")}_${a}.xlsx`;XLSX.writeFile(c,o)}var S=[{id:"solwent-plakaty",name:"Solwent - Plakaty",icon:"\u{1F5BC}\uFE0F",implemented:!0},{id:"vouchery",name:"Vouchery",icon:"\u{1F39F}\uFE0F",implemented:!0},{id:"dyplomy",name:"Dyplomy",icon:"\u{1F4DC}",implemented:!1},{id:"wizytowki-druk-cyfrowy",name:"Wizyt\xF3wki - druk cyfrowy",icon:"\u{1F4C7}",implemented:!0},{id:"zaproszenia",name:"Zaproszenia",icon:"\u2709\uFE0F",implemented:!1},{id:"ulotki-cyfrowe-dwustronne",name:"Ulotki - Cyfrowe Dwustronne",icon:"\u{1F4C4}",implemented:!0},{id:"ulotki-cyfrowe-jednostronne",name:"Ulotki - Cyfrowe Jednostronne",icon:"\u{1F4C4}",implemented:!0},{id:"banner",name:"Bannery",icon:"\u{1F3C1}",implemented:!0},{id:"wlepki-naklejki",name:"Wlepki / Naklejki",icon:"\u{1F3F7}\uFE0F",implemented:!0}];var b=new q;function T(){let e=document.getElementById("basketList"),t=document.getElementById("basketTotal"),i=document.getElementById("basketDebug");if(!e||!t||!i)return;let n=b.getItems();n.length===0?e.innerHTML=`
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class="basketMeta">Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</div>
        </div>
        <div class="basketPrice">\u2014</div>
      </div>
    `:e.innerHTML=n.map((a,o)=>`
      <div class="basketItem">
        <div style="min-width:0;">
          <div class="basketTitle">${a.category}: ${a.name}</div>
          <div class="basketMeta">${a.optionsHint} (${a.quantity} ${a.unit})</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${f(a.totalPrice)}</div>
          <button class="iconBtn" onclick="window.removeItem(${o})" title="Usu\u0144">\xD7</button>
        </div>
      </div>
    `).join("");let c=b.getGrandTotal();t.innerText=f(c).replace(" z\u0142",""),i.innerText=JSON.stringify(n.map(a=>a.payload),null,2)}window.removeItem=e=>{b.removeItem(e),T()};document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("viewContainer"),t=document.getElementById("categorySelector"),i=document.getElementById("categorySearch"),n=document.getElementById("globalExpress");if(!e||!t||!n||!i)return;let c=()=>({cart:{addItem:o=>{b.addItem(o),T()}},expressMode:n.checked,updateLastCalculated:(o,l)=>{let d=document.getElementById("currentPrice"),p=document.getElementById("currentHint");d&&(d.innerText=f(o).replace(" z\u0142","")),p&&(p.innerText=l?`(${l})`:"")}}),a=new h(e,c);a.setCategories(S),a.addRoute(C),a.addRoute(B),a.addRoute($),a.addRoute(j),a.addRoute(U),a.addRoute(N),a.addRoute(F),S.forEach(o=>{let l=document.createElement("option");l.value=o.id,l.innerText=`${o.icon} ${o.name}`,o.implemented||(l.disabled=!0,l.innerText+=" (wkr\xF3tce)"),t.appendChild(l)}),t.addEventListener("change",()=>{let o=t.value;o?window.location.hash=`#/${o}`:window.location.hash="#/"}),i.addEventListener("input",()=>{let o=i.value.toLowerCase();Array.from(t.options).forEach((d,p)=>{if(p===0)return;let s=d.text.toLowerCase();d.hidden=!s.includes(o)})}),i.addEventListener("keydown",o=>{if(o.key==="Enter"){let l=i.value.toLowerCase(),d=Array.from(t.options).find((p,s)=>s>0&&!p.hidden&&!p.disabled);d&&(t.value=d.value,window.location.hash=`#/${d.value}`,i.value="")}}),window.addEventListener("hashchange",()=>{let l=(window.location.hash||"#/").slice(2);t.value=l}),n.addEventListener("change",()=>{let o=window.location.hash;window.location.hash="",window.location.hash=o}),document.getElementById("clearBtn")?.addEventListener("click",()=>{b.clear(),T()}),document.getElementById("sendBtn")?.addEventListener("click",()=>{let o={name:document.getElementById("custName").value||"Anonim",phone:document.getElementById("custPhone").value||"-",email:document.getElementById("custEmail").value||"-",priority:document.getElementById("custPriority").value};if(b.isEmpty()){alert("Lista jest pusta!");return}J(b.getItems(),o)}),T(),a.start()});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>console.log("SW registered",e)).catch(e=>console.error("SW failed",e))});
