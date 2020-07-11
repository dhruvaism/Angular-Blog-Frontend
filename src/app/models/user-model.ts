export interface User {
    id: number,
    email: string,
    fname: string,
    lname: string,
    dob: string,
    photoUrl: string,
    created_at:string,
    location:string
}

export interface UserResponse {
    success:number,
    errors:string,
    result:User
}