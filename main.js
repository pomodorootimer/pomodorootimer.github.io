window.onload = () => {
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;


// Mantém uma instância de um objeto db para armazenarmos os dados IndexedDB
let db;

const tasks = document.getElementById('tasks');
const note = document.getElementById('logs');

function createListItem(contents) {
  const listItem = document.createElement('li');
  listItem.textContent = contents;
  return listItem;
};



//Botões
let start = document.getElementById("start");
let pause = document.getElementById("pause");
let reset = document.getElementById("reset");


const addTask = document.getElementById("add");
const taskList = document.getElementById("taskList"); //lista de tarefas
const submit = document.getElementById("submit-response");
const addTaskForm = document.querySelector("#add-task-form");
var response = document.getElementById("task-input");
const cancelButton = document.getElementById("cancel-add-task");

addTaskForm.style.display = "none";

note.appendChild(createListItem('App initialised.'));

  // abrindo o banco de dados
  const DBOpenRequest = window.indexedDB.open('toDoList', 4);

  
  //Cadastra dois event handlers para atuarem no banco de dados sendo aberto com sucesso, ou não
  DBOpenRequest.onerror = (event) => {
    note.appendChild(createListItem('Error ao carregar o banco de dados'));
  };

  DBOpenRequest.onsuccess = (event) => {
    note.appendChild(createListItem(' Banco de dados iniciado '));

    // Armazena o resultado da abertura do banco de dados na variável db
    db = DBOpenRequest.result;

    // mostra a lista taskList
    displayData();
  };

  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;

    db.onerror = (event) => {
      note.appendChild(createListItem('Erro ao carregar o banco de dados'));
    };

    // Cria um objectStore para este banco de dados
    const objectStore = db.createObjectStore(['toDoList'], { keyPath: 'taskTitle' });

    // Defini os objetos no database
    objectStore.createIndex('name', 'name', { unique: false });

    note.appendChild(createListItem('Objeto criado ! '));
  };


//Displays
document.getElementById("work_time");
document.getElementById("work_time_text");
document.getElementById("break_time");
document.getElementById("break_time_text");
//Time
let work_minutes = document.getElementById("work_minutes");
let work_Seconds = document.getElementById("work_seconds");
let break_minutes = document.getElementById("break_minutes");
let break_seconds = document.getElementById("break_seconds");

// Botão Play
start.addEventListener("click", function () {
  startTimer = setInterval(timer, 1000);
  start.style.display = "none";
  pause.style.display = "flex";
});

// Botão Pause
pause.addEventListener("click", function () {
  clearInterval(startTimer);
  start.style.display = "flex";
  pause.style.display = "none";
});

// Botão Stop
reset.addEventListener("click", function () {
  start.style.display = "flex";
  pause.style.display = "none";

  work_minutes.innerText = 25;
  work_Seconds.innerText = "00";

  break_minutes.innerText = 5;
  break_seconds.innerText = "00";

  clearInterval(startTimer);
});


