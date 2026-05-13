import { useState, useEffect } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');`;

const C = {
  bg:       "#0B1220",
  bgCard:   "#0F1828",
  bgSurf:   "#131E2E",
  border:   "#1E2D42",
  borderMd: "#2A3D58",
  gold:     "#8E9B7A",
  goldSoft: "#8E9B7A18",
  goldMid:  "#8E9B7A33",
  goldHov:  "#A0B08A",
  silver:   "#6E7E8E",
  text:     "#D8E0E8",
  muted:    "#5A6878",
  dim:      "#3A4A5A",
  danger:   "#C05050",
  success:  "#5A9068",
  warning:  "#B8864E",
  info:     "#4A7AAA",
  white:    "#EEF2F6",
};

const STAGES = [
  { id: 1, label: "Orçamento Solicitado",    short: "Orçamento",  },
  { id: 2, label: "Documentação Pendente",   short: "Documentos", },
  { id: 3, label: "Documentação Recebida",   short: "Recebido",   },
  { id: 4, label: "Em Elaboração de Minuta", short: "Minuta",     },
  { id: 5, label: "Aguardando Assinatura",   short: "Assinatura", },
  { id: 6, label: "Enviado ao Registro",     short: "Registro",   },
  { id: 7, label: "Finalizado",              short: "Finalizado", },
];

const RI_STAGES = [
  "Prenotado","Exigência","Aguardando Pagamento",
  "Pago","Aguardando Registro","Registrado/Finalizado",
];

const QUALIFICATIONS = [
  "Vendedor(a)","Comprador(a)","Doador(a)","Donatário(a)",
  "Cedente","Cessionário(a)","Representante","Procurador(a)",
  "Anuente","Interveniente","Herdeiro(a)","Advogado(a)","Viúvo(a)",
];

const ESCRITURA_TIPOS = [
  "Compra e Venda","Doação","Permuta","Cessão de Direitos",
  "Inventário","Divórcio","União Estável","Usufruto",
  "Constituição de Hipoteca","Promessa de Compra e Venda",
  "Procuração Pública","Ata Notarial","Outro",
];

const initialCase = () => ({
  id:null, protocolo:"", senha:"", tipo:"", teor:"",
  dataSolicitacao:"", dataDocumentacao:"", estagio:1, pendencia:"", conferenciaInterna:false,
  minutaBase64:"", minutaFileName:"", observacoesCliente:"",
  documentoFinalBase64:"", documentoFinalFileName:"",
  orcamentoBase64:"", orcamentoFileName:"",
  solicitante:{nome:"",cpf:"",email:"",telefone:""},
  canal:"WhatsApp", minutaResponsavel:"Heitor", minutaResponsavelCustom:"", partes:[],
  documentosNecessarios:"", documentosPendentes:"",
  valores:{escritura:"",registro:"",imposto:"",tipoImposto:"ITBI",certidoes:"",total:""},
  registroImovel:{protocolo:"",numero:"",cidade:"",estado:"",estagio:""},
  assinatura:{data:"",hora:"",modalidade:"Em Cartório"},
  observacoes:"", criadoEm:"", atualizadoEm:"",
});


function LogoBadge({ size = 42 }) {
  return (
    <div style={{
      width: size, height: size,
      background: C.bgCard,
      border: `1px solid ${C.borderMd}`,
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 1,
    }}>
      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize: size * 0.38, color: C.gold, lineHeight:1 }}>27</span>
      <div style={{ width:"70%", height:1, background: C.gold + "66" }} />
      <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize: size * 0.13, color: C.gold, letterSpacing:"0.12em", lineHeight:1 }}>CN</span>
    </div>
  );
}

function stageColor(s){
  if(s<=2) return C.warning;
  if(s<=4) return C.info;
  if(s===5) return C.gold;
  if(s===6) return "#7A88B8";
  return C.success;
}

