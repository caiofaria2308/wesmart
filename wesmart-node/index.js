const express=require('express');
const app =express();
const bodyParser=require('body-parser');
const port=8010;
const mysql=require('mysql');
//Configurando o body parser para pegar posts mais tarde
app.use(bodyParser.urlencoded({extended:true }));
app.use(bodyParser.json());
//Definindo as rotas
const router=express.Router();
router.get('/',(req,res)=>res.json({ message: 'Funcionando!!'}));
app.use('/',router);
app.listen(port);
console.log("API Funcionando!!! ");
const conn=conexao();
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
  }
  app.use(allowCrossDomain);
//Select sem parametro
//router.get('/usuario/:id?',(req,res)=>{
//    ExecSQL("SELECT * FROM usuario",res);
//});
//Select com parametro
//router.get('/usuario/:cod_usuario?',(req,res)=>{
//    let filter='';
//    if (req.params.id) filter="WHERE cod_usuario="+parseInt(req.params.id);
//   ExecSQL('SELECT * FROM usuario'+filter,res);
//});


//LOGIN
app.get('/usuario/:email?&:senha?', (req, res) => {
    var email=req.params.email;
    var senha=req.params.senha;

    ExecSQL("SELECT cod_usuario as codigo,nome_usuario as nome from usuario where email_usuario="+email+" and senha_usuario="+senha,res);
});
//SELECIONAR USUARIOS QUE ESTÃO COMEÇANDO A SUAS FERIAS 
app.get('/usuario/inicio_ferias/',(req,res)=>
{
    sql="select cod_usuario usuario from historico_ferias where data_inicio_historico_ferias<=date_format(now(),'%Y-%m-%d')and ativo_historico_ferias=true";
    ExecSQL(sql,res);
});

//SELECIONAR USUARIOS QUE TERMINARAM SUAS FERIAS
app.get('/usuario/fim_ferias/',(req,res)=>
{
    sql="select cod_historico_ferias codigo_ferias ,cod_usuario usuario from historico_ferias where data_termino_historico_ferias<date_format(now(),'%Y-%m-%d')and ativo_historico_ferias=true";
    ExecSQL(sql,res);

});
app.post('/usuario/desativar_ferias',(req,res)=>
{   
    ferias=req.body.codigo_ferias;
    sql="UPDATE historico_ferias set ativo_historico_ferias=false where cod_historico_ferias="+ferias;
    ExecSQL(sql,res);
});
//GET PROX TECNICO IMPLANTACAO
app.get('/get_prox_imp/',(req,res)=>
{
    //var sql="SELECT u.nome_usuario as nome from usuario u where u.ativo_usuario=true order by u.data_ult_imp_usuario asc limit 1";
    ExecSQL("SELECT u.nome_usuario as nome from usuario u where u.ativo_usuario=true order by u.data_ult_imp_usuario asc limit 1",res);
});
//GET PROX TECNICO VISITA TÉCNICA
app.get('/get_prox_tec/',(req,res)=>
{
    var sql="SELECT u.nome_usuario as nome from usuario u where u.ativo_usuario=true order by u.data_ult_tec_usuario asc limit 1";
    ExecSQL(sql,res);
});

//GET ULTIMO plantao cadastrado
app.get('/get_ult_plantao/',(req,res)=>
{
    var sql="SELECT u.nome_usuario as nome from historico_plantao hp INNER JOIN usuario u ON u.cod_usuario=hp.cod_usuario order by hp.data_historico_plantao desc limit 1";
    ExecSQL(sql,res);
    
});
// GET valor em caixa
app.get('/get_valor_caixa/',(req,res)=>
{
    var sql="SELECT round( cx.valor_abertura_caixa-(sum( hc.valor_historico_compra)),2)ValorCaixa  from historico_compra hc INNER JOIN caixa cx ON cx.cod_caixa=hc.cod_caixa WHERE cx.status_aberto_caixa=true GROUP BY cx.valor_abertura_caixa ";
    ExecSQL(sql,res);
});
//CADASTRAR USUARIO
app.post('/usuario/cadastrar/',(req,res)=>
{
    nome=req.body.nome;
    email=req.body.email;
    senha=req.body.senha;
    var sql="INSERT INTO usuario VALUES (null,'"+nome+"','"+email+"','"+senha+"','2000-01-01','2000-01-01',false   )";
    ExecSQL(sql,res);

});
//ALTERAR SENHA DO USUARIO
app.post('/usuario/alt_senha',(req,res)=>
{
    email=req.body.email;
    old_senha=req.body.old_senha;
    new_senha=req.body.new_senha;
    var sql="update usuario set senha_usuario='"+new_senha+"' where email_usuario='"+email+"' and senha_usuario='"+old_senha+"' ";
    ExecSQL(sql,res);
});
    
