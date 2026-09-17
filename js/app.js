let tareas = [];
let idAEliminar = null;


function crearTareaObjeto({ titulo, descripcion, prioridad, categoria, fechaLimite}){
    return{
    id: crypto.randomUUID(),
    titulo,
    descripcion: descripcion || "",
    prioridad,
    categoria,
    fechaLimite: fechaLimite || "",
    estado: "pendiente",
    creadaEn: new Date().toISOString()
    };
}

function estaVencida(tarea){
    if ( tarea.estado === "completada" || !tarea.fechaLimite) return false;
    const hoy = new Date().toISOString().split("T")[0];
    return tarea.fechaLimite < hoy;

}


function guardarTareas(){
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function cargarTareas(){
    const datos = localStorage.getItem("tareas");
    tareas = datos ? JSON.parse(datos) : [];
}

function crearTarjeta(tarea){
    const vencida = estaVencida(tarea);
    const clases = [
        "task-card", "card", "h-100",
        `prioridad-${tarea.prioridad}`,
        tarea.estado === "completada" ? "task-completed" : "",
        vencida ? "task-overdue" : ""
    ].join(" ");
    return `
    <div class="${clases}" draggable="true" data-id="${tarea.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="task-title card-title">${tarea.titulo}</h5>
            <span class="badge bg-${Prioridad(tarea.prioridad)}">${tarea.prioridad}</span>
          </div>
          <p class="card-text text-muted small">${tarea.descripcion}</p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary">${tarea.categoria}</span>
            <small class="${vencida ? 'text-danger fw-bold' : 'text-muted'}">
              ${tarea.fechaLimite ? "Vence: " + tarea.fechaLimite : "Sin fecha"}
              ${vencida ? " (Vencida)" : ""}
            </small>
          </div>
          <div class="d-flex gap-2">

      <button class="btn btn-sm btn-outline-secondary btn-mover-atras d-md-none" data-id="${tarea.id}">
        <i class="bi bi-arrow-left"></i>
      </button>
      <button class="btn btn-sm btn-outline-secondary btn-mover-adelante d-md-none" data-id="${tarea.id}">
        <i class="bi bi-arrow-right"></i>
      </button>
          
         
      <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${tarea.id}">
        <i class="bi bi-pencil"></i> Editar
      </button>
      <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${tarea.id}">
        <i class="bi bi-trash"></i> Eliminar
      </button>


          </div>
        
      </div>
    </div>
    `
}
function Prioridad(prioridad){
    if (prioridad === "alta") return "danger";
    if (prioridad === "media") return "warning";
    return "success";
}

function render(){

    actualizarContadores();

    const mensajeVacio = document.getElementById("emptyMessage");

    const tareasFiltradas = aplicarFiltros(tareas);
    const contenedor = document.querySelectorAll(".kanban-cards");

    if (tareasFiltradas.length === 0){
    contenedor.forEach(col => col.innerHTML = "");
    mensajeVacio.classList.remove("d-none");
    return;
}
    mensajeVacio.classList.add("d-none");

    contenedor.forEach(col => {
    const tareasCol = tareasFiltradas.filter(t => t.estado === col.dataset.status);
    col.innerHTML = tareasCol.map(crearTarjeta).join("");
});
}



    document.getElementById("btnNuevaTarea").addEventListener("click", function () {
    taskForm.reset();
    document.getElementById("taskId").value = "";
    document.getElementById("taskModalLabel").textContent = "Nueva Tarea";
});



const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", function(e){
    e.preventDefault();

    const id = document.getElementById("taskId").value;
    const titulo = document.getElementById("taskTitulo").value.trim();
    const descripcion = document.getElementById("taskDescripcion").value.trim();
    const prioridad = document.getElementById("taskPrioridad").value;
    const categoria = document.getElementById("taskCategoria").value;
    const fechaLimite = document.getElementById("taskFecha").value;
    
    // Validación: título obligatorio (el "required" del HTML ya ayuda, pero
  // igual validamos en JS por si acaso, y por buena práctica)

  if ( !titulo ){
    alert("El titulo es obligatorio");
    return;
  }

  if(!id ){
    const nuevaTarea = crearTareaObjeto({titulo, descripcion, prioridad, categoria, fechaLimite });
    tareas.push(nuevaTarea);
  } else{
    const tarea = tareas.find(t => t.id === id);
    tarea.titulo = titulo;
    tarea.descripcion = descripcion;
    tarea.prioridad = prioridad;
    tarea.categoria = categoria;
    tarea.fechaLimite = fechaLimite;

  }
    guardarTareas();
    render();
    taskForm.reset();

    const modalInstancia = bootstrap.Modal.getInstance(document.getElementById("taskModal"));
    modalInstancia.hide();


});

