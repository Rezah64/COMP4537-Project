import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import toast from "react-hot-toast";
import { User } from "../types";
import { ArrowLeft, LogOut, Smile } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { incrementCounterAPI } from "../utils/api";

export default function EditProfile() {
  const { user, updateUser, logout, updateName, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState(name);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const handleEdit = () => {
    setOriginalName(name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(originalName);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      incrementCounterAPI("/auth/logout");
      navigate("/login");
    } catch {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateName(name);
      if (user && updateUser) {
        const updatedUser: User = {
          id: user.id,
          name: name,
          email: user.email,
          isAdmin: user.isAdmin,
          apiCalls: user.apiCalls,
          createdAt: user.createdAt,
          lastActive: user.lastActive,
        };
        updateUser(updatedUser);
      }
      toast.success("Name updated successfully");
      incrementCounterAPI('/auth/updateName');
      setIsEditing(false);
    } catch {
      toast.error("Failed to update name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const userId = user?.id;
      if (userId) {
        await deleteAccount(userId);
      } else {
        throw new Error("User ID is undefined");
      }

    } catch (error) {
      console.log("An error occured", error);
    }

  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Smile className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Mood Booster
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-400 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4 text-gray-900">
            User Settings
          </h1>
          <div className="space-y-6">
            <div className="flex items-center">
              <label
                htmlFor="name"
                className="w-24 text-sm font-medium text-gray-700"
              >
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
            <div className="flex space-x-2">
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
            <div>
              <button
                onClick={() => setIsDeleting(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none transition-colors duration-200"
              >
                Edit
              </button>
            </div>
            {isDeleting && (
              <div
                className={`fixed left-0 top-0 flex h-full w-full items-center justify-center bg-gray-900 bg-opacity-50`}
              >
                <div className="mx-4 flex w-96 flex-col space-y-4 rounded-lg bg-white p-6">
                  <h2 className="text-center text-2xl font-bold">
                    Are you sure you want to delete your account?
                  </h2>

                  <p className="text-center font-medium text-gray-800">
                    Action cannot be undone.
                  </p>
                  <button
                    className="text-md mx-auto h-12 w-44 rounded bg-red-400 px-4 py-4 text-center font-bold text-white hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Delete Account
                  </button>
                  <button
                    className="text-md mx-auto h-12 w-44 rounded bg-slate-400 px-4 py-4 text-center font-bold text-white hover:bg-slate-600"
                    onClick={() => setIsDeleting(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