function displayData() {
// Primeiro limpe o conteúdo da lista de tarefas para que você não obtenha uma lista enorme de coisas duplicadas toda vez
   // a exibição é atualizada.
  while (taskList.firstChild) {
    taskList.removeChild(taskList.lastChild);
  }

  // Abre nosso armazenamento de objeto e, em seguida, obtém uma lista de cursores de todos os diferentes itens de dados no IDB para iterar
  const objectStore = db.transaction(['toDoList']).objectStore('toDoList');
  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
   
    if (!cursor) {
 // Verifica se não há (mais) itens de cursor para iterar
      note.appendChild(createListItem('Entradas todas exibidas.'));
      return;
    }
    
  // Constroi a entrada da lista de tarefas e coloque-a no item da lista.

    const {taskTitle } = cursor.value;
    const toDoText = `${taskTitle}`;
    const listItem = createListItem(toDoText);


 // Coloca o item item dentro da lista de tarefas
    taskList.appendChild(listItem);

   // Cria um botão delete dentro de cada item da lista,
    const deleteButton = document.createElement('th');
    deleteButton.className  = "fa-solid fa-trash";
    listItem.appendChild(deleteButton);
    
  // Defina um atributo de dados em nosso botão de exclusão para associar a tarefa à qual ele se relaciona.
    deleteButton.setAttribute('data-task', taskTitle);
    
// Associa ação (exclusão) quando clicado
    deleteButton.onclick = (event) => {
      deleteItem(event);
    };

    // continua para o próximo item no cursor
    cursor.continue();
  };
};


  // 
  addTask.addEventListener('click', setForm, false);
  submit.addEventListener('click', addData, false);
  cancelButton.addEventListener('click', cancel, false);

  function deleteItem(event) {
    // Recupera o nome da tarefa que queremos deletar
    const dataTask = event.target.getAttribute('data-task');

    // Abra uma transação no banco de dados e exclua a tarefa, encontrando-a pelo nome que recuperamos acima
    const transaction = db.transaction(['toDoList'], 'readwrite');
    transaction.objectStore('toDoList').delete(dataTask);

  // Relata que o item de dados foi deletado
    transaction.oncomplete = () => {
      // Exclui o pai do botão, que é o item da lista, para que não seja mais exibido
      event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      note.appendChild(createListItem(`Task "${dataTask}" deletada.`));
    };
  };

 //quando clica no botão de "+" para cadastrar uma tarefa
  function setForm(){
    addTaskForm.style.display = "block";
    
  }

  //quando ele aperta no botão cancelar a adição de uma tarefa 
  function cancel(){
    addTaskForm.style.display = "none";

  }

  //cadastrar task
  function addData(e){

    if(response.value === ''){ //não cadastra se a task estiver vazia
      note.appendChild(createListItem('Task vazia '))
      return;
    }

    // novo objeto de dados
    const newItem = [
      {
        taskTitle: response.value
      }
     
    ];

       // abre uma transição de leitura/gravação no banco de dados
       const transaction = db.transaction(['toDoList'], 'readwrite');

      // report da transação acima
    transaction.oncomplete = () => {
      note.appendChild(createListItem('Transação concluída: modificação do banco de dados concluída.'));

      // atualiza a exibição de item com o item recém adicionado
      displayData();
    };

    transaction.onerror = () => {
      note.appendChild(createListItem(`Transação não aberta devido a erro: ${transaction.error}`));
    };

   // Chama um armazenamento de objeto que já foi adicionado ao banco de dados
    const objectStore = transaction.objectStore('toDoList');
    console.log(objectStore.indexNames);
    console.log(objectStore.indexNames);
    console.log(objectStore.keyPath);
    console.log(objectStore.name);
    console.log(objectStore.transaction);
    console.log(objectStore.autoIncrement);

   // faz uma requisição para adionar o objeto nvo
    const objectStoreRequest = objectStore.add(newItem[0]);
    objectStoreRequest.onsuccess = (event) => {

      note.appendChild(createListItem('Sucesso na requisção'));

      response.value = '';
      addTaskForm.style.display = "none";
    };

  }



// White Mode
var checkbox = document.querySelector("input[name=theme]");

// Local Storage
const checkboxColorMode = JSON.parse(localStorage.getItem("color-mode"));

if (checkboxColorMode) {
  checkbox.checked = checkboxColorMode;
  document.documentElement.setAttribute("data-theme", "light");
}

checkbox.addEventListener("change", ({ target }) => {
  target.checked
    ? document.documentElement.setAttribute("data-theme", "light")
    : document.documentElement.setAttribute("data-theme", "dark");

  localStorage.setItem("color-mode", target.checked);
});

// Função pra decrementar o tempo
function timer() {
  // POMODORO TIMER
  if (work_Seconds.innerText != 0) {
    work_Seconds.innerText--;
  } else if (work_minutes.innerText != 0 && work_Seconds.innerText == 0) {
    work_Seconds.innerText = 59;
    work_minutes.innerText--;
  }

  // BREAK TIMER
  if (work_minutes.innerText == 0 && work_Seconds.innerText == 0) {
    //Display
    work_time.style.display = "none";
    work_time_text.style.display = "none";
    break_time.style.display = "flex";
    break_time_text.style.display = "block";

    if (break_seconds.innerText != 0) {
      break_seconds.innerText--;
    } else if (break_minutes.innerText != 0 && break_seconds.innerText == 0) {
      break_seconds.innerText = 59;
      break_minutes.innerText--;
    }
  }

  if (
    work_minutes.innerText == 0 &&
    work_Seconds.innerText == 0 &&
    break_minutes.innerText == 0 &&
    break_seconds.innerText == 0
  ) {
    work_minutes.innerText = 25;
    work_Seconds.innerText = "00";

    break_minutes.innerText = 5;
    break_seconds.innerText = "00";

    //Display
    work_time.style.display = "flex";
    break_time.style.display = "none";
    break_time_text.style.display = "none";
    work_time_text.style.display = "block";
  }
}

}