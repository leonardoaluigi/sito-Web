window.onload = async() => {
  await gestisci_ancora_profilo();
  const precButt = document.getElementById("prec");
  const succButt = document.getElementById("succ");
  const lista = document.getElementById("film_evidenza");
    
  let current = 0;//indice del primo film che è visibile attualmente
  let slides = [];//array che conterrà tutti gli elementi
  let nFilm = 3;//numero di film che si vedranno sullo schermo 

  function showFilm(indice) {
    slides.forEach((slide,i) =>{
      slides[i].style.display = (i >= indice && i < indice + nFilm) ? "block" : "none";//nascondiamo tutte le immagini comprese tra indice e indice+nFilm
    })
    precButt.style.display = indice === 0? "none" : "block";
    succButt.style.display = (indice + nFilm === slides.length)? "none":"block";
  }

  try {
    const res = await fetch("/api/film-in-evidenza");
    if (!res.ok) {
      console.log("Errore nella risposta");
      return;
    }

    const data = await res.json();
    console.log("Film ricevuti:", data);
    const id_film = data.map(film => film.id);//creiamo un array formato da tutti gli id dei film ricevuti
    lista.innerHTML = "";

    data.forEach(film => {//carichiamo dinamicamente i film in evidenza sulla home
      lista.innerHTML += `<a href="#" class="link_film">
        <img src="${film.foto}" alt="${film.titolo}"></a>`
    });

    slides = lista.querySelectorAll("a");//salva tutti i film presenti in lista dentro l'array
    showFilm(current);//chiama la funzione che mi mostra 3 film alla volta sul carosello
    await gestisci_ancora_film(id_film);///chiama la funzione per la gestione delle ancore
  } catch (err) {
    console.error("Errore durante la fetch", err);
  }



    

  precButt.addEventListener("click", () => {
    if (slides.length > 0) {
      current = Math.max(current - nFilm, 0);
      showFilm(current);
    }
  });

  succButt.addEventListener("click", () => {
      if (slides.length > 0) {
        current = Math.min(current + nFilm, slides.length - nFilm);
        showFilm(current);
      }
  });


  
};


