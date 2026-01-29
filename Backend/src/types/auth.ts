export type AuthRole = "uploader" | "viewer" | "creator";

export type AuthPayload = {
  requestId?: string;
  shareId?: string;
  role: string;
};

export type JwtSignPayload = {
  requestId?: string;
  shareId?: string;
  role: AuthRole;
};

export type JwtDecodedPayload = {
  requestId?: string;
  shareId?: string;
  role: string;
};