export default function App(){
  const [cases,setCases]=useState([]);
  useEffect(()=>{fetch('/api/casos').then(r=>r.json()).then(setCases).catch(()=>{});},[]);
  const [view,setView]=useState("home");
  const [adminAuth,setAdminAuth]=useState(false);
  const [adminPwd,setAdminPwd]=useState("");
  const [adminErr,setAdminErr]=useState("");
  const [editId,setEditId]=useState(null);
  const [formData,setFormData]=useState(initialCase());
  const [formStep,setFormStep]=useState(1);
  const [consultInput,setConsultInput]=useState({protocolo:"",senha:""});
  const [consultResult,setConsultResult]=useState(null);
  const [consultErr,setConsultErr]=useState("");
  const [filterStatus,setFilterStatus]=useState("all");
  const [searchTerm,setSearchTerm]=useState("");
  const [detailCase,setDetailCase]=useState(null);
  const [newParte,setNewParte]=useState({nome:"",cpf:"",rg:"",qualificacao:QUALIFICATIONS[0]});
  const [toast,setToast]=useState(null);
  const [aiChat,setAiChat]=useState([]);
  const [aiInput,setAiInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [showAI,setShowAI]=useState(false);
  const [adminTab,setAdminTab]=useState("atos");
  const [tarefas,setTarefas]=useState([]);
  useEffect(()=>{fetch('/api/tarefas').then(r=>r.json()).then(setTarefas).catch(()=>{});},[]);

  const PASS = "heitor2724";

  const showToast=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),3200);};

  const gerarMensagem=(c)=>{
    const stg=STAGES.find(s=>s.id===c.estagio);
    const nome=c.solicitante?.nome?.split(" ")[0]||"cliente";
    return [
      `Olá, ${nome}!`,``,
      `Aqui é o Escrevente Heitor Lima — 27º Tabelião de Notas da Capital.`,``,
      `Seu processo foi atualizado:`,
      `📋 Protocolo: ${c.protocolo||c.id}`,
      c.senha?`🔑 Senha: ${c.senha}`:null,
      c.tipo?`📌 Tipo: ${c.tipo}`:null,
      `🔄 Estágio atual: ${stg?.label||"—"}`,
      c.pendencia?`⚠️ Pendência: ${c.pendencia}`:null,``,
      `Acesse nosso sistema com seu protocolo e senha para acompanhar em detalhes.`,``,
      `Qualquer dúvida, estamos à disposição!`,
    ].filter(l=>l!==null).join("\n");
  };

  const notificarCliente=(c)=>{
    const msg=gerarMensagem(c);
    if(c.canal==="WhatsApp"){
      const phone=(c.solicitante?.telefone||"").replace(/\D/g,"");
      if(!phone){showToast("Telefone não cadastrado.","danger");return;}
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`,"_blank");
    }else if(c.canal==="E-mail"){
      const email=c.solicitante?.email;
      if(!email){showToast("E-mail não cadastrado.","danger");return;}
      const sub=`Atualização do seu processo — Protocolo ${c.protocolo||c.id}`;
      window.open(`mailto:${email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`,"_blank");
    }else{
      showToast(`Canal "${c.canal}" não suporta notificação automática.`,"danger");
    }
  };

  const handleLogin=()=>{
    if(adminPwd===PASS){setAdminAuth(true);setView("admin");setAdminErr("");}
    else setAdminErr("Senha incorreta.");
  };

  const saveCase=async()=>{
    const now=new Date().toISOString();
    try{
      if(editId){
        const updated={...formData,atualizadoEm:now};
        await fetch(`/api/casos/${editId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(updated)});
        setCases(cases.map(c=>c.id===editId?updated:c));
        showToast("Caso atualizado com sucesso.");
      } else {
        const nc={...formData,id:`ESC${Date.now().toString(36).toUpperCase()}`,criadoEm:now,atualizadoEm:now};
        if(!nc.protocolo) nc.protocolo=nc.id;
        await fetch("/api/casos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(nc)});
        setCases([nc,...cases]);
        showToast("Caso cadastrado com sucesso.");
      }
    }catch{showToast("Erro ao salvar. Verifique a conexão.","danger");}
    setEditId(null);setFormData(initialCase());setFormStep(1);setView("admin");
  };

  const delCase=async(id)=>{
    if(confirm("Excluir este caso permanentemente?")){
      try{
        await fetch(`/api/casos/${id}`,{method:"DELETE"});
        setCases(cases.filter(c=>c.id!==id));
        showToast("Caso excluído.","danger");
      }catch{showToast("Erro ao excluir.","danger");}
    }
  };

  const addTarefaAPI=async(t)=>{
    try{await fetch("/api/tarefas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});}catch{}
    setTarefas(prev=>[...prev,t]);
  };
  const toggleTarefaAPI=async(id)=>{
    const t=tarefas.find(t=>t.id===id);
    const updated={...t,feita:!t.feita};
    try{await fetch(`/api/tarefas/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(updated)});}catch{}
    setTarefas(prev=>prev.map(t=>t.id===id?updated:t));
  };
  const deleteTarefaAPI=async(id)=>{
    try{await fetch(`/api/tarefas/${id}`,{method:"DELETE"});}catch{}
    setTarefas(prev=>prev.filter(t=>t.id!==id));
  };

  const openEdit=(c)=>{setFormData({...c});setEditId(c.id);setFormStep(1);setView("form");};

  const handleConsult=()=>{
    setConsultErr("");setConsultResult(null);
    const found=cases.find(c=>c.protocolo?.toLowerCase()===consultInput.protocolo.toLowerCase()&&c.senha===consultInput.senha);
    if(found) setConsultResult(found);
    else setConsultErr("Protocolo ou senha incorretos. Verifique os dados informados pelo escrevente.");
  };

  const addParte=()=>{if(!newParte.nome)return;setFormData(f=>({...f,partes:[...(f.partes||[]),{...newParte}]}));setNewParte({nome:"",cpf:"",rg:"",qualificacao:QUALIFICATIONS[0]});};
  const remParte=(i)=>setFormData(f=>({...f,partes:f.partes.filter((_,idx)=>idx!==i)}));

  const filtered=cases.filter(c=>{
    const ms=filterStatus==="all"||c.estagio===parseInt(filterStatus);
    const mq=!searchTerm||[c.protocolo,c.solicitante?.nome,c.tipo].some(x=>x?.toLowerCase().includes(searchTerm.toLowerCase()));
    return ms&&mq;
  });

  const askAI=async()=>{
    if(!aiInput.trim()||aiLoading)return;
    const msg=aiInput.trim();setAiInput("");setAiLoading(true);
    const msgs=[...aiChat,{role:"user",content:msg}];
    setAiChat(msgs);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY||"",
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-allow-browser":"true",
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-5",max_tokens:1000,
          system:`Você é o assistente jurídico-notarial do escrevente Heitor Lima, do 27º Tabelião de Notas da Capital de São Paulo. Responda de forma profissional e concisa em português brasileiro. Contexto dos casos: ${JSON.stringify(cases.slice(0,8))}`,
          messages:msgs.map(m=>({role:m.role,content:m.content})),
        }),
      });
      const d=await res.json();
      setAiChat([...msgs,{role:"assistant",content:d.content?.[0]?.text||"Sem resposta."}]);
    }catch{
      setAiChat([...msgs,{role:"assistant",content:"Erro de conexão. Configure a chave VITE_ANTHROPIC_API_KEY no arquivo .env para usar o assistente."}]);
    }
    setAiLoading(false);
  };

  const FORM_STEPS=["Identificação","Solicitante","Partes","Documentação","Valores","Registro","Agendamento"];

  return(
    <div style={{fontFamily:"'Montserrat',sans-serif",background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{FONT}{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select,textarea{
          background:${C.bgSurf};border:1px solid ${C.border};color:${C.text};
          border-radius:6px;padding:10px 14px;
          font-family:'Montserrat',sans-serif;font-size:13px;width:100%;
          transition:border 0.2s,box-shadow 0.2s;outline:none;
        }
        input:focus,select:focus,textarea:focus{border-color:${C.gold};box-shadow:0 0 0 2px ${C.goldMid};}
        select option{background:${C.bgCard};}
        label{font-size:10px;color:${C.muted};letter-spacing:0.12em;text-transform:uppercase;display:block;margin-bottom:6px;font-weight:600;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 20px;border-radius:5px;border:1px solid ${C.borderMd};background:transparent;color:${C.text};cursor:pointer;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.06em;transition:all 0.2s;text-transform:uppercase;}
        .btn:hover{border-color:${C.gold};color:${C.gold};}
        .btn-gold{background:${C.gold};border-color:${C.gold};color:${C.bg};}
        .btn-gold:hover{background:${C.goldHov};border-color:${C.goldHov};color:${C.bg};}
        .btn-danger{border-color:${C.danger}44;color:${C.danger};}
        .btn-danger:hover{background:${C.danger}18;}
        .card{background:${C.bgCard};border:1px solid ${C.border};border-radius:10px;padding:22px;}
        .tag{display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;}
        textarea{resize:vertical;min-height:80px;}
      `}</style>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,
          background:toast.type==="danger"?C.danger:C.success,
          color:"#fff",padding:"12px 22px",borderRadius:6,fontSize:12,fontWeight:700,
          letterSpacing:"0.06em",textTransform:"uppercase",
          boxShadow:"0 8px 32px #00000080"}}>
          {toast.msg}
        </div>
      )}

      {/* TOPBAR */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,background:C.bgCard}}>
        <div style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>setView("home")}>
          <LogoBadge size={42}/>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:17,color:C.white,lineHeight:1.1,letterSpacing:"0.02em"}}>27º Tabelião de Notas</div>
            <div style={{fontSize:9,color:C.gold,marginTop:3,letterSpacing:"0.18em",fontWeight:600,textTransform:"uppercase"}}>Gestão Notarial · Heitor Lima</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn" style={{fontSize:11}} onClick={()=>{setConsultResult(null);setConsultErr("");setView("consult");}}>Consultar Protocolo</button>
          <button className="btn btn-gold" style={{fontSize:11}} onClick={()=>{adminAuth?setView("admin"):setView("login");}}>
            {adminAuth?"Área do Escrevente":"Área do Escrevente"}
          </button>
        </div>
      </div>

      {/* HOME */}
      {view==="home"&&(
        <div style={{maxWidth:960,margin:"0 auto",padding:"70px 32px"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <LogoBadge size={72}/>
            <div style={{height:1,width:80,background:C.gold,margin:"24px auto"}}/>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontSize:46,lineHeight:1.2,color:C.white,marginBottom:12,letterSpacing:"0.01em"}}>
              Central de Acompanhamento<br/>
              <span style={{color:C.gold,fontStyle:"italic"}}>de Atos Notariais</span>
            </h1>
            <p style={{color:C.silver,fontSize:13,maxWidth:520,margin:"0 auto",lineHeight:1.9,letterSpacing:"0.02em"}}>
              Acompanhe em tempo real o andamento da sua escritura ou procuração<br/>solicitada ao Escrevente Heitor Lima — 27º Tabelião de Notas da Capital.
            </p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:32}}>
            <div className="card" style={{cursor:"pointer",transition:"border-color 0.2s,transform 0.2s",textAlign:"center",padding:"36px 28px"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}
              onClick={()=>setView("consult")}>
              <div style={{width:52,height:52,background:C.goldSoft,border:`1px solid ${C.goldMid}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:22}}>🔍</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:22,color:C.white,marginBottom:10}}>Consultar Andamento</div>
              <div style={{color:C.silver,fontSize:12,lineHeight:1.8,marginBottom:24}}>Informe seu número de protocolo e senha para acompanhar o status da sua solicitação em tempo real.</div>
              <button className="btn btn-gold" style={{margin:"0 auto",justifyContent:"center",width:"100%"}}>Consultar Agora</button>
            </div>

            <div className="card" style={{background:C.bgSurf}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:20,color:C.gold,marginBottom:20,letterSpacing:"0.02em"}}>Contato & Informações</div>
              <div style={{fontSize:13,lineHeight:2.2,color:C.silver}}>
                <div><span style={{color:C.text,fontWeight:600}}>Escrevente:</span> Heitor Lima</div>
                <div><span style={{color:C.text,fontWeight:600}}>Cartório:</span> 27º Tabelião de Notas da Capital</div>
                <div style={{height:1,background:C.border,margin:"12px 0"}}/>
                <div style={{height:1,background:C.border,margin:"12px 0"}}/>
                <div style={{fontSize:12,color:C.silver,lineHeight:1.9}}>
                  📍 Av. São Luís, 59 — República, São Paulo<br/>
                  <span style={{color:C.muted,fontSize:11}}>Acesso pela Rua Basílio da Gama, 100 — República</span>
                </div>
                <div style={{height:1,background:C.border,margin:"12px 0"}}/>
                <div>📱 <a href="tel:+5511940233665" style={{color:C.gold,textDecoration:"none"}}>(11) 94023-3665</a></div>
                <div>📧 <a href="mailto:heitor27tab@gmail.com" style={{color:C.gold,textDecoration:"none"}}>heitor27tab@gmail.com</a></div>
                <div>☎️ <a href="tel:+551131245018" style={{color:C.gold,textDecoration:"none"}}>(11) 3124-5018</a></div>
              </div>
              <div style={{marginTop:18,padding:"12px 16px",background:C.goldSoft,borderRadius:6,fontSize:11,color:C.gold,border:`1px solid ${C.goldMid}`,lineHeight:1.8,letterSpacing:"0.04em"}}>
                ATUAÇÃO NOTARIAL DESDE 2021 — AUTENTICAÇÕES · FIRMAS · APOSTILAMENTO · ESCRITURAS · PROCURAÇÕES · ATAS NOTARIAIS
              </div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:16,color:C.dim,fontSize:11,letterSpacing:"0.1em"}}>
            <div style={{flex:1,height:1,background:C.border}}/>
            <span>ÁREA DO ESCREVENTE — ACESSO RESTRITO</span>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>
        </div>
      )}

      {/* LOGIN */}
      {view==="login"&&(
        <div style={{maxWidth:400,margin:"80px auto",padding:"0 32px"}}>
          <div className="card" style={{padding:"32px"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <LogoBadge size={52}/>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:22,color:C.white,marginTop:16,marginBottom:4}}>Área do Escrevente</div>
              <div style={{fontSize:11,color:C.muted,letterSpacing:"0.06em"}}>RESTRITO AO ESCREVENTE RESPONSÁVEL</div>
            </div>
            <label>Senha de Acesso</label>
            <input type="password" value={adminPwd} onChange={e=>setAdminPwd(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" style={{marginBottom:14}}/>
            {adminErr&&<div style={{color:C.danger,fontSize:12,marginBottom:12,letterSpacing:"0.04em"}}>{adminErr}</div>}
            <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",marginBottom:8}} onClick={handleLogin}>Entrar</button>
            <button className="btn" style={{width:"100%",justifyContent:"center",fontSize:11}} onClick={()=>setView("home")}>← Voltar</button>
          </div>
        </div>
      )}

      {/* CONSULTA */}
      {view==="consult"&&(
        <div style={{maxWidth:680,margin:"50px auto",padding:"0 32px"}}>
          <button className="btn" style={{marginBottom:24,fontSize:11}} onClick={()=>{setView("home");setConsultResult(null);setConsultErr("");}}>← Voltar</button>
          <div className="card" style={{marginBottom:consultResult?20:0}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:24,color:C.white,marginBottom:4}}>Consulta de Andamento</div>
            <div style={{color:C.muted,fontSize:11,letterSpacing:"0.08em",marginBottom:24}}>INFORME OS DADOS FORNECIDOS PELO ESCREVENTE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div>
                <label>Número do Protocolo</label>
                <input placeholder="Ex.: ESC2025-001" value={consultInput.protocolo}
                  onChange={e=>setConsultInput(p=>({...p,protocolo:e.target.value}))}/>
              </div>
              <div>
                <label>Senha de Acesso</label>
                <input type="password" placeholder="Senha fornecida pelo escrevente" value={consultInput.senha}
                  onChange={e=>setConsultInput(p=>({...p,senha:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&handleConsult()}/>
              </div>
            </div>
            {consultErr&&<div style={{color:C.danger,fontSize:12,marginBottom:12,padding:"10px 14px",background:C.danger+"18",borderRadius:6,border:`1px solid ${C.danger}33`}}>{consultErr}</div>}
            <button className="btn btn-gold" style={{width:"100%",justifyContent:"center"}} onClick={handleConsult}>Consultar</button>
          </div>
          {consultResult&&<CaseView c={consultResult} stageColor={stageColor}
            onSaveObs={async(obs)=>{const u={...consultResult,observacoesCliente:obs};try{await fetch(`/api/casos/${u.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});}catch{}setConsultResult(u);setCases(cases.map(c=>c.id===u.id?u:c));}}/>}
        </div>
      )}

      {/* ADMIN */}
      {view==="admin"&&adminAuth&&(
        <div style={{padding:"32px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:28,color:C.white}}>Área do Escrevente</div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn" style={{fontSize:11}} onClick={()=>setShowAI(!showAI)}>✦ Assistente IA</button>
              <button className="btn btn-gold" style={{fontSize:11}} onClick={()=>{setFormData(initialCase());setEditId(null);setFormStep(1);setView("form");}}>+ Novo Ato</button>
            </div>
          </div>

          {/* TABS */}
          <div style={{display:"flex",gap:0,marginBottom:28,borderBottom:`1px solid ${C.border}`}}>
            {[{id:"atos",label:"Atos"},{id:"agenda",label:"Agenda"}].map(tab=>(
              <button key={tab.id} onClick={()=>setAdminTab(tab.id)} style={{
                padding:"10px 28px",background:"none",border:"none",cursor:"pointer",
                borderBottom:`2px solid ${adminTab===tab.id?C.gold:"transparent"}`,
                color:adminTab===tab.id?C.gold:C.muted,
                fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:600,
                letterSpacing:"0.06em",transition:"all 0.2s",marginBottom:-1,
              }}>{tab.label.toUpperCase()}</button>
            ))}
          </div>

          {/* ABA ATOS */}
          {adminTab==="atos"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
                {[
                  {label:"Total de Atos",val:cases.length,c:C.gold},
                  {label:"Em Andamento",val:cases.filter(c=>c.estagio<7).length,c:C.info},
                  {label:"Finalizados",val:cases.filter(c=>c.estagio===7).length,c:C.success},
                  {label:"Com Pendências",val:cases.filter(c=>c.pendencia).length,c:C.warning},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px"}}>
                    <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10,fontWeight:700}}>{s.label}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:38,color:s.c}}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center"}}>
                <input placeholder="Buscar por protocolo, nome, tipo..." value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)} style={{maxWidth:340,fontSize:12}}/>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{maxWidth:240,fontSize:12}}>
                  <option value="all">Todos os estágios</option>
                  {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filtered.length===0&&(
                  <div style={{textAlign:"center",color:C.muted,padding:"48px 0",fontSize:13,letterSpacing:"0.08em"}}>NENHUM ATO ENCONTRADO</div>
                )}
                {filtered.map(c=>(
                  <div key={c.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,transition:"border-color 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderMd}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:17,color:C.white}}>{c.protocolo||c.id}</span>
                        <span className="tag" style={{background:stageColor(c.estagio)+"22",color:stageColor(c.estagio),border:`1px solid ${stageColor(c.estagio)}44`}}>
                          {STAGES.find(s=>s.id===c.estagio)?.short||"—"}
                        </span>
                        {c.tipo&&<span className="tag" style={{background:C.goldSoft,color:C.gold,border:`1px solid ${C.goldMid}`}}>{c.tipo}</span>}
                      </div>
                      <div style={{fontSize:11,color:C.muted,display:"flex",gap:16,flexWrap:"wrap"}}>
                        <span>{c.solicitante?.nome||"—"}</span>
                        {c.dataSolicitacao&&<span>Solicitado: {c.dataSolicitacao}</span>}
                        {c.pendencia&&<span style={{color:C.warning}}>⚠ {c.pendencia}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,flexShrink:0}}>
                      <button className="btn" style={{fontSize:10,padding:"7px 14px"}} onClick={()=>{setDetailCase(c);setView("detail");}}>Ver</button>
                      <button className="btn" style={{fontSize:10,padding:"7px 14px"}} onClick={()=>openEdit(c)}>Editar</button>
                      {(c.canal==="WhatsApp"||c.canal==="E-mail")&&(
                        <button className="btn" style={{fontSize:10,padding:"7px 14px",borderColor:C.gold+"88",color:C.gold}} onClick={()=>notificarCliente(c)}>
                          {c.canal==="WhatsApp"?"📱 Notificar":"✉️ Notificar"}
                        </button>
                      )}
                      <button className="btn btn-danger" style={{fontSize:10,padding:"7px 14px"}} onClick={()=>delCase(c.id)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ABA AGENDA */}
          {adminTab==="agenda"&&(
            <AgendaView
              cases={cases} tarefas={tarefas}
              onAddTarefa={addTarefaAPI} onToggleTarefa={toggleTarefaAPI} onDeleteTarefa={deleteTarefaAPI}
              C={C} setDetailCase={setDetailCase} setView={setView}
            />
          )}
        </div>
      )}

      {/* DETALHE ADMIN */}
      {view==="detail"&&detailCase&&adminAuth&&(
        <div style={{padding:"32px",maxWidth:900,margin:"0 auto"}}>
          <div style={{display:"flex",gap:10,marginBottom:24}}>
            <button className="btn" style={{fontSize:11}} onClick={()=>setView("admin")}>← Voltar</button>
            <button className="btn btn-gold" style={{fontSize:11}} onClick={()=>openEdit(detailCase)}>Editar Caso</button>
          </div>
          <CaseView c={detailCase} stageColor={stageColor}/>
          <div className="card" style={{marginTop:16}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:18,color:C.gold,marginBottom:18}}>Dados Internos (Escrevente)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              <Field label="Escrevente da Minuta" val={detailCase.minutaResponsavel==="Outro"?detailCase.minutaResponsavelCustom||"—":detailCase.minutaResponsavel||"—"}/>
              <Field label="Agendamento" val={detailCase.assinatura?.data?(detailCase.assinatura.data+(detailCase.assinatura.hora?" às "+detailCase.assinatura.hora:"")):"—"}/>
              <Field label="Modalidade" val={detailCase.assinatura?.modalidade||"—"}/>
              <Field label="Protocolo RI" val={detailCase.registroImovel?.protocolo||"—"}/>
              <Field label="Nº Registro" val={detailCase.registroImovel?.numero||"—"}/>
              <Field label="Cidade/Estado RI" val={detailCase.registroImovel?.cidade?(detailCase.registroImovel.cidade+"/"+detailCase.registroImovel.estado):"—"}/>
              <Field label="Status RI" val={detailCase.registroImovel?.estagio||"—"}/>
            </div>
            {detailCase.observacoes&&<div style={{marginTop:14}}><Field label="Observações" val={detailCase.observacoes}/></div>}
            {detailCase.observacoesCliente&&(
              <div style={{marginTop:14,padding:"12px 16px",background:C.info+"14",borderRadius:6,border:`1px solid ${C.info}30`}}>
                <div style={{fontSize:9,color:C.info,fontWeight:700,letterSpacing:"0.12em",marginBottom:6}}>OBSERVAÇÕES DO CLIENTE</div>
                <div style={{fontSize:13,color:C.text,whiteSpace:"pre-line"}}>{detailCase.observacoesCliente}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORMULÁRIO */}
      {view==="form"&&adminAuth&&(
        <FormView
          formData={formData} setFormData={setFormData}
          formStep={formStep} setFormStep={setFormStep}
          newParte={newParte} setNewParte={setNewParte}
          addParte={addParte} remParte={remParte}
          saveCase={saveCase} editId={editId}
          onCancel={()=>{setView("admin");setEditId(null);}}
          notificarCliente={notificarCliente}
          steps={FORM_STEPS}
          STAGES={STAGES} TIPOS={ESCRITURA_TIPOS}
          QUALS={QUALIFICATIONS} RI_STAGES={RI_STAGES} C={C}
        />
      )}

      {/* AI PANEL */}
      {showAI&&adminAuth&&(
        <div style={{position:"fixed",right:24,bottom:24,width:380,height:520,
          background:C.bgCard,border:`1px solid ${C.borderMd}`,borderRadius:12,
          display:"flex",flexDirection:"column",zIndex:1000,
          boxShadow:"0 24px 60px #00000090"}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:16,color:C.gold}}>✦ Assistente Notarial</div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.08em"}}>INTELIGÊNCIA ARTIFICIAL · 27º CARTÓRIO</div>
            </div>
            <button onClick={()=>setShowAI(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
            {aiChat.length===0&&(
              <div style={{color:C.muted,fontSize:12,textAlign:"center",marginTop:40,lineHeight:2,letterSpacing:"0.04em"}}>
                Pergunte sobre documentação,<br/>procedimentos, valores ou casos.
              </div>
            )}
            {aiChat.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:8,fontSize:12,lineHeight:1.7,
                  background:m.role==="user"?C.gold:C.bgSurf,
                  color:m.role==="user"?C.bg:C.text,
                  border:m.role==="assistant"?`1px solid ${C.border}`:"none"}}>
                  {m.content}
                </div>
              </div>
            ))}
            {aiLoading&&<div style={{color:C.muted,fontSize:11,letterSpacing:"0.08em"}}>CONSULTANDO...</div>}
          </div>
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&askAI()}
              placeholder="Faça uma pergunta..." style={{flex:1,fontSize:12}}/>
            <button className="btn btn-gold" style={{padding:"8px 14px",fontSize:12,flexShrink:0}} onClick={askAI}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CaseView ─── */
function CaseView({c,stageColor,onSaveObs}){
  const stg=STAGES.find(s=>s.id===c.estagio);
  return(
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"24px 28px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",background:C.bgSurf}}>
        <div>
          <div style={{fontSize:10,color:C.gold,letterSpacing:"0.14em",fontWeight:700,marginBottom:6}}>PROTOCOLO</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:28,color:C.white,lineHeight:1}}>{c.protocolo}</div>
          <div style={{fontSize:12,color:C.silver,marginTop:6}}>{c.tipo||"Escritura"}{c.teor?` · ${c.teor}`:""}</div>
        </div>
        <div style={{display:"inline-block",padding:"6px 18px",borderRadius:4,
          background:stageColor(c.estagio)+"22",color:stageColor(c.estagio),
          border:`1px solid ${stageColor(c.estagio)}44`,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>
          {stg?.label||"—"}
        </div>
      </div>

      <div style={{padding:"16px 28px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:3,marginBottom:8}}>
          {STAGES.map(s=>(
            <div key={s.id} style={{flex:1,height:3,borderRadius:2,
              background:c.estagio>=s.id?stageColor(c.estagio):C.border,
              transition:"background 0.4s"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {STAGES.map(s=>(
            <span key={s.id} style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",
              color:c.estagio>=s.id?stageColor(c.estagio):C.muted,textTransform:"uppercase"}}>
              {s.short}
            </span>
          ))}
        </div>
      </div>

      <div style={{padding:"24px 28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {(c.valores?.escritura||c.valores?.registro||c.valores?.imposto||c.valores?.certidoes)&&(
          <div style={{gridColumn:"1/-1",background:C.bgSurf,borderRadius:8,padding:"16px 18px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.14em",fontWeight:700,marginBottom:14}}>VALORES</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:16}}>
              {c.valores?.escritura&&<ValCard label="Escritura" val={`R$ ${c.valores.escritura}`}/>}
              {c.valores?.registro&&<ValCard label="Registro" val={`R$ ${c.valores.registro}`}/>}
              {c.valores?.imposto&&<ValCard label={c.valores?.tipoImposto||"Imposto"} val={`R$ ${c.valores.imposto}`}/>}
              {c.valores?.certidoes&&<ValCard label="Certidão" val={`R$ ${c.valores.certidoes}`}/>}
              {c.valores?.total&&<ValCard label="Total" val={`R$ ${c.valores.total}`} accent/>}
            </div>
          </div>
        )}

        <div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",fontWeight:700,marginBottom:12}}>SOLICITANTE</div>
          <div style={{fontSize:13,lineHeight:2.2,color:C.text}}>
            <div style={{fontWeight:600,color:C.white}}>{c.solicitante?.nome||"—"}</div>
            {c.solicitante?.email&&<div style={{fontSize:12,color:C.silver}}>{c.solicitante.email}</div>}
            {c.solicitante?.telefone&&<div style={{fontSize:12,color:C.silver}}>{c.solicitante.telefone}</div>}
            {c.canal&&<div style={{fontSize:11,color:C.gold,marginTop:4}}>via {c.canal}</div>}
          </div>
        </div>

        <div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",fontWeight:700,marginBottom:12}}>DATAS</div>
          <div style={{fontSize:13,lineHeight:2.2}}>
            {c.dataSolicitacao&&<div>Solicitação: <span style={{color:C.white,fontWeight:600}}>{c.dataSolicitacao}</span></div>}
            {c.dataDocumentacao&&<div>Env. docs: <span style={{color:C.white,fontWeight:600}}>{c.dataDocumentacao}</span></div>}
          </div>
        </div>

        {c.documentosNecessarios&&(
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",fontWeight:700,marginBottom:10}}>DOCUMENTOS NECESSÁRIOS</div>
            <div style={{fontSize:12,color:C.silver,lineHeight:1.8,whiteSpace:"pre-line"}}>{c.documentosNecessarios}</div>
          </div>
        )}
        {c.documentosPendentes&&(
          <div>
            <div style={{fontSize:9,color:C.warning,letterSpacing:"0.14em",fontWeight:700,marginBottom:10}}>⚠ DOCUMENTOS PENDENTES</div>
            <div style={{fontSize:12,color:C.warning,lineHeight:1.8,whiteSpace:"pre-line"}}>{c.documentosPendentes}</div>
          </div>
        )}

        {c.estagio===4&&c.conferenciaInterna&&(
          <div style={{gridColumn:"1/-1",padding:"12px 18px",background:C.info+"14",borderRadius:6,border:`1px solid ${C.info}30`,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15}}>🔍</span>
            <div>
              <div style={{fontSize:9,color:C.info,fontWeight:700,letterSpacing:"0.12em",marginBottom:2}}>ELABORAÇÃO DE MINUTA</div>
              <div style={{fontSize:13,color:C.info,fontWeight:600}}>Em conferência interna</div>
            </div>
          </div>
        )}
        {c.pendencia&&(
          <div style={{gridColumn:"1/-1",padding:"14px 18px",background:C.warning+"14",borderRadius:6,border:`1px solid ${C.warning}30`}}>
            <div style={{fontSize:9,color:C.warning,fontWeight:700,letterSpacing:"0.12em",marginBottom:6}}>PENDÊNCIA PARA PRÓXIMO ESTÁGIO</div>
            <div style={{fontSize:13,color:C.warning}}>{c.pendencia}</div>
          </div>
        )}

        {c.partes?.length>0&&(
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",fontWeight:700,marginBottom:12}}>PARTES DO ATO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {c.partes.map((p,i)=>(
                <div key={i} style={{background:C.bg,borderRadius:6,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                  <div style={{fontWeight:600,fontSize:13,color:C.white}}>{p.nome}</div>
                  <div style={{fontSize:11,color:C.gold,marginTop:2,letterSpacing:"0.04em"}}>{p.qualificacao}</div>
                  {p.cpf&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>CPF: {p.cpf}</div>}
                  {p.rg&&<div style={{fontSize:11,color:C.muted}}>RG: {p.rg}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {c.documentoFinalBase64&&(
          <DocumentoViewer fileName={c.documentoFinalFileName} base64={c.documentoFinalBase64}/>
        )}

        {c.minutaBase64&&(
          <div style={{gridColumn:"1/-1",padding:"14px 18px",background:C.info+"14",borderRadius:6,border:`1px solid ${C.info}30`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
            <div>
              <div style={{fontSize:9,color:C.info,fontWeight:700,letterSpacing:"0.12em",marginBottom:4}}>MINUTA DISPONÍVEL</div>
              <div style={{fontSize:12,color:C.text}}>📄 {c.minutaFileName||"minuta"}</div>
            </div>
            <a href={c.minutaBase64} download={c.minutaFileName||"minuta"}
              style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 20px",borderRadius:5,
                background:C.gold,border:`1px solid ${C.gold}`,color:C.bg,cursor:"pointer",
                fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:600,
                letterSpacing:"0.06em",textTransform:"uppercase",textDecoration:"none"}}>
              Baixar
            </a>
          </div>
        )}

        {onSaveObs&&<ClienteObs c={c} onSaveObs={onSaveObs}/>}
      </div>
    </div>
  );
}

function DocumentoViewer({fileName,base64}){
  const [show,setShow]=useState(false);
  return(
    <div style={{gridColumn:"1/-1",padding:"16px 18px",background:C.success+"14",borderRadius:8,border:`1px solid ${C.success}33`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:9,color:C.success,fontWeight:700,letterSpacing:"0.12em",marginBottom:4}}>DOCUMENTO FINAL DISPONÍVEL</div>
          <div style={{fontSize:12,color:C.text}}>📄 {fileName||"documento.pdf"}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShow(s=>!s)}
            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:5,
              background:"transparent",border:`1px solid ${C.success}`,color:C.success,cursor:"pointer",
              fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>
            {show?"Fechar":"Ver Documento"}
          </button>
          <a href={base64} download={fileName||"documento.pdf"}
            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:5,
              background:C.success,border:`1px solid ${C.success}`,color:"#fff",cursor:"pointer",
              fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:600,
              letterSpacing:"0.06em",textTransform:"uppercase",textDecoration:"none"}}>
            Baixar
          </a>
        </div>
      </div>
      {show&&(
        <iframe src={base64} title="Documento Final"
          style={{width:"100%",height:540,marginTop:16,borderRadius:6,border:`1px solid ${C.border}`}}/>
      )}
    </div>
  );
}

function ClienteObs({c,onSaveObs}){
  const [obs,setObs]=useState(c.observacoesCliente||"");
  const [saved,setSaved]=useState(false);
  const save=()=>{onSaveObs(obs);setSaved(true);setTimeout(()=>setSaved(false),2500);};
  return(
    <div style={{gridColumn:"1/-1",padding:"18px",background:C.bgSurf,borderRadius:8,border:`1px solid ${C.border}`}}>
      <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"0.12em",marginBottom:12}}>OBSERVAÇÕES / SOLICITAÇÕES DE ALTERAÇÃO</div>
      <textarea rows={4} value={obs} onChange={e=>{setObs(e.target.value);setSaved(false);}}
        placeholder="Descreva aqui suas dúvidas, observações ou solicitações de alteração na minuta..."
        style={{background:C.bg,border:`1px solid ${C.border}`,color:C.text,borderRadius:6,
          padding:"10px 14px",fontFamily:"'Montserrat',sans-serif",fontSize:13,width:"100%",
          resize:"vertical",minHeight:80,marginBottom:12,outline:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={save}
          style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 20px",borderRadius:5,
            background:saved?C.success:C.gold,border:"none",color:C.bg,cursor:"pointer",
            fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:600,
            letterSpacing:"0.06em",textTransform:"uppercase",transition:"background 0.3s"}}>
          {saved?"✓ Enviado":"Enviar Observação"}
        </button>
        {saved&&<span style={{fontSize:11,color:C.success,letterSpacing:"0.06em"}}>Observação registrada com sucesso.</span>}
      </div>
    </div>
  );
}

function ValCard({label,val,accent}){
  return(
    <div>
      <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:6}}>{label.toUpperCase()}</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:20,color:accent?C.gold:C.white}}>{val}</div>
    </div>
  );
}