//GET TIPO VISITA
app.get('/visita/get_tipo_visita/',(req,res)=>
{
    var sql="SELECT cod_tipo_visita codigo_tipo, descricao_tipo_visita tipo FROM tipo_visita where ativo_tipo_visita=true;";
    ExecSQL(sql,res);
});
//GET HISTORICO DE VISITAS BASEADO NO TIPO, O QUAL ESTÁ REFERIDO COMO FILTRO
app.get('/visita/get_historico/:filtro?&:qtd?',(req,res)=>
{
    if (req.params.filtro==0)
        {var sql="SELECT hv.cod_historico_visita codigo_visita, u.nome_usuario,hv.nome_loja Loja,tv.descricao_tipo_visita tipo,DATE_FORMAT(hv.data_historico_visita,'%d/%m/%Y') DataVisita from historico_visita hv inner join usuario u on u.cod_usuario=hv.cod_usuario inner join tipo_visita tv on tv.cod_tipo_visita=hv.cod_tipo_visita where ativo_historico_visita=true order by data_historico_visita desc limit "+req.params.qtd;}
    else  {var sql="SELECT hv.cod_historico_visita codigo_visita, u.nome_usuario,hv.nome_loja Loja,tv.descricao_tipo_visita tipo,DATE_FORMAT(hv.data_historico_visita,'%d/%m/%Y') DataVisita from historico_visita hv inner join usuario u on u.cod_usuario=hv.cod_usuario inner join tipo_visita tv on tv.cod_tipo_visita=hv.cod_tipo_visita where ativo_historico_visita=true and hv.cod_tipo_visita="+req.params.filtro+" order by data_historico_visita desc limit "+req.params.qtd;}
    ExecSQL(sql,res);
});
//CADASTRO DE VISITA
app.post('/visita/cadastro/',(req,res)=>
{
    var usuario=req.body.usuario;
    var loja=req.body.loja;
    var tipo=req.body.tipo;
    var data=req.body.data;
    
    var sql="INSERT INTO historico_visita value (null,"+usuario+",'"+loja+"',"+tipo+",'"+data+"',true   ); ";
   
    ExecSQL(sql,res);
    
});
// CADASTRO DE VISITA
app.post('/visita/ferias/',(req,res)=>
{
    var usuario=req.body.usuario;
    var data_inicio=req.body.data_inicio;
    var data_final=req.body.data_fim;
    var sql="INSERT INTO historico_ferias VALUES (null,"+usuario+",'"+data_inicio+"','"+data_final+"',true)";
    ExecSQL(sql,res);
});

// ATUALIZAR ULTIMA VISITA DOS USUARIOS
app.post('/visita/att_usuario/',(req,res)=>
{
    var usuario=req.body.usuario;
    var tipo=req.body.tipo;
    var data=req.body.data;
    if(tipo==1)
    {
        sql="update usuario set data_ult_tec_usuario='"+data+"' where cod_usuario="+usuario;
    }
    else if(tipo==2)
    {
        sql="update usuario set data_ult_imp_usuario='"+data+"' where cod_usuario="+usuario;
    }
    
    ExecSQL(sql,res);
});
// ATUALIZAR STATUS DO USUARIO
app.post("/visita/att_status_usuario/",(req,res)=>
{
    var usuario=req.body.usuario;
    var filtro=req.body.filtro;
    if (filtro==1)
    {
        sql="update usuario set ativo_usuario=false where cod_usuario="+usuario;
    }
    else if (filtro==2)
    {
        sql="update usuario set ativo_usuario=true where cod_usuario="+usuario;
    }
    ExecSQL(sql,res);
});
// GET USUARIOS ATIVOS
app.get('/consulta/get_usuario/',(req,res)=>
{
    sql="select cod_usuario codigo_usuario, nome_usuario nome from usuario where ativo_usuario=true";
    ExecSQL(sql,res);
});
// GET USUARIOS INATIVOS
app.get('/consulta/get_usuario_inativo/',(req,res)=>
{
    sql="select cod_usuario codigo_usuario, nome_usuario nome from usuario where ativo_usuario=false";
    ExecSQL(sql,res);
});

