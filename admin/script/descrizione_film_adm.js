window.onload = async function(){
    await gestisci_ancora_profilo();
    const params = new URLSearchParams(window.location.search);
    const film_id = params.get("id");

    if(!film_id){
        console.log("ID del film non presente nell'URL");
        return;
    }

    try{
        const res = await fetch (`/api/film/${film_id}`);
        if(!res.ok){
            console.log("Errore nella risposta");
            return;
        }
        const response = await res.json();
        const film = response[0];
        const cont_film = document.getElementById("descrizione_film_adm");
        const modifica_dettagli = document.getElementById("modifica_dettagli_admin");
        modifica_dettagli.innerHTML ="";
        cont_film.innerHTML = "";
        cont_film.innerHTML = `
            <h1>Titolo: <strong>${film.titolo}</strong></h1>
            <img src="/${film.foto}" alt="${film.titolo}">
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
        if(film.evidenza){
            modifica_dettagli.innerHTML = `
                        <p>Il film è in evidenza sulla home vuoi rimuoverlo?<button id="evidenza_btn">Rimuovi</button></p>
                        <p>Vuoi rimuovere il film dal sito?<button id="rimuovi_film_btn">Rimuovi</button></p>
                        <span class="divider"></span>
                    `;
        }else{
            modifica_dettagli.innerHTML = `
                        <p>Il film non è in evidenza sulla home vuoi aggiungerlo?<span><button id="evidenza_btn">Aggiungi</button></span></p>
                        <p>Vuoi rimuovere il film dal sito?<span><button id="rimuovi_film_btn">Rimuovi</button></span></p>
                        <span class="divider"></span>
                    `;
        }

        const evidenza_film = document.getElementById("evidenza_btn");
        evidenza_film.addEventListener("click", async()=>{
            try{
                const res = await fetch("/api/gestione-evidenza", {
                    method:"POST",
                    headers:{
                        "Content-type" : "application/json"
                    },
                    credentials:"include",
                    body: JSON.stringify({
                        film_id: film.id,
                        evidenza: film.evidenza ? 0:1//se il film è in evidenza il server imposterà il valore evidenza a 0 in modo da toglierlo dai film in evidenza e viceversa
                    })
                });
                if(res.ok){
                    alert("Campo evidenza del film aggiornato");
                    window.location.reload();
                }
            }catch(err){
                console.error("Errore durante la richiesta", err);
            }
        })

        const elimina_film = document.getElementById("rimuovi_film_btn");
        elimina_film.addEventListener("click", async() =>{
            if(confirm("Sei sicuro di voler eliminare il film (azione irreversibile)?")){
                try{
                    const res = await fetch("/api/elimina-film",{
                        method:"POST",
                        headers:{
                            "Content-type":"application/json"
                        },
                        credentials:"include",
                        body: JSON.stringify({film_id: film.id})
                    });
                    if(res.ok){
                        alert("Film eliminato con successo");
                        window.location.href = "/catalogo.html";
                    }
                }catch(err){
                    console.error("Errore durante la richiesta", err);
                }
            }
        })

        


    }catch(err){
        console.log("Errore durante la fetch",err)
    }

    try{
        const recensioni_box = document.getElementById("recensioni_box_adm");
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
                <button class="elimina_rec_adm" data-id="${recensione.id}">Elimina</button>
            `;
        })

        document.querySelectorAll(".elimina_rec_adm").forEach(btn=>{
            btn.addEventListener("click", async()=>{
                console.log("Bottone cliccato");
                const recensione_id = btn.getAttribute("data-id");
                console.log("Recensione_id =", recensione_id);
                if(confirm("Sei sicuro di voler eliminare la recensione?")){
                    try{
                        const res= await fetch("/api/elimina-recensione", {
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json"
                            },
                            credentials:"include",
                            body : JSON.stringify({recensione_id})
                        })
                        if(res.ok){
                            window.location.reload();
                        }
                    }catch(err){
                        console.error("Errore nella richiesta")
                    }
                }
            })
        });


    }catch(err){
        console.error("Errore nella fetch delle recensioni", err);
    }

   
    
}

