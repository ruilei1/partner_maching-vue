/**
 * 用户类别
 */
export type userType ={
    id:number;
    username:string;
    userAccount:string;
    avatarUrl ?: string;
    profile ?:string;
    gender : number;
    phone : string;
    email :string;
    userStatus:string;
    userRole:string;
    planetCode:string;
    tags:string[];
    createTime :Date;
    // avatarUrl 和 profile 没有提供，但仍然是有效的
};