function Field({label,val}){
  return(
    <div>
      <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:13,color:C.text}}>{val||"—"}</div>
    </div>
  );
}

/* ─── AgendaView ─── */
function AgendaView({cases,tarefas,onAddTarefa,onToggleTarefa,onDeleteTarefa,C,setDetailCase,setView}){
  const todayStr=new Date().toISOString().slice(0,10);
  const [cur,setCur]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const [sel,setSel]=useState(todayStr);
  const [novaTarefa,setNovaTarefa]=useState({titulo:"",hora:""});
  const [addOpen,setAddOpen]=useState(false);

  const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DIAS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  const prevM=()=>setCur(c=>c.m===0?{y:c.y-1,m:11}:{y:c.y,m:c.m-1});
  const nextM=()=>setCur(c=>c.m===11?{y:c.y+1,m:0}:{y:c.y,m:c.m+1});

  const firstDay=new Date(cur.y,cur.m,1).getDay();
  const daysInMonth=new Date(cur.y,cur.m+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const dateStr=(d)=>`${cur.y}-${String(cur.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const fmt=(s)=>{if(!s)return"";const[y,m,d]=s.split("-");return`${d}/${m}/${y}`;};

  const assinaturasDodia=(ds)=>cases.filter(c=>c.assinatura?.data===ds);
  const tarefasDoDia=(ds)=>tarefas.filter(t=>t.data===ds).sort((a,b)=>(a.hora||"99")>(b.hora||"99")?1:-1);

  const selAssinaturas=assinaturasDodia(sel);
  const selTarefas=tarefasDoDia(sel);

  const addTarefa=()=>{
    if(!novaTarefa.titulo.trim())return;
    onAddTarefa({id:Date.now().toString(36),data:sel,titulo:novaTarefa.titulo,hora:novaTarefa.hora,feita:false});
    setNovaTarefa({titulo:"",hora:""});setAddOpen(false);
  };
  const toggleTarefa=(id)=>onToggleTarefa(id);
  const delTarefa=(id)=>onDeleteTarefa(id);

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:24,alignItems:"start"}}>

      {/* CALENDÁRIO */}
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button className="btn" style={{fontSize:11,padding:"6px 14px"}} onClick={prevM}>←</button>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:20,color:C.white}}>
            {MESES[cur.m]} {cur.y}
          </div>
          <button className="btn" style={{fontSize:11,padding:"6px 14px"}} onClick={nextM}>→</button>
        </div>

        <div style={{padding:"16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
            {DIAS.map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:9,color:C.muted,fontWeight:700,letterSpacing:"0.1em",padding:"4px 0"}}>{d}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((day,i)=>{
              if(!day)return <div key={i}/>;
              const ds=dateStr(day);
              const hasAss=assinaturasDodia(ds).length>0;
              const hasTar=tarefasDoDia(ds).length>0;
              const isToday=ds===todayStr;
              const isSel=ds===sel;
              return(
                <div key={i} onClick={()=>setSel(ds)} style={{
                  padding:"6px 2px",borderRadius:6,cursor:"pointer",textAlign:"center",
                  background:isSel?C.gold:isToday?C.goldSoft:"transparent",
                  border:`1px solid ${isSel?C.gold:isToday?C.goldMid:"transparent"}`,
                  transition:"all 0.15s",
                }}>
                  <div style={{fontSize:13,color:isSel?C.bg:isToday?C.gold:C.text,fontWeight:isSel||isToday?700:400}}>{day}</div>
                  {(hasAss||hasTar)&&(
                    <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2}}>
                      {hasAss&&<div style={{width:5,height:5,borderRadius:"50%",background:isSel?C.bg:C.info}}/>}
                      {hasTar&&<div style={{width:5,height:5,borderRadius:"50%",background:isSel?C.bg:C.gold}}/>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:"10px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.muted}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.info}}/> Assinatura
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.muted}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.gold}}/> Tarefa
          </div>
        </div>
      </div>

      {/* PAINEL DO DIA */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:2}}>DIA SELECIONADO</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:20,color:sel===todayStr?C.gold:C.white}}>
                {fmt(sel)}{sel===todayStr&&<span style={{fontSize:11,color:C.gold,marginLeft:8,fontFamily:"'Montserrat',sans-serif",fontWeight:600,letterSpacing:"0.08em"}}>HOJE</span>}
              </div>
            </div>
            <button className="btn btn-gold" style={{fontSize:10,padding:"7px 14px"}} onClick={()=>setAddOpen(o=>!o)}>+ Tarefa</button>
          </div>

          {addOpen&&(
            <div style={{padding:"14px 20px",background:C.bgSurf,borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 100px auto",gap:8,alignItems:"end"}}>
                <div>
                  <label>Tarefa</label>
                  <input value={novaTarefa.titulo} onChange={e=>setNovaTarefa(p=>({...p,titulo:e.target.value}))}
                    placeholder="Descrição..." onKeyDown={e=>e.key==="Enter"&&addTarefa()}/>
                </div>
                <div>
                  <label>Horário</label>
                  <input type="time" value={novaTarefa.hora} onChange={e=>setNovaTarefa(p=>({...p,hora:e.target.value}))}/>
                </div>
                <button className="btn btn-gold" style={{padding:"10px 14px",fontSize:12}} onClick={addTarefa}>Add</button>
              </div>
            </div>
          )}

          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
            {/* Assinaturas */}
            {selAssinaturas.length>0&&(
              <div>
                <div style={{fontSize:9,color:C.info,fontWeight:700,letterSpacing:"0.12em",marginBottom:10}}>ASSINATURAS AGENDADAS</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {selAssinaturas.map(c=>(
                    <div key={c.id} style={{padding:"10px 14px",background:C.info+"14",borderRadius:6,border:`1px solid ${C.info}30`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:C.white}}>{c.solicitante?.nome||"—"}</div>
                          <div style={{fontSize:11,color:C.silver}}>{c.tipo||"Escritura"} · {c.protocolo}</div>
                          {c.assinatura?.hora&&<div style={{fontSize:11,color:C.info,marginTop:2}}>🕐 {c.assinatura.hora}{c.assinatura.modalidade?` · ${c.assinatura.modalidade}`:""}</div>}
                        </div>
                        <button className="btn" style={{fontSize:9,padding:"4px 10px",flexShrink:0}} onClick={()=>{setDetailCase(c);setView("detail");}}>Ver</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarefas */}
            {selTarefas.length>0&&(
              <div>
                <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"0.12em",marginBottom:10}}>TAREFAS DO DIA</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {selTarefas.map(t=>(
                    <div key={t.id} style={{padding:"10px 14px",background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                      <input type="checkbox" checked={!!t.feita} onChange={()=>toggleTarefa(t.id)}
                        style={{width:15,height:15,cursor:"pointer",accentColor:C.gold,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:t.feita?C.muted:C.text,textDecoration:t.feita?"line-through":"none"}}>{t.titulo}</div>
                        {t.hora&&<div style={{fontSize:10,color:C.muted}}>🕐 {t.hora}</div>}
                      </div>
                      <button onClick={()=>delTarefa(t.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 6px"}}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selAssinaturas.length===0&&selTarefas.length===0&&(
              <div style={{textAlign:"center",color:C.muted,fontSize:12,padding:"24px 0",letterSpacing:"0.06em"}}>NENHUM EVENTO NESTE DIA</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FormView ─── */
function FormView({formData,setFormData,formStep,setFormStep,newParte,setNewParte,addParte,remParte,saveCase,editId,onCancel,notificarCliente,steps,STAGES,TIPOS,QUALS,RI_STAGES,C}){
  const f=(k,v)=>setFormData(d=>({...d,[k]:v}));
  const fn=(s,k,v)=>setFormData(d=>({...d,[s]:{...d[s],[k]:v}}));
  const handleMinutaUpload=(e)=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>3*1024*1024){alert("Arquivo muito grande. Máximo 3MB.");e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=(ev)=>setFormData(d=>({...d,minutaBase64:ev.target.result,minutaFileName:file.name}));
    reader.readAsDataURL(file);
  };
  const handleDocFinalUpload=(e)=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>3*1024*1024){alert("Arquivo muito grande. Máximo 3MB.");e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=(ev)=>setFormData(d=>({...d,documentoFinalBase64:ev.target.result,documentoFinalFileName:file.name}));
    reader.readAsDataURL(file);
  };
  const handleOrcamentoUpload=(e)=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>3*1024*1024){alert("Arquivo muito grande. Máximo 3MB.");e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=(ev)=>setFormData(d=>({...d,orcamentoBase64:ev.target.result,orcamentoFileName:file.name}));
    reader.readAsDataURL(file);
  };

  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"32px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:26,color:C.white}}>{editId?"Editar Caso":"Novo Caso"}</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.12em",marginTop:4}}>PASSO {formStep} DE {steps.length} · {steps[formStep-1].toUpperCase()}</div>
        </div>
        <button className="btn" style={{fontSize:11}} onClick={onCancel}>Cancelar</button>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:28}}>
        {steps.map((_,i)=>(
          <div key={i} onClick={()=>setFormStep(i+1)} style={{flex:1,height:2,borderRadius:1,cursor:"pointer",
            background:formStep>i?C.gold:formStep===i+1?C.gold+"66":C.border,transition:"background 0.3s"}}/>
        ))}
      </div>

      <div className="card" style={{minHeight:320}}>
        {formStep===1&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Número do Protocolo</label><input value={formData.protocolo} onChange={e=>f("protocolo",e.target.value)} placeholder="Ex.: ESC2025-001"/></div>
              <div><label>Senha do Cliente</label><input value={formData.senha} onChange={e=>f("senha",e.target.value)} placeholder="Senha para consulta pública"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Tipo de Escritura</label>
                <select value={formData.tipo} onChange={e=>f("tipo",e.target.value)}>
                  <option value="">Selecione...</option>
                  {TIPOS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label>Data da Solicitação</label><input type="date" value={formData.dataSolicitacao} onChange={e=>f("dataSolicitacao",e.target.value)}/></div>
            </div>
            <div><label>Teor / Descrição do Ato</label><textarea rows={3} value={formData.teor} onChange={e=>f("teor",e.target.value)} placeholder="Descreva o objeto do ato notarial..."/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Estágio Atual</label>
                <select value={formData.estagio} onChange={e=>f("estagio",parseInt(e.target.value))}>
                  {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label>Escrevente Responsável pela Minuta</label>
                <select value={formData.minutaResponsavel} onChange={e=>f("minutaResponsavel",e.target.value)}>
                  <option>Heitor</option>
                  <option>Yasmin</option>
                  <option value="Outro">Outro...</option>
                </select>
                {formData.minutaResponsavel==="Outro"&&(
                  <input
                    style={{marginTop:8}}
                    value={formData.minutaResponsavelCustom}
                    onChange={e=>f("minutaResponsavelCustom",e.target.value)}
                    placeholder="Nome do escrevente"
                  />
                )}
              </div>
            </div>
            {formData.estagio===4&&(
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`}}>
                <input type="checkbox" id="conferencia" checked={!!formData.conferenciaInterna} onChange={e=>f("conferenciaInterna",e.target.checked)}
                  style={{width:16,height:16,cursor:"pointer",accentColor:C.gold}}/>
                <label htmlFor="conferencia" style={{fontSize:12,color:C.text,textTransform:"none",letterSpacing:"0.02em",cursor:"pointer",marginBottom:0,fontWeight:600}}>Em conferência interna</label>
              </div>
            )}
            <div><label>Pendência para Próximo Estágio</label><input value={formData.pendencia} onChange={e=>f("pendencia",e.target.value)} placeholder="O que está pendente para avançar?"/></div>
            <div><label>Observações Internas</label><textarea rows={3} value={formData.observacoes} onChange={e=>f("observacoes",e.target.value)} placeholder="Anotações internas (não visíveis ao cliente)..."/></div>
          </div>
        )}

        {formStep===2&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Nome do Solicitante</label><input value={formData.solicitante.nome} onChange={e=>fn("solicitante","nome",e.target.value)}/></div>
              <div><label>CPF</label><input value={formData.solicitante.cpf} onChange={e=>fn("solicitante","cpf",e.target.value)} placeholder="000.000.000-00"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>E-mail</label><input type="email" value={formData.solicitante.email} onChange={e=>fn("solicitante","email",e.target.value)}/></div>
              <div><label>Telefone</label><input value={formData.solicitante.telefone} onChange={e=>fn("solicitante","telefone",e.target.value)} placeholder="(11) 00000-0000"/></div>
            </div>
            <div><label>Como Solicitou</label>
              <select value={formData.canal} onChange={e=>f("canal",e.target.value)}>
                {["WhatsApp","E-mail","Pessoalmente","Telefone"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {formStep===3&&(
          <div>
            <div style={{background:C.bgSurf,borderRadius:8,padding:"16px",marginBottom:18,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:"0.08em",marginBottom:14}}>ADICIONAR PARTE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
                <div><label>Nome</label><input value={newParte.nome} onChange={e=>setNewParte(p=>({...p,nome:e.target.value}))}/></div>
                <div><label>CPF</label><input value={newParte.cpf} onChange={e=>setNewParte(p=>({...p,cpf:e.target.value}))}/></div>
                <div><label>RG</label><input value={newParte.rg} onChange={e=>setNewParte(p=>({...p,rg:e.target.value}))}/></div>
                <div><label>Qualificação</label>
                  <select value={newParte.qualificacao} onChange={e=>setNewParte(p=>({...p,qualificacao:e.target.value}))}>
                    {QUALS.map(q=><option key={q}>{q}</option>)}
                  </select>
                </div>
                <button className="btn btn-gold" style={{padding:"10px 16px",whiteSpace:"nowrap"}} onClick={addParte}>+ Add</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(formData.partes||[]).map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",
                  background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12}}>
                    <span style={{fontWeight:600,color:C.white}}>{p.nome}</span>
                    <span style={{color:C.gold,marginLeft:10,fontSize:11}}>{p.qualificacao}</span>
                    {p.cpf&&<span style={{color:C.muted,marginLeft:10,fontSize:11}}>CPF: {p.cpf}</span>}
                    {p.rg&&<span style={{color:C.muted,marginLeft:10,fontSize:11}}>RG: {p.rg}</span>}
                  </div>
                  <button className="btn btn-danger" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>remParte(i)}>Remover</button>
                </div>
              ))}
              {!formData.partes?.length&&<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"24px 0",letterSpacing:"0.06em"}}>NENHUMA PARTE ADICIONADA</div>}
            </div>
          </div>
        )}

        {formStep===4&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label>Data do Envio da Documentação</label><input type="date" value={formData.dataDocumentacao} onChange={e=>f("dataDocumentacao",e.target.value)}/></div>
            <div><label>Documentos Necessários</label><textarea rows={4} value={formData.documentosNecessarios} onChange={e=>f("documentosNecessarios",e.target.value)} placeholder="Liste os documentos necessários para o ato..."/></div>
            <div><label>Documentos Pendentes</label><textarea rows={4} value={formData.documentosPendentes} onChange={e=>f("documentosPendentes",e.target.value)} placeholder="Liste os documentos ainda pendentes de envio..."/></div>
            <div><label>Observações Internas</label><textarea rows={3} value={formData.observacoes} onChange={e=>f("observacoes",e.target.value)} placeholder="Anotações internas (não visíveis ao cliente)..."/></div>
            <div>
              <label>Minuta (Arquivo — máx. 3MB)</label>
              {formData.minutaFileName?(
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.text,flex:1}}>📄 {formData.minutaFileName}</span>
                  <button type="button" className="btn btn-danger" style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{f("minutaBase64","");f("minutaFileName","");}}>Remover</button>
                </div>
              ):(
                <input type="file" accept=".pdf,.doc,.docx,.odt" onChange={handleMinutaUpload} style={{cursor:"pointer"}}/>
              )}
            </div>
            <div>
              <label>Escritura / Matrícula — Documento Final (máx. 3MB)</label>
              {formData.documentoFinalFileName?(
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.text,flex:1}}>📄 {formData.documentoFinalFileName}</span>
                  <button type="button" className="btn btn-danger" style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{f("documentoFinalBase64","");f("documentoFinalFileName","");}}>Remover</button>
                </div>
              ):(
                <input type="file" accept=".pdf" onChange={handleDocFinalUpload} style={{cursor:"pointer"}}/>
              )}
            </div>
          </div>
        )}

        {formStep===5&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Valor da Escritura (R$)</label><input value={formData.valores.escritura} onChange={e=>fn("valores","escritura",e.target.value)} placeholder="0,00"/></div>
              <div><label>Valor do Registro (R$)</label><input value={formData.valores.registro} onChange={e=>fn("valores","registro",e.target.value)} placeholder="0,00"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Tipo de Imposto</label>
                <select value={formData.valores.tipoImposto} onChange={e=>fn("valores","tipoImposto",e.target.value)}>
                  <option>ITBI</option><option>ITCMD</option>
                </select>
              </div>
              <div><label>Valor do Imposto (R$)</label><input value={formData.valores.imposto} onChange={e=>fn("valores","imposto",e.target.value)} placeholder="0,00"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Atualização de Certidão (R$)</label><input value={formData.valores.certidoes} onChange={e=>fn("valores","certidoes",e.target.value)} placeholder="0,00"/></div>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
                <div style={{flex:1}}>
                  <label>Valor Total (R$)</label>
                  <input
                    value={formData.valores.total}
                    onChange={e=>fn("valores","total",e.target.value)}
                    placeholder="0,00"
                    style={{fontWeight:600,fontSize:15,color:C.gold}}
                  />
                </div>
                <button
                  className="btn"
                  style={{fontSize:11,flexShrink:0,marginBottom:0}}
                  type="button"
                  onClick={()=>{
                    const parse=(v)=>parseFloat((v||"0").replace(/\./g,"").replace(",","."))||0;
                    const soma=parse(formData.valores.escritura)+parse(formData.valores.registro)+parse(formData.valores.imposto)+parse(formData.valores.certidoes);
                    fn("valores","total",soma.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}));
                  }}
                >
                  Calcular
                </button>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <label>Orçamento (PDF — máx. 3MB)</label>
              {formData.orcamentoFileName?(
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.bgSurf,borderRadius:6,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.text,flex:1}}>📄 {formData.orcamentoFileName}</span>
                  <button type="button" className="btn btn-danger" style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{f("orcamentoBase64","");f("orcamentoFileName","");}}>Remover</button>
                </div>
              ):(
                <input type="file" accept=".pdf" onChange={handleOrcamentoUpload} style={{cursor:"pointer"}}/>
              )}
            </div>
          </div>
        )}

        {formStep===6&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Protocolo do Registro de Imóveis</label><input value={formData.registroImovel.protocolo} onChange={e=>fn("registroImovel","protocolo",e.target.value)}/></div>
              <div><label>Número do Registro</label><input value={formData.registroImovel.numero} onChange={e=>fn("registroImovel","numero",e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Cidade</label><input value={formData.registroImovel.cidade} onChange={e=>fn("registroImovel","cidade",e.target.value)}/></div>
              <div><label>Estado</label><input value={formData.registroImovel.estado} onChange={e=>fn("registroImovel","estado",e.target.value)} placeholder="SP"/></div>
            </div>
            <div><label>Estágio no Registro de Imóveis</label>
              <select value={formData.registroImovel.estagio} onChange={e=>fn("registroImovel","estagio",e.target.value)}>
                <option value="">Selecione...</option>
                {RI_STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {formStep===7&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><label>Data da Assinatura</label><input type="date" value={formData.assinatura.data} onChange={e=>fn("assinatura","data",e.target.value)}/></div>
              <div><label>Horário</label><input type="time" value={formData.assinatura.hora} onChange={e=>fn("assinatura","hora",e.target.value)}/></div>
              <div><label>Modalidade</label>
                <select value={formData.assinatura.modalidade} onChange={e=>fn("assinatura","modalidade",e.target.value)}>
                  {["Em Cartório","Diligência","Videoconferência"].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        <button className="btn" onClick={()=>setFormStep(s=>Math.max(1,s-1))}
          style={{visibility:formStep===1?"hidden":"visible",fontSize:11}}>← Anterior</button>
        <div style={{display:"flex",gap:10}}>
          {formStep<steps.length?(
            <button className="btn btn-gold" style={{fontSize:11}} onClick={()=>setFormStep(s=>s+1)}>Próximo →</button>
          ):(
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-gold" style={{fontSize:11}} onClick={saveCase}>✓ Salvar Caso</button>
              {(formData.canal==="WhatsApp"||formData.canal==="E-mail")&&(
                <button className="btn" style={{fontSize:11,borderColor:C.gold+"88",color:C.gold}}
                  onClick={()=>{saveCase();notificarCliente(formData);}}>
                  {formData.canal==="WhatsApp"?"📱 Salvar e Notificar":"✉️ Salvar e Notificar"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
