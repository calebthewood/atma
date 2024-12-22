export const isAdmin = (role: string) => role === "admin";
export const isHost = (role: string) => role === "host";
export const canViewDashboard = (role: string) => isAdmin(role) || isHost(role);
