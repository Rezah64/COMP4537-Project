import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { updateUserName } from "../utils/api";
import toast from "react-hot-toast";
import { User } from "../types";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState(name);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setOriginalName(name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(originalName);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserName(name);
      if (user && updateUser) {
        const updatedUser: User = {
          id: user.id,
          name: name,
          email: user.email,
          isAdmin: user.isAdmin,
          apiCalls: user.apiCalls,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        };
        updateUser(updatedUser);
      }
      toast.success("Name updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">User Settings</h1>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            disabled={!isEditing}
            onChange={(e) => setName(e.target.value)}
            className={`flex-1 rounded-lg border ${
              isEditing ? "border-indigo-500" : "border-gray-300"
            } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
        </div>
        <div className="mt-4 flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors duration-200"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors duration-200 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