const kanbanBoard = document.getElementById("kanbanBoard");

kanbanBoard.addEventListener("click", function (e) {
  const btnEditar = e.target.closest(".btn-editar");
  if (!btnEditar) return;

  const id = btnEditar.dataset.id;
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;

  document.getElementById("taskId").value = tarea.id;
  document.getElementById("taskTitulo").value = tarea.titulo;
  document.getElementById("taskDescripcion").value = tarea.descripcion;
  document.getElementById("taskPrioridad").value = tarea.prioridad;
  document.getElementById("taskCategoria").value = tarea.categoria;
  document.getElementById("taskFecha").value = tarea.fechaLimite;
  document.getElementById("taskModalLabel").textContent = "Editar Tarea";

  const modal = new bootstrap.Modal(document.getElementById("taskModal"));
  modal.show();
});

kanbanBoard.addEventListener("click", function(e) {
    const btnEliminar = e.target.closest(".btn-eliminar");
    if( !btnEliminar ) return;

    idAEliminar = btnEliminar.dataset.id;

    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show(); 
});


document.getElementById("confirmDeleteBtn").addEventListener("click", function (){
    tareas = tareas.filter(t => t.id !== idAEliminar);
    guardarTareas();
    render();

    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
    modal.hide();
    
    idAEliminar = null;
});


const ORDEN_ESTADOS = ["pendiente", "progreso", "completada"];

kanbanBoard.addEventListener("click", function(e){
  const btnAtras = e.target.closest(".btn-mover-atras");
  const btnAdelante = e.target.closest(".btn-mover-adelante");
  if (!btnAtras && !btnAdelante) return;

  const id = (btnAtras || btnAdelante).dataset.id;
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;

  const indiceActual = ORDEN_ESTADOS.indexOf(tarea.estado);
  const nuevoIndice = indiceActual + (btnAdelante ? 1 : -1);

  if (nuevoIndice < 0 || nuevoIndice >= ORDEN_ESTADOS.length) return;

  tarea.estado = ORDEN_ESTADOS[nuevoIndice];
  guardarTareas();
  render();
});



function aplicarFiltros(lista) {
  const prioridad = document.getElementById("filtroPrioridad").value;
  const categoria = document.getElementById("filtroCategoria").value;
  const busqueda = document.getElementById("buscarInput").value.trim().toLowerCase();

  return lista.filter(tarea => {
    if (prioridad && tarea.prioridad !== prioridad) return false;
    if (categoria && tarea.categoria !== categoria) return false;
    if (busqueda && !tarea.titulo.toLowerCase().includes(busqueda)) return false;
    return true;
  });
}




document.getElementById("filtroPrioridad").addEventListener("change", render);
document.getElementById("filtroCategoria").addEventListener("change", render);




document.getElementById("buscarInput").addEventListener("input", render);

function actualizarContadores() {
  const pendientes = tareas.filter(t => t.estado === "pendiente").length;
  const enProgreso = tareas.filter( t => t.estado === "progreso").length;
  const completadas = tareas.filter(t => t.estado === "completada").length;

  document.getElementById("contPendientes").textContent = `Pendientes: ${pendientes}`;
  document.getElementById("contEnProgreso").textContent = `En Progreso: ${enProgreso}`;
  document.getElementById("contCompletadas").textContent = `Completadas: ${completadas}`;
}


kanbanBoard.addEventListener("dragstart", function(e){
  const tarjeta = e.target.closest(".task-card");
  if(!tarjeta) return;
  e.dataTransfer.setData("text/plain", tarjeta.dataset.id);
});

kanbanBoard.addEventListener("dragover", function(e){
  const col = e.target.closest(".kanban-cards");
  if(!col) return;
  e.preventDefault();
});

kanbanBoard.addEventListener("drop", function(e){
  const col = e.target.closest(".kanban-cards");
  if(!col) return;
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  const tarea = tareas.find(t => t.id === id);
  if(!tarea) return;
  tarea.estado = col.dataset.status;
  guardarTareas();
  render();
});


cargarTareas();
render();