/* JogoAmal Digital — client-only portfolio demo. No payments, authentication or server database. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const dateISO = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  };
  const original = [
    {id:1,date:dateISO(-6),name:"Donatur Contoh",kind:"pemasukan",description:"Infaq Jumat (simulasi)",method:"Tunai",amount:1500000},
    {id:2,date:dateISO(-5),name:"Panitia Contoh",kind:"pengeluaran",description:"Perawatan masjid (simulasi)",method:"Tunai",amount:425000},
    {id:3,date:dateISO(-4),name:"Donatur Contoh",kind:"pemasukan",description:"Pembangunan masjid (simulasi)",method:"Transfer Bank (simulasi)",amount:2500000},
    {id:4,date:dateISO(-3),name:"Takmir Contoh",kind:"pengeluaran",description:"Perlengkapan kegiatan (simulasi)",method:"Tunai",amount:650000},
    {id:5,date:dateISO(-2),name:"Donatur Contoh",kind:"pemasukan",description:"Donasi pendidikan (simulasi)",method:"Tunai",amount:750000},
    {id:6,date:dateISO(-1),name:"Donatur Contoh",kind:"pemasukan",description:"Infak jamaah (simulasi)",method:"Tunai",amount:890000}
  ];
  const KEY = "jogoamal-original-ui-demo-v2";
  const currency = value => Number(value).toLocaleString("id-ID");
  const valid = t => t && Number.isSafeInteger(t.id) && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    typeof t.name==="string" && t.name.length<=90 && typeof t.description==="string" && t.description.length<=160 &&
    (t.kind==="pemasukan"||t.kind==="pengeluaran") && typeof t.method==="string" && t.method.length<=80 &&
    Number.isSafeInteger(t.amount) && t.amount>0 && t.amount<=10000000000;
  let entries;
  try {const saved=JSON.parse(localStorage.getItem(KEY));entries=Array.isArray(saved)?saved.filter(valid).slice(0,200):original.map(t=>({...t}));}
  catch {entries=original.map(t=>({...t}));}
  let chart=null;
  let currentEdit=null;
  let role = new URLSearchParams(location.search).get("role") === "admin" ? "admin" : "user";
  const rolePicker=$("demo-role");
  if (rolePicker) rolePicker.value=role;
  function persist() {try{localStorage.setItem(KEY,JSON.stringify(entries.slice(0,200)));}catch{}}
  function note(message) {
    const el=$("demo-feedback");if(!el) return;
    el.textContent=message;el.hidden=false;
    el.scrollIntoView({block:"nearest",behavior:"smooth"});
  }
  function make(tag,cls,value) {
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(value!==undefined)el.textContent=value;
    return el;
  }
  function render() {
    const inTotal=entries.filter(x=>x.kind==="pemasukan").reduce((a,x)=>a+x.amount,0);
    const outTotal=entries.filter(x=>x.kind==="pengeluaran").reduce((a,x)=>a+x.amount,0);
    $("totalSaldo").textContent=currency(inTotal-outTotal)+",00";
    $("totalIncome").textContent=currency(inTotal)+",00";
    $("totalExpense").textContent=currency(outTotal)+",00";
    $("admin-card").hidden=role!=="admin";
    $("user-card").hidden=role!=="user";
    document.querySelectorAll(".admin-only").forEach(el=>{el.hidden=role!=="admin";});
    $("demo-username").textContent=role==="admin"?"Admin (Demo)":"Jamaah (Demo)";
    const filters=new FormData($("filterForm"));
    const period=String(filters.get("periode")||"");
    const kind=String(filters.get("jenis")||"");
    const query=String(filters.get("program")||"").trim().toLocaleLowerCase("id");
    const shown=entries.filter(t=>(!period||t.date===period)&&(!kind||t.kind===kind)&&(!query||t.description.toLocaleLowerCase("id").includes(query)));
    $("demo-count").textContent=shown.length;
    const tbody=$("demo-transactions");
    tbody.replaceChildren();
    if(!shown.length) {
      const tr=make("tr"),td=make("td","py-4 px-4 text-center text-gray-500","Belum ada transaksi");
      td.colSpan=role==="admin"?7:6;tr.append(td);tbody.append(tr);
    } else {
      const fragment=document.createDocumentFragment();
      shown.slice().reverse().forEach(t=>{
        const tr=make("tr","border-t border-gray-100 hover:bg-gray-50");
        const date=make("td","py-3 px-4",new Date(t.date+"T12:00:00").toLocaleDateString("id-ID")+" 12:00");
        const name=make("td","py-3 px-4",t.name);
        const kindTd=make("td","py-3 px-4");
        kindTd.append(make("span","badge "+(t.kind==="pemasukan"?"badge-success":"badge-danger"),t.kind==="pemasukan"?"Pemasukan":"Pengeluaran"));
        const desc=make("td","py-3 px-4",t.description);
        const method=make("td","py-3 px-4");
        method.append(make("span","payment-method-badge",t.method));
        const amount=make("td","py-3 px-4 text-right","Rp "+currency(t.amount));
        tr.append(date,name,kindTd,desc,method,amount);
        const actions=make("td","py-3 px-4 text-center admin-only");
        if(role==="admin") {
          const edit=make("button","text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50","✎");
          edit.type="button";edit.setAttribute("aria-label","Edit transaksi "+t.description);
          edit.addEventListener("click",()=>openEdit(t.id));
          const del=make("button","text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50","🗑");
          del.type="button";del.setAttribute("aria-label","Hapus transaksi "+t.description);
          del.addEventListener("click",()=>{if(confirm("Hapus transaksi simulasi ini?")){entries=entries.filter(x=>x.id!==t.id);persist();render();note("Transaksi simulasi dihapus.");}});
          actions.append(edit,del);
          tr.append(actions);
        }
        fragment.append(tr);
      });
      tbody.append(fragment);
    }
    drawChart(shown);
  }
  function drawChart(rows) {
    const el=$("chartKeuangan");if(!el)return;
    if(!window.Chart) {
      const notice=$("chart-fallback");
      if(notice)notice.hidden=false;
      return;
    }
    const latest=rows.slice(-10);
    if(chart) chart.destroy();
    chart=new Chart(el.getContext("2d"),{
      type:"bar",
      data:{labels:latest.map(t=>new Date(t.date+"T12:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short"})),
        datasets:[{label:"Transaksi Keuangan",data:latest.map(t=>t.kind==="pemasukan"?t.amount:-t.amount),
          backgroundColor:latest.map(t=>t.kind==="pemasukan"?"#10b981":"#ef4444"),
          borderColor:latest.map(t=>t.kind==="pemasukan"?"#059669":"#dc2626"),borderWidth:1,borderRadius:4}]},
      options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>"Rp "+currency(Math.abs(context.raw))}}},
        scales:{y:{ticks:{callback:value=>"Rp "+currency(Math.abs(value))}}}}
    });
  }
  function fields(form) {
    const fd=new FormData(form);
    const amount=Number(fd.get("jumlah"));
    const name=String(fd.get("nama")||"").trim();
    const description=String(fd.get("deskripsi")||"").trim();
    const kind=String(fd.get("jenis")||"pemasukan");
    const method=String(fd.get("payment_method")||"Tunai");
    if(!name||!description||name.length>90||description.length>160||!Number.isSafeInteger(amount)||amount<=0||amount>10000000000||(kind!=="pemasukan"&&kind!=="pengeluaran"))return null;
    return {name,description,amount,kind,method:method.substring(0,80)};
  }
  function onAdd(form) {
    const data=fields(form);
    if(!data){note("Isi nama, keterangan, jenis transaksi dan nominal yang valid.");return;}
    entries.push({...data,id:Math.max(6,...entries.map(x=>x.id))+1,date:dateISO()});
    if(entries.length>200)entries=entries.slice(-200);
    persist();form.reset();render();
    note("Berhasil menambahkan transaksi contoh. Tidak ada donasi atau pembayaran sungguhan.");
  }
  $("adminTransactionForm")?.addEventListener("submit",e=>{e.preventDefault();onAdd(e.currentTarget);});
  $("userDonationForm")?.addEventListener("submit",e=>{e.preventDefault();onAdd(e.currentTarget);});
  $("filterForm")?.addEventListener("submit",e=>{e.preventDefault();render();});
  $("filterForm")?.addEventListener("reset",()=>setTimeout(render,0));
  rolePicker?.addEventListener("change",e=>{role=e.target.value;render();});
  const updateRef=(select,container)=>{
    if(!select||!container)return;
    const method=select.value;
    container.style.display=method&&method!=="Tunai"?"block":"none";
    const input=container.querySelector("input");
    if(input) {input.required=false;if(container.style.display==="none")input.value="";}
  };
  const adminSelect=$("adminPaymentMethodSelect"),userSelect=$("userPaymentMethod");
  adminSelect?.addEventListener("change",()=>updateRef(adminSelect,$("adminPaymentReference")));
  userSelect?.addEventListener("change",()=>updateRef(userSelect,$("paymentReferenceField")));
  $("jenisTransaksi")?.addEventListener("change",()=>updateRef(adminSelect,$("adminPaymentReference")));
  updateRef(adminSelect,$("adminPaymentReference"));updateRef(userSelect,$("paymentReferenceField"));
  function openEdit(id){
    currentEdit=id;
    const t=entries.find(x=>x.id===id);if(!t)return;
    const modal=$("demo-edit-modal");
    const form=$("demo-edit-form");
    form.elements.namedItem("nama").value=t.name;
    form.elements.namedItem("jenis").value=t.kind;
    form.elements.namedItem("deskripsi").value=t.description;
    form.elements.namedItem("jumlah").value=t.amount;
    form.elements.namedItem("payment_method").value=t.method.startsWith("Transfer")?"Transfer Bank (simulasi)":t.method;
    modal.classList.add("active");modal.hidden=false;
    form.elements.namedItem("nama").focus();
  }
  function closeEdit(){const modal=$("demo-edit-modal");modal.classList.remove("active");modal.hidden=true;currentEdit=null;}
  $("demo-edit-form")?.addEventListener("submit",e=>{
    e.preventDefault();
    const data=fields(e.currentTarget);
    if(!data){note("Mohon isi formulir edit dengan benar.");return;}
    const i=entries.findIndex(x=>x.id===currentEdit);if(i<0)return;
    entries[i]={...entries[i],...data};persist();closeEdit();render();note("Transaksi contoh diperbarui.");
  });
  $("close-edit")?.addEventListener("click",closeEdit);
  $("cancel-edit")?.addEventListener("click",closeEdit);
  $("demo-edit-modal")?.addEventListener("click",e=>{if(e.target.id==="demo-edit-modal")closeEdit();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeEdit();});
  $("reset-demo")?.addEventListener("click",()=>{entries=original.map(t=>({...t}));persist();render();note("Data contoh dikembalikan ke awal.");});
  render();
})();
