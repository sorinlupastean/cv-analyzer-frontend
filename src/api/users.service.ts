import { http } from "./http";

export type UserProfileDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  website?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  provider?: string | null;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

export const usersApi = {
  me: async () => {
    const { data } = await http.get<UserProfileDto>("/users/me");
    return data;
  },

  updateMe: async (payload: Partial<UserProfileDto>) => {
    const { data } = await http.patch<UserProfileDto>("/users/me", payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordDto) => {
    const { data } = await http.patch<{ message: string }>(
      "/users/me/password",
      payload,
    );
    return data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await http.patch<UserProfileDto>(
      "/users/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  },

  deleteAvatar: async () => {
    const { data } = await http.delete<UserProfileDto>("/users/me/avatar");
    return data;
  },
};
