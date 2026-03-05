async function gestisci_ancora_profilo(){
    const profilo_btn = document.getElementById("menu-profilo");

    profilo_btn.addEventListener("click", async(e) =>{
        e.preventDefault();
        try{
            const res = await fetch("/api/userinfo");

            if(!res.ok){
                console.error("Errore nella risposta");
                if(res.status === 401){
                    alert("Non sei loggato. Verrai reinderizzato alla pagina di login");
                    window.location.href = "/login.html";
                }
            }

            const data = await res.json();


            if(data.ruolo === "admin"){
                window.location.href = "/admin/admin.html";
            }else{
                window.location.href = "/private/restricted.html"
            }
        }catch(err){
            console.error("Errore: ", err);
        }
    });
}