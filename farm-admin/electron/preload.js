const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  list: (entity) => ipcRenderer.invoke('db:list', entity),
  create: (entity, data) => ipcRenderer.invoke('db:create', entity, data),
  update: (entity, id, data) => ipcRenderer.invoke('db:update', entity, id, data),
  remove: (entity, id) => ipcRenderer.invoke('db:remove', entity, id),
  stats: () => ipcRenderer.invoke('db:stats'),
});