//GET HISTÓRICO DE COMPRAS
app.get('/compra/get_historico/',(req,res)=>
{   
    
    sql="select hc.cod_historico_compra codigo,u.nome_usuario usuario,hc.chave_cfe chave,date_format(hc.data_historico_compra,'%d/%m/%Y') datacompra, hc.descricao_historico_compra descricao,round(hc.valor_historico_compra,2) valor from historico_compra hc inner join usuario u on u.cod_usuario=hc.cod_usuario inner join caixa c on c.cod_caixa=hc.cod_caixa where c.status_aberto_caixa=true";
    ExecSQL(sql,res);
});
app.get('/compra/get_historico_compra_caixa/:filtro?&:codigo?',(req,res)=>
{   
    
    sql="select hc.cod_historico_compra codigo,u.nome_usuario usuario,hc.chave_cfe chave,date_format(hc.data_historico_compra,'%d/%m/%Y') datacompra, hc.descricao_historico_compra descricao,hc.valor_historico_compra valor from historico_compra hc inner join usuario u on u.cod_usuario=hc.cod_usuario inner join caixa c on c.cod_caixa=hc.cod_caixa where c.status_aberto_caixa=true";
    if (req.params.filtro==1) sql="select hc.cod_historico_compra codigo,u.nome_usuario usuario,hc.chave_cfe chave,date_format(hc.data_historico_compra,'%d/%m/%Y') datacompra, hc.descricao_historico_compra descricao,hc.valor_historico_compra valor from historico_compra hc inner join usuario u on u.cod_usuario=hc.cod_usuario inner join caixa c on c.cod_caixa=hc.cod_caixa where c.cod_caixa="+req.params.codigo;
    ExecSQL(sql,res);
});

app.post('/compra/abrir_caixa',(req,res)=>
{
    usuario=req.body.usuario;
    valor_abertura=req.body.valor_Abertura;
    sql="insert into caixa values (null,"+usuario+",date_format(now(),'%Y-%m-%d'),null,'"+valor_abertura+"',null,true )";
    ExecSQL(sql,res);
});

app.get("/compra/fechar_caixa/:valorcaixa?",(req,res)=>
{
    sql="update caixa set status_aberto_caixa=false, data_fechamento_caixa=date_format(now(),'%Y-%m-%d'), valor_fechamento_caixa="+req.params.valorcaixa+" where status_aberto_caixa=true";
    ExecSQL(sql,res);
});

app.post('/compra/cadastro/',(req,res)=>
{
    usuario=req.body.usuario;
    valor_compra=req.body.valor_compra;
    descricao_compra=req.body.descricao_compra;
    data_compra=req.body.data_compra;
    chave_cfe=req.body.chave_cfe;
    sql="insert into historico_compra values(null,"+usuario+",'"+chave_cfe+"','"+data_compra+"','"+descricao_compra+"','"+valor_compra+"',(SELECT cod_caixa from caixa where status_aberto_caixa=true ))";
    ExecSQL(sql,res);

});

app.get('/compra/get_caixa/',(req,res)=>
{

    sql="SELECT c.cod_caixa codigo,u.nome_usuario usuario,date_format(c.data_abertura_caixa,'%d/%m/%Y') data_abertura,if(c.data_fechamento_caixa=null,'Caixa aberto',date_format(c.data_fechamento_caixa,'%d/%m/%Y')) data_fechamento,c.valor_abertura_caixa valor_abertura,if(c.valor_fechamento_caixa=null,'Caixa aberto',c.valor_fechamento_caixa) valor_fechamento,if(c.status_aberto_caixa=true,'Aberto','Fechado') situacao FROM caixa c INNER JOIN usuario u ON u.cod_usuario=c.cod_usuario "
    ExecSQL(sql,res);
});


