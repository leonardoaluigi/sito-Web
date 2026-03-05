window.onload = async() =>{
    await gestisci_ancora_profilo();
    const form = document.getElementById("registr_form");


    form.addEventListener("submit", async(e) =>{
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const cognome = document.getElementById("cognome").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const conferma_password = document.getElementById("conferma_password").value;

        try{
            const response = await fetch("/api/registr",{
                method : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ nome, cognome, username, password, conferma_password })
            });

            const data = await response.json();
            const message = document.getElementById("message");

            if(data.success){
                message.textContent = "Registrazione avvenuta con successo!";
                message.style.color = "green";
                setTimeout(() =>{
                    window.location.href = "login.html";
                }, 1000);//dopo un secondo dall'avvenuta registrazione reinderizza su login.html per permettere di effettuare il login
            }else{
                message.textContent = "Errore: " + data.message;
            }
        }catch(err){
            console.error("Registrazione fallita" + err);
        }
    })
    
    
    
}