(function() {

    var app = {
        isLoading: true,
        shops: [],
        menuToggle: false,
        container: document.querySelector('.main'),
        list: document.querySelector('.shop-list'),
        sideNavList: document.querySelector('side-nav-shop-list'),
        spinner: document.querySelector('.loader'),
        shopItemTemplate: document.querySelector('.shop-item-template'),
        productItemTemplate: document.querySelector('.product-item-template'),
        productAddButton: document.querySelector('.product-add'),
        addModal: document.querySelector('#add-modal'),
        editMenu: document.querySelector('.edit-menu'),
        butRemoveShop: document.querySelector('#butRemoveShop')
    };

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/
    document.getElementById('butAdd').addEventListener('click', function() {
        app.addProductOrShop();
    });

    document.getElementById('butEditProduct').addEventListener('click', function() {
        app.editProduct();
    });

    document.getElementById('butRemoveProducts').addEventListener('click', function() {
        app.removeSelectedProducts();
    });

    document.getElementById('butRemoveShop').addEventListener('click', function() {
        app.removeShopIfSelected();
    });

    /*****************************************************************************
     *
     * Helper methods
     *
     ****************************************************************************/

    app.addProductOrShop = function() {
        var shopId    = app.addModal.querySelector('#modal-id').value,
            nameInput = app.addModal.querySelector('#name'),
            name      = nameInput.value;


        if(shopId === "") {
            app.addShop(name);
        } else {
            app.addProduct(name, shopId);
        }

        nameInput.value = "";
        Materialize.updateTextFields();
    };

    app.removeShopIfSelected = function() {
        var shop = app.list.querySelector('.active');
        if(shop !== null) {
            var shopId = shop.dataset.id;
            app.removeShop(shopId);
        } else {
            Materialize.toast('No shop selected', 4000)
        }
    };

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/
    app.truncateShopList = function () {
        while (app.list.firstChild) {
            app.list.removeChild(app.list.firstChild);
        }
        app.list.appendChild(app.shopItemTemplate);
    };

    app.truncateProductList = function (shopId) {
        var shopList = app.list.querySelector("li[data-id='"+shopId+"']");
        var productList = shopList.querySelector('.product-list');
        while (productList.firstChild) {
            productList.removeChild(productList.firstChild);
        }
        var addButton = app.productAddButton.cloneNode(true);
        addButton.dataset.shopId = shopId;
        productList.appendChild(addButton);
    };

    app.updateShoppingList = function() {

        if(app.isLoading) {
            app.spinner.style.display = "none";
            app.container.style.display = "block";
            app.isLoading = false;
        }

        app.truncateShopList();

        var item;

        app.shops.forEach(function(shop, shopId) {
            item = app.shopItemTemplate.cloneNode(true);
            item.classList.remove('shop-item-template');

            item.dataset.id = shopId;
            item.querySelector('.shop-name').textContent = shop.name;
            item.querySelector('.badge').textContent = String(shop.products.length);

            item.classList.remove('hidden');

            app.list.appendChild(item);

            app.updateProductList(shopId);
            item.querySelector('.modal-trigger').dataset.shopId = shopId;
        });
    };

    app.updateProductList = function(shopId) {
        app.truncateProductList(shopId);

        var item,
            shopItem    = app.list.querySelector("li[data-id='"+shopId+"']"),
            productList = shopItem.querySelector('.product-list'),
            shop        = app.shops[ shopId ];

        shop.products.forEach(function(product, productId) {
            var id = shopItem.dataset.id + "-" + productId;
            item = app.productItemTemplate.cloneNode(true);
            item.classList.remove('product-item-template');
            item.querySelector('.product-name').textContent = product;
            item.querySelector('.product-id').id = id;
            item.querySelector('.product-label').setAttribute("for", id);

            item.querySelector('.product-id').addEventListener('change', function () {
                app.toggleEditMenu(this);
            });

            item.classList.remove('hidden');
            productList.appendChild(item);
        });
    };

    app.updateShoppingListCounters = function () {
        app.shops.forEach(function(shop, shopId) {
            var shopList = app.list.querySelector("li[data-id='"+shopId+"']");

            shopList.querySelector('.badge').textContent = String(shop.products.length);
        });
    };

    app.removeSelectedProducts = function () {
        var shop = app.list.querySelector('.active');
        var products = shop.querySelector('.product-list');
        var productNodes = products.childNodes;
        var productIdFix =  0;

        for(var i = 0; i < productNodes.length; i++) {
            var node   = productNodes[i].querySelector('input[type="checkbox"]');

            if(node !== null && node.checked) {
                var nodeId = node.id.split("-")[1];
                var productId = nodeId - productIdFix;
                var shopId = node.id.split("-")[0];

                app.removeProduct(productId, shopId);

                products.removeChild(productNodes[i]);
                i--;
                productIdFix++;
            }
        }

        app.editMenu.classList.add('hidden');
    };

    app.toggleEditMenu = function (element) {
        var elementId = element.id.split("-");
        var shopId    = elementId[0];

        var shopList = app.list.querySelector("li[data-id='"+shopId+"']");
        var productList = shopList.querySelector('.product-list');

        var productNodes = productList.childNodes;
        var selectedNodes = 0;
        for(var i = 0; i< productNodes.length; i ++) {
            var node = productNodes[i].querySelector('input[type="checkbox"]');

            if(node !== null && node.checked) { selectedNodes++ }
        }

        if(selectedNodes === 0) {
            app.editMenu.classList.add('hidden');
            app.menuToggle = false;
        } else {
            app.editMenu.classList.remove('hidden');
            app.menuToggle = true;

            if(selectedNodes > 1) {
                document.getElementById('butEditProduct').classList.add('hidden');
            } else {
                document.getElementById('butEditProduct').classList.remove('hidden');
            }
        }
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    app.saveShoppingList = function() {
        localStorage.setItem("shops", JSON.stringify(app.shops));
    };

    app.addProduct = function(name, shopId) {
        app.shops[ shopId ].products.push(name);

        app.updateProductList(shopId);
        app.updateShoppingListCounters();

        app.saveShoppingList();
    };

    app.removeProduct = function(name, shopId) {
        var index = app.shops[shopId].products.indexOf(name);

        app.shops[shopId].products.splice(index, 1);

        app.updateShoppingListCounters();

        app.saveShoppingList();
    };

    app.editProduct = function() {
        //TO DO

        app.saveShoppingList();
    };

    app.addShop = function(name) {
        var shop = { name: "", products: [] };
        shop.name = name;

        app.shops.push(shop);

        app.updateShoppingList();

        app.saveShoppingList();
    };

    app.removeShop = function(shopId) {
        app.shops.splice(shopId, 1);
        app.updateShoppingList();

        app.saveShoppingList();
    };

    /*****************************************************************************
     *
     * init after DOM is fully loaded (including images, videos, etc)
     *
     ****************************************************************************/

    window.onload = function() {
        app.shops = JSON.parse(localStorage.getItem("shops"));

        if(app.shops === null) {
            app.shops = [];
            localStorage.setItem("shops", JSON.stringify(app.shops));
        }

        app.updateShoppingList();

        if('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('service-worker.js')
                .then(function() { console.log("Service Worker Registered"); });
        }
    };

})();
