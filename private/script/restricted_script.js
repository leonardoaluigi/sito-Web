window.onload = async function () {
    await gestisci_ancora_profilo();
    try {
        const res = await fetch("/private/restricted.html");//se tramite ancora o URL si prova ad accedere a restricted parte il middleware di controllo
        if(!res.ok){
            return;
        }

        // acquisizione delle informazioni del profilo
        const userInfo = await fetch("/api/userinfo", {
            credentials: "include"
        });
        const userData = await userInfo.json();
        if (userData.success) {
            document.getElementById("username_bas").innerHTML = userData.username;
            document.querySelector("#nome_bas span").innerHTML = userData.nome;
            document.querySelector("#cognome_bas span").innerHTML = userData.cognome;
            document.querySelector("#tipo_utente_bas span").innerHTML = userData.ruolo;
            document.querySelector("#data_registrazione_bas span").innerHTML = new Date(userData.data_registrazione).toLocaleDateString();
        }

    }
    catch (err) {
        console.error("Errore fetch pagina protetta:", err);
    }

    const bttn = document.getElementById("logout_button_bas");
    bttn.addEventListener("click", async() => {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include"
            });

            if (res.ok) {
                window.location.href = "/index.html";
            } else {
                console.error("Errore nel logout");
            }
        } catch (err) {
            console.error("Errore nella richiesta di logout:", err);
        }
    });

    
    try{
        const recensioni_mie = document.getElementById("recensioni_mie");
        const res = await fetch(`/api/recensioni-proprie`);
        if(!res.ok){
            console.error("Errore nella risposta");
            return;
        }
        const data = await res.json();
        recensioni_mie.innerHTML = "";
        if(data.length === 0){
            recensioni_mie.innerHTML = `
                <p id="no_recens_proprie">Non hai fatto ancora nessuna recensione.
                <a href="/catalogo.html">Inizia ora</a></p>`;
            console.log("Nessuna recensione trovata per questo film");
            return;
        }
        console.log(data);
        data.forEach(recensione => {
            recensioni_mie.innerHTML += `
                <p class="recens_proprie">
                <span>Film: <strong>${recensione.titolo}</strong></span>
                <span class=elimina_recensione><button data-id="${recensione.id}">Elimina</button></span>
                </p>
                <p class="recens_proprie_text">${recensione.testo}</p>
            `;
        })

        document.querySelectorAll(".elimina_recensione button").forEach(btn=>{
            btn.addEventListener("click", async()=>{
                console.log("Bottone cliccato");
                const recensione_id = btn.getAttribute("data-id");//per prendere l'id della recensione in questione usiamo il data-id
                console.log("Recensione_id =", recensione_id);
                if(confirm("Sei sicuro di voler eliminare la recensione?")){
                    try{
                        const res= await fetch("/api/elimina-mia-recensione", {
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
        console.error("Errore nella risposta:", err);
    }
    

    
    

    
    

};

