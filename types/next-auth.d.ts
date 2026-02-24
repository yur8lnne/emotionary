import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      userId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: number;
    userId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    userId: string;
  }
}
