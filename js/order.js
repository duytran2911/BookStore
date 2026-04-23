firebase.auth().onAuthStateChanged(user => {
    const el = document.getElementById("user-area");

    if (user) {
        el.innerHTML = `
            <span class="user-name">👤 ${user.email}</span>
            <button class="auth-btn" onclick="logout()">Logout</button>
        `;
    } else {
        el.innerHTML = `
            <a href="login.html" class="auth-link">Login</a>
        `;
    }
});

function logout() {
    firebase.auth().signOut();
}

// ================= LOAD ORDERS =================
function loadOrders() {
    let totalOrders = 0;
    let processingOrders = 0;
    let totalRevenue = 0;

    db.collection("orders")
        .orderBy("orderDate", "desc")
        .get()
        .then(snap => {

            if (snap.empty) {
                document.getElementById("order-table-body").innerHTML =
                    `<tr><td colspan="7" class="empty">Chưa có đơn hàng</td></tr>`;
                return;
            }

            let html = "";

            snap.forEach(doc => {
                const o = doc.data();
                const id = doc.id;

                totalOrders++;
                if (o.status === "Đang xử lý") processingOrders++;
                totalRevenue += o.totalAmount;

                let date = "N/A";
                if (o.orderDate?.toDate) {
                    const d = o.orderDate.toDate();
                    date = d.toLocaleString("vi-VN");
                }

                html += `
                        <tr>
                            <td>${id.substring(0, 6)}...</td>

                            <td>
                                <b>${o.userName}</b><br>
                                <small>${o.userEmail}</small>
                            </td>

                            <td>${o.products.length}</td>

                            <td style="color:#ee4d2d;font-weight:bold">
                                ${o.totalAmount.toLocaleString()}₫
                            </td>

                            <td>
                                <select class="status-select"
                                onchange="updateStatus('${id}',this.value)">
                                    <option ${o.status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
                                    <option ${o.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                                    <option ${o.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                                    <option ${o.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                                </select>
                            </td>

                            <td>${date}</td>

                            <td>
                                <button class="btn-view" onclick="viewOrder('${id}')">
                                Xem
                                </button>
                            </td>
                        </tr>
                        `;
            });

            document.getElementById("order-table-body").innerHTML = html;

            // stats
            document.getElementById("total-orders").innerText = totalOrders;
            document.getElementById("processing-orders").innerText = processingOrders;
            document.getElementById("total-revenue").innerText =
                totalRevenue.toLocaleString() + "₫";
        });
}

// ================= UPDATE STATUS =================
function updateStatus(id, status) {
    if (!confirm("Cập nhật trạng thái?")) {
        loadOrders();
        return;
    }

    db.collection("orders").doc(id).update({
        status: status
    }).then(() => {
        alert("Đã cập nhật!");
        loadOrders();
    });
}

// ================= VIEW =================
function viewOrder(id) {
    alert("Chi tiết đơn: " + id);
}

loadOrders();