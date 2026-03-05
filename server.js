const express = require("express");
const mysql = require("mysql2");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

const port= 3000;

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

const JWT_SECRET = "my_secret";//firma per il token


const connection = mysql.createPool({
    host: "localhost",
    user: "user1",
    password: "pass1",
    database: "cinerate_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 100,

});

//api per andare a selezionare tutti i film in evidenza all'interno del db
app.get("/api/film-in-evidenza", async(req,res) =>{
    try{
        const query = "select * from film where evidenza=?";
        const [righe,colonne] = await connection.promise().execute(query,[1]);
        if (righe.length === 0){
            return res.status(404).json({error: "Nessun film in evidenza trovato"});
        }
        res.json(righe);
    } catch(err){
        console.error("Errore interno al DB:",err);
        return res.status(500).json({error: "Errore interno al server"});
    }  
});

//api per selezionare il film cliccato dall'utente e acquisirne i dettagli
app.get("/api/film/:id", async(req,res) =>{
    const film_id = req.params.id;
    if(!film_id){
        res.status(400).json({error: "ID del film mancante"});
        return;
    }
    try{
        const query = `
            SELECT film.*, GROUP_CONCAT(generi.nome SEPARATOR ', ') AS generi
            FROM film
            JOIN film_generi ON film.id = film_generi.id_film
            JOIN generi ON generi.nome = film_generi.nome_genere
            WHERE film.id = ?
            GROUP BY film.id;
        `;
        const[righe,colonne] = await connection.promise().execute(query, [film_id]);
        res.json(righe);
    }catch(err){
        console.error("Errore interno al DB:", err);
        return res.status(500).json({error: "Errore interno al server"});
    }
});

//api per selezionare tutte le recensioni di tutti gli utenti rispetto a uno specifico film 
app.get("/api/carica-recensioni/:id", async(req,res) =>{
    const film_id = req.params.id;
    try{
        const query = `SELECT utenti.username, recensioni.testo, recensioni.id
                    FROM recensioni
                    JOIN utenti ON recensioni.id_utente = utenti.id
                    WHERE recensioni.id_film = ?
                    `;
        const[righe,colonne] = await connection.promise().execute(query,[film_id]);
        res.json(righe);
    }catch(err){
        console.error("Errore interno al DB:", err);
        return res.status(500).json({error: "Errore interno al server"});
    }
});

//api per selezionare tutti i film (con relativi dettagli) presenti all'interno del db
app.get("/api/catalogo-film", async(req,res) =>{
    try{
        const query = `
        SELECT 
            film.*,
            GROUP_CONCAT(generi.nome SEPARATOR ', ') AS generi
        FROM
            film
        JOIN
            film_generi ON film.id = film_generi.id_film
        JOIN 
            generi ON film_generi.nome_genere = generi.nome
        GROUP BY
            film.id`;
        const[righe,colonne] = await connection.promise().execute(query);
        res.json(righe);
    }catch(err){
        console.error("Errore interno al DB:", err);
        return res.status(500).json({error: "Errore interno al server"});
    }
});

//api per caricare una recensione all'interno del db (con controllo utente da parte del middleware)
app.post("/api/recensioni", authenticateToken, async(req,res) =>{
    const {film_id, testo} = req.body;
    const id_utente = req.user.userID;
    if(!testo){
        return res.status(400).json({error: "Testo della recensione mancante"});
    }

    try{
        const query =`INSERT INTO recensioni(id_film,id_utente,testo)
                VALUES (?,?,?)
        `;
        const[righe,colonne] = await connection.promise().execute(query, [film_id,id_utente,testo]);
        return res.json({
            success:true,
            message: "Recensione aggiunta con successo"
        })
    }catch(err){
        console.error("Errore interno al DB:", err);
        return res.status(500).json({error: "Errore interno al server"});
    }
   
});

//api per caricare un contatto e-mail all'interno del db
app.post("/api/contatti", async(req,res) => {
    const {email, oggetto, messaggio} = req.body;
    if(!email || !oggetto || !messaggio){
        return res.status(400).json({error: "Tutti i campi sono obbligatori"})
    };
    try{
        const query = `INSERT INTO contatti(email,oggetto,messaggio)
                    VALUES (?,?,?)
        `;
        const [righe,colonne] = await connection.promise().execute(query,[email,oggetto,messaggio]);
        return res.json({
            success: true,
            message: "Recensione aggiunta con successo"
        })
    }catch(err){
        console.error("Errore interno al DB:", err);
        return res.status(500).json({error: "Errore interno al server"});
    }
})

