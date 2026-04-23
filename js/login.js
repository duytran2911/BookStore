const loginForm = document.querySelector("#login-form")
const inpEmail = document.querySelector("#inp-email")
const inpPwd = document.querySelector("#inp-pwd")

loginForm.addEventListener("submit", function (event) {

    event.preventDefault()

    const email = inpEmail.value
    const password = inpPwd.value

    if (!email || !password) {
        alert("Vui lòng nhập đầy đủ")
        return
    }

    firebase.auth().signInWithEmailAndPassword(email, password)

        .then((userCredential) => {

            const user = userCredential.user

            const userSession = {
                user: user,
                expiry: new Date().getTime() + 2 * 60 * 60 * 1000
            }

            localStorage.setItem("user_session", JSON.stringify(userSession))

            alert("Đăng nhập thành công")
            window.location.href = "index.html"

        })

        .catch((error) => {
            alert("Sai email hoặc mật khẩu")
            console.log(error)
        })

})