firebase.auth().onAuthStateChanged(user => {
    const el = document.getElementById("user-area");
    if (user) {
        el.innerHTML = `
                    👤 ${user.email}
                    <button onclick="logout()" style="margin-left:8px; background:white; color:#ee4d2d; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                        Đăng xuất
                    </button>
                `;
    } else {
        el.innerHTML = `<a href="login.html" style="background:white; color:#ee4d2d; padding:6px 12px; border-radius:6px; text-decoration:none;">Đăng nhập</a>`;
    }
});

function logout() {
    firebase.auth().signOut();
}

function toggleForm() {
    const form = document.getElementById("form");
    form.style.display = form.style.display === "block" ? "none" : "block";
}

function addProduct() {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const imageURL = document.getElementById("image").value.trim();
    const category = document.getElementById("category").value;
    const discount = Number(document.getElementById("discount").value) || 0;

    if (!name || !price || !imageURL) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    db.collection("products").add({
        name: name,
        price: price,
        imageURL: imageURL,
        category: category,
        discount: discount,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("✅ Thêm sản phẩm thành công!");
        toggleForm();
        // Reset form
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("image").value = "";
        document.getElementById("discount").value = "0";
    }).catch(err => {
        console.error(err);
        alert("Lỗi khi thêm sản phẩm!");
    });
}

// Hiển thị danh sách sản phẩm
db.collection("products")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            const discountText = p.discount && p.discount > 0 ?
                `<span class="discount">-${p.discount}%</span>` : "—";

            html += `
                        <tr>
                            <td><img src="${p.imageURL || 'https://via.placeholder.com/60'}" alt="${p.name}"></td>
                            <td style="text-align:left; font-weight:500;">${p.name}</td>
                            <td>${p.category || "Chưa phân loại"}</td>
                            <td>${p.price.toLocaleString()}₫</td>
                            <td>${discountText}</td>
                            <td>
                                <button class="delete" onclick="del('${doc.id}')">Xóa</button>
                            </td>
                        </tr>
                    `;
        });

        document.getElementById("list").innerHTML = html || `
                    <tr><td colspan="6" style="padding:30px; color:#888;">
                        Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
                    </td></tr>`;
    });

function del(id) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
        db.collection("products").doc(id).delete()
            .then(() => alert("Đã xóa sản phẩm!"))
            .catch(err => {
                console.error(err);
                alert("Không thể xóa sản phẩm!");
            });
    }
}