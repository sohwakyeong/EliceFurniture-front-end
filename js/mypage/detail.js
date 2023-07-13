// 상품의 id값 받아오기
let temp = location.href.split('?');
console.log(temp);

// 상품의 id값 기반의 상품 정보 받아오기
fetch(`http://kdt-sw-5-team01.elicecoding.com/api/products/${temp[1]}`)
    .then((response) => response.json())
    .then((data) => {
        detailDataArr = data;
        //상품 상세페이지 생성
        productContentsMade();
    });

const totalCount = document.querySelector('.sprice_total');

let detailDataArr = [];

const imgProduct = document.querySelector('.img_product');
const detailIn = document.querySelector('.detail_in');

function productContentsMade() {
    imgProduct.innerHTML = `
        <img src="${detailDataArr.productImageKey}" alt="${detailDataArr.productName}">`;
    detailIn.innerHTML = `
        <h1>${detailDataArr.productName}</h1>
        <p>${detailDataArr.shortDescription}</p>
        <p>${detailDataArr.price}</p>
            `;

    const inforContainer = document.querySelector('.info_detail');
    const createInfoHTML = (item) => `
    <p>${item.shortDescription}</p>
`;

    const priceTotalElement = document.querySelector('.price_total');
    priceTotalElement.innerHTML = `<strong><em>${detailDataArr.price}</em></strong>`; // 수정필요

    // 버튼 클릭시 input값 증감, 토탈값 증감
    const increaseBtn = document.querySelector('.increase_quantity');
    const decreaseBtn = document.querySelector('.decrease_quantity');
    const inputNum = document.querySelector('.text_quantity input');
    const priceTotal = document.querySelector('.price_total');

    increaseBtn.addEventListener('click', () => {
        let num = parseInt(inputNum.value);
        num++;
        inputNum.value = num;
        updateTotalPrice(num);
    });

    decreaseBtn.addEventListener('click', () => {
        let num = parseInt(inputNum.value);
        if (num > 1) {
            num--;
            inputNum.value = num;
            updateTotalPrice(num);
        }
    });

    function updateTotalPrice(quantity) {
        const price = parseInt(detailDataArr[0].price.replace(',', ''));
        const totalPrice = price * quantity;
        priceTotal.innerHTML = `<strong><em>${totalPrice.toLocaleString()} KRW</em></strong>(${quantity}개)`;
    }

    // 장바구니 넣기
    // 장바구니에 상품을 추가하는 함수
    const addProduct = (item) => {
        // 장바구니에 저장할 배열
        let cartItems = [];

        // 로컬 스토리지에서 기존 장바구니 데이터 가져오기
        const storedItems = localStorage.getItem('cartItems');
        if (storedItems) {
            cartItems = JSON.parse(storedItems);
        }

        // 기존 데이터에 추가하기
        cartItems.push(item);

        // 장바구니 데이터 업데이트
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    };

    // IndexedDB에 상품 정보 저장
    const saveToIndexedDB = (data) => {
        const request = window.indexedDB.open('myDB', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const objectStore = db.createObjectStore('cart', {
                keyPath: 'id',
                autoIncrement: true,
            });
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('productName', 'productName', {
                unique: false,
            });
            objectStore.createIndex('searchKeywords', 'searchKeywords', {
                unique: false,
            });
            objectStore.createIndex('price', 'price', { unique: false });
            objectStore.createIndex('quantity', 'quantity', { unique: false });
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['cart'], 'readwrite');
            const objectStore = transaction.objectStore('cart');
            const addRequest = objectStore.add(data);

            addRequest.onsuccess = function (event) {
                console.log('Data added to IndexedDB');
            };

            addRequest.onerror = function (event) {
                console.error('Error adding data to IndexedDB');
            };

            transaction.oncomplete = function (event) {
                console.log('Transaction completed');
                // 데이터 저장 완료 후, 장바구니 페이지에서 사용할 수 있도록 함수 호출
                displayCartItems();
            };

            transaction.onerror = function (event) {};

            db.close();
        };

        request.onerror = function (event) {};
    };

    // 장바구니 넣기
    const addCart = (event) => {
        event.preventDefault();
        // 선택한 상품 정보 가져오기
        const selectedProduct = {
            category: detailDataArr.categoryId.title,
            productName: detailDataArr.productName,
            searchKeywords: detailDataArr.searchKeywords,
            price: detailDataArr.price,
            quantity: parseInt(inputNum.value),
        };

        // 장바구니에 상품을 추가
        addProduct(selectedProduct);

        // IndexedDB에 상품 정보 저장
        saveToIndexedDB(selectedProduct);

        // 장바구니에 추가되었다는 메시지 출력
        alert('상품이 장바구니에 추가되었습니다.');

        // 장바구니 페이지로 이동
        window.location.href = 'cart.html';
    };

    const addButton = document.querySelector('.button_add');
    addButton.addEventListener('click', addCart);

    // 바로구매
    const buyButton = document.querySelector('.button_buy');
    buyButton.addEventListener('click', () => {
        // 로컬 스토리지 데이터 가져오기
        const cartItemsString = localStorage.getItem('cartItems');
        const cartData = JSON.parse(cartItemsString) || [];

        // 로컬 스토리지 데이터를 query parameter로 변환
        const queryString = cartData
            .map((item) => {
                return `category=${encodeURIComponent(
                    item.category,
                )}&productName=${encodeURIComponent(
                    item.productName,
                )}&searchKeywords=${encodeURIComponent(
                    item.searchKeywords,
                )}&price=${encodeURIComponent(
                    item.price,
                )}&quantity=${encodeURIComponent(item.quantity)}`;
            })
            .join('&');

        // order.html로 이동
        window.location.href = `/html/order.html?${queryString}`;
    });
}
