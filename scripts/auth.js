const auth = document.querySelector('.header__user');
const bag = document.querySelector('.header__shop');
const authSignout = document.querySelector('.profile__container button');
const authBurger = document.querySelector('.burger-menu__profile');
userName = document.querySelector('.profile__usernameB');
userName2 = document.querySelector('.profile__username');
emailP = document.querySelector('.profile__email');

var userInfo;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        const loader = document.querySelector('.loader');
        if (window.location.href.indexOf("Html") > -1) {
            auth.href = './profile.html';
            authBurger.href = './profile.html';
        } else {
            auth.href = './Html/profile.html';
            authBurger.href = './Html/profile.html';
            loader.classList.add('loader--show');
        }

        const db = firebase.firestore();
        const usersRef = db.collection('users');
        usersRef.doc(user.uid).get().then(function (doc) {
            if (doc.exists) {
                const data = doc.data();
                userInfo = data;
                userInfo.uid = user.uid;

                if(window.getCart){
                    getCart();
                  }

                //Mostrar las opciones del admin
                if (data.admin) {
                    const showAdmin = document.querySelectorAll('.showAdmin');
                    const hideAdmin = document.querySelectorAll('.hideAdmin');
                    showAdmin.forEach(function (elem) {
                        elem.classList.remove('hidden');
                    })
                    hideAdmin.forEach(function (elem) {
                        elem.classList.add('hidden');
                    })
                }

                //Mostrar info del perfil
                if (userName) {
                    userName.innerText = data.username + '!';
                    userName2.innerText = data.username;
                    emailP.innerText = data.email;
                    loader.classList.remove('loader--show');
                }
            }
        });

    } else {
        if (window.location.href.indexOf("Html") > -1) {
            auth.href = './login.html';
            authBurger.href = './login.html';
        } else {
            auth.href = './Html/login.html';
            authBurger.href = './Html/login.html';
        }
    }
});

// cerrar sesión
if (authSignout) {
    authSignout.addEventListener('click', function (event) {
        event.preventDefault();
        firebase.auth().signOut();
        window.location.href = '../index.html';
    });
}
