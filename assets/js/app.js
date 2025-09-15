const cl = console.log;

const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const postSubmitbtn = document.getElementById('postSubmitBtn');
const postUpdatebtn = document.getElementById('postUpdatebtn');


const postContainerr = document.getElementById('postContainer');

const snackBar = (msg, icon) => {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 3000
  });
};

let BASE_URL = 'https://batch-18-db-default-rtdb.asia-southeast1.firebasedatabase.app/';
let POST_URL = `${BASE_URL}/posts.json`;

const objToArr = (obj) =>{
    let postArr = []
    for(const key in obj){
     obj[key].id=key
     postArr.unshift(obj[key])
    }
    return postArr
}

const templating = arr =>{
    let result ='';

    arr.forEach(ele => {
       result += `<div class="col-md-4 mb-4">
                <div class="card h-100" id="${ele.id}">
                    <div class="card-header bg-warning">
                        <h1 class="m-0">${ele.title}</h1>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${ele.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-success">Edit</button>
                        <button onclick="onRremove(this)" class="btn btn-sm btn-danger">Remove</button>
                    </div>
                </div>
            </div>
       
       `
    });
    postContainerr.innerHTML = result;
}

const createCard = (postObj) =>{
  let col = document.createElement('div');
  col.className = `col-md-4 mb-4`
  col.innerHTML = `
    <div class="card h-100" id="${postObj.id}">
      <div class="card-header bg-warning">
        <h1 class="m-0">${postObj.title}</h1>
      </div>
      <div class="card-body">
        <p class="m-0">${postObj.body}</p>
      </div>
      <div class="card-footer d-flex justify-content-between">
        <button onclick="onEdit(this)" class="btn btn-sm btn-success">Edit</button>
        <button onclick="onRremove(this)" class="btn btn-sm btn-danger">Remove</button>
      </div>
    </div>
  `
  postContainerr.prepend(col);
}


const onEdit = (ele) =>{
  let EDIT_ID = ele.closest('.card').id;
  cl(EDIT_ID)
  localStorage.setItem("EDIT_ID", EDIT_ID);  
  let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`;
  cl(EDIT_URL)
  makeApiCall("GET", EDIT_URL,null);
}


const patchData = (res) =>{
         titleControl.value=res.title;
         bodyControl.value=res.body;
         userIdControl.value=res.userId;
         postSubmitBtn.classList.add('d-none')
         postUpdatebtn.classList.remove('d-none')
}
cl(patchData)
const onRremove = (ele) => {
  let REMOVE_ID = ele.closest('.card').id;
  let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`;
  localStorage.setItem('REMOVE_ID', REMOVE_ID);

  Swal.fire({
    title: "Are you sure?",
    text: "This post will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      makeApiCall("DELETE", REMOVE_URL);
      Swal.fire("Deleted!", "Your post has been deleted.", "success");
    }
  });
};


const makeApiCall = (methodName, apiUrl, msgBody) =>{
  let xhr = new XMLHttpRequest();
  xhr.open(methodName, apiUrl);

  xhr.setRequestHeader("Content-type", "application/json");
 let mesg= msgBody ? JSON.stringify(msgBody) : null;
  xhr.send(mesg);

  xhr.onload=function(){
    if(xhr.status >= 200 && xhr.status <= 299){
      let res = JSON.parse(xhr.response);
      cl(res);
 let arr = objToArr(res);
      if(methodName === "GET" && apiUrl.includes('posts.json')){

        templating(arr);
      }else if(methodName === "GET"){
        patchData(res)
      }
      else if(methodName === "POST"){
        createCard({...msgBody, id:res.name}); 
        snackBar("Post Created Successfully!","success");
        postForm.reset();
      }else if(methodName === "PATCH"){
       let Patch_id = localStorage.getItem("EDIT_ID")
       
        let card= document.getElementById(Patch_id)
        cl(card)
          let h1 = card.querySelector('h1');
          let p = card.querySelector('p');
          h1.innerHTML = res.title;
          p.innerHTML = res.body;
    
        snackBar("Post Updated Successfully!","success");
        postForm.reset();
        postUpdatebtn.classList.add('d-none');
        postSubmitBtn.classList.remove('d-none');
        localStorage.removeItem("EDIT_ID");
      }else if (methodName === "DELETE"){
        let REMOVE_ID = localStorage.getItem('REMOVE_ID');
        let card = document.getElementById(REMOVE_ID).parentElement.remove()
        
      }
    }
  }

  
}

const onPostsubmit = (eve) =>{
  eve.preventDefault();

  let postObj ={
    title:titleControl.value,
    body:bodyControl.value,
    userId:userIdControl.value
  }
  cl(postObj)
  postForm.reset()

    //API call

    makeApiCall("POST",POST_URL,postObj)
  
}


const onupdate = () =>{
  //UPDATED_ID
   let UPDATED_ID = localStorage.getItem('EDIT_ID')

   //UPDATED_URL
   let UPDATED_URL = `${BASE_URL}/posts/${UPDATED_ID}.json`
  //UPDATED_OBJ >> from form-controls
  let UPDATED_OBJ={
    title:titleControl.value,
    body:bodyControl.value,
    userId:userIdControl.value
  }
  cl(UPDATED_OBJ)

  //MAKEAPICALL

  makeApiCall("PATCH", UPDATED_URL, UPDATED_OBJ)
  
}

postForm.addEventListener('submit', onPostsubmit)
postUpdatebtn.addEventListener('click', onupdate)


makeApiCall("GET", POST_URL,null);
