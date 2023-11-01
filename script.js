//client 

const { response } = require("express");

//get stored data
let storedToken = localStorage.getItem('jwtToken');
let storedUsername = localStorage.getItem('username');

//set The user name in html
const usernameElement = document.getElementById('username');
usernameElement.textContent = storedUsername;

//Load page and event listeners
document.addEventListener('DOMContentLoaded',()=>{
    const baseUrl = window.location.origin;
    fetchposts(baseUrl);

    if (storedToken){
        const storedRole = localStorage.getItem('userRole');
        if (storedRole == 'admin'){
            showAdminFeatures();
        }
    }else{

    }
    const form = document.getElementById('new-post-form')
    if (form){
        form.addEventListener('submit',(event)=> createPost(event,baseUrl));
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit',(event)=> loginUser(event,baseUrl));

    const registerForm = document.getElementById('register-form');
    registerFormForm.addEventListener('submit',(event) => registerUser(event,baseUrl));
});

//Post details
const postDetailContainer = document.getElementById('post-detail-container');

//Add a listener for detail page
window.addEventListener('load',()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    if (postId){
        showPostDetail(postId);
    }
});

//Fetch posts
async function fetchPosts(baseUrl){
    const res = await fetch(`${baseUrl}/posts`);
    const data = await res.json();  
    const postsList = document.getElementById('posts-list');
    const admin = localStorage.getItem('userRole')=== 'admin';
    //buttons visability only for admin group
    if(postsList){
        postsList.innerHTML = data
            .map((post,index)=>{
                const deleteButtonStyle = isAdmin ? '' : 'display:none';
                const updateeButtonStyle = isAdmin ? '' : 'display:none';

                return `
                <div id="posts-list">
                <div id="post-id" class="post">
                    <img src="https://images.unsplash.com/photo-1683009427540-c5bd6a32abf6?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxzZWFyY2h8ODl8fG5lb218ZW58MHx8MHx8fDA%3D" alt="Image">
                    <div class="post-title">
                        <h1><a href="#">Post Title for a nice post</a></h1>
                    </div>
                    <span><p>Author</p>Timestamp</span>
                    <div id="admin-buttons">
                        <button class="btn">Delete</button>
                        <button class="btn">Create</button>
                    </div>
                    <hr />
                </div>
                <div id="${post.id}" class="post">
                    <img src="${post.imageUrl}" alt="Image">
                    <div class="post-title">
                       ${
                            index === 0
                            ? `<h1><a href="/post/${post._id}">${post.title}</a></h1>`
                            : `<h3><a href="/post/${post._id}">${post.title}</a></h3>`
                       }
                    </div>
                    ${
                        index === 0
                        ? `<span><p>${post.author}</p>${post.timestamp}</span>`
                        : ``
                    }
                    <div id="admin-buttons">
                        <button class="btn" style=""${deleteButtonStyle} onClick="deletePost('${post._id}', '${baseUrl}')">Delete</button>
                        <button class="btn" style=""${deleteButtonStyle} onClick="showUpdateForm('${post._id}', '${post.title}','${post.content}')">Update</button>
                    </div>
                    ${index === 0 ? ' <hr />' : ''}
                    ${index === 0 ? ' <h2>All Articles</h2>' : ''}
                    <hr />
                </div>
              </div>
                `
            })
            .join('');
    }
}

async function createPost(event, baseUrl){
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUrlInput = document.getElementById('image-url');

    //Get values from the input fiels

    const title    = titleInput.value;
    const content  = contentInput.value;
    const imageUrl = imageUrlInput.value;

    //ensure that inputs are not empty

    if(!title||!content||!imageUrl){
        alert("Please fill all fields");
        return;
    }

    const newPost = {title,content,imageUrl,
        author:storedUsername,
        timestamp:new Date().toLocaleDateString(undefined,{
            weekday:'long',
            year:"numeric",
            month:'long',
            day:"numeric",
        }),
    };
    const headers = new headers({
        'Content-Type':'application/json',
        Authorization: `Bearer ${storedToken}`,
    });
    const requestOptions = {
        method:"POST",
        headers:headers,
        body:JSON.stringify(newPost)
    };
    try{
        const responce = await fetch(`${baseUrl}/posts`,requestOptions);
        if(!responce.ok)
        {
            const storedRole = localStorage.getItem("userRole");
            console.log(`Error creating the POST:HTTP Status ${response.status}`);
        }else{
            //Clear the input data
            titleInput.value = '';
            contentInput.value = '';
            imageUrlInput.value = '';
            alert('Create Post successfull')
        }
    }catch (error){
        console.log('An error occured during the fetch:',error);
        alert('Create Post Failed')
    }
    fetchPosts(baseUrl);
}

//Delete post route

