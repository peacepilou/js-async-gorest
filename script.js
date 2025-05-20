// Fonctions pour injecter nos éléments dans le DOM (après avoir récupéré nos éléments depuis une base de données)
function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

function createUser(user) {
    let li = createNode('li');
    let span = createNode('span');
    
    let btnPatch = createNode('button');
    let btnDelete = createNode('button');

    li.id = `li-${user.id}`

    span.innerHTML = `Nom : ${user.name} - Email : ${user.email} Sexe : ${user.gender} - Id : ${user.id}`;
    span.id = `row-${user.id}`

    btnPatch.classList.add("btn-edit");
    btnPatch.id = `${user.id}`;
    btnPatch.innerText = "Éditer";
    
    btnDelete.classList.add("btn-delete");
    btnDelete.id = `${user.id}`;
    btnDelete.innerText = "Supprimer";

    append(li, span);
    append(span, btnPatch);
    append(span, btnDelete);
    append(ul, li);
}


// Généralités
const ul = document.getElementById('users');
const baseUrl = 'https://gorest.co.in';
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
let userListFetched = [];
let userToEdit = {};
let token = "Bearer 88d646fc526fd2ed575953f54317340815a44288044d46a2ad1aeeb1855b0fd8";


/**
 * ---------------------------
 * LA METHODE FETCH
 * ---------------------------
 * 
 * La méthode fetch nécessite un URL pour récupérer les données.
 * Selon le serveur, la méthode fetch nécéssite également un certain nombre de paramètres
 * Ici, le serveur demande à ce que nous précisions que nous souhaitons une réponse sous forme JSON, ainsi que notre token
 * Un token est un jeton d'authentification qui permet au serveur de s'assurer que nous avons bel et bien créé un compte dans l'API
 * Le token partagé ici est le mien. Il ne faut jamais le partager lorsqu'il s'agit d'une application importante ! 
 * 
 * renvoit une Promise (un flux de données). 
 * 
 * Une Promise est une interface qui permet de gérer des données asynchrones : 
 * → .then() permet de dire "lorsque j'aurai reçu les données, voici ce que je ferai"
 * → .catch() permet de dire "si quelque chose se passe mal lors de la réception des données, voici ce que je ferai"
 * 
 * Pour convertir une Promise en données manipulables en JS, il faut utiliser promise.json(). Cette méthode elle même renvoit une Promise, contenant l'objet JS manipulable
 * */


/**
 * ---------------------------
 * REQUÊTE GET
 * --------------------------
* */

const getDatasBtn = document.querySelector("#get-datas");

const getDatas = () => {
    // Appeler l'API
    fetch(`${baseUrl}/public/v2/users`)
    .then((resp) => resp.json())
    // Une fois que la conversion est effectuée, on 
    .then((data) => {
        userListFetched = data;
        console.log(userListFetched);
        data.forEach((user) => {
            createUser(user);
        });
    })
    .then(() => {
        getPatchBtnListReference();
    })
    // Si erreur
    .catch((err) => {
        console.log(err);
    });
}

getDatasBtn.addEventListener("click", getDatas);




/**
 * ---------------------------
 * REQUÊTE POST & PATCH
 * Permet d'envoyer (POST) ou de mettre à jour (PATCH) une donnée
 * --------------------------
* */
let postOrPatchMethod = "";

const postDatasBtn = document.querySelector("#post-datas");
const postOrEditUserForm = (btn) => {
    if(btn.target.id !== "post-datas") {
        userToEdit = userListFetched.find(user => user.id === Number(btn.target.id))
        userName.value = userToEdit.name;
        userEmail.value = userToEdit.email;
        userGender.value = userToEdit.gender;
        userStatus.value = userToEdit.status;
        postOrPatchMethod = "PATCH";
    } else {
        postOrPatchMethod = "POST";
    }
    modal.style.display = "block";
}



postDatasBtn.addEventListener("click", postOrEditUserForm);

const getPatchBtnListReference = () => {
    const patchBtnList = document.querySelectorAll(".btn-edit");
    patchBtnList.forEach(btn => {
        btn.addEventListener("click", postOrEditUserForm);
    });
    const deleteBtnList = document.querySelectorAll(".btn-delete");
    deleteBtnList.forEach(btn => {
        btn.addEventListener("click", deletetDatas);
    });
}



/**
 * ---------------------------
 * Formulaire d'ajout/édition
 * --------------------------
* */

const editForm = document.querySelector("#edit-user-form");
const userName = document.querySelector("#username");
const userEmail = document.querySelector("#user-email");
const userGender = document.querySelector("#user-gender");
const userStatus = document.querySelector("#status");


userGender.addEventListener("change", (event) => {
    console.log(userGender.value);
});

editForm.addEventListener("submit", (e) => {

        e.preventDefault();

        let userEdited = {
            name: userName.value,
            email: userEmail.value,
            gender: userGender.value,
            status: userStatus.value,
        }

        const postOrPatchParameters = {
            method: postOrPatchMethod,
            headers: {
                "Content-Type":  "application/json",
                "Authorization": "Bearer 88d646fc526fd2ed575953f54317340815a44288044d46a2ad1aeeb1855b0fd8"
            },
            body: JSON.stringify(userEdited)
        }

        const baseUrlPostOrEdit = `${baseUrl}/public/v2/users`
        
        const patchDatas = () => {
            
            let fetchUrl = "";
            
            if(postOrPatchMethod === "PATCH") {
                fetchUrl = `${baseUrlPostOrEdit}/${userToEdit.id}`
            } else {
                fetchUrl = `${baseUrlPostOrEdit}`
            }

            console.log(fetchUrl);
            console.log(postOrPatchParameters);

            fetch(fetchUrl, postOrPatchParameters)
            .then((resp) => resp.json())
            .then((userCreatedOrUpdated) => {
                console.log(userCreatedOrUpdated);
                if(postOrPatchMethod === "PATCH") {
                    let userToReplace = userListFetched.find(user => user.id === Number(userCreatedOrUpdated.id));
                    const row = document.querySelector(`#row-${userToReplace.id}`)
                    row.innerHTML = `Nom : ${userCreatedOrUpdated.name} - Email : ${userCreatedOrUpdated.email} Sexe : ${userCreatedOrUpdated.gender} - Id : ${userCreatedOrUpdated.id}`;
                } else {
                    createUser(userCreatedOrUpdated);
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
        patchDatas();

        
});

/**
 * ---------------------------
 * REQUÊTE DELETE
 * Permet de supprimer une donnée présente dans le serveur
 * --------------------------
* */

const deletetDatas = (btn) => {
    userToDelete = userListFetched.find(user => user.id === Number(btn.target.id))
    const deleteParameters = {
        method: 'DELETE',
        headers: {
            "Content-Type":  "application/json",
            "Authorization": "Bearer 88d646fc526fd2ed575953f54317340815a44288044d46a2ad1aeeb1855b0fd8"
        }
    }
    fetch(`${baseUrl}/public/v2/users/${userToDelete.id}`, deleteParameters)
    .then((response) => {
        console.log(response);
        userListFetched = userListFetched.filter(user => user.id !== userToDelete.id);  
        const row = document.querySelector(`#li-${userToDelete.id}`)
        ul.removeChild(row);
    })
    .catch(err => {
        console.log(err);
    });
}


/**
 * ---------------------------
 * MODAL
 * --------------------------
* */

const hideModal = () => {
    modal.style.display = "none";
}
const hideModalFromWindow = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

span.addEventListener("click", hideModal)
// Si on clique n'importe où sur la page
window.addEventListener("click", hideModalFromWindow)