//middleware per verifica presenza del token e per andarlo a validare tramite jwt.verify
function authenticateToken(req,res,next){
    const token = req.cookies.token;

    if(!token){
        //se la richiesta è per un'api allora non posso reinderizzare al login 
        //devo solo restituire un errore
        if(req.originalUrl.startsWith("/api")){
            return res.status(401).json({success:false, message: "Token mancante o non valido"})
        }

        return res.redirect(302,"/login.html");
    }
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }catch(err){
        return res.redirect(302, "/index.html");
    }
}

//middleware ulteriore per verificare se l'utente che intende utilizzare determinate risorse sia o meno un admin
function admin(req,res,next){
    if(req.user && req.user.userRole === "admin"){
        next();
    }else{
        return res.status(403).redirect("/403.html");
    }
}


//proteggo la cartella private
app.use("/private", authenticateToken, express.static("private"));
//proteggo la cartella admin
app.use("/admin", authenticateToken, admin, express.static("admin"));



//endpoint login con controllo del DB
app.post("/api/login", async(req,res) =>{
    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({
            success: false,
            message: "Username e password sono obbligatori"
        });
    }

    const query = `SELECT id, username, ruolo, nome, cognome, data_registrazione FROM utenti 
                    WHERE username = ? AND password = ?`;

    try{
        const [righe,colonne] = await connection.promise().execute(query, [username,password]);

        if(righe.length == 0){
            return res.status(401).json({
                success : false,
                message : "Credenziali non valide"
            });
        }

        const user = righe[0];

        const payload = {
            userID: user.id,
            userUsername: user.username,
            userRole: user.ruolo,
            userName: user.nome,
            userSurname: user.cognome,
            userRegDate: user.data_registrazione
        }

        const token = jwt.sign(payload, JWT_SECRET, {//crea il token formato dal payload e firmato da JWT_SECRET
            algorithm: "HS256",
            expiresIn: "1h"
        });

        //imposto il cookie: invio al Browser del client il token
        res.cookie("token", token, {
            httpOnly: true,//js non può leggere il token
            secure: true,//trasmettiamo con https
            maxAge: 3600000,
            sameSite: "Strict"//limita l'invio del cookie
        });

        return res.json({
            success : true,
            message : "Login riuscito",
            ruolo: user.ruolo
        });


    }catch(err){
        console.error("Errore interno al DB: ", err);
        return res.status(500).json({
            success: false,
            message: "Errore interno al server"
        });
    }
});

//endpoint per la registrazione con inserimento nel db
app.post("/api/registr", async(req,res) =>{
    const {nome,cognome,username,password,conferma_password} = req.body;

    if(!nome || !cognome || !username || !password || !conferma_password){
        return res.status(400).json({
            success: false,
            message : "Tutti i campi sono obbligatori"
        })
    }

    if(password !== conferma_password){
        return res.status(401).json({
            success: false,
            message: "Le password non coincidono"
        })
    }

    try{
        const query_esist = "SELECT id FROM utenti WHERE username = ?";
        const [righe_esist,colonne_esist] = await connection.promise().execute(query_esist, [username]);

        if(righe_esist.length > 0){
            return res.json({
                success:false,
                message: "Username già in utilizzo"
            })
        }

        //salvo il nuovo utente
        const query = "INSERT INTO utenti(username, password, nome, cognome) VALUES(?,?,?,?)";
        await connection.promise().execute(query,[username, password, nome, cognome] );

        return res.json({
            success:true,
            message: "Utente creato"
        })
    }catch(err){
        console.error("errore interno al server:" + err);
        return res.status(500).json({
            success: false,
            message: "Errore interno al server"
        })
    }
});


//tramite il middleware andiamo a reperire tutte le informazioni dell'utente loggato
app.get("/api/userinfo",authenticateToken, (req,res)=>{
    res.json({//usiamo req.user restituito dal middleware per mandare le info
        success:true,
        id: req.user.userID,
        nome:req.user.userName,
        cognome:req.user.userSurname,
        username: req.user.userUsername,
        ruolo: req.user.userRole,
        data_registrazione: req.user.userRegDate,
    })
});

//endpoint per logout
app.post("/api/logout", authenticateToken, (req, res) => {
    res.clearCookie("token");//cancelliamo dal browser il cookie
    res.json({
        success: true,
        message: "Logout effettuato"
    });
});

//endpoint per selezionare tutte le recensioni di un determinato utente
app.get("/api/recensioni-proprie", authenticateToken, async (req,res)=>{
    try{
        const user_id = req.user.userID;
        const query = `SELECT recensioni.id,recensioni.testo,film.titolo
                        FROM recensioni
                        JOIN film on recensioni.id_film = film.id
                        JOIN utenti ON recensioni.id_utente = utenti.id
                        WHERE recensioni.id_utente = ?
                    `;
        const[righe,colonne] = await connection.promise().execute(query,[user_id]);
        res.json(righe);
    }catch(err){
        console.error("Errore interno al server:", err);
        res.status(500).json({error: "Errore interno al server"});
    }
})

