declare namespace WHITELIST {
  /**
   * -1 表示删除，0表示禁用，1表示启用
   */
  type Status = -1 | 0 | 1;

  interface IItem {
    id: number;
    account: string;
    permission: string;
  }

  interface SaveParams extends IItem {
    id?: number;
    robotId: number;
  }
}
