async function request(path, options = {}) {
 const response = await fetch(path, {...options, headers:{...(options.body?{"Content-Type":"application/json"}:{}),...options.headers}});
 if (!response.ok) { let message=`Request failed (${response.status})`; try { const data=await response.json(); if(data.error) message=data.error; } catch {} throw new Error(message); }
 if(response.status===204) return null;
 return response.json();
}
export const loadTasks=()=>request("/api/tasks");
export const createTaskRequest=task=>request("/api/tasks",{method:"POST",body:JSON.stringify(task)});
export const updateTaskRequest=(id,task)=>request(`/api/tasks/${encodeURIComponent(id)}`,{method:"PUT",body:JSON.stringify(task)});
export const deleteTaskRequest=id=>request(`/api/tasks/${encodeURIComponent(id)}`,{method:"DELETE"});
