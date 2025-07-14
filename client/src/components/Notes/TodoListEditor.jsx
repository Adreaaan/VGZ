import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './NoteEditors.css';

const TodoListEditor = ({ game, onSave, onCancel, loading, setLoading }) => {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState({
    todo: [],
    doing: [],
    done: []
  });
  const [newTodoText, setNewTodoText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const addTodo = useCallback(() => {
    if (newTodoText.trim()) {
      const newTodo = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: newTodoText.trim()
      };
      setTodos(prev => ({
        ...prev,
        todo: [...(prev.todo || []), newTodo]
      }));
      setNewTodoText('');
    }
  }, [newTodoText]);

  const removeTodo = useCallback((columnId, todoId) => {
    setTodos(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(todo => todo.id !== todoId)
    }));
  }, []);

  const updateTodoText = useCallback((columnId, todoId, newText) => {
    setTodos(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(todo => 
        todo.id === todoId ? { ...todo, text: newText } : todo
      )
    }));
  }, []);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setTodos(prevTodos => {
      const sourceItems = Array.from(prevTodos[source.droppableId] || []);
      const destItems = source.droppableId === destination.droppableId 
        ? sourceItems 
        : Array.from(prevTodos[destination.droppableId] || []);

      const [draggedItem] = sourceItems.splice(source.index, 1);
      
      if (source.droppableId === destination.droppableId) {
        sourceItems.splice(destination.index, 0, draggedItem);
        return {
          ...prevTodos,
          [source.droppableId]: sourceItems
        };
      } else {
        destItems.splice(destination.index, 0, draggedItem);
        return {
          ...prevTodos,
          [source.droppableId]: sourceItems,
          [destination.droppableId]: destItems
        };
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      alert('Por favor, añade un título');
      return;
    }

    const totalTodos = Object.values(todos).flat().length;
    if (totalTodos === 0) {
      alert('Por favor, añade al menos una tarea');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: title.trim(),
          tipo: 'todo',
          videojuego: game._id,
          esPrivada: isPrivate,
          contenido: {
            todos: todos
          }
        })
      });

      if (response.ok) {
        const newNote = await response.json();
        onSave(newNote);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear la nota');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error al guardar la nota');
    } finally {
      setLoading(false);
    }
  }, [title, todos, isPrivate, game, onSave, setLoading]);

  const columns = [
    { id: 'todo', title: 'Por Hacer', color: '#f56500' },
    { id: 'doing', title: 'En Progreso', color: '#3182ce' },
    { id: 'done', title: 'Completado', color: '#38a169' }
  ];

  return (
    <div className="note-editor">
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Título de la lista</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Objetivos en Elden Ring"
            className="title-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Añadir nueva tarea</label>
          <div className="add-todo-container">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Añadir nueva tarea..."
              className="add-todo-input"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button onClick={addTodo} className="add-todo-btn">
              ➕
            </button>
          </div>
        </div>

        <div className="form-group">
          <div className="privacy-checkbox">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="privacy-input"
            />
            <label htmlFor="isPrivate" className="privacy-label">
              🔒 Lista privada (solo visible para mí)
            </label>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {columns.map((column) => (
              <div key={column.id} className="kanban-column">
                <div 
                  className="column-header"
                  style={{ borderTopColor: column.color }}
                >
                  <h4 style={{ color: column.color }}>{column.title}</h4>
                  <span className="task-count">
                    {(todos[column.id] || []).length}
                  </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`todo-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {(todos[column.id] || []).map((todo, index) => (
                        <Draggable 
                          key={todo.id} 
                          draggableId={todo.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`todo-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="drag-handle">
                                ⋮⋮
                              </div>
                              <input
                                type="text"
                                value={todo.text}
                                onChange={(e) => updateTodoText(column.id, todo.id, e.target.value)}
                                className="todo-text-input"
                              />
                              <button
                                onClick={() => removeTodo(column.id, todo.id)}
                                className="remove-todo-btn"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {(!todos[column.id] || todos[column.id].length === 0) && (
                        <div className="empty-column">
                          <p>Arrastra tareas aquí</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <div className="editor-actions">
        <button onClick={onCancel} className="cancel-btn" disabled={loading}>
          Cancelar
        </button>
        <button onClick={handleSave} className="save-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Lista'}
        </button>
      </div>
    </div>
  );
};

export default TodoListEditor;