async function deletePost(postId,baseUrl){
    const deleteUrl = `${baseUrl}/posts/${postId}`;
    try{
        const responce = await fetch(deleteUrl,{
            method: 'Delete',
            headers: {
                Authorization:`Bearer ${storedToken}`,
            },  
        })

        if(responce.ok){
            alert("Delete POST successfull")
            fetchPosts(baseUrl);
        }else{
            alert('Delete post failed.')
        }


    }catch(error){
        console.error(`Error while deleting post: ${error}`);
        alert("Delete post failed.")
    }
}
//Update form
function showUpdateForm(postId,title,content){
    const updateForm =`
    <form id="update-form">
        <input type="text" id="update-title" value="${title}" />
        <textarea id="update-content"> ${content}</textarea>
        <button type="submit">Update post</button>

    </form>
    `;
    const postElement = document.getElementById(postId); 
    postElement.innerHTML+= updateForm;

    const form = document.getElementById('update-form');
    form.addEventListener('submit',(event)=>updateForm(event,postId));
}
//Update post
async function updatePost(event,postId){
    event.preventDefault();
    const title = document.getElementById('update-title').value;
    const content = document.getElementById('update-content').value;
    const baseUrl = window.location.origin;

    //ensure that inputs are not empty
    if (!title || !content){
        alert("Please fill in all fields");
        return;
    }

    const updatedPost = {
        title,
        content,
    };

    try{
        const responce = await fetch(`${baseUrl}/posts/${postID}`,{
            method: 'PUT',
            headers: {
                'Content-Type':'application/json',
                Authorization:`Bearer ${storedToken}`,
            },  
            body:JSON.stringify(updatePost),
        });

        if(responce.ok){
            alert("Update POST successfull");
            fetchPosts(baseUrl);
        }else{
            alert('Update post failed.');
        }


    }catch(error){
        console.error(` An error occured during the fetch`,error);
        alert("Update post failed.");
    }
}

//Register user funtion

async function registerUser(event,baseUrl){
    event.preventDefault();
    const usernameInput = document.getElementById('register-username').value;
    const passwordInput = document.getElementById('register-password').value;
    const roleInput = document.getElementById('register-role').value;

    const username = usernameInput.value;
    const password = passwordInput.value;
    const role = roleInput.value;


    //ensure that inputs are not empty
    if (!username || !password || !role){
        alert("Please fill in all fields");
        return;
    }

    const newUser = {
        username,
        password,
        role,
    };


        const res = await fetch(`${baseUrl}/register`,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },  
            body:JSON.stringify(newUser),
        });

        const data = await res.json();

        if(data.success){
            alert("Registered successfully!");

            //clear input fields
            usernameInput.value = '';
            passwordInput.value = '';
            roleInput.value = '';
        }else{
            alert('Registration failed.');
        }
}

//Login user funtion

async function loginUser(event,baseUrl){
    event.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;

    const username = usernameInput.value;
    const password = passwordInput.value;


    //ensure that inputs are not empty
    if (!username || !password || !role){
        alert("Please fill in all fields");
        return;
    }

    const user = {
        username,
        password,
    };


        const res = await fetch(`${baseUrl}/login`,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },  
            body:JSON.stringify(user),
        });

        const data = await res.json();

        if(data.success){
            localStorage.setItem("jwtToken",data.token);
            localStorage.setItem("userRole",data.role);
            localStorage.setItem("username",username);
            
            //The hamburger menu gonna close if it's open
            linksContainer.classList.toggle('active');
            hamburger.classList.toggle('active');

            //clear input fields
            usernameInput.value = '';
            passwordInput.value = '';

            location.reload();

            if (data.role === 'admin'){
                showAdminFeatures();
            }
        }else{
            alert('Login failed.');
        }
}

//Admin Features
function showAdminFeatures(){
    const newPostDiv =  document.getElementById('new-post-div')
    if(newPostDiv){
        newPostDiv.style.display = 'flex';
    }

    const allBtns = document.querySelectorAll('.btn');
    allBtns.forEach((btn)=>{
        if (btn){
            btn.style.display = 'block';
        }
    })
}
//Logout
document.addEventListener('DOMContentLoaded',()=>{
    const baseUrl = window.location.origin;
    const registerDiv = document.getElementById('register-div');
    const loginDiv = document.getElementById('login-div');
    const logoutDiv = document.getElementById('logout-div');
    const logoutButton = document.getElementById('logout-button');

    if(storedToken){
        registerDiv.style.display = 'none';
        loginDiv.style.display = 'none';
        logoutDiv.style.display = 'flex';
        logoutButton.addEventListener('click', ()=>{
            localStorage.removeItem("jwtToken")
            localStorage.removeItem("userRole")
            localStorage.removeItem("username")
            location.reload();
        });
    }else{
        registerDiv.style.display = 'flex';
        loginDiv.style.display = 'flex';
        logoutDiv.style.displayn = 'none';
    }
});