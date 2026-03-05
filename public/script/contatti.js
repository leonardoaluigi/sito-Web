window.onload = async ()=>{
    await gestisci_ancora_profilo();
    const form = document.getElementById("contatti_form");

    form.addEventListener("submit", async(e)=>{
        e.preventDefault();

        const email = document.getElementById("email").value;
        const oggetto = document.getElementById("oggetto").value;
        const messaggio= document.getElementById("messaggio_form").value;

        try{
            const response = await fetch("/api/contatti", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({email,oggetto,messaggio})
            });

            const data = await response.json();

            if (data.success){
                alert("Messaggio inviato correttamente");
                form.reset();
            }else{
                alert(data.error);
            }
        }catch(err){
            console.log("Fail:" +err);
        }
    })

}