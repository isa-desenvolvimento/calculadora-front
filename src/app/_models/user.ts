export interface User {
    id: number;
    email: string;
    username: string;
    password: string;
    role: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    data: any;
    message: string;
    status: string;
}