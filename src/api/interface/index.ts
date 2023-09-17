// 请求响应参数（不包含data）
export interface Result {
  code: number;
  message: string;
  server: string,
  success: boolean,
  total?: number
}

// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data: T;
}

// 请求应用列表
export interface IReqApplication {
  type: number;
}

// 请求发送短信
export interface IReqSmsCode {
  loginName: string,
  password: string,
  phone: string
}

// 登录模块
export namespace Login {
  export interface ReqLoginAccount {
    loginName: string;
    password: string;
  }

  export interface IResLoginByCode {
    phone: string,
    code: string,
  }

  export interface IResLogin extends ReqLoginAccount {
    code: string,
  }
}
