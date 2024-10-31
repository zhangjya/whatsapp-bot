declare namespace ROBOT {
  /**
   * -1 表示删除，0表示未授权，1表示等待扫码，2表示授权中，3表示已授权
   */
  type Status = -1 | 0 | 1 | 2 | 3;

  interface IItem {
    id: number;
    name: string;
    status: Status;
    createdAt?: string;
    updatedAt?: string;
    nickName?: string;
    mobile?: string;
    qr?: string;
    percent?: number;
  }

  interface SaveParams {
    id?: number;
    name: string;
    nickName?: string;
    mobile?: string;
  }
}