app.get("/equipamento/get_historico/",(req,res)=>
{
    sql="SELECT he.cod_historico_equipamento codigo,u.nome_usuario usuario,e.descricao_equipamento equipamento,date_format(he.data_retirada_historico_equipamento,'%d/%m/%Y') retirada,date_format(he.data_entrega_historico_equipamento,'%d/%m/%Y') entrega FROM historico_equipamento he inner join usuario u on u.cod_usuario=he.cod_usuario inner join equipamento e on e.cod_equipamento = he.cod_equipamento";
    ExecSQL(sql,res);
});

app.get("/equipamento/get_lista_equipamento/",(req,res)=>
{
    sql="select cod_equipamento codigo, descricao_equipamento equipamento from equipamento where ativo_equipamento=true and locado_equipamento=false ";
    ExecSQL(sql,res);
});
app.get("/equipamento/get_lista_equipamento_locado/:cod?",(req,res)=>
{
    sql="select e.cod_equipamento codigo,e.descricao_equipamento equipamento from equipamento e left join historico_equipamento he on he.cod_equipamento = e.cod_equipamento  where e.locado_equipamento=true and he.devolvido_equipamento=false and he.cod_usuario="+req.params.cod;
    ExecSQL(sql,res);
});

app.post('/equipamento/cadastro_equipamento/',(req,res)=>
{
    equipamento=req.body.equipamento;
    sql="INSERT INTO equipamento VALUES (null,'"+equipamento+"',false,true)";
    ExecSQL(sql,res);
});
app.post('/equipamento/cadastrar_saida/',(req,res)=>
{
    usuario=req.body.usuario;
    equipamento=req.body.equipamento;
    data_retirada=req.body.data_retirada;
    sql="INSERT INTO historico_equipamento VALUES (null,"+usuario+",'"+data_retirada+"',null,'"+equipamento+"',false);   ";
    ExecSQL(sql,res);
});
app.post('/equipamento/devolver_equipamento/',(req,res)=>
{
    equipamento=req.body.equipamento;
    data_devolucao=req.body.data_devolucao;
    sql="update historico_equipamento set data_entrega_historico_equipamento='"+data_devolucao+"' , devolvido_equipamento=true where cod_equipamento="+equipamento+" and devolvido_equipamento=false";
    ExecSQL(sql,res);
});
app.post('/equipamento/att_equipamento/',(req,res)=>
{
    equipamento=req.body.equipamento;
    funcao=req.body.funcao;

    if(funcao==1)
    {
        sql="update equipamento set locado_equipamento=true where cod_equipamento="+equipamento;
    }
    else if(funcao==2)
    {
        sql ="update equipamento set locado_equipamento=false where cod_equipamento="+equipamento;
    }
    ExecSQL(sql,res);
});

app.get('/plantao/get_ult_plantao_domingo/:data_plantao?',(req,res)=>
{
    sql="select cod_usuario cod_usr from historico_plantao where weekday(data_historico_plantao)=6 and date_format(data_historico_plantao,'%d')-date_format('"+req.params.data_plantao+"','%d')=-7 order by data_historico_plantao desc limit 1";
    ExecSQL(sql,res);
});

app.post('/plantao/cad_plantao/',(req,res)=>
{
    usuario=req.body.usuario;
    data_plantao=req.body.data_plantao;
    sql="insert into historico_plantao values(null,"+usuario+",'"+data_plantao+"')";
    ExecSQL(sql,res);
});

app.get('/plantao/get_historico/:filtro?',(req,res)=>
{
    sql="select hp.cod_historico_plantao codigo, u.nome_usuario usuario, date_format(hp.data_historico_plantao,'%d/%m/%Y') data_plantao, weekday(hp.data_historico_plantao) dia_semana from historico_plantao hp  inner join usuario u on u.cod_usuario=hp.cod_usuario order by hp.data_historico_plantao desc limit "+req.params.filtro;
    ExecSQL(sql,res);
});

function conexao()
{
    const conn=mysql.createConnection(
        {
            host: '192.168.1.192',
            port: 3306,
            user: 'public',
            password: 'Smk_03657',
            database: 'wesmart'
        });
        return conn;
}

function ExecSQL(sqlQry,res)
{
    conn.query(sqlQry,function(error,results,fields)
    {
        if (error)
            res.json(error);
        else
            res.json(results);
        
    });

}