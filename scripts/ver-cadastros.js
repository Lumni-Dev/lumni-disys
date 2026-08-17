// Lista os cadastros do banco (Supabase) mostrando o que cada usuario/workspace
// esta fazendo: quantas vagas, candidatos e processos (pipeline) cadastrou.
// Uso: node scripts/ver-cadastros.js  (disparado pelo "ver cadastros.bat" na area de trabalho)

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local"), quiet: true });
const { Client } = require("pg");

function dataBR(v) {
  return new Date(v).toLocaleDateString("pt-BR");
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const usuarios = await client.query(
    "SELECT email, created_at FROM user_profiles ORDER BY created_at"
  );

  // Um resumo por workspace (account): dono, nome e quantidade de vagas,
  // candidatos e processos (cartoes do pipeline).
  const accounts = await client.query(`
    SELECT
      a.id,
      a.owner_email,
      a.name,
      a.created_at,
      (SELECT COUNT(*) FROM jobs j           WHERE j.account_id = a.id) AS vagas,
      (SELECT COUNT(*) FROM candidates c     WHERE c.account_id = a.id) AS candidatos,
      (SELECT COUNT(*) FROM pipeline_cards p WHERE p.account_id = a.id) AS processos
    FROM accounts a
    ORDER BY a.created_at
  `);

  // Vagas de cada workspace, com o numero de candidatos ligados a cada vaga.
  const jobs = await client.query(`
    SELECT
      j.account_id,
      j.title,
      j.status,
      j.openings,
      (SELECT COUNT(*) FROM candidates c WHERE c.job_id = j.id) AS candidatos
    FROM jobs j
    ORDER BY j.account_id, j.created_at
  `);

  const jobsByAccount = new Map();
  for (const j of jobs.rows) {
    if (!jobsByAccount.has(j.account_id)) jobsByAccount.set(j.account_id, []);
    jobsByAccount.get(j.account_id).push(j);
  }

  console.log("========================================");
  console.log(`USUARIOS CADASTRADOS: ${usuarios.rows.length}`);
  console.log("========================================");
  for (const u of usuarios.rows) {
    console.log(`  - ${u.email}  (desde ${dataBR(u.created_at)})`);
  }

  console.log("");
  console.log("========================================");
  console.log(`WORKSPACES E ATIVIDADE: ${accounts.rows.length}`);
  console.log("========================================");

  // Totais gerais para uma visao rapida no topo do bloco.
  let totVagas = 0, totCand = 0, totProc = 0;
  for (const a of accounts.rows) {
    totVagas += Number(a.vagas);
    totCand += Number(a.candidatos);
    totProc += Number(a.processos);
  }
  console.log(`TOTAL GERAL -> Vagas: ${totVagas} | Candidatos: ${totCand} | Processos: ${totProc}`);
  console.log("");

  for (const a of accounts.rows) {
    const nome = a.name ? a.name : "(sem nome)";
    console.log(`  ${nome}  [${a.owner_email}]  (desde ${dataBR(a.created_at)})`);
    console.log(
      `     Vagas: ${a.vagas} | Candidatos: ${a.candidatos} | Processos (pipeline): ${a.processos}`
    );

    const lista = jobsByAccount.get(a.id) || [];
    for (const j of lista) {
      console.log(
        `       vaga: ${j.title}  (${j.status}, ${j.openings} posicoes, ${j.candidatos} candidatos)`
      );
    }
    console.log("");
  }

  await client.end();
}

main().catch((e) => {
  console.error("Erro ao consultar o banco:", e.message);
  process.exitCode = 1;
});
