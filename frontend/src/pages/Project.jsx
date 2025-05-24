import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

export default function Project() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <div className="p-4">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-4">No project found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p>{project.description}</p>
      {/* Add more project details as needed */}
    </div>
  );
}
