window.onload = async() =>{
    await gestisci_ancora_profilo();
    const filtro_btn = document.getElementById("filtro_btn");
    filtro_btn.addEventListener("click",async () =>{
        const genere = document.getElementById("genere").value;
        const anno = document.getElementById("anno").value;
        const durata_min = document.getElementById("durata_min").value;
        await caricaFilm(genere, anno, durata_min);
    });
    
    await caricaFilm();
    
}

async function caricaFilm(genere = null, anno = null, durata = null){
    try {
        const film_catalogo = document.getElementById("catalogo_film");
        const res = await fetch("/api/catalogo-film");
        const data = await res.json();
        console.log(data);
        film_catalogo.innerHTML = "";

        const film_filtrati = data.filter(film => {
            /*crea un array di generi usando la virgola come separatore
            del tipo ["Azione", "Drammatico"}
            poi sostituisce questo array con un nuvo array ottenuto andando
            ad eliminare gli spazi non necessari con trim()*/
            //salviamo ogni genere dentro questo array
            const generiArray = film.generi.split(",").map(g => g.trim());
            /*vediamo se generi array contiene il genere che abbiamo mandato come parametro
            se generi array lo contiene condizione vera quindi confrGenere è vero
            ovviamente se non specifichiamo il genere quindi (genere = null) la condizione sarà comunque vera
            grazie a !genere*/
            const confrGenere = !genere || generiArray.includes(genere);
            const confrAnno = !anno || film.anno === parseInt(anno);
            const confrDurata = !durata || film.durata >= parseInt(durata);
            //se questa condizione è vera allora il film esaminato finisce dentro film_filtrati
            return confrGenere && confrAnno && confrDurata;
        });

        if (film_filtrati.length === 0) {
            film_catalogo.innerHTML = `<p>:(</p>
                                        <p>Nessun film trovato con i criteri specificati</p>`;
            return;
        }

        film_filtrati.forEach(film => {
            film_catalogo.innerHTML += `
                <a href="#" class="link_film">
                    <img src="${film.foto}" alt="${film.titolo}">
                </a>`;
        });
        //salviamo tutti e solo gli id dei film filtrati dentro id_film tramite la funzione map()
        const id_film = film_filtrati.map(film => film.id);
        await gestisci_ancora_film(id_film);

    } catch (err) {
        console.error("Errore durante il caricamento del catalogo:", err);
    }
}


