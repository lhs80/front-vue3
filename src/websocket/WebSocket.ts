/**
 * @name: WebSocket.ts
 * @author: kervin
 * @date: 2023-03-08 22:43
 * @description：WebSocket.ts
 * @update: 2023-03-08 22:43
 */
import { v4 } from "uuid";

export type MessageCallback<WsMessage> = (e: WsMessage) => void;
export type send<T> = (msg: WsMessage<T>) => void;
export type Callback = (e: boolean | any) => void;
export type { WsMessage, Ioptions };

interface WsMessage<T> {
  // 消息类型
  type: string;
  // 请求序号
  requestId: string;
  // 消息内容
  content?: T;
  // 组ID
  groupId?: string;
  // 发送者编号
  sender?: string;
  // 目标人员IDs
  userIds?: string[];
  // 回执类型
  receipt?: number;
}

interface Ioptions {
  url: string; // 链接的通道的地址
  token?: string; //Token
  hearInterval?: number; // 心跳间隔,应设为WebSocket接口返回数据
  heartMsg?: WsMessage<null>; // 心跳消息
  isReconnect?: boolean; // 是否自动重连
  isDestroy?: boolean; // 是否销毁
  reconnectTime?: number; // 重连时间间隔
  reconnectCount?: number; // 重连次数 -1 则不限制
  autoRenew?: boolean; // 是否自动续约
  renewMsg?: WsMessage<null>; // 续约消息
  inactiveEventTime?: number; // 用户踢出时间默认10次心跳的时间,应设为Token有效期
  inactiveEvent?: Callback; // 用户不活跃事件
  messageCb?: MessageCallback<WsMessage<any>>; // 消息的回调
  onOpen?: Callback; // 连接成功回调
  onError?: Callback; // 连接错误回调
}

const websocketErrorCode = new Map([
  [1000, "正常关闭;无论为何目的而创建，该链接都已成功完成任务。"],
  [1001, "终端离开，可能因为服务端错误，也可能因为浏览器正从打开连接的页面跳转离开。"],
  [1002, "由于协议错误而中断连接。"],
  [1003, "由于接收到不允许的数据类型而断开连接(如仅接收文本数据的终端接收到了二进制数据)."],
  [1005, "保留。表示没有收到预期的状态码。"],
  [1006, "保留。用于期望收到状态码时连接非正常关闭(也就是说，没有发送关闭帧)."],
  [1007, "由于收到了格式不符的数据而断开连接(如文本消息中包含了非UTF-8数据)."],
  [1008, "由于收到不符合约定的数据而断开连接。这是一个通用状态码，用于不适合使用1003和1009状态码的场景。"],
  [1009, "由于收到过大的数据帧而断开连接。"],
  [1010, "客户端期望服务器商定一个或多个拓展，但服务器没有处理，因此客户端断开连接。"],
  [1011, "客户端由于遇到没有预料的情况阻止其完成请求，因此服务端断开连接。"],
  [1012, "服务器由于重启而断开连接。"],
  [1013, "服务器由于临时原因断开连接，如服务器过载因此断开一部分客户端连接。"],
  [1015, "保留。表示连接由于无法完成TLS握手而关闭(例如无法验证服务器证书)."],
  [3000, "服务端超过10秒未回复"],
  [3001, "连接参数错误"],
]);

/**
 * 定时任务基类
 */

class TimedTask {
  /**
   * 心跳计时器
   */
  heartTimeOutTimer: number;
  /**
   * 续约计时器
   */
  autoRenewTimer: number;
  /**
   * 接收超时计时器
   */
  receiveTimeOutTimer: number;

  /**
   * 构造器
   */
  constructor() {
    this.heartTimeOutTimer = 0;
    this.autoRenewTimer = 0;
    this.receiveTimeOutTimer = 0;
  }

  /**
   * 启动心跳
   * @param func 发送心跳函数
   * @param HearInterval
   */
  startHear(func: send<WsMessage<null>>, HearInterval: number): void {
    this.heartTimeOutTimer = setInterval(func, HearInterval * 1000);
  }

  /**
   * 停止心跳时全部停止
   */
  stopHear(): void {
    clearTimeout(this.heartTimeOutTimer);
    clearTimeout(this.receiveTimeOutTimer);
    clearTimeout(this.autoRenewTimer);
  }

  /**
   * 结束续约
   */
  stopRenew(): void {
    clearTimeout(this.autoRenewTimer);
  }

