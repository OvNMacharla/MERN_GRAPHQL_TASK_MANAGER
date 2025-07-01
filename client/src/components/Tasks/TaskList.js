import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TASKS } from '../../graphql/queries';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList = () => {
  const { data, loading, error, refetch } = useQuery(GET_TASKS);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div className="text-center py-4">Loading tasks...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onTaskCreated={() => {
            refetch();
            setShowForm(false);
          }}
        />
      )}

      <div className="grid gap-4">
        {data?.getTasks?.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onTaskUpdated={refetch}
          />
        ))}
      </div>

      {data?.getTasks?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tasks found. Create your first task!
        </div>
      )}
    </div>
  );
};

export default TaskList;