//endpoint che consente ad un utente di eliminare una propria recensione
app.post("/api/elimina-mia-recensione", authenticateToken, async(req,res) =>{
    try{
        const {recensione_id} = req.body;
        const user_id = req.user.userID;
        
        const check_query ="SELECT id FROM recensioni where id = ? AND id_utente = ?";
        const[check_righe, check_colonne] = await connection.promise().execute(check_query, [recensione_id,user_id]);

        if(check_righe === 0){
            return res.status(403).json({success:false ,message: "Non puoi eliminare questa recensione"});
        }

        const query = "DELETE FROM recensioni where id=?";
        await connection.promise().execute(query,[recensione_id]);
        res.json({success:true, message:"Recensione eliminata con successo"});
    }catch(err){
        console.error("Errore nell'eliminazione della recensione", err);
        res.status(500).json({success:false, message:"Errore interno al server"});
    }
});

//endpoint per eliminare la recensione di un utente da parte dell'admin
app.post("/api/elimina-recensione", authenticateToken,admin, async(req,res) =>{
    try{
        const {recensione_id} = req.body;
        const query = "DELETE FROM recensioni where id=?";
        await connection.promise().execute(query,[recensione_id]);
        res.json({success:true, message:"Recensione eliminata con successo"});
    }catch(err){
        console.error("Errore nell'eliminazione della recensione", err);
        res.status(500).json({success:false, message:"Errore interno al server"});
    }
});

//endpoint per aggiungere o eliminare un film in evidenza
app.post("/api/gestione-evidenza", authenticateToken,admin,async(req,res) =>{
    try{
        const{film_id, evidenza} = req.body;
        const query = "UPDATE film SET evidenza = ? where id = ?";
        await connection.promise().execute(query,[evidenza, film_id]);
        res.json({success:true, message: "Evidenza aggiornata"});
    }catch(err){
        console.error("Errore nell'aggiornamento del campo evidenza", err);
        res.status(500).json({success:false, message:"Errore interno al server"});
    }
})

//endpoint per eliminare un film dal db
app.post("/api/elimina-film", authenticateToken,admin,async(req,res)=>{
    try{
        const{film_id} = req.body;
        const query1 = "DELETE FROM film_generi WHERE id_film=?";
        await connection.promise().execute(query1,[film_id]);
        const query2 = "DELETE FROM film WHERE id = ?";
        await connection.promise().execute(query2,[film_id]);
        res.json({success:true, message:"Film eliminato"});

    }catch(err){
        console.error("Errore nell'eliminazione del film", err);
        res.status(500).json({success:false, message:"Errore interno al server"});
    }
})

//endpoint per aggiungere un film al db
app.post("/api/aggiunta-film", authenticateToken,admin, async(req,res) =>{
    try{
        const{titolo, anno_uscita, regista,url_copertina, evidenza, descrizione,durata,genere} = req.body;
        
        if(!titolo || !anno_uscita || !regista || !url_copertina || !evidenza || !descrizione || !durata || !genere){
            return res.status(400).json({
                success:false,
                message: "Tutti i campi sono obbligatori"
            })
        }
        const generiArr = genere.split(",").map(g => g.trim());
        const query1 = `INSERT INTO film(titolo,anno,regista,foto,evidenza,descrizione,durata) 
                        VALUES(?,?,?,?,?,?,?)`
        const[righe1,colonne1] = await connection.promise().execute(query1,[titolo, Number(anno_uscita), regista,url_copertina, Number(evidenza), descrizione,Number(durata)]);
        const film_id = righe1.insertId;
        const query2 = `INSERT INTO film_generi(id_film, nome_genere)
                        VALUES(?,?)`
        for(let i=0; i < generiArr.length; i++){//in base a quanti n generi ha il film aggiunto farò n query di insert sulla tabella ponte
            await connection.promise().execute(query2,[film_id, generiArr[i]]);
        }
        return res.json({
            success:true,
            message: "Film aggiunto con successo"
        })
    }catch(err){
        console.error("Errore nell'aggiunta del film:", err.message, err.stack);
        return res.status(500).json({success:false, message: "Errore del server"});
    }
})

app.use((req,res) =>{
    res.status(404).sendFile(__dirname + "/public/404.html");
});

app.listen(3000, () =>{
    console.log(`Server avviato su http://localhost:${port}`);
})