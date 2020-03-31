export interface User {
    id?: number;
    username: string;
    password?: string;
    profile: string;
    status: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    data: any;
    message: string;
}