window.onload =async function(){
    await gestisci_ancora_profilo();
    const params = new URLSearchParams(window.location.search);//prende tutta la parte dopo ? sull'URL
    const film_id = params.get("id");//prende l'id contenuto in params (id=8) ad esempio

    if(!film_id){
        console.log("ID del film non presente nell'URL");
        return;
    }

    //caricamento recensione tramite la form per le recensioni e /api/recensioni
    const form = document.getElementById("form_recensioni");
    form.addEventListener("submit", async (e) =>{
        e.preventDefault();

        const testo = form.querySelector("textarea").value;
        try{
            const res = await fetch("/api/recensioni", {
                method: "POST",
                headers:{
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify({film_id,testo})
            });
            const response = await res.json();
            //controllo se il testo è presente
            if(res.status === 400){
                alert("Testo della recensione mancante");

            }else if(res.status === 401){//controllo se l'utente è loggato
                alert("Autenticazione richiesta. Effettua il login");
                window.location.href = "login.html";
            }else if (response.success){
                alert("Recensione inviata");
                window.location.reload();//ricarica la pagina con lo stesso URL
            }else{
                console.error("Errore", response);
            }
        }catch(err){
            console.error("Errore durante l'invio della recensione", err);
        }
    })

    //appena la pagina si carica mostriamo dinamicamente i dettagli del film con id = film_id
    try{
        const res = await fetch (`/api/film/${film_id}`);
        if(!res.ok){
            console.log("Errore nella risposta");
            return;
        }
        const response = await res.json();
        const film = response[0];
        const cont_film = document.getElementById("descrizione_film");
        cont_film.innerHTML = "";
        cont_film.innerHTML = `
            <h1>Titolo: <strong>${film.titolo}</strong></h1>
            <img src="${film.foto}" alt="${film.titolo}">
            <p>Regista: <strong>${film.regista}</strong></p>
            <span class="divider"></span>
            <p>Anno: <strong>${film.anno}</strong></p>
            <span class="divider"></span>
            <p>Genere: <strong>${film.generi}</strong></p>
            <span class="divider"></span>
            <p>Durata: <strong>${film.durata}m</strong></p>
            <span class="divider"></span>
            <p>Descrizione:</p>
            <p><strong>${film.descrizione}</strong></p>
            <span class="divider"></span>
            `
        ;

    }catch(err){
        console.log("Errore durante la fetch",err)
    }


    //carico dinamicamente le recensioni del film con id=film_id
    try{
        const recensioni_box = document.getElementById("recensioni_box");
        const res = await fetch(`/api/carica-recensioni/${film_id}`);
        if(!res.ok){
            console.error("Errore nella risposta");
            return;
        }
        const response = await res.json();
        recensioni_box.innerHTML = "";
        if(response.length === 0){
            recensioni_box.innerHTML = `
                <p class="empty_recens_box">:( Nessuna recensione disponibile per questo film.</p>`;
            console.log("Nessuna recensione trovata per questo film");
            return;
        }
        response.forEach(recensione => {
            recensioni_box.innerHTML += `
                <p class="no_empty_recens_box_utente">Utente: <strong>${recensione.username}</strong></p>
                <p class="no_empty_recens_box_testo">${recensione.testo}</p>
                <span class="divider"></span>
            `;
        })
    }catch(err){
        console.error("Errore nella fetch delle recensioni", err);
    }

    
    
    

}

