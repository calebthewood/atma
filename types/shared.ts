export type ActionResponse<T = any> = {
  ok: boolean;
  message?: string;
  data: T | null;
  error?: {
    code?: string;
    details?: any;
  };
};

export type UserFormData = {
  role: "user" | "host" | "admin";
  name: string;
  status: "active" | "inactive" | "suspended" | "deleted" | "archived";
  image?: string;
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  hostUsers?: {
    hostId: string;
    permissions: string;
    companyRole: string;
  }[];
};