  /**
   * 启动续约
   * @param func 发送续约函数
   * @param autoRenewInterval 自动续约间隔
   */
  reStartRenew(func: send<WsMessage<null>>, autoRenewInterval: number): void {
    clearTimeout(this.autoRenewTimer);
    this.autoRenewTimer = setInterval(func, autoRenewInterval * 1000);
  }

  /**
   * 开启接收超时检测
   * @param func 发送心跳函数
   * @param outTime 超时时间
   */
  startTimeoutDetection(func: send<WsMessage<null>>, outTime: number): void {
    this.receiveTimeOutTimer = setInterval(func, outTime * 1000);
  }

  /**
   * 重置接收超时检测
   * @param func 发送心跳函数
   * @param outTime 超时时间
   */
  resetTimeoutDetection(func: send<WsMessage<null>>, outTime: number): void {
    clearTimeout(this.receiveTimeOutTimer);
    this.startTimeoutDetection(func, outTime);
  }
}

class UicpSocket extends TimedTask {
  /**
   * webSocket 连接实例
   */
  ws: WebSocket | any;

  /**
   * 默认重连次数
   */
  reconnectCount: number;
  /**
   * 重连计时器
   */
  reconnectTimer: number;
  /**
   * 用户是否活跃
   */
  userActive: boolean;
  /**
   * 用户是否活跃计时器
   */
  userActiveTimer: number;
  /**
   * 连接参数
   */
  options: Ioptions;

  constructor() {
    super();
    this.reconnectCount = -1;
    this.reconnectTimer = 0;
    this.userActive = false;
    this.userActiveTimer = 0;
    this.options = {
      url: "", // 连接地址
      token: "", // token
      hearInterval: 5, // 心跳间隔,应设为WebSocket接口返回数据
      heartMsg: UicpSocket.heartbeatMessage(), // 心跳信息
      isReconnect: true, // 是否自动重连
      isDestroy: false, // 是否销毁
      reconnectTime: 5000, // 重连时间间隔
      reconnectCount: -1, // 重连次数 -1 则不限制
      autoRenew: false, // 是否自动续约
      inactiveEventTime: 5 * 10, // 用户踢出时间默认10次心跳的时间,应设为Token有效期
      inactiveEvent: (e: boolean) => {
        console.log("用户不活跃::::", e);
      },
      renewMsg: UicpSocket.renewMessage(),
      messageCb: (e: WsMessage<any>) => {
        console.log("收到消息::::", e);
      },
      onOpen: (e: boolean) => {
        console.log("连接成功::::", e);
      },
      onError: (e: boolean | any) => {
        console.log("连接错误::::", e);
      },
    };
  }

  /**
   * 建立连接
   * @param ops 连接参数
   */
  create(ops: Ioptions): void {
    this.options = Object.assign(this.options, ops);
    this.reconnectCount = this.options.reconnectCount as number;
    console.log("%s 创建 websocket 连接,连接参数:%o", new Date().toLocaleString(), this.options);
    if (!("WebSocket" in window)) {
      throw new Error("当前浏览器不支持，无法使用");
    }
    if (!this.options.url) {
      throw new Error("地址不存在，无法建立通道");
    }
    // this.ws = null
    this.ws = new WebSocket(this.options.url, [this.options.token as string]);
    this.onopen();
    this.onclose();
    this.onerror();
    this.onmessage();
  }

  /**
   * 自定义连接成功事件
   * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
   */
  private onopen(): void {
    this.ws.onopen = () => {
      // 清除重连定时器
      clearTimeout(this.reconnectTimer);
      // 建立心跳机制
      console.log("%s connect WebSocket success", new Date().toLocaleString());
      super.stopHear();
      super.stopRenew();
      if (typeof this.options.onOpen === "function") {
        this.options.onOpen(true);
      }
    };
  }

  /**
   * 自定义关闭事件
   * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
   */
  private onclose(): void {
    this.ws.onclose = (event: any) => {
      if (!this.options.isDestroy) {
        console.log("%s 正常注销后 WebSocket 关闭, code:%d-%s", new Date().toLocaleString(), event.code, websocketErrorCode.get(event.code));
      }
      if (event.code === 1000) {
        console.log("%s WebSocket 正常关闭, code:%d-%s", new Date().toLocaleString(), event.code, websocketErrorCode.get(event.code));
      } else if (event.code === 4000) {
        // 业务代码
        return;
      } else {
        console.error("%s WebSocket 非正常关闭, code:%d-%s", new Date().toLocaleString(), event.code, websocketErrorCode.get(event.code));
        super.stopHear();
        this.onReconnect();
      }
    };
  }

