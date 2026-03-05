window.onload = async function () {
    await gestisci_ancora_profilo();
    try {
        const res = await fetch("/admin/admin.html");
        if(!res.ok){
            return;
        }

        // acquisizione delle informazioni del profilo
        const userInfo = await fetch("/api/userinfo", {
            credentials: "include"
        });
        const userData = await userInfo.json();
        if (userData.success) {
            document.getElementById("username_adm").innerHTML = userData.username;
            document.querySelector("#nome_adm span").innerHTML = userData.nome;
            document.querySelector("#cognome_adm span").innerHTML = userData.cognome;
            document.querySelector("#tipo_utente_adm span").innerHTML = userData.ruolo;
            document.querySelector("#data_registrazione_adm span").innerHTML = new Date(userData.data_registrazione).toLocaleDateString();
        }

    }
    catch (err) {
        console.error("Errore fetch pagina protetta:", err);
    }

    const bttn = document.getElementById("logout_button_adm");
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

    const form = document.getElementById("form_admin");
    form.addEventListener("submit", async(e) =>{
        e.preventDefault();

        const titolo = document.getElementById("titolo_film").value;
        const anno_uscita = document.getElementById("anno_uscita").value;
        const regista = document.getElementById("regista").value;
        const url_copertina = document.getElementById("copertina_film").value;
        const evidenza = document.getElementById("evidenza").value;
        const descrizione = document.getElementById("descrizione_film").value;
        const durata = document.getElementById("durata_film").value;
        const genere = document.getElementById("genere_film").value;

        try{
            const response = await fetch("/api/aggiunta-film",{
                method:"POST",
                headers:{
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body : JSON.stringify({titolo,anno_uscita,regista,url_copertina,evidenza,descrizione,durata,genere})
            });
            const data = await response.json();
            if(response.status === 400){
                alert("Devi compilare tutti i campi");
            }
            if(response.ok){
                alert("Film aggiunto con successo");
                location.reload();
            }

        }catch(err){
            console.error("Errore durante la fetch", err);
        }
    })

};