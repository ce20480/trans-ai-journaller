import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminUsersPage() {
  // Use your service‑role client to list all Auth users:
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }

  const users = data.users;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-white">User Management</h1>
      <div className="bg-[#262626] p-6 rounded-lg border border-[#373737] overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-[#1a1a1a]">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#373737]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#1a1a1a]/40">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {user.user_metadata?.role || "user"}
                </td>
                <td className="px-4 py-2">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {/* You can wire up role‐update actions here via your API routes */}
                  <button className="text-sm bg-[#373737] px-2 py-1 rounded hover:bg-[#4a4a4a]">
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
