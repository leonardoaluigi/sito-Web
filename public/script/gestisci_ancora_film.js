async function gestisci_ancora_film(id_film){
    let data;
    try{
        const res = await fetch("/api/userinfo");

        if(!res.ok){
            console.error("Errore nella risposta");
        }

        data = await res.json();
    }catch(err){
        console.error("Errore: ", err);
    }
    document.querySelectorAll(".link_film").forEach((link, i) =>{
        //aggiungiamo un addEvListener ("click") sulle ancore dei film in modo da reinderizzare sulla pagina dell'user basic oppure admin
        link.addEventListener("click", async(e)=>{
            e.preventDefault();
            const id = id_film[i];
            if(data.ruolo ==="admin"){
                window.location.href=`/admin/descrizione_film_admin.html?id=${id}`;
            }else{
                window.location.href=`descrizione_film.html?id=${id}`;
            }
        })
    })
}