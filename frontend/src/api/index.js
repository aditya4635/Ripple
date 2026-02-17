import apiClient from "./apiClient.js";

export const authApi = {
  async signup(data) {
    const res = await apiClient.post("/auth/signup", data);
    return res.data;
  },

  async verifyEmail(data) {
    const res = await apiClient.post("/auth/verify-email", data);
    return res.data;
  },

  async resendOTP(data) {
    const res = await apiClient.post("/auth/resend-otp", data);
    return res.data;
  },

  async googleLogin(data) {
    const res = await apiClient.post("/auth/google", data);
    return res.data;
  },

  async login(data) {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },

  async logout() {
    const res = await apiClient.post("/auth/logout");
    return res.data;
  },

  async checkAuth() {
    const res = await apiClient.get("/auth/check");
    return res.data;
  },
};

export const userApi = {
  async updateProfile(data) {
    const res = await apiClient.put("/user/update-profile", data);
    return res.data;
  },

  async initiateEmailChange(data) {
    const res = await apiClient.post("/user/change-email", data);
    return res.data;
  },

  async verifyEmailChange(data) {
    const res = await apiClient.post("/user/verify-email-change", data);
    return res.data;
  },
};

export const messageApi = {
  async getUsers() {
    const res = await apiClient.get("/messages/users");
    return res.data;
  },

  async getMessages(userId) {
    const res = await apiClient.get(`/messages/${userId}`);
    return res.data;
  },

  async sendMessage(userId, data) {
    const res = await apiClient.post(`/messages/send/${userId}`, data);
    return res.data;
  },

  async markAsRead(userId) {
    const res = await apiClient.put(`/messages/read/${userId}`);
    return res.data;
  },

  async deleteMessage(messageId, deleteType) {
    const res = await apiClient.delete(`/messages/${messageId}`, {
      data: { deleteType },
    });
    return res.data;
  },

  async deleteChatHistory(userId) {
    const res = await apiClient.delete(`/messages/chat/${userId}`);
    return res.data;
  },
};

export const aiApi = {
  async chat(message) {
    const res = await apiClient.post("/ai/chat", { message });
    return res.data;
  },
};
