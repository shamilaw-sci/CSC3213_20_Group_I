<<<<<<< HEAD

=======
//user management page, list of users, add user, edit user, delete user
>>>>>>> origin/developer
"use client";
import { Trash, User, UserCheck} from 'lucide-react';
import { useEffect, useState } from 'react';

type UserRecord = { userId: string; name: string; email: string; role: string; createdAt: string; lastLogin: string | null; twinsCreated: number };


//Time format function
function getTimeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
//Main component
export default function Userpage(){
    const [users , setUsers] = useState<UserRecord[]>([]);
    const [error, setError] = useState("");

    useEffect(() => { void loadUsers(); }, []);
    const loadUsers = async () => {
        try { const response = await fetch('/api/users'); if (!response.ok) throw new Error((await response.json()).error); setUsers(await response.json()); }
        catch (e) { setError(e instanceof Error ? e.message : 'Could not load users.'); }
    };

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    //Delete user function
    const handleDeleteUser = (user: any) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setIsDeleteOpen(false);
    };
    
    const confirmDelete = async () => {
        if (selectedUser) {
            try {
                const response = await fetch(`/api/users/${selectedUser.userId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error((await response.json()).error);
                setUsers((current) => current.filter((u) => u.userId !== selectedUser.userId));
                closeModal();
            } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete user.'); }
        }
    };
    //Edit user function
    const handleEditUser = (user: any) => {
        // Implement edit functionality here
        console.log("Edit user:", user);
    };

    //User interface
    return(
        <div className="p-6 bg-white rounded-2xl shadow">
            <h1 className="text-3xl font-bold mb-5">User Details</h1>
            {error && <p className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left mt-4 p-5 border border-gray-300">

                    <thead>
                    <tr className="bg-gray-200 text-left text-sm text-gray-600 uppercase">
                        <th className="p-2">User</th>
                        
                        <th className="p-2">Role</th>
                        <th className="p-2">Joined</th>
                        <th className="p-2">Last Login</th>
                        <th className="p-2">Twins Created</th>
                        <th className="p-2 text-center"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((user) => (
                        <tr key={user.userId} className="border-b hover:bg-gray-100" >
                            {/* user name */}
                            <td className="p-2 py-7">
                                <span className="font-semibold">
                                    {user.name}<br/>
                                </span>
                                <span className="italic text-gray-500">
                                    {user.email}
                                </span>
                                
                                </td>
                            {/* user role */}
                            <td className="p-2">
                                <span className={` px-3 py-4 rounded-xl shadow-xs text-xs font-semibold ${
                                        user.role === "Registered User"
                                        ? "bg-red-100 text-green-900"
                                        : "bg-yellow-100 text-yellow-900"
                                }`}>
                                <span >
                                    {user.role === "Registered User" && (
                                        <div className="inline-flex items-center gap-1">
                                            <UserCheck size={16} />
                                            <span> {user.role}</span>
                                        </div>
                                    )
                                    }
                                    {user.role === "Guest User" && (
                                        <div className="inline-flex items-center gap-1">
                                            <User size={16} />
                                            <span> {user.role}</span>
                                        </div>
                                    )}
                                </span>
                                
                                </span>
                            </td>
                            {/* user created date */}
                            <td className="p-2 text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            {/* user last login */}
                            <td className="p-2 text-gray-500">
                                  {user.lastLogin ? getTimeAgo(user.lastLogin) : "Never"}
                            </td>
                            {/* user twins created */}
                            <td className="p-2 text-center">{user.twinsCreated}</td>
                            {/* user actions */}
                            <td className="p-2">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleDeleteUser(user)}
                                        className="p-3 hover:bg-gray-300 rounded-md">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </table>
            </div>

            {/* Delete confirmation modal */}
            {isDeleteOpen && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-2">Are you sure you want to delete user "{selectedUser.name}"?</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            
            
            
        </div>



    )
}