  /**
   * 自定义错误事件
   * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
   */
  onerror(): void {
    this.ws.onerror = (event: any) => {
      console.error("%s WebSocket connect error:%o", new Date().toLocaleString(), event);
      super.stopHear();
      if (typeof this.options.onError === "function") {
        this.options.onError(event);
      }
    };
  }

  /**
   * 自定义消息监听事件
   * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
   */
  onmessage(): void {
    this.ws.onmessage = (event: MessageEvent<string>) => {
      // 收到任何消息时重置超时检测,2次心跳时间没有收到消息,触发超时重连
      super.resetTimeoutDetection(() => {
        console.error("%s 未收到服务端消息超过%d秒,执行重连", new Date().toLocaleString(), (this.options.hearInterval as number) * 2);
        this.destroy(3000, websocketErrorCode.get(3000));
        this.create(this.options);
      }, (this.options.hearInterval as number) * 2);
      const wsMessage: WsMessage<any> = JSON.parse(event.data);
      if (wsMessage.type === "ERROR") {
        console.error("%s 连接websocket数据错误:%s---%o", new Date().toLocaleString(), wsMessage.type, wsMessage.content);
        // 抛出消息到消息回执函数
        if (typeof this.options.messageCb === "function") {
          this.options.messageCb(wsMessage);
        }
        this.destroy(1000, websocketErrorCode.get(3001));
      } else if (wsMessage.type === "HEARTBEAT_INTERVAL") {
        console.log("%s websocket 心跳策略:%s=%o", new Date().toLocaleString(), wsMessage.type, wsMessage.content);
        // 设置心跳间隔时间
        this.options.hearInterval = wsMessage.content as number;
        // 可以发送心跳时,恢复重连次数
        // this.reconnectCount = this.options.reconnectCount as number;
        this.ws.send(JSON.stringify(UicpSocket.heartbeatMessage()));
        // 开启心跳发送
        super.startHear((): void => {
          // 发送心跳消息
          this.send(this.options.heartMsg as WsMessage<null>);
        }, this.options.hearInterval);
        // 启动续约
        if (this.options.autoRenew) {
          super.reStartRenew(() => {
            this.send(this.options.renewMsg as WsMessage<null>);
          }, this.options.hearInterval * 4);
        }
        // 开启活跃检测
        this.mouseHandlers();
      } else if (wsMessage.type === "HEARTBEAT") {
        // 收到心跳消息不处理
        return;
      } else {
        // 判断消息是否需要回执
        if (wsMessage.receipt !== 0) {
          this.send(UicpSocket.receiptMessage(wsMessage));
        }
        // 抛出消息到消息回执函数
        if (typeof this.options.messageCb === "function") {
          this.options.messageCb(wsMessage);
        }
      }
    };
  }

  /**
   * 自定义发送消息事件
   * @param {String} data 发送的消息
   */
  public send<T>(data: WsMessage<T>): void {
    // console.log("%s 发送 websocket 消息:%o", new Date().toLocaleString(), data);
    if (this.ws.readyState !== this.ws.OPEN) {
      throw new Error("没有连接到服务器，无法推送");
    }
    this.ws.send(JSON.stringify(data));
  }

  /**
   * 重新连接
   */
  onReconnect(): void {
    if (!this.options.isDestroy) {
      if (this.reconnectCount > 0 || this.reconnectCount === -1) {
        console.error("%s websocket 重连[%d-%d]", new Date().toLocaleString(), this.reconnectCount, this.options.reconnectCount);
        this.reconnectTimer = window.setTimeout(() => {
          this.create(this.options);
          if (this.reconnectCount !== -1 && this.reconnectCount > 0) {
            this.reconnectCount--;
          }
        }, this.options.reconnectTime);
      } else {
        console.error("%s 重连次数已达到最大,结束重连[%d-%d]", new Date().toLocaleString(), this.reconnectCount, this.options.reconnectCount);
        clearTimeout(this.reconnectTimer);
      }
    } else {
      // console.log("%s websocket 连接已销毁不需要重连", new Date().toLocaleString());
    }
  }

  /**
   * 销毁
   * @param closeCode 关闭代码
   * @param closeMessage 关闭消息
   */
  destroy(closeCode?: number, closeMessage?: string): void {
    console.log("%s 销毁 websocket 连接,销毁代码:%d,附带信息:%s", new Date().toLocaleString(), closeCode, closeMessage);
    super.stopHear();
    clearTimeout(this.reconnectTimer); // 清除重连定时器
    this.options.isDestroy = true;
    this.ws.close(closeCode, closeMessage);
  }

