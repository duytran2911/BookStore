let products = [];
let cart = [];
let currentCategory = "all";
let currentSort = "";
let userId = null;
let productMap = {};
let currentBanner = 0;
const bannerImgs = document.querySelectorAll(".banner-images img");

// Banner Slider
function startBannerSlider() {
    setInterval(() => {
        bannerImgs[currentBanner].classList.remove("active");
        currentBanner = (currentBanner + 1) % bannerImgs.length;
        bannerImgs[currentBanner].classList.add("active");
    }, 3000);
}

// Auth State
firebase.auth().onAuthStateChanged(user => {
    const userArea = document.getElementById("user-area");
    if (user) {
        userId = user.uid;
        userArea.innerHTML = `
                    👤 ${user.email}
                    <button onclick="logout()" style="margin-left:10px; padding:5px 10px; background:white; color:#ee4d2d; border:none; border-radius:5px; cursor:pointer;">
                        Đăng xuất
                    </button>
                `;
        loadCart();
    } else {
        userId = null;
        cart = [];
        updateCart();
        userArea.innerHTML = `
                    <a href="login.html" style="background:white; color:#ee4d2d; padding:8px 14px; border-radius:6px; text-decoration:none; font-weight:bold;">
                        Đăng nhập
                    </a>
                `;
    }
});

function logout() {
    firebase.auth().signOut();
}

// Load Products
db.collection("products").get().then(snapshot => {
    products = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        productMap[doc.id] = data;
        return data;
    });
    renderProducts();
}).catch(err => {
    console.error("Lỗi tải sản phẩm:", err);
    document.getElementById("grid").innerHTML = `
                <p style="color:red; grid-column:1/-1; text-align:center; padding:40px;">
                    Không thể tải danh sách sách. Vui lòng thử lại sau.
                </p>`;
});

function getFinalPrice(price, discount = 0) {
    return Math.round(price * (1 - discount / 100));
}

// Render Products
function renderProducts() {
    const keyword = document.getElementById("search").value.toLowerCase().trim();

    let filtered = products.filter(p => {
        const nameMatch = (p.name || "").toLowerCase().includes(keyword);
        const categoryMatch = currentCategory === "all" || p.category === currentCategory;
        return nameMatch && categoryMatch;
    });

    if (currentSort === "low") {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === "high") {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    const html = filtered.map(p => {
        const finalPrice = getFinalPrice(p.price, p.discount || 0);
        return `
                    <div class="product-card">
                        ${p.discount ? `<div class="discount-badge">-${p.discount}%</div>` : ''}
                        <img src="${p.imageURL || 'https://via.placeholder.com/300x240?text=No+Image'}" alt="${p.name}">
                        <div class="product-info">
                            <div>${p.name}</div>
                            <div>
                                ${p.discount ? `<span style="text-decoration:line-through;color:#888;font-size:14px;">${p.price.toLocaleString()}₫</span><br>` : ''}
                                <span class="product-price">${finalPrice.toLocaleString()}₫</span>
                            </div>
                            <button class="add-btn" onclick="addToCart('${p.id}')">
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                `;
    }).join("");

    document.getElementById("grid").innerHTML = html || `
                <p style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">
                    Không tìm thấy sách nào phù hợp.
                </p>`;

    updateActiveCategory();
}

function updateActiveCategory() {
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));

    if (currentCategory === "all") document.getElementById("cat-all").classList.add("active");
    else if (currentCategory === "Truyện tranh") document.getElementById("cat-truyen").classList.add("active");
    else if (currentCategory === "Văn học") document.getElementById("cat-van").classList.add("active");
    else if (currentCategory === "Kỹ năng") document.getElementById("cat-ky").classList.add("active");
}

function setCategory(category) {
    currentCategory = category;
    renderProducts();
}

function setSort(sortType) {
    currentSort = sortType;
    renderProducts();
}

function addToCart(productId) {
    const p = productMap[productId];
    if (!p) return;

    if (!userId) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: p.id,
            name: p.name,
            price: p.price,
            discount: p.discount || 0,
            image: p.imageURL || '',
            quantity: 1
        });
    }

    saveCart();
    updateCart();

    // Hiệu ứng nút
    const btns = document.querySelectorAll(`button[onclick="addToCart('${productId}')"]`);
    btns.forEach(btn => {
        const original = btn.innerText;
        btn.innerText = "✓ Đã thêm";
        btn.classList.add("added");
        setTimeout(() => {
            btn.innerText = original;
            btn.classList.remove("added");
        }, 1200);
    });
}

function loadCart() {
    if (!userId) return;
    db.collection("carts").doc(userId).onSnapshot(doc => {
        cart = doc.exists ? (doc.data().items || []) : [];
        updateCart();
    });
}

function saveCart() {
    if (!userId) return;
    db.collection("carts").doc(userId).set({ items: cart });
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCart();
}

function updateCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").innerText = count;

    let total = 0;
    const itemsHTML = cart.map(item => {
        const finalPrice = getFinalPrice(item.price, item.discount);
        total += finalPrice * item.quantity;
        return `
                    <div class="cart-item">
                        <img src="${item.image || 'https://via.placeholder.com/70'}" alt="${item.name}">
                        <div style="flex:1;">
                            <strong>${item.name}</strong><br>
                            ${item.discount ? `<span style="text-decoration:line-through;color:#888;">${item.price.toLocaleString()}₫</span><br>` : ''}
                            <span style="color:#ee4d2d; font-weight:bold;">${finalPrice.toLocaleString()}₫</span> × ${item.quantity}
                            <div style="margin-top:8px;">
                                <button onclick="changeQuantity('${item.id}', -1)" style="width:30px; background-color: white; border: none">–</button>
                                <span style="margin:0 8px;">${item.quantity}</span>
                                <button onclick="changeQuantity('${item.id}', 1)" style="width:30px; background-color: white; border: none">+</button>
                            </div>
                        </div>
                    </div>
                `;
    }).join("");

    document.getElementById("cart-items").innerHTML = itemsHTML ||
        `<p style="text-align:center; color:#888; padding:20px;">Giỏ hàng trống</p>`;

    document.getElementById("cart-total").innerText = `Tổng tiền: ${total.toLocaleString()}₫`;
}

function toggleCart() {
    document.getElementById("cart").classList.toggle("active");
}

function checkout() {
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Vui lòng đăng nhập để thanh toán!");
        return;
    }

    const btn = document.getElementById("checkout-btn");
    btn.classList.add("loading");

    const totalAmount = cart.reduce((sum, item) =>
        sum + getFinalPrice(item.price, item.discount) * item.quantity, 0);

    db.collection("orders").add({
        userId: user.uid,
        userEmail: user.email,
        products: cart,
        totalAmount: totalAmount,
        status: "Đang xử lý",
        orderDate: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        cart = [];
        saveCart();
        updateCart();
        toggleCart();
    }).catch(err => {
        console.error(err);
        alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    }).finally(() => {
        setTimeout(() => btn.classList.remove("loading"), 800);
    });
}

// Khởi tạo khi tải trang
window.onload = () => {
    startBannerSlider();
    // Render dự phòng nếu Firebase load chậm
    setTimeout(() => {
        if (products.length === 0) renderProducts();
    }, 800);
};

// Search realtime
document.getElementById("search").addEventListener("input", renderProducts);