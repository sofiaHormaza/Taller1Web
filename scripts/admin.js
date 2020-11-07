//Show modal to edit or add a product
const modal = document.querySelector('.edit-add');
const close = document.querySelector('.edit-add__close');
const btnAdd = document.querySelector('.options-up__actions button');
const opacity = document.querySelector('.opacity');

function openHandle() {
  modal.classList.add('edit-add--show');
  opacity.classList.add('opacity--show');
}
btnAdd.addEventListener('click', openHandle);

function closeHandle() {
  modal.classList.remove('edit-add--show');
  opacity.classList.remove('opacity--show');
}
close.addEventListener('click', closeHandle);


//Database
const db = firebase.firestore();
const productsRef = db.collection('products');

const productsList = document.querySelector('.products');
const loader = document.querySelector('.loader');

let selectedItem = null;

var storageRef = firebase.storage().ref();

function renderProducts(list) {
  productsList.innerHTML = '';
  list.forEach(function (elem) {
    const newProduct = document.createElement('div');
    newProduct.classList.add('products__glasses');

    newProduct.innerHTML = `
      <p class="products__remove">Remove</p>
      <div class="products__container">
        <img class="products__imgGlasses" src="${elem.img}" alt="" >
        <h4 class="products__title">${elem.nameProduct}</h4>
        <p class="products__price">$${elem.price}</p>
        <button class="button button--secondary product__edit">EDIT</button>
      </div>
      `;


    if (elem.storageImgs) {
      
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
    editBtn.addEventListener('click', function () {
      form.nameProduct.value = elem.nameProduct;
      form.price.value = elem.price;
      form.descrip.value = elem.descrip;
      form.shape.value = elem.shape;
      form.gender.value = elem.gender;
      form.type.value = elem.type;
      selectedItem = elem;

      openHandle();
    });


    productsList.appendChild(newProduct);
  });
}


function getProducts() {
  productsRef.get().then((querySnapshot) => {
    const objects = [];
    querySnapshot.forEach((doc) => {
      const obj = doc.data();
      obj.id = doc.id;
      objects.push(obj);
      console.log(`${doc.id} => ${doc.data()}`);
    });
    renderProducts(objects);
    loader.classList.remove('loader--show');
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

const imagesP = form.querySelectorAll('.input--file');
imagesP.forEach(function(group, index) {
  group.addEventListener('change', function () {
  
    var newImageRef = storageRef.child(`products/${Math.floor(Math.random()*999999999)}.webp`);
  
    var file = group.files[0]; // use the Blob or File API
  
    newImageRef.put(file).then(function(snapshot) {
      console.log(snapshot)
      console.log('Uploaded a blob or file!');
      imagePaths[index] = snapshot.metadata.fullPath;
    });
  });
});


