window.onload = async () =>{
    
    const form = document.getElementById("login_form");

    form.addEventListener("submit", async(e) =>{
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try{
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            const message = document.getElementById("message");
            console.log(data);

            if (data.success) {
                if(data.ruolo === "admin" )
                    window.location.href = "/admin/admin.html";
                else{
                    window.location.href = "/private/restricted.html"
                }
            }
            else {
                message.textContent = "Errore: " + data.message;
            }

            
        } catch (error) {
            console.error("Login failed:", error);
        }
    })

    
    
}