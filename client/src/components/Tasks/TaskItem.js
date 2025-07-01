import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_TASK, DELETE_TASK } from '../../graphql/mutations';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TaskItem = ({ task, onTaskUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority
  });

  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTask({
        variables: {
          id: task.id,
          input: editForm
        }
      });
      toast.success('Task updated successfully');
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ variables: { id: task.id } });
        toast.success('Task deleted successfully');
        onTaskUpdated();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({
        variables: {
          id: task.id,
          input: { status: newStatus }
        }
      });
      onTaskUpdated();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          />
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows="3"
          />
          <div className="flex gap-4">
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="p-2 border rounded-md"
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="p-2 border rounded-md"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange('TODO')}
          disabled={task.status === 'TODO'}
          className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Todo
        </button>
        <button
          onClick={() => handleStatusChange('IN_PROGRESS')}
          disabled={task.status === 'IN_PROGRESS'}
          className="px-3 py-1 text-sm bg-yellow-200 rounded-md hover:bg-yellow-300 disabled:opacity-50"
        >
          In Progress
        </button>
        <button
          onClick={() => handleStatusChange('COMPLETED')}
          disabled={task.status === 'COMPLETED'}
          className="px-3 py-1 text-sm bg-green-200 rounded-md hover:bg-green-300 disabled:opacity-50"
        >
          Completed
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Created: {new Date(task.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default TaskItem;
