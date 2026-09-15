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
    completada: false,
    creadaEn: new Date().toISOString()
    };
}

function estaVencida(tarea){
    if ( tarea.completada || !tarea.fechaLimite) return false;
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
        tarea.completada ? "task-completed" : "",
        vencida ? "task-overdue" : ""
    ].join(" ");
    return `
    <div class="col-md-6 col-lg-4" data-id="${tarea.id}">
      <div class="${clases}">
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
          <button class="btn btn-sm btn-outline-success btn-toggle" data-id="${tarea.id}">
          <i class="bi ${tarea.completada ? 'bi-arrow-counterclockwise' : 'bi-check-lg'}"></i>
        ${tarea.completada ? "Reabrir" : "Completar"}
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

    const contenedor = document.getElementById("taskList");
    const mensajeVacio = document.getElementById("emptyMessage");

    const tareasFiltradas = aplicarFiltros(tareas);


    if (tareasFiltradas.length === 0){
        contenedor.innerHTML = "";
        mensajeVacio.classList.remove("d-none");
        return;
    }
    mensajeVacio.classList.add("d-none");
    contenedor.innerHTML = tareasFiltradas.map(crearTarjeta).join("");
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

const taskList = document.getElementById("taskList");

taskList.addEventListener("click", function (e) {
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

taskList.addEventListener("click", function(e) {
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


taskList.addEventListener("click", function (e){
    const btnToggle = e.target.closest(".btn-toggle");
    if (!btnToggle) return;

    const id = btnToggle.dataset.id;
    const tarea = tareas.find(t => t.id === id);
    if(!tarea) return;

    tarea.completada = !tarea.completada;
    guardarTareas();
    render();
} );

function aplicarFiltros(lista) {
  const estado = document.querySelector("#tabsStatus .active").dataset.status;
  const prioridad = document.getElementById("filtroPrioridad").value;
  const categoria = document.getElementById("filtroCategoria").value;
  const busqueda = document.getElementById("buscarInput").value.trim().toLowerCase();

  return lista.filter(tarea => {
    if (estado === "Pendientes" && tarea.completada) return false;
    if (estado === "Completadas" && !tarea.completada) return false;
    if (prioridad && tarea.prioridad !== prioridad) return false;
    if (categoria && tarea.categoria !== categoria) return false;
    if (busqueda && !tarea.titulo.toLowerCase().includes(busqueda)) return false;
    return true;
  });
}


const tabsStatus = document.getElementById("tabsStatus");

tabsStatus.addEventListener("click", function (e) {
  const btn = e.target.closest(".nav-link");
  if (!btn) return;

  tabsStatus.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  render();
});

document.getElementById("filtroPrioridad").addEventListener("change", render);
document.getElementById("filtroCategoria").addEventListener("change", render);




document.getElementById("buscarInput").addEventListener("input", render);

function actualizarContadores() {
  const pendientes = tareas.filter(t => !t.completada).length;
  const completadas = tareas.filter(t => t.completada).length;

  document.getElementById("contPendientes").textContent = `Pendientes: ${pendientes}`;
  document.getElementById("contCompletadas").textContent = `Completadas: ${completadas}`;
}

cargarTareas();
render();