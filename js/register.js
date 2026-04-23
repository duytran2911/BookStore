const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("inp-username").value;
    const email = document.getElementById("inp-email").value;
    const password = document.getElementById("inp-pwd").value;
    const confirm = document.getElementById("inp-confirm-pwd").value;

    if (password !== confirm) {
        alert("Mật khẩu không khớp");
        return;
    }

    if (password.length < 6) {
        alert("Mật khẩu phải >= 6 ký tự");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {

            const user = userCredential.user;

            // Lưu thêm info user vào Firestore
            db.collection("users").doc(user.uid).set({
                username: username,
                email: email,
                createdAt: new Date()
            });

            alert("Đăng ký thành công!");
            window.location.href = "login.html";

        })
        .catch(err => {
            alert(err.message);
            console.log(err);
        });
});