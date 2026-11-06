(() => {
  "use strict";
  const STORE_KEY = "jogoamal-portfolio-demo-v1";
  const MAX_ITEMS = 150;
  const rupiah = new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0});
  const today = new Date();
  const dayISO = offset => { const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()+offset,12); return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0"); };
  const example = [
    {id:"sample1",date:dayISO(0),type:"masuk",description:"Donasi Jumat",amount:2500000},
    {id:"sample2",date:dayISO(-1),type:"masuk",description:"Infak jamaah",amount:1250000},
    {id:"sample3",date:dayISO(-1),type:"keluar",description:"Operasional kebersihan",amount:425000},
    {id:"sample4",date:dayISO(-2),type:"masuk",description:"Donasi pembangunan",amount:3750000},
    {id:"sample5",date:dayISO(-3),type:"keluar",description:"Perawatan fasilitas",amount:975000},
    {id:"sample6",date:dayISO(-4),type:"masuk",description:"Infak harian",amount:850000},
    {id:"sample7",date:dayISO(-5),type:"masuk",description:"Donasi pendidikan",amount:1500000},
    {id:"sample8",date:dayISO(-6),type:"keluar",description:"Kegiatan sosial",amount:525000}
  ];
  const get = id => document.getElementById(id);
  function isValid(t) {
    return t && typeof t.id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
      (t.type === "masuk" || t.type === "keluar") && typeof t.description === "string" &&
      t.description.length <= 80 && Number.isSafeInteger(t.amount) && t.amount >= 1000 && t.amount <= 10000000000;
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY));
      if (Array.isArray(data)) return data.filter(isValid).slice(0,MAX_ITEMS);
    } catch (_) { /* blocked or invalid storage: use examples */ }
    return example.map(t => ({...t}));
  }
  let entries = load();
  function save() {
    try { localStorage.setItem(STORE_KEY,JSON.stringify(entries)); } catch (_) { get("form-message").textContent = "Mode sementara: browser ini tidak menyimpan perubahan."; }
  }
  function create(tag,className,text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function render() {
    let incoming=0,outgoing=0;
    entries.forEach(t => { if(t.type === "masuk") incoming += t.amount; else outgoing += t.amount; });
    get("total-in").textContent=rupiah.format(incoming);
    get("total-out").textContent=rupiah.format(outgoing);
    get("balance").textContent=rupiah.format(incoming-outgoing);
    get("transaction-count").textContent=entries.length+" transaksi";

    const query=get("search").value.trim().toLocaleLowerCase("id");
    const filter=get("filter-type").value;
    const visible=entries.filter(t=>(filter==="semua"||t.type===filter)&&t.description.toLocaleLowerCase("id").includes(query));
    const body=get("transactions-body");
    body.replaceChildren();
    const fragment=document.createDocumentFragment();
    visible.forEach(t=>{
      const row=create("tr");
      const labelDate = new Date(t.date+"T12:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
      row.append(create("td","",labelDate),create("td","",t.description));
      const type=create("td");type.append(create("span","pill "+(t.type==="masuk"?"in":"out"),t.type==="masuk"?"Pemasukan":"Pengeluaran"));
      row.append(type,create("td","amount-col",(t.type==="keluar"?"−":"+")+rupiah.format(t.amount)));
      fragment.append(row);
    });
    body.append(fragment);
    get("empty-state").hidden=visible.length!==0;
    drawChart();
  }
  function drawChart(){
    const chart=get("chart");chart.replaceChildren();
    const daily=Array.from({length:7},(_,i)=>({date:dayISO(i-6),inside:0,outside:0}));
    daily.forEach(d=>{
      entries.filter(t=>t.date===d.date).forEach(t=>{if(t.type==="masuk")d.inside+=t.amount;else d.outside+=t.amount;});
    });
    const highest=Math.max(1,...daily.flatMap(d=>[d.inside,d.outside]));
    const weekdays=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    chart.setAttribute("aria-label","Grafik transaksi tujuh hari terakhir: "+daily.map(d=>d.date+" pemasukan "+rupiah.format(d.inside)+" pengeluaran "+rupiah.format(d.outside)).join("; "));
    daily.forEach(d=>{
      const day=create("div","chart-day"),bars=create("div","bars");
      const inBar=create("div","bar"),outBar=create("div","bar out");
      inBar.style.height=Math.max(2,100*d.inside/highest)+"%";
      outBar.style.height=Math.max(2,100*d.outside/highest)+"%";
      inBar.title="Pemasukan: "+rupiah.format(d.inside);
      outBar.title="Pengeluaran: "+rupiah.format(d.outside);
      bars.append(inBar,outBar);
      const weekday=weekdays[new Date(d.date+"T12:00:00").getDay()];
      day.append(bars,create("span","day-label",weekday));
      chart.append(day);
    });
  }
  get("date-label").textContent="Terakhir dibuka: "+today.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
  get("transaction-form").addEventListener("submit",e=>{
    e.preventDefault();
    const type=get("type").value,description=get("description").value.trim(),amount=Number(get("amount").value);
    const message=get("form-message");
    if ((type!=="masuk"&&type!=="keluar") || !description || description.length>80 || !Number.isSafeInteger(amount) || amount<1000 || amount>10000000000) {
      message.textContent="Isi jenis, keterangan, dan nominal Rp1.000–Rp10 miliar yang valid.";return;
    }
    entries.unshift({id:"custom-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),type,description,amount,date:dayISO(0)});
    if(entries.length>MAX_ITEMS)entries.length=MAX_ITEMS;
    save();get("transaction-form").reset();get("search").value="";get("filter-type").value="semua";
    message.textContent="Transaksi simulasi berhasil ditambahkan.";
    render();
  });
  get("reset-btn").addEventListener("click",()=>{
    entries=example.map(t=>({...t}));
    save();get("search").value="";get("filter-type").value="semua";
    get("form-message").textContent="Data simulasi dikembalikan ke contoh awal.";
    render();
  });
  get("search").addEventListener("input",render);
  get("filter-type").addEventListener("change",render);
  render();
})();
