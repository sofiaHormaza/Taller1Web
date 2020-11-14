//Show modal to edit or add a product
const modal = document.querySelector('.edit-add');
const closeM = document.querySelector('.edit-add__close');
const btnAdd = document.querySelector('.filters button');

function openHandle() {
  modal.classList.add('edit-add--show');
  opacity.classList.add('opacity--show');
}
btnAdd.addEventListener('click', openHandle);

function closeMHandle() {
  modal.classList.remove('edit-add--show');
  opacity.classList.remove('opacity--show');
}
closeM.addEventListener('click', closeMHandle);


//Database
const db = firebase.firestore();
const productsRef = db.collection('products');
const bagRef = db.collection('bag');

const productsList = document.querySelector('.products');
const loader = document.querySelector('.loader');

let selectedItem = null;

var storageRef = firebase.storage().ref();

function renderProducts(list) {
  productsList.innerHTML = '';
  list.forEach(function (elem) {
    const newProduct = document.createElement('div');
    newProduct.classList.add('products__glasses');

    const url = `details.html?${elem.id}-${elem.nameProduct}`;

    newProduct.innerHTML = `
      <p class="products__remove hidden showAdmin">Remove</p>
      <div class="products__container">
        <a href="${url}" class="products__link">
          <img class="products__imgGlasses" src="" alt="" >
        </a>
        <h4 class="products__title">${elem.nameProduct}</h4>
        <p class="products__price">$${elem.price}</p>
        <button class="button button--secondary product__edit hidden showAdmin">EDIT</button>
        <button class="button button--secondary product__addShop hideAdmin">ADD TO BAG</button>
      </div>
      `;


      
    bagProducts = [];
    const addShop = newProduct.querySelector('.product__addShop');
    addShop.addEventListener('click', function () {
      const newBagItem = {
        nameProduct: elem.nameProduct,
        price: Number(elem.price),
        image: elem.storageImgs[0],
      };

      bagProducts.push(newBagItem);
      bagProducts2 = {
        products: bagProducts,
      }
      console.log(userInfo.uid);

      bagRef.doc(userInfo.uid).set(bagProducts2).catch(function(error) {
      console.error("Error adding document: ", error);
  });
    });

    //Mostrar imagen
    if (elem.storageImgs && elem.storageImgs.length > 0) {
      storageRef.child(elem.storageImgs[0]).getDownloadURL().then(function (url) {
        var img = newProduct.querySelector('img');
        img.src = url;
      }).catch(function (error) {
        // Handle any errors
      });

    }

    //Delete
    const deleteBtn = newProduct.querySelector('.products__remove');
    deleteBtn.addEventListener('click', function () {
      loader.classList.add('loader--show');
      productsRef.doc(elem.id).delete().then(function () {
        console.log("Document successfully deleted!");
        getProducts();
      })
        .catch(function (error) {
          console.error("Error removing document: ", error);
        });
    });

    //Edit
    const editBtn = newProduct.querySelector('.product__edit');
    const shopBtn = newProduct.querySelector('.product__addShop');
    editBtn.addEventListener('click', function () {
      form.nameProduct.value = elem.nameProduct;
      form.price.value = elem.price;
      form.descrip.value = elem.descrip;
      form.shape.value = elem.shape;
      form.gender.value = elem.gender;
      form.type.value = elem.type;
      selectedItem = elem;

      modal.classList.add('edit-add--show');
      opacity.classList.add('opacity--show');
    });

    //Mostrar opciones del admin
    if (userInfo && userInfo.admin) {
      deleteBtn.classList.remove('hidden');
      editBtn.classList.remove('hidden');
      shopBtn.classList.add('hidden');
    }

    productsList.appendChild(newProduct);
  });
}

let objectsList = [];

function getProducts() {
  if (window.location.href.indexOf("Sun") > -1) {
    productsRef.where('type', "==", "sun").get().then((querySnapshot) => {
      objectsList = [];
      querySnapshot.forEach((doc) => {
        const obj = doc.data();
        obj.id = doc.id;
        objectsList.push(obj);
        //console.log(`${doc.id} => ${doc.data()}`);
      });
      renderProducts(objectsList);
      loader.classList.remove('loader--show');
    });
  } else if (window.location.href.indexOf("Optical") > -1) {
    productsRef.where('type', "==", "optical").get().then((querySnapshot) => {
      objectsList = [];
      querySnapshot.forEach((doc) => {
        const obj = doc.data();
        obj.id = doc.id;
        objectsList.push(obj);
        //console.log(`${doc.id} => ${doc.data()}`);
      });
      renderProducts(objectsList);
      loader.classList.remove('loader--show');
    });
  }

}

function getBag() {
  bagRef
    .doc(userInfo.uid)
    .get()
    .then((doc) => {
      if(doc.exists){
        bagProducts = doc.data().products;
      }
    }).catch(function (error) {
      console.log("hola: ", error);
    });
}

getProducts();

var imagePaths = [];

//Agregar producto
const form = document.querySelector('.edit-add__form');
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const newProduct = {
    nameProduct: form.nameProduct.value,
    price: Number(form.price.value),
    descrip: form.descrip.value,
    shape: form.shape.value,
    gender: form.gender.value,
    type: form.type.value,
    storageImgs: imagePaths,
    date: Date.now(),
  };

  loader.classList.add('loader--show');

  function handleThen(docRef) {
    getProducts();
    form.nameProduct.value = '';
    form.price.value = '';
    form.descrip.value = '';
    form.shape.value = 'no';
    form.gender.value = 'no';
    form.type.value = 'no';
    selectedItem = null;
  }

  function handleCatch(error) {
    console.error("Error adding document: ", error);
  }

  if (selectedItem) {
    //Edit
    productsRef.doc(selectedItem.id).set(newProduct).then(handleThen).catch(handleCatch);

  } else {
    //Add product
    productsRef.add(newProduct).then(handleThen).catch(handleCatch);
  }
});


//Imagenes Storage
const imagesP = form.querySelectorAll('.input--file');
imagesP.forEach(function (group, index) {
  group.addEventListener('change', function () {

    var newImageRef = storageRef.child(`products/${Math.floor(Math.random() * 999999999)}.webp`);

    var file = group.files[0]; // use the Blob or File API

    newImageRef.put(file).then(function (snapshot) {
      console.log(snapshot)
      console.log('Uploaded a blob or file!');
      imagePaths[index] = snapshot.metadata.fullPath;
    });
  });
});


//Ordenar productos

const filterForm = document.querySelector('.filters__form');

filterForm.addEventListener('change', function () {

  let copy = objectsList.slice();

  const order = filterForm.order.value;
  switch (order) {
    case 'low':
      copy.sort(function (a, b) {
        return a.price - b.price;
      });
      break;
    case 'high':
      copy.sort(function (a, b) {
        return b.price - a.price;
      });
      break;
    case 'newest':
      copy.sort(function (a, b) {
        return b.date - a.date;
      });
      break;
  }

  const nameFilter = filterForm.filter.value;
  if (nameFilter != '') {
    copy = copy.filter(function (elem) {
      if (elem.gender == nameFilter) {
        return true;
      }
      if (elem.shape == nameFilter) {
        return true;
      }
      return false;
    });
  }

  renderProducts(copy);
});
