import React, { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
}

const Update = () => {
  const { id } = useParams({ strict: false });
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch role data and permissions
  const {
    data: roleData,
    isLoading: isRoleLoading,
    isError: isRoleError,
  } = useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/roles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    enabled: !!id,
  });

  // Update form data when role data is loaded
  useEffect(() => {
    if (roleData) {
      setRoleName(roleData.Role?.name || "");
      setSelectedPermissions(roleData.RolePermissions || []);
    }
  }, [roleData]);

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { name: string; permissions: string[] }) => {
      const response = await axios.put(`/api/roles/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", id] });
      toast.success("Role updated successfully");
      navigate({ to: "/roles" });
    },
    onError: (error: any) => {
      toast.error("Error updating role");
    },
  });

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionName]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate({
      name: roleName,
      permissions: selectedPermissions,
    });
  };

  if (isRoleLoading) {
    return <div className="p-5">Loading...</div>;
  }

  if (isRoleError) {
    return <div className="p-5">Error loading role data</div>;
  }

  const { Role, RolePermissions, Permissions } = roleData || {};

  return (
    <div className="w-full p-5">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Role</CardTitle>
            <CardDescription>
              Update role name and assign permissions
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Role Name */}
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                  required
                />
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {Permissions && Permissions.length > 0 ? (
                    Permissions.map((permission: Permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.name)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.name, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500">
                      No permissions available
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Selected: {selectedPermissions.length} permissions
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/roles" })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRoleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Update;