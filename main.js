// Selecting DOM elements
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

// Toggle cart visibility on icon click and close cart on close button click
iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

// Function to add product data to HTML
const addDataToHTML = () => {
    // Remove default data from HTML

    // Add new data
    if (products.length > 0) { // If there is data
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML =
                `<img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">${product.price}kr</div>
                <button class="addCart">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
};

// Event listener for adding to cart when a product is clicked
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});

// Function to add a product to the cart
const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
};

// Function to add cart data to local storage
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Function to update cart data in HTML
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity = totalQuantity + item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">${info.price * item.quantity}kr</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>`;
        });
    }
    iconCartSpan.innerText = totalQuantity;
};

// Event listener for changing quantity in the cart
listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

// Function to change quantity in the cart
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
};

// Function to initialize the application
const initApp = () => {
    // Get product data
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // Get cart data from local storage
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        });
};

// Initialize the application
initApp();


// ------------------------------------------------------------------------------------
// ------------------------------------------ ORDER FORM ------------------------------
// ------------------------------------------------------------------------------------
const invoiceDetails = document.querySelector('#invoiceDetails');
const creditCardDetails = document.querySelector('#creditCardDetails');
const paymentOptions = document.querySelectorAll('[name="paymentOption"]');
const inputFields = document.querySelectorAll('form input:not([type="checkbox"]):not([type="radio"]):not([type="button"])');

const popup = document.querySelector('#popup');
const orderSummary = document.querySelector('#orderSummary');

const orderBtn = document.querySelector('#sendForm');

let invoicePaymentSelected = false;

inputFields.forEach(field => {
  field.addEventListener('keyup', validateFormField);
  field.addEventListener('focusout', validateFormField);
});

paymentOptions.forEach(radio => {
  radio.addEventListener('change', togglePaymentOptions);
});

function validateFormField() {

  let hasErrors = false;

  inputFields.forEach(field => {
    const errorField = field.previousElementSibling;
    let errorMsg = '';
    if (errorField !== null) {
      errorField.innerHTML = '';
    }

    switch (field.id) {
      case 'doorCode':
        if (field.value.length === 0) {
          errorMsg = 'This field is not correct';
          hasErrors = true;
        }
        break;
      case 'zipcode':
        if (field.value.length != 5) {
          errorMsg = 'This field is not correct';
          hasErrors = true;
        }
        break;
      case 'firstName':
      case 'lastName':
      case 'street':
      case 'city':
        if (field.value.length === 0) {
          errorMsg = 'This field is not correct';
          hasErrors = true;
        }
        break;
      case 'ssn':
        const regex = new RegExp(
          /^(\d{10}|\d{12}|\d{6}-\d{4}|\d{8}-\d{4}|\d{8} \d{4}|\d{6} \d{4})/
        );
        if (regex.exec(field.value) === null) {
          errorMsg = 'Faulty social security number.';
          hasErrors = true;
        }
        break;
    }

    if (errorField !== null) {
      errorField.innerHTML = errorMsg;
    }
  });

  if (hasErrors) {
    document.querySelector('#sendForm').setAttribute('disabled', 'disabled');
    orderBtn.removeEventListener('click', sendForm);
  } else {
    document.querySelector('#sendForm').removeAttribute('disabled');
    orderBtn.addEventListener('click', sendForm);
  }
}

function sendForm() {
    popup.classList.remove('hidden');
    orderSummary.classList.remove('hidden');
    popup.addEventListener('click', hideOrderConfirmation);
    document.querySelector('#closePopup').addEventListener('click', hideOrderConfirmation);
  }
  
  function hideOrderConfirmation() {
    popup.classList.add('hidden');
    orderSummary.classList.add('hidden');
    popup.removeEventListener('click', hideOrderConfirmation);
    document
      .querySelector('#closePopup')
      .removeEventListener('click', hideOrderConfirmation);
  }

function togglePaymentOptions(e) {
  if (e.currentTarget.value === 'invoice') {
    invoiceDetails.classList.remove('hidden');
    creditCardDetails.classList.add('hidden');
    invoicePaymentSelected = true;
  } else {
    invoiceDetails.classList.add('hidden');
    creditCardDetails.classList.remove('hidden');
    invoicePaymentSelected = false;
  }
}