  /**
   * 心跳消息
   */
  private static heartbeatMessage(): WsMessage<null> {
    return {
      type: "HEARTBEAT",
      requestId: v4().split("-").join(""),
      receipt: 0,
    };
  }

  /**
   * 续约消息
   */
  private static renewMessage(): WsMessage<null> {
    return {
      type: "RENEW",
      requestId: v4().split("-").join(""),
      receipt: 0,
    };
  }

  /**
   * 回执消息
   * @param sourceMessage 源消息
   */
  private static receiptMessage(sourceMessage: WsMessage<any>): WsMessage<null> {
    return {
      type: "RECEIPT",
      requestId: sourceMessage.requestId,
      receipt: 0,
    };
  }

  /**
   * 鼠标移动事件监听
   */
  mouseHandlers(): void {
    document.addEventListener("mousemove", this.onMouseMove);
  }

  /**
   * 鼠标移动事件处理函数
   * @param event 事件
   */
  private onMouseMove: EventListener = (event: MouseEventInit) => {
    // 用户标记为不活跃并在自动续约时执行
    if (!this.userActive && !this.options.autoRenew) {
      // 设置用户活跃标识为true
      this.userActive = true;
      // 每隔4次心跳的事假设置用户为不活跃,需要重新激活
      window.setTimeout(() => {
        this.userActive = false;
      }, ((this.options.inactiveEventTime as number) / 2) * 1000);
      // 清除活跃计时器
      clearTimeout(this.userActiveTimer);
      // 创建新的计时器
      this.userActiveTimer = window.setTimeout(() => {
        // 指定时间(Token有效期)后用户仍然不活跃,发布事件
        console.warn("%s 检测到用户%d秒没有鼠标行为,判断为非活跃用户", new Date().toLocaleString(), this.options.inactiveEventTime as number);
        if (typeof this.options.inactiveEvent === "function") {
          this.options.inactiveEvent(true);
        }
      }, (this.options.inactiveEventTime as number) * 1000);
      console.log("%s 检测到用户行为,自动续期", new Date().toLocaleString());
      this.send<null>(this.options.renewMsg as WsMessage<null>);
    }
  };
}

/**
 * 默认导出
 */
export default {
  /**
   * WebSocket 实例
   */
  uicpSocket: {} as UicpSocket,

  /**
   * 创建 WebSocket 连接
   * @param options 连接参数
   */
  createSocket: function (options: Ioptions) {
    if (!this.uicpSocket.ws) {
      // 存在 ws 实例,则先注销
      this.destroySocket();
    }
    this.uicpSocket = new UicpSocket();
    this.uicpSocket.create(options);
  },

  /**
   * 查询 WebSocket 状态
   */
  status(): number {
    return this.uicpSocket.ws.readyState;
  },

  /**
   * 设置消息回调函数
   * @param cb 回调函数
   */
  setOnMessage(cb: MessageCallback<WsMessage<any>>): void {
    this.uicpSocket.options.messageCb = cb;
  },

  /**
   * 设置消息回调函数
   * @param message
   */
  sendMessage<T>(message: WsMessage<T>): void {
    this.uicpSocket.send<T>(message);
  },

  /**
   * 续约
   */
  renew(): void {
    console.log("%s 续约", new Date().toLocaleString());
    this.uicpSocket.send<null>(this.uicpSocket.options.renewMsg as WsMessage<null>);
  },

  /**
   * 开启自动续约,(4次心跳续约1次)
   */
  autoRenew(): void {
    console.log("%s 开启自动续约", new Date().toLocaleString());
    this.uicpSocket.options.autoRenew = true;
    this.uicpSocket.reStartRenew(() => {
      this.uicpSocket.send<null>(this.uicpSocket.options.renewMsg as WsMessage<null>);
    }, (this.uicpSocket.options.hearInterval as number) * 4);
  },

  /**
   * 结束自动续约
   */
  stopAutoRenew(): void {
    console.log("%s 结束自动续约", new Date().toLocaleString());
    this.uicpSocket.options.autoRenew = false;
    this.uicpSocket.stopRenew();
  },

  /**
   * 注销 WebSocket
   */
  destroySocket(): void {
    if (this.uicpSocket.ws) {
      this.uicpSocket.destroy(1000, websocketErrorCode.get(1000));
    }
  },
};